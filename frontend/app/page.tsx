"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./firebase"; // Import your firebase connection
import Link from "next/link";

export default function Home() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<User | null>(null); // Store current user
  const router = useRouter();

  // 🔹 Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);

  // 🔹 Logout Function
  const handleLogout = async () => {
    await signOut(auth);
    alert("Logged out successfully!");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/results?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 bg-[#f0f4f8] dark:bg-[#1e293b]">
      
      {/* 🔹 NEW: Top Navigation Bar */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        {user ? (
          // IF LOGGED IN: Show Name & Logout
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-700 dark:text-gray-200 hidden md:block">
              Welcome, {user.displayName || "User"} 👋
            </span>
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-xl font-bold text-white bg-red-500 shadow-lg hover:scale-105 transition-transform"
            >
              Logout
            </button>
          </div>
        ) : (
          // IF NOT LOGGED IN: Show Login & Signup
          <div className="flex gap-4">
            <Link href="/login">
              <button className="px-6 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-[#f0f4f8] dark:bg-[#1e293b] 
              shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff] 
              dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55] 
              hover:scale-105 transition-transform">
                Login
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-6 py-2 rounded-xl font-bold text-white bg-blue-500 shadow-lg hover:scale-105 transition-transform">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* 🔹 Title */}
      <h1 className="text-5xl md:text-7xl font-black text-gray-700 dark:text-gray-200 mb-8 tracking-tight text-center">
        Price<span className="text-blue-500">AI</span>
      </h1>

      {/* 🔹 Search Box */}
      <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
        <input
          type="text"
          placeholder="Search for anything..."
          className="w-full p-6 pl-8 pr-16 rounded-[2rem] text-xl outline-none transition-all
          bg-[#f0f4f8] dark:bg-[#1e293b] text-gray-700 dark:text-gray-200
          shadow-[inset_10px_10px_20px_#cdd4db,inset_-10px_-10px_20px_#ffffff]
          dark:shadow-[inset_10px_10px_20px_#0f172a,inset_-10px_-10px_20px_#2d3b55]
          focus:ring-2 focus:ring-blue-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white bg-blue-500 
          shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff]
          dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55]
          hover:scale-110 active:scale-95 transition-all"
        >
          🔍
        </button>
      </form>
      
      <p className="mt-8 text-gray-500 dark:text-gray-400 font-medium">
        Powered by AI • Real-time Prices • Smart Savings
      </p>
    </div>
  );
}