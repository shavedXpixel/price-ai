"use client";
import { useState } from "react";
import { auth, db } from "../firebase"; // 🔹 Added db import
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // 🔹 Added Firestore imports
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Create User in Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update Auth Profile Name
      await updateProfile(user, { displayName: name });

      // 3. 🔹 SAVE TO DATABASE (Fixes "Anonymous" issue)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: "user", // Default role
        createdAt: new Date().toISOString(),
        cart: [],
        searchHistory: []
      });

      router.push("/");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-700">
      
      {/* 🔹 SHARED MESH GRADIENT BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ rotate: 360, scale: [1.2, 1, 1.2] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-500/20 dark:bg-purple-600/10 blur-[120px] rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-500/20 dark:bg-blue-600/10 blur-[120px] rounded-full"
          />
      </div>

      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-10 rounded-[2.5rem] bg-white/60 dark:bg-gray-900/60 backdrop-blur-3xl border border-white/40 dark:border-gray-800/50 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-2">Join PriceAI</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Start comparing prices like a pro</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              className="p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 outline-none focus:ring-4 focus:ring-blue-500/20 transition-all dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Email</label>
            <input 
              type="email" 
              placeholder="john@example.com" 
              className="p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 outline-none focus:ring-4 focus:ring-blue-500/20 transition-all dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Password</label>
            <input 
              type="password" 
              placeholder="Create a password" 
              className="p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 outline-none focus:ring-4 focus:ring-blue-500/20 transition-all dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="mt-4 py-4 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-600/20"
          >
            Create Account
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Already have an account? <Link href="/login" className="text-blue-500 font-black hover:underline underline-offset-4">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}