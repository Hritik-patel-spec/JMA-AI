"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  Phone,
  User,
  BookOpen,
  Hash,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Login Fields
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // SignUp Fields
  const [fullName, setFullName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  // Handle Sign Up (Direct Save to Excel)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ text: "Password and Confirm Password do not match!", type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          studentClass,
          rollNo,
          phone,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Sign Up failed");

      setMessage({ text: "Account created successfully! Saved to Excel. Please Sign In now.", type: "success" });
      setAuthMode("login");
      setLoginIdentifier(phone || email);
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login (Check Excel Sheet)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Save user record locally and redirect
      localStorage.setItem("jma_user", JSON.stringify(data.user));
      localStorage.setItem("jma_open_new_chat", "true");

      router.push("/");
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0d0e12] text-gray-100 flex items-center justify-center p-4 relative overflow-x-hidden font-sans">
      <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -top-10 -left-10 animate-pulse" />
      <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -bottom-10 -right-10 animate-pulse" />

      <div className="w-full max-w-md bg-[#13141c] border border-gray-800/80 rounded-3xl p-7 shadow-2xl backdrop-blur-xl relative z-10 my-8">
        
        {/* LOGO */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 mb-3 flex items-center justify-center">
            <img src="/jma.png" alt="Jesus and Mary Academy Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide text-white">JMA.AI Portal</h1>
          <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider font-medium">
            Jesus and Mary Academy
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-xs text-center font-medium border ${
            message.type === "error" 
              ? "bg-red-500/10 border-red-500/30 text-red-400" 
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}>
            {message.text}
          </div>
        )}

        {/* Toggle Tab */}
        <div className="grid grid-cols-2 gap-1 bg-[#181a22] p-1 rounded-xl border border-gray-800 mb-5">
          <button
            type="button"
            onClick={() => { setAuthMode("login"); setMessage(null); }}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              authMode === "login"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode("signup"); setMessage(null); }}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              authMode === "signup"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* SIGN IN FORM */}
        {authMode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                Mobile Number or Email
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3 text-gray-500" size={18} />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="9876543210 or student@jma.com"
                  className="w-full bg-[#181a22] border border-gray-800 focus:border-blue-500 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181a22] border border-gray-800 focus:border-blue-500 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? "Matching Records..." : "Sign In"}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* SIGN UP FORM */}
        {authMode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-3">
            {/* Full Name */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3 text-gray-500" size={18} />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Student Full Name"
                  className="w-full bg-[#181a22] border border-gray-800 focus:border-blue-500 rounded-xl pl-11 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Class & Roll No */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                  Class
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 text-gray-500" size={16} />
                  <input
                    type="text"
                    required
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    placeholder="Class 10-A"
                    className="w-full bg-[#181a22] border border-gray-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                  Roll No
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 text-gray-500" size={16} />
                  <input
                    type="text"
                    required
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="Roll Number"
                    className="w-full bg-[#181a22] border border-gray-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3 text-gray-500" size={18} />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-[#181a22] border border-gray-800 focus:border-blue-500 rounded-xl pl-11 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 text-gray-500" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  className="w-full bg-[#181a22] border border-gray-800 focus:border-blue-500 rounded-xl pl-11 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-500" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#181a22] border border-gray-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                  Confirm
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-500" size={16} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#181a22] border border-gray-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {isLoading ? "Saving Record..." : "Complete Sign Up & Save"}
            </button>
          </form>
        )}

        <p className="text-[11px] text-center text-gray-500 mt-5">
          Powered by Sylvia AI • Jesus and Mary Academy
        </p>
      </div>
    </div>
  );
}