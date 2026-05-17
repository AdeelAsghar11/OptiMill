"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Cpu, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") as "client" | "shop" || "client";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"client" | "shop">(initialRole);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: role,
          }
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user && data.session) {
        router.push("/");
        router.refresh();
      } else if (data.user && !data.session) {
        // Requires email verification
        setError("Please check your email for a verification link.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 shadow-2xl">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 text-center tracking-tight">
        Create an account
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-center mb-8 text-sm">
        Join OptiMill to start manufacturing.
      </p>

      {error && (
        <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${error.includes("check your email") ? "bg-blue-500/10 border-blue-500/20" : "bg-red-500/10 border-red-500/20"}`}>
          <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${error.includes("check your email") ? "text-blue-500" : "text-red-500"}`} />
          <p className={`text-sm ${error.includes("check your email") ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}>{error}</p>
        </div>
      )}

      <div className="flex p-1 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl mb-8">
        <button
          onClick={() => setRole("client")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            role === "client" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
        >
          Client
        </button>
        <button
          onClick={() => setRole("shop")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            role === "shop" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
        >
          Shop Master
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="Create a strong password"
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 px-4 font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign up
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 bg-[var(--background)] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none dark:bg-blue-500/20" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none dark:bg-indigo-500/20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Cpu className="w-6 h-6 text-white" />
          </div>
        </div>

        <Suspense fallback={<div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
          <RegisterForm />
        </Suspense>

        <p className="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
