"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      // 1. Wait for Auth to initialize
      auth.onAuthStateChanged(async (user) => {
        if (!user) {
          router.push("/login");
          return;
        }

        // 2. Verify Admin Role in Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().role === "admin") {
          setIsAdmin(true);
          fetchUsers(); // 3. Only fetch data if admin
        } else {
          router.push("/"); // Kick out non-admins
        }
      });
    };

    checkAccess();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to ban this user?")) {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white bg-black">Verifying Admin Access...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-10 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-6xl mx-auto">
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Admin Console
          </h1>
          <p className="text-gray-400 mt-2">Monitor user activity and manage access.</p>
        </div>
        <button 
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm font-bold"
        >
          ← Back to Site
        </button>
      </div>

      {/* Glassmorphic Table Container */}
      <div className="max-w-6xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-xs uppercase tracking-widest">
              <th className="p-6">User Name</th>
              <th className="p-6">Email Address</th>
              <th className="p-6">Role</th>
              <th className="p-6">User ID</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <motion.tr 
                key={user.id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                className="group"
              >
                <td className="p-6 font-bold text-lg">{user.name || "Anonymous"}</td>
                <td className="p-6 text-gray-300 font-mono text-sm">{user.email}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    user.role === 'admin' 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {user.role || "USER"}
                  </span>
                </td>
                <td className="p-6 text-gray-600 text-xs font-mono">{user.id}</td>
                <td className="p-6 text-right">
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3 py-1 rounded-lg text-xs font-bold transition"
                    >
                      Ban User
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="p-10 text-center text-gray-500">No users found.</div>
        )}
      </div>
    </div>
  );
}