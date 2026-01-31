"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Define the shape of the data
interface Product {
  name: string;
  price: string;
  displayPrice: string;
  source: string;
  link: string;
  image: string;
}

// ---------------------------------------------------------
// 1. The Logic Component (Handles the search)
// ---------------------------------------------------------
function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q"); 
  
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setLoading(true);
      // NOTE: Make sure this URL matches your Render Backend URL
      fetch(`https://price-ai-backend.onrender.com/search/${query}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results);
          setLoading(false);
        })
        .catch((err) => {
            console.error(err);
            setLoading(false);
        });
    }
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
          <a href="/" className="text-blue-600 hover:underline mb-4 inline-block">← Back to Search</a>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Best Prices for: <span className="text-blue-600 capitalize">{query}</span>
          </h1>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-xl text-gray-600">Gathering prices from across India...</p>
        </div>
      ) : (
        /* Results Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group"
            >
              {/* Product Image */}
              <div className="h-56 p-6 bg-white flex items-center justify-center border-b border-gray-50 relative">
                  <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold text-gray-600 bg-gray-100 rounded-full uppercase tracking-wider shadow-sm">
                      {item.source}
                  </span>
                  
                  {item.image ? (
                      <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                      />
                  ) : (
                      <div className="text-gray-300 text-sm">No Image Available</div>
                  )}
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg leading-tight mb-3 line-clamp-2" title={item.name}>
                    {item.name}
                  </h3>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                   <div>
                      <p className="text-xs text-gray-500 font-medium">Best Price</p>
                      <p className="text-2xl font-bold text-green-700">
                          {item.displayPrice || `₹${item.price}`}
                      </p>
                   </div>
                   <a 
                     href={item.link} 
                     target="_blank"
                     rel="noopener noreferrer"
                     className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-md"
                   >
                     Buy Now
                   </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && results.length === 0 && (
          <div className="text-center mt-20 text-gray-500">
              <p className="text-xl">No results found.</p>
              <p>Try searching for a simpler term like "iPhone 15"</p>
          </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// 2. The Page Component (Wraps logic in Suspense)
// ---------------------------------------------------------
export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-900">
      <Suspense fallback={<div className="text-center mt-20">Loading Search...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}