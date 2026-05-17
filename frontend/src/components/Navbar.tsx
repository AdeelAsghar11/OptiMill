"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Upload, Store, LayoutDashboard, Package, LogOut, Settings, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { NotificationBell } from "./notifications/NotificationBell";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Analyze", href: "/upload", icon: Upload },
  { label: "Market", href: "/shops", icon: Store },
  { label: "Orders", href: "/orders", icon: Package },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  // Close menu on route change
  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <header className="sticky top-0 z-[100] px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto glass rounded-2xl px-4 md:px-6 h-14 md:h-16 flex items-center justify-between shadow-2xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all"
            >
              <Cpu className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </motion.div>
            <span className="text-xl md:text-2xl font-black tracking-tighter">
              Opti<span className="text-blue-500">Mill</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
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
            {user?.user_metadata?.role === "shop" && (
              <Link 
                href="/dashboard/shop" 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                  pathname === "/dashboard/shop" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5"
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                Shop Dashboard
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            {isLoading ? (
              <div className="w-10 h-10 md:w-24 md:h-10 rounded-xl bg-white/5 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-100">{user.user_metadata?.full_name || "Account"}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{user.email}</span>
                </div>
                <ThemeToggle />
                <NotificationBell />
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
                <ThemeToggle />
                <Link
                  href="/auth/login"
                  className="px-3 md:px-5 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-premium px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-white text-[10px] md:text-xs font-black uppercase tracking-widest"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-[100] glass rounded-[2rem] px-6 h-16 flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-xl">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              className={`relative flex flex-col items-center gap-1 transition-all ${
                isActive ? "text-blue-500" : "text-slate-500"
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${isActive ? "bg-blue-500/10" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-500" : "text-slate-500"}`} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
                {label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-dot"
                  className="absolute -bottom-2 w-1 h-1 bg-blue-500 rounded-full"
                />
              )}
            </Link>
          );
        })}
        
        {/* Mobile More Button */}
        <button
          onClick={() => {
            console.log("Toggling menu:", !isMenuOpen);
            setIsMenuOpen(!isMenuOpen);
          }}
          className={`relative flex flex-col items-center gap-1 transition-all ${
            isMenuOpen ? "text-blue-500" : "text-slate-500"
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${isMenuOpen ? "bg-blue-500/10" : ""}`}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            More
          </span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[98]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed inset-x-4 bottom-24 z-[99] glass rounded-[2.5rem] p-8 shadow-3xl border border-white/10 overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-6">
                {user ? (
                  <>
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl mb-2 border border-white/5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
                        {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-black text-white leading-tight">
                          {user.user_metadata?.full_name || "Account"}
                        </span>
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">
                          {user.user_metadata?.role || "Client"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {user.user_metadata?.role === "shop" && (
                        <Link 
                          href="/dashboard/shop" 
                          className="flex items-center gap-4 p-4 text-blue-400 hover:text-blue-300 hover:bg-blue-400/5 rounded-2xl transition-all"
                        >
                          <Store className="w-5 h-5" />
                          <span className="font-bold uppercase tracking-widest text-[10px]">Shop Dashboard</span>
                        </Link>
                      )}
                      <Link 
                        href="/settings" 
                        className="flex items-center gap-4 p-4 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                      >
                        <Settings className="w-5 h-5 text-slate-500" />
                        <span className="font-bold uppercase tracking-widest text-[10px]">Account Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-4 p-4 text-red-400 hover:text-red-300 hover:bg-red-400/5 rounded-2xl transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-widest text-[10px]">Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center gap-3 p-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all active:scale-95"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="btn-premium flex items-center justify-center gap-3 p-5 rounded-[1.5rem] text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/30 active:scale-95"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
  </>
);
}
