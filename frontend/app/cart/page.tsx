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
}

export default function CartPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().cart) {
          setCart(docSnap.data().cart);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const removeFromCart = async (item: Product) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    setCart((prev) => prev.filter((i) => i.link !== item.link));
    await updateDoc(docRef, { cart: arrayRemove(item) });
  };

  // Helper to parse price string "₹1,49,900" -> 149900
  const getPrice = (priceStr: string) => {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
  };

  const totalPrice = cart.reduce((acc, item) => acc + getPrice(item.price), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold dark:text-white">Loading Cart...</div>;

  return (
    <div className="min-h-screen p-6 md:p-12 bg-[#f0f4f8] dark:bg-[#1e293b] font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-gray-700 dark:text-gray-200 mb-8">Shopping Cart 🛒</h1>
        
        {cart.length === 0 ? (
           <div className="text-center mt-20">
             <p className="text-xl text-gray-400">Your cart is empty.</p>
             <Link href="/"><button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl">Go Shopping</button></Link>
           </div>
        ) : (
          <div className="flex flex-col gap-6">
            {cart.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-[2rem] bg-[#f0f4f8] dark:bg-[#1e293b] shadow-[8px_8px_16px_#cdd4db,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#2d3b55]">
                <img src={item.image} alt="product" className="w-20 h-20 object-contain mix-blend-multiply dark:mix-blend-normal" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 line-clamp-1">{item.name}</h3>
                  <p className="text-blue-500 font-bold">{item.displayPrice || item.price}</p>
                </div>
                <button onClick={() => removeFromCart(item)} className="text-red-500 font-bold px-3">✕</button>
              </div>
            ))}
            
            {/* Total & Checkout */}
            <div className="mt-8 p-6 rounded-[2rem] bg-blue-500 text-white shadow-xl flex justify-between items-center">
                <div>
                    <p className="text-sm opacity-80">Total Amount</p>
                    <h2 className="text-3xl font-black">₹{totalPrice.toLocaleString()}</h2>
                </div>
                <Link href="/checkout">
                    <button className="px-8 py-3 bg-white text-blue-600 font-black rounded-xl shadow-lg hover:scale-105 transition-transform">
                        CHECKOUT ➔
                    </button>
                </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}