// frontend/app/signup/page.tsx
"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // 🔹 New: Import database tools
import { auth, db } from "../firebase"; // 🔹 New: Import the db connection
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // 1. Create the Account (Authentication)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Add Display Name to Auth Profile
      await updateProfile(user, { displayName: name });

      // 3. 🔹 SAVE TO DATABASE (The Magic Step)
      // We create a document inside the "users" collection with the same ID as the user
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        role: "customer", // You can use this later to make "admin" accounts!
      });

      alert("Account Created & Saved! Redirecting...");
      router.push("/login");
    } catch (err: any) {
      console.error("Signup Error:", err);
      setError(err.message.replace("Firebase:", "").trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] dark:bg-[#1e293b] p-4">
      <div className="w-full max-w-md p-8 rounded-[2.5rem] 
        bg-[#f0f4f8] dark:bg-[#1e293b]
        shadow-[20px_20px_40px_#cdd4db,-20px_-20px_40px_#ffffff]
        dark:shadow-[20px_20px_40px_#0f172a,-20px_-20px_40px_#2d3b55]">
        
        <h2 className="text-3xl font-black text-center text-gray-700 dark:text-gray-200 mb-8">
          Join Price AI 🚀
        </h2>

        {error && <p className="text-red-500 text-center text-sm font-bold mb-4">{error}</p>}

        <form onSubmit={handleSignup} className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 rounded-xl outline-none transition-all
            bg-[#f0f4f8] dark:bg-[#1e293b] text-gray-700 dark:text-white
            shadow-[inset_6px_6px_12px_#cdd4db,inset_-6px_-6px_12px_#ffffff]
            dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#2d3b55]
            focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl outline-none transition-all
            bg-[#f0f4f8] dark:bg-[#1e293b] text-gray-700 dark:text-white
            shadow-[inset_6px_6px_12px_#cdd4db,inset_-6px_-6px_12px_#ffffff]
            dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#2d3b55]
            focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl outline-none transition-all
            bg-[#f0f4f8] dark:bg-[#1e293b] text-gray-700 dark:text-white
            shadow-[inset_6px_6px_12px_#cdd4db,inset_-6px_-6px_12px_#ffffff]
            dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#2d3b55]
            focus:ring-2 focus:ring-blue-400"
            required
          />

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-black text-white bg-blue-500 transition-transform active:scale-95
            shadow-[6px_6px_12px_#cdd4db,-6px_-6px_12px_#ffffff]
            dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#2d3b55]"
          >
            SIGN UP
          </button>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">
          Already have an account? <Link href="/login" className="text-blue-500 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}