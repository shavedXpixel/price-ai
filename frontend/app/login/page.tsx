// frontend/app/login/page.tsx
"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // Go to Home after login
    } catch (err: any) {
      setError("Invalid Email or Password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] dark:bg-[#1e293b] p-4">
      <div className="w-full max-w-md p-8 rounded-[2.5rem] 
        bg-[#f0f4f8] dark:bg-[#1e293b]
        shadow-[20px_20px_40px_#cdd4db,-20px_-20px_40px_#ffffff]
        dark:shadow-[20px_20px_40px_#0f172a,-20px_-20px_40px_#2d3b55]">
        
        <h2 className="text-3xl font-black text-center text-gray-700 dark:text-gray-200 mb-8">
          Welcome Back 👋
        </h2>

        {error && <p className="text-red-500 text-center text-sm font-bold mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
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
            LOGIN
          </button>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">
          New here? <Link href="/signup" className="text-blue-500 font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}