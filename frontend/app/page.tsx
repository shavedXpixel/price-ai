"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./firebase"; 
import Link from "next/link";
import { useTheme } from "next-themes"; 

// 🔹 CLICKABLE RUNNING BANNER
function TopScrollingBanner() {
    const router = useRouter();
    
    const alerts = [
        { text: "🔥 FLASHSALE: Get up to 40% off on Refurbished iPhones!", query: "iPhone" },
        { text: "🚀 TRENDING: Sony PS5 Pro prices just dropped!", query: "PS5 Pro" },
        { text: "💎 EXCLUSIVE: Lowest price found for MacBook Air M2", query: "MacBook Air M2" },
        { text: "⚡ SPEEDY: Real-time price tracking active for 50+ stores", query: "deals" },
        { text: "🌟 NEW: Check prices for Luxury Watch Collections", query: "Rolex" },
        { text: "📱 GRAB IT: Samsung S24 Ultra now starting at ₹1,09,999", query: "S24 Ultra" }
    ];

    const handleBannerClick = (q: string) => {
        router.push(`/results?q=${encodeURIComponent(q)}`);
    };

    return (
        <div className="fixed top-0 left-0 w-full h-10 bg-blue-600 dark:bg-blue-700 text-white overflow-hidden z-[100] flex items-center shadow-lg cursor-pointer">
            <div className="flex whitespace-nowrap animate-marquee items-center">
                {[...alerts, ...alerts].map((item, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleBannerClick(item.query)}
                        className="mx-10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline decoration-white underline-offset-4 transition-all"
                    >
                        {item.text}
                    </button>
                ))}
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 35s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<User | null>(null); 
  const router = useRouter();
  const { theme, setTheme } = useTheme(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false); 

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); 
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsMenuOpen(false);
    alert("Logged out successfully!");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/results?q=${encodeURIComponent(query)}`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 bg-[#f0f4f8] dark:bg-[#1e293b]">
      
      <TopScrollingBanner />

      {/* 🔹 Navigation */}
      <div className="absolute top-14 right-6 z-50 flex flex-col items-end">
        <div className="flex items-center gap-4">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-[#f0f4f8] dark:bg-[#1e293b] shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55] active:scale-95 transition-all">
                {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-[#f0f4f8] dark:bg-[#1e293b] text-gray-700 dark:text-gray-200 shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55] active:scale-95 transition-all">
                {isMenuOpen ? "✕" : "☰"}
            </button>
            
            {/* Desktop Navigation Group */}
            <div className="hidden md:flex items-center gap-4">
                {user ? (
                    <>
                        <span className="font-bold text-gray-700 dark:text-gray-200 px-2">
                             Hi, {user.displayName ? user.displayName.split(' ')[0] : "User"} 👋
                        </span>
                        <Link href="/orders"><button className="px-4 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-[#f0f4f8] dark:bg-[#1e293b] shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55] hover:scale-105 transition-transform">📦 Orders</button></Link>
                        <Link href="/wishlist"><button className="px-4 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-[#f0f4f8] dark:bg-[#1e293b] shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55] hover:scale-105 transition-transform">❤️ Wishlist</button></Link>
                        <Link href="/cart"><button className="px-4 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-[#f0f4f8] dark:bg-[#1e293b] shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55] hover:scale-105 transition-transform">🛒 Cart</button></Link>
                        <button onClick={handleLogout} className="px-6 py-2 rounded-xl font-bold text-white bg-red-500 shadow-lg hover:scale-105 transition-transform">Logout</button>
                    </>
                ) : (
                    <>
                        <Link href="/login"><button className="px-6 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-[#f0f4f8] dark:bg-[#1e293b] shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55] hover:scale-105 transition-transform">Login</button></Link>
                        <Link href="/signup"><button className="px-6 py-2 rounded-xl font-bold text-white bg-blue-500 shadow-lg hover:scale-105 transition-transform">Sign Up</button></Link>
                    </>
                )}
            </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
            <div className="mt-4 w-48 flex flex-col gap-3 p-4 rounded-2xl bg-[#f0f4f8] dark:bg-[#1e293b] shadow-[10px_10px_20px_#cdd4db,-10px_-10px_20px_#ffffff] dark:shadow-[10px_10px_20px_#0f172a,-10px_-10px_20px_#2d3b55] md:hidden animate-in slide-in-from-top-2">
                {user ? (
                    <>
                        <div className="text-center font-bold text-blue-500 pb-2 border-b border-gray-300 dark:border-gray-700">
                             Hi, {user.displayName ? user.displayName.split(' ')[0] : "User"}!
                        </div>
                        <Link href="/orders" onClick={() => setIsMenuOpen(false)}><button className="w-full text-left px-4 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300">📦 Orders</button></Link>
                        <Link href="/wishlist" onClick={() => setIsMenuOpen(false)}><button className="w-full text-left px-4 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300">❤️ Wishlist</button></Link>
                        <Link href="/cart" onClick={() => setIsMenuOpen(false)}><button className="w-full text-left px-4 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300">🛒 Cart</button></Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 rounded-xl font-bold text-red-500">Logout</button>
                    </>
                ) : (
                    <>
                        <Link href="/login" onClick={() => setIsMenuOpen(false)}><button className="w-full text-left px-4 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300">Login</button></Link>
                        <Link href="/signup" onClick={() => setIsMenuOpen(false)}><button className="w-full text-left px-4 py-2 rounded-xl font-bold text-blue-500">Sign Up</button></Link>
                    </>
                )}
            </div>
        )}
      </div>

      {/* 🔹 Main Hero Section */}
      <div className="animate-in fade-in zoom-in duration-700 flex flex-col items-center">
        
        {/* 🔹 USER NAME DISPLAYED ON CENTER SCREEN */}
        {user && (
            <div className="mb-2 text-xl md:text-2xl font-bold text-gray-500 dark:text-gray-400 opacity-80">
                Hi, {user.displayName ? user.displayName : "Shop Master"} 👋
            </div>
        )}

        <h1 className="text-6xl md:text-8xl font-black text-gray-700 dark:text-gray-200 mb-8 tracking-tight text-center">
            Price<span className="text-blue-500">AI</span>
        </h1>

        <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
            <input
            type="text"
            placeholder="Search for anything..."
            className="w-full p-6 pl-8 pr-16 rounded-[2rem] text-xl outline-none transition-all bg-[#f0f4f8] dark:bg-[#1e293b] text-gray-700 dark:text-gray-200 shadow-[inset_10px_10px_20px_#cdd4db,inset_-10px_-10px_20px_#ffffff] dark:shadow-[inset_10px_10px_20px_#0f172a,inset_-10px_-10px_20px_#2d3b55] focus:ring-2 focus:ring-blue-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white bg-blue-500 shadow-lg active:scale-95 transition-all">🔍</button>
        </form>
        
        <p className="mt-8 text-gray-500 dark:text-gray-400 font-medium text-center px-4">
            Tap a trending alert above or search to start saving.
        </p>
      </div>
    </div>
  );
}