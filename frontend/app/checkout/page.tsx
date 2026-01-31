"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase"; 
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Product {
  name: string;
  price: string;
  displayPrice: string;
  source: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // 🔹 Store cart locally for the invoice (before we wipe DB)
  const [lastOrderCart, setLastOrderCart] = useState<Product[]>([]);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch cart immediately to have it ready for invoice
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().cart) {
           setLastOrderCart(docSnap.data().cart);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔹 PDF GENERATOR FUNCTION
  const downloadInvoice = () => {
    const doc = new jsPDF();

    // 1. Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("PriceAI Invoice", 14, 20);

    doc.setFontSize(10);
    doc.text(`Order ID: #${orderId}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Customer: ${user?.displayName || "Valued Customer"}`, 14, 40);

    // 2. Table of Items
    const tableColumn = ["Item", "Store", "Price"];
    const tableRows: any[] = [];
    let total = 0;

    lastOrderCart.forEach((item) => {
      const priceVal = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
      total += priceVal;
      tableRows.push([item.name.substring(0, 30) + "...", item.source, item.displayPrice || item.price]);
    });

    // Add Total Row
    tableRows.push(["", "TOTAL", `Rs. ${total.toLocaleString()}`]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, // Blue Header
      styles: { fontSize: 10 },
    });

    // 3. Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for shopping with PriceAI!", 14, (doc as any).lastAutoTable.finalY + 10);
    doc.text("This is a computer-generated invoice.", 14, (doc as any).lastAutoTable.finalY + 15);

    // 4. Download
    doc.save(`PriceAI_Invoice_${orderId}.pdf`);
  };

  const handlePayment = async () => {
    setLoading(true);

    // Generate a random Order ID
    const newOrderId = Math.floor(100000 + Math.random() * 900000).toString();
    setOrderId(newOrderId);

    // Simulate Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clear Cart in DB
    if (user) {
        try {
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, { cart: [] });
        } catch (e) {
            console.error("Error clearing cart:", e);
        }
    }

    setLoading(false);
    setSuccess(true); 
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f4f8] dark:bg-[#1e293b] font-sans p-6 text-center">
        {/* Success Animation */}
        <div className="relative flex items-center justify-center w-32 h-32 bg-green-500 rounded-full animate-bounce-in shadow-2xl shadow-green-500/50 mb-8">
            <svg className="w-16 h-16 text-white animate-draw-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        
        <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-2 animate-fade-up">Payment Successful! 🎉</h1>
        <p className="text-gray-500 dark:text-gray-400 animate-fade-up delay-100 mb-8">Order #{orderId} has been placed.</p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs animate-fade-up delay-200">
            {/* 🔹 DOWNLOAD INVOICE BUTTON */}
            <button 
                onClick={downloadInvoice}
                className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
                <span>📄</span> Download Invoice
            </button>

            {/* HOME BUTTON */}
            <button 
                onClick={() => router.push("/")}
                className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
                Return to Home
            </button>
        </div>

        <style jsx>{`
          @keyframes bounce-in { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); } }
          @keyframes draw-check { 0% { stroke-dasharray: 100; stroke-dashoffset: 100; } 100% { stroke-dashoffset: 0; } }
          @keyframes fade-up { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
          .animate-bounce-in { animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; }
          .animate-draw-check { stroke-dasharray: 100; animation: draw-check 1s ease-out forwards 0.5s; }
          .animate-fade-up { animation: fade-up 0.8s ease-out forwards; }
          .delay-100 { animation-delay: 0.2s; }
          .delay-200 { animation-delay: 0.4s; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f0f4f8] dark:bg-[#1e293b]">
      <div className="w-full max-w-md p-8 rounded-[2.5rem] bg-[#f0f4f8] dark:bg-[#1e293b] 
        shadow-[20px_20px_40px_#cdd4db,-20px_-20px_40px_#ffffff] 
        dark:shadow-[20px_20px_40px_#0f172a,-20px_-20px_40px_#2d3b55]
        transition-all duration-500 hover:shadow-[25px_25px_50px_#cdd4db,-25px_-25px_50px_#ffffff]
        dark:hover:shadow-[25px_25px_50px_#0f172a,-25px_-25px_50px_#2d3b55]">
        
        <h2 className="text-3xl font-black text-gray-700 dark:text-gray-200 mb-8 tracking-tight">Checkout 💳</h2>

        {/* Payment Options */}
        <div className="flex gap-4 mb-8 p-2 rounded-2xl bg-gray-200/50 dark:bg-gray-800/50">
            {['card', 'upi', 'cod'].map((m) => (
                <button key={m} onClick={() => setMethod(m)} className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 ${method === m ? "bg-blue-500 text-white shadow-[0px_4px_12px_rgba(59,130,246,0.5)] scale-105" : "text-gray-500 hover:bg-white/50 dark:hover:bg-gray-700/50"}`}>{m}</button>
            ))}
        </div>

        {/* Dynamic Form */}
        <div className="mb-8 min-h-[180px]">
            {method === "card" && (
                <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative group">
                        <input type="text" placeholder="Card Number" className="w-full p-4 pl-12 rounded-xl bg-transparent border-none outline-none shadow-[inset_4px_4px_8px_#cdd4db,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#2d3b55] focus:ring-2 focus:ring-blue-400 transition-all" />
                        <span className="absolute left-4 top-4 text-xl opacity-50">💳</span>
                    </div>
                    <div className="flex gap-4">
                        <input type="text" placeholder="MM/YY" className="w-1/2 p-4 rounded-xl bg-transparent outline-none shadow-[inset_4px_4px_8px_#cdd4db,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#2d3b55] focus:ring-2 focus:ring-blue-400 transition-all" />
                        <input type="text" placeholder="CVV" className="w-1/2 p-4 rounded-xl bg-transparent outline-none shadow-[inset_4px_4px_8px_#cdd4db,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#2d3b55] focus:ring-2 focus:ring-blue-400 transition-all" />
                    </div>
                </div>
            )}
            {method === "upi" && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-full h-32 bg-white dark:bg-gray-800 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 group hover:border-blue-500 transition-colors cursor-pointer">
                        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">📷</span>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Scan QR Code</p>
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="Enter UPI ID (e.g. user@oksbi)" className="w-full p-4 pl-12 rounded-xl bg-transparent outline-none shadow-[inset_4px_4px_8px_#cdd4db,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#2d3b55] focus:ring-2 focus:ring-blue-400 transition-all" />
                        <span className="absolute left-4 top-4 text-lg opacity-50">📱</span>
                    </div>
                </div>
            )}
            {method === "cod" && (
                <div className="flex flex-col items-center justify-center h-full animate-in fade-in slide-in-from-bottom-4 duration-500 py-4 gap-4">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-4xl shadow-inner">📦</div>
                    <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-200 font-bold text-lg">Cash on Delivery</p>
                        <p className="text-gray-400 text-sm mt-1">Pay when your order arrives at your doorstep.</p>
                    </div>
                </div>
            )}
        </div>

        {/* Animated Pay Button */}
        <button onClick={handlePayment} disabled={loading} className={`group relative w-full py-4 rounded-2xl font-black text-white text-lg tracking-wider overflow-hidden transition-all duration-300 active:scale-95 shadow-[0px_10px_20px_rgba(0,0,0,0.1)] ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"}`}>
            <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>PROCESSING...</span>
                    </>
                ) : (
                    <><span>PAY NOW</span><span className="group-hover:translate-x-1 transition-transform">➔</span></>
                )}
            </div>
            {!loading && <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-1000 ease-in-out" />}
        </button>

      </div>
    </div>
  );
}