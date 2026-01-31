"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useTheme } from "next-themes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface OrderItem {
  name: string;
  source: string;
  price: string;
  image: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  method: string;
  items: OrderItem[];
}

export default function OrderHistory() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().orders) {
          // Sort orders by date (Newest first)
          const sortedOrders = docSnap.data().orders.sort((a: any, b: any) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setOrders(sortedOrders);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const downloadInvoice = (order: Order) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("PriceAI Invoice", 14, 20);
    doc.setFontSize(10);
    doc.text(`Order ID: #${order.id}`, 14, 30);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 14, 35);
    doc.text(`Payment: ${order.method.toUpperCase()}`, 14, 40);

    const tableColumn = ["Item", "Store", "Price"];
    const tableRows: any[] = [];

    order.items.forEach((item) => {
      tableRows.push([item.name.substring(0, 30) + "...", item.source, item.price]);
    });

    tableRows.push(["", "TOTAL", `Rs. ${order.total.toLocaleString()}`]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`PriceAI_Order_${order.id}.pdf`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold dark:text-white">Loading orders...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 dark:text-white">
        <h2 className="text-3xl font-black">Please Login First 🔒</h2>
        <Link href="/login"><button className="px-8 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg">Login Page</button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans transition-colors duration-300 bg-[#f0f4f8] dark:bg-[#1e293b]">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between p-6 rounded-[2rem] bg-[#f0f4f8] dark:bg-[#1e293b] shadow-[10px_10px_20px_#cdd4db,-10px_-10px_20px_#ffffff] dark:shadow-[10px_10px_20px_#0f172a,-10px_-10px_20px_#2d3b55]">
            <div className="flex items-center gap-4">
                <Link href="/" className="w-12 h-12 flex items-center justify-center rounded-full text-blue-500 bg-[#f0f4f8] dark:bg-[#1e293b] shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55] hover:scale-95 transition-transform">←</Link>
                <h1 className="text-2xl font-black text-gray-700 dark:text-gray-200">My Orders 📦</h1>
            </div>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-[#f0f4f8] dark:bg-[#1e293b] shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55]">{theme === "dark" ? "☀️" : "🌙"}</button>
        </div>

        {/* Order List */}
        {orders.length === 0 ? (
            <div className="text-center mt-20">
                <p className="text-2xl font-bold text-gray-400">No past orders found.</p>
                <Link href="/"><button className="mt-6 px-8 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">Start Shopping</button></Link>
            </div>
        ) : (
            <div className="flex flex-col gap-8">
                {orders.map((order) => (
                    <div key={order.id} className="p-6 rounded-[2rem] bg-[#f0f4f8] dark:bg-[#1e293b] shadow-[12px_12px_24px_#cdd4db,-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0f172a,-12px_-12px_24px_#2d3b55] border border-white/50 dark:border-gray-700/50">
                        
                        {/* Order Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-300 dark:border-gray-700">
                            <div>
                                <h2 className="text-xl font-black text-gray-800 dark:text-white">Order #{order.id}</h2>
                                <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-4 md:mt-0">
                                <span className="text-lg font-bold text-green-500">₹{order.total.toLocaleString()}</span>
                                <button onClick={() => downloadInvoice(order)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">📄 Invoice</button>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/50 dark:bg-black/20">
                                    <img src={item.image} alt={item.name} className="w-12 h-12 object-contain mix-blend-multiply dark:mix-blend-normal" />
                                    <div className="overflow-hidden">
                                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{item.name}</h3>
                                        <p className="text-xs text-blue-500 font-bold">{item.source}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}