"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import Link from "next/link";
import { useTheme } from "next-themes";

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

export default function WishlistPage() {
  const [user, setUser] = useState<User | null>(null);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  // 🔹 Helper to create a Unique ID
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
          setWishlist(docSnap.data().wishlist);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const removeFromWishlist = async (item: Product) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    const targetId = getProductId(item);
    
    // 🔹 FIX: Filter by Unique ID, not just Link
    setWishlist((prev) => prev.filter((i) => getProductId(i) !== targetId));

    // Remove from DB
    await updateDoc(docRef, {
      wishlist: arrayRemove(item)
    });
  };

  // --- (Keep existing Link Helpers from previous code) ---
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

  const getStoreColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("amazon")) return "bg-[#FF9900] text-black";
    if (s.includes("flipkart")) return "bg-[#2874F0] text-white";
    if (s.includes("croma")) return "bg-[#00E9BF] text-black";
    if (s.includes("cashify")) return "bg-[#4CAF50] text-white";
    if (s.includes("reliance")) return "bg-[#E42529] text-white";
    return "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200";
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold dark:text-white">Loading your wishlist...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 dark:text-white">
        <h2 className="text-3xl font-black">Please Login First 🔒</h2>
        <Link href="/login">
            <button className="px-8 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg">Login Page</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans transition-colors duration-300 bg-[#f0f4f8] dark:bg-[#1e293b]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between p-6 rounded-[2rem] 
          bg-[#f0f4f8] dark:bg-[#1e293b]
          shadow-[10px_10px_20px_#cdd4db,-10px_-10px_20px_#ffffff]
          dark:shadow-[10px_10px_20px_#0f172a,-10px_-10px_20px_#2d3b55]">
          
            <div className="flex items-center gap-4">
                <Link href="/" className="w-12 h-12 flex items-center justify-center rounded-full text-blue-500 
                    bg-[#f0f4f8] dark:bg-[#1e293b]
                    shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff]
                    dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55]
                    hover:scale-95 transition-transform">
                    ←
                </Link>
                <h1 className="text-2xl font-black text-gray-700 dark:text-gray-200">
                    My Wishlist ❤️
                </h1>
            </div>

            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-12 h-12 rounded-full flex items-center justify-center text-xl
                bg-[#f0f4f8] dark:bg-[#1e293b]
                shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff]
                dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55]">
                {theme === "dark" ? "☀️" : "🌙"}
            </button>
        </div>

        {wishlist.length === 0 ? (
            <div className="text-center mt-20">
                <p className="text-2xl font-bold text-gray-400">Your wishlist is empty! 💔</p>
                <Link href="/">
                    <button className="mt-6 px-8 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                        Start Shopping
                    </button>
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {wishlist.map((item, index) => {
                    const safeLink = getSafeLink(item.link, item.source, item.name);
                    const itemId = getProductId(item);

                    return (
                        <div key={itemId} className="relative rounded-[2.5rem] p-4 flex flex-col group transition-all duration-300 hover:-translate-y-2 
                            bg-[#f0f4f8] dark:bg-[#1e293b]
                            shadow-[12px_12px_24px_#cdd4db,-12px_-12px_24px_#ffffff]
                            dark:shadow-[12px_12px_24px_#0f172a,-12px_-12px_24px_#2d3b55]">
                        
                        <button 
                            onClick={() => removeFromWishlist(item)}
                            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 text-gray-500 hover:text-red-500 flex items-center justify-center shadow-md transition-all active:scale-90"
                            title="Remove"
                        >
                            ✕
                        </button>

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
                                <p className="text-xs text-gray-400 font-bold mb-1">PRICE</p>
                                <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{item.displayPrice || `₹${item.price}`}</p>
                            </div>
                            <a href={safeLink} target="_blank" rel="noopener noreferrer" className="text-white w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform bg-blue-500 shadow-md">➔</a>
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