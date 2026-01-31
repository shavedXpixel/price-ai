"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { auth, db } from "../firebase"; 
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from "firebase/firestore";

interface Product {
  name: string;
  price: string;
  displayPrice: string;
  source: string;
  link: string;
  image: string;
  rating?: number;
  reviews?: number;
}

type SortState = "default" | "asc" | "desc";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q"); 
  const { theme, setTheme } = useTheme(); 
  
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortState, setSortState] = useState<SortState>("default");
  const [selectedStore, setSelectedStore] = useState("All");
  
  const [user, setUser] = useState<User | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]); 

  // 🔹 Unique ID Helper
  const getProductId = (item: Product) => {
    return `${item.source}-${item.name}-${item.price}`.replace(/\s+/g, '').toLowerCase();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().wishlist) {
          const savedIds = docSnap.data().wishlist.map((item: Product) => getProductId(item));
          setWishlistIds(savedIds);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`https://price-ai.onrender.com/search/${query}`)
        .then((res) => res.json())
        .then((data) => {
          const enrichedResults = data.results.map((item: any) => ({
            ...item,
            rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
            reviews: Math.floor(Math.random() * 500) + 10
          }));
          setResults(enrichedResults);
          setLoading(false);
        })
        .catch((err) => {
            console.error(err);
            setLoading(false);
        });
    }
  }, [query]);

  const toggleWishlist = async (item: Product) => {
    if (!user) {
      alert("Please Login to save items! 🔒");
      return;
    }
    const docRef = doc(db, "users", user.uid);
    const itemId = getProductId(item);
    const isAlreadySaved = wishlistIds.includes(itemId);

    if (isAlreadySaved) {
        setWishlistIds(prev => prev.filter(id => id !== itemId));
        // Note: Ideally we remove by ID, but arrayRemove requires exact object match.
        // This usually works if the object hasn't changed.
        await updateDoc(docRef, { wishlist: arrayRemove(item) });
    } else {
        setWishlistIds(prev => [...prev, itemId]);
        await setDoc(docRef, { wishlist: arrayUnion(item) }, { merge: true });
    }
  };

  // 🔹 NEW: SMART SHARE FUNCTION
  const handleShare = async (item: Product) => {
    const safeLink = getSafeLink(item.link, item.source, item.name);
    const shareText = `🔥 Found ${item.name} for ${item.displayPrice || item.price} on ${item.source}! \nCheck it out here: ${safeLink}`;

    if (navigator.share) {
      // Use Native Mobile Share
      try {
        await navigator.share({
          title: 'Price AI Deal',
          text: shareText,
          url: safeLink,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback for PC: Copy to Clipboard
      navigator.clipboard.writeText(shareText);
      alert("Deal copied to clipboard! 📋");
    }
  };

  // --- Helpers ---
  const generateStoreSearchLink = (source: string, title: string) => {
    const encodedTitle = encodeURIComponent(title);
    const cleanSource = source ? source.toLowerCase().replace(/\s+/g, "") : "";
    if (cleanSource.includes("amazon")) return `https://www.amazon.in/s?k=${encodedTitle}`;
    if (cleanSource.includes("flipkart")) return `https://www.flipkart.com/search?q=${encodedTitle}`;
    if (cleanSource.includes("croma")) return `https://www.croma.com/search/?text=${encodedTitle}`;
    if (cleanSource.includes("reliance")) return `https://www.reliancedigital.in/search?q=${encodedTitle}`;
    if (cleanSource.includes("cashify")) return `https://www.cashify.in/search?q=${encodedTitle}`;
    if (cleanSource.includes("tatacliq")) return `https://www.tatacliq.com/search/?searchCategory=all&text=${encodedTitle}`;
    if (cleanSource.includes("sahivalue")) return `https://sahivalue.com/search?q=${encodedTitle}`;
    if (cleanSource.includes("ovantica")) return `https://ovantica.com/index.php?route=product/search&search=${encodedTitle}`;
    return `https://www.google.com/search?q=${encodedTitle}+site:${cleanSource}.com+OR+site:${cleanSource}.in`;
  };

  const getSafeLink = (link: string, source: string, title: string) => {
    if (!link) return generateStoreSearchLink(source, title);
    if (link.startsWith("http")) {
        if (link.includes("google.com") || link.includes("google.co.in")) {
             return generateStoreSearchLink(source, title);
        }
        return link; 
    }
    if (link.startsWith("/dp/") || link.startsWith("/gp/")) return `https://www.amazon.in${link}`;
    if (link.startsWith("/p/") || link.startsWith("/dl/")) return `https://www.flipkart.com${link}`;
    const hiddenUrlMatch = link.match(/(https?:\/\/[^&%]+)/);
    if (hiddenUrlMatch && hiddenUrlMatch[0]) {
         const extracted = decodeURIComponent(hiddenUrlMatch[0]);
         if (!extracted.includes("google.com")) return extracted;
    }
    return generateStoreSearchLink(source, title);
  };

  const stores = ["All", ...Array.from(new Set(results.map(r => r.source)))];
  const getPriceValue = (priceStr: string) => {
    if (!priceStr) return Infinity;
    const cleanString = priceStr.replace(/[^0-9.]/g, "");
    return parseFloat(cleanString) || Infinity;
  };
  const lowestPrice = results.length > 0 ? Math.min(...results.map(item => getPriceValue(item.price))) : 0;
  const filteredResults = results.filter(item => selectedStore === "All" || item.source === selectedStore);
  const displayResults = [...filteredResults].sort((a, b) => {
    if (sortState === "default") return 0;
    const priceA = getPriceValue(a.price);
    const priceB = getPriceValue(b.price);
    return sortState === "asc" ? priceA - priceB : priceB - priceA;
  });

  const toggleSort = () => {
    if (sortState === "default") setSortState("asc");
    else if (sortState === "asc") setSortState("desc");
    else setSortState("default");
  };

  const getSortLabel = () => {
    if (sortState === "asc") return "Price: Low to High 📉";
    if (sortState === "desc") return "Price: High to Low 📈";
    return "Sort by Price ⇅";
  };

  const getStoreColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("amazon")) return "bg-[#FF9900] text-black";
    if (s.includes("flipkart")) return "bg-[#2874F0] text-white";
    if (s.includes("croma")) return "bg-[#00E9BF] text-black";
    if (s.includes("cashify")) return "bg-[#4CAF50] text-white";
    if (s.includes("reliance")) return "bg-[#E42529] text-white";
    return "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200";
  };

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans transition-colors duration-300 bg-[#f0f4f8] dark:bg-[#1e293b]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 rounded-[2rem] transition-all
            bg-[#f0f4f8] dark:bg-[#1e293b]
            shadow-[10px_10px_20px_#cdd4db,-10px_-10px_20px_#ffffff]
            dark:shadow-[10px_10px_20px_#0f172a,-10px_-10px_20px_#2d3b55]">
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                <a href="/" className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full text-blue-500 transition-transform hover:scale-95
                    bg-[#f0f4f8] dark:bg-[#1e293b]
                    shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff]
                    dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55]">
                    ←
                </a>
                <h1 className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-200 truncate">
                    Results for: <span className="text-blue-500 capitalize">{query}</span>
                </h1>
                </div>

                <div className="flex items-center gap-4">
                <button onClick={toggleSort} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2
                    ${sortState !== "default" 
                    ? "bg-blue-500 text-white shadow-[inset_4px_4px_8px_#1d4ed8,inset_-4px_-4px_8px_#3b82f6]" 
                    : "bg-[#f0f4f8] dark:bg-[#1e293b] text-gray-600 dark:text-gray-300 shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55]"
                    }`}>
                    {getSortLabel()}
                </button>

                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all
                    bg-[#f0f4f8] dark:bg-[#1e293b]
                    shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff]
                    dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55]">
                    {theme === "dark" ? "☀️" : "🌙"}
                </button>
                </div>
            </div>

            {!loading && (
                <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar">
                    {stores.map((store) => (
                        <button key={store} onClick={() => setSelectedStore(store)} className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${selectedStore === store ? "bg-blue-500 text-white shadow-[inset_2px_2px_5px_#1d4ed8,inset_-2px_-2px_5px_#3b82f6]" : "bg-[#f0f4f8] dark:bg-[#1e293b] text-gray-500 dark:text-gray-400 shadow-[5px_5px_10px_#cdd4db,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#0f172a,-5px_-5px_10px_#2d3b55] hover:scale-105"}`}>{store}</button>
                    ))}
                </div>
            )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500"></div>
            <p className="mt-6 text-xl text-gray-500 dark:text-gray-400 font-medium">Inflating results...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayResults.map((item, index) => {
              const isCheapest = getPriceValue(item.price) === lowestPrice;
              const safeLink = getSafeLink(item.link, item.source, item.name);
              const itemId = getProductId(item);
              const isSaved = wishlistIds.includes(itemId); 

              return (
                <div key={itemId} className={`relative rounded-[2.5rem] p-4 flex flex-col group transition-all duration-300 hover:-translate-y-2 bg-[#f0f4f8] dark:bg-[#1e293b] shadow-[12px_12px_24px_#cdd4db,-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0f172a,-12px_-12px_24px_#2d3b55] ${isCheapest ? "ring-2 ring-red-500/50" : ""}`}>
                  
                  {/* 🔹 HEART BUTTON */}
                  <button 
                    onClick={() => toggleWishlist(item)}
                    className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90
                    ${isSaved ? "bg-red-500 text-white" : "bg-white/80 dark:bg-black/50 text-gray-400 hover:text-red-500"}`}
                  >
                    {isSaved ? "♥" : "♡"}
                  </button>

                  {/* 🔹 NEW: SHARE BUTTON */}
                  <button 
                    onClick={() => handleShare(item)}
                    className="absolute top-14 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 bg-white/80 dark:bg-black/50 text-gray-400 hover:text-blue-500"
                    title="Share Deal"
                  >
                    📤
                  </button>

                  {isCheapest && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-xs px-4 py-2 rounded-full shadow-lg z-10 animate-pulse">
                      🏆 BEST DEAL
                    </div>
                  )}

                  <div className="h-48 rounded-[2rem] flex items-center justify-center relative p-4 mb-4 overflow-hidden bg-[#f0f4f8] dark:bg-[#1e293b] shadow-[inset_6px_6px_12px_#cdd4db,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#2d3b55]">
                      <span className={`absolute top-4 left-4 px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-md ${getStoreColor(item.source)}`}>{item.source}</span>
                      {item.image ? (
                        <a href={safeLink} target="_blank" rel="noopener noreferrer" className="h-full w-full flex items-center justify-center">
                          <img src={item.image} alt={item.name} className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform hover:scale-110" />
                        </a>
                      ) : (<div className="text-gray-300 text-xs">No Image</div>)}
                  </div>

                  <div className="px-2 flex-1 flex flex-col justify-between">
                    <div>
                        <a href={safeLink} target="_blank" rel="noopener noreferrer">
                          <h3 className="font-bold text-gray-700 dark:text-gray-200 text-md leading-snug mb-2 line-clamp-2 hover:text-blue-500 transition-colors" title={item.name}>{item.name}</h3>
                        </a>
                        <div className="flex items-center gap-1 mb-3">
                            <span className="text-yellow-400 text-sm">★</span>
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{item.rating}</span>
                            <span className="text-[10px] text-gray-400">({item.reviews})</span>
                        </div>
                    </div>
                    
                    <div className="flex items-end justify-between mt-2">
                       <div>
                          <p className="text-xs text-gray-400 font-bold mb-1">{isCheapest ? <span className="text-red-500">🔥 LOWEST</span> : "PRICE"}</p>
                          <p className={`text-2xl font-black ${isCheapest ? "text-red-500" : "text-gray-800 dark:text-gray-100"}`}>{item.displayPrice || `₹${item.price}`}</p>
                       </div>
                       <a href={safeLink} target="_blank" rel="noopener noreferrer" className={`text-white w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[4px_4px_8px_#cdd4db,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#2d3b55] ${isCheapest ? "bg-red-500" : "bg-blue-500"}`}>➔</a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}