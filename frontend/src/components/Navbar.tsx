"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Cpu, Upload, Store, LayoutDashboard, Package, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { NotificationBell } from "./notifications/NotificationBell";

const navItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Analyze CAD", href: "/upload", icon: Upload },
  { label: "Marketplace", href: "/shops", icon: Store },
  { label: "My Orders", href: "/orders", icon: Package },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-[100] px-6 py-4">
      <div className="max-w-7xl mx-auto glass rounded-2xl px-6 h-16 flex items-center justify-between shadow-2xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: 90 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all"
          >
            <Cpu className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-2xl font-black tracking-tighter">
            Opti<span className="text-blue-500">Mill</span>
          </span>
        </Link>

        {/* Nav Links - HCI: Recognition over Recall */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-blue-600 shadow-lg shadow-blue-600/30 rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span className="relative z-10 uppercase tracking-widest">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth Buttons - HCI: Feedback Loops */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-24 h-10 rounded-xl bg-white/5 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end hidden sm:block">
                <span className="text-xs font-bold text-slate-100">{user.user_metadata?.full_name || "Account"}</span>
                <span className="text-[10px] text-slate-500 font-medium">{user.email}</span>
              </div>
              <NotificationBell />
              <div className="h-6 w-px bg-white/10 mx-1" />
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-90"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-5 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="btn-premium px-6 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-widest"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
