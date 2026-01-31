"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (query) {
      router.push(`/results?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
        PriceAI 🇮🇳
      </h1>
      
      <div className="w-full max-w-lg flex flex-col gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What are you looking for?"
          className="w-full p-4 text-lg border-2 border-gray-200 rounded-full shadow-sm focus:border-blue-500 focus:outline-none px-6"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        
        <button
          onClick={handleSearch}
          className="self-center bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition"
        >
          Search Prices
        </button>
      </div>
    </div>
  );
}