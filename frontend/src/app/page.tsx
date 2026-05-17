"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Cpu, 
  DollarSign, 
  Calendar, 
  ChevronRight,
  Zap,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  LogOut,
  Store
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";

const steps = [
  { id: 1, title: "Submit", icon: Layers, desc: "Input manufacturing requirements and upload 3D models." },
  { id: 2, title: "Analyze", icon: Activity, desc: "Rule-based quality risk scoring and AI design classification." },
  { id: 3, title: "Match", icon: Cpu, desc: "Find optimal production lines and fabricators globally." },
  { id: 4, title: "Quote", icon: DollarSign, desc: "Deterministic cost calculation and instant quote generation." },
  { id: 5, title: "Schedule", icon: Calendar, desc: "Risk-buffered timeline and production scheduling." },
];

export default function Dashboard() {
  const [activeStep, setActiveStep] = useState(1);
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 space-y-20">
      {/* Hero Section - HCI: Clarity and Impact */}
      <header className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:items-end">
        <div className="space-y-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Precision Manufacturing
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] md:leading-[0.9]"
          >
            Design. <span className="text-blue-500">Analyze.</span> <br className="hidden md:block" />
            Fabricate.
          </motion.h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
            The intelligent marketplace for CAD analysis and fabrication. 
            Deterministic matching for CNC, 3D printing, and high-precision manufacturing.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
            <Link 
              href="/upload"
              className="btn-premium px-8 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-sm w-full sm:w-auto text-center flex items-center justify-center gap-2 shadow-2xl"
            >
              Analyze CAD File
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/request"
              className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest transition-all text-sm w-full sm:w-auto text-center shadow-lg"
            >
              Custom Order
            </Link>
            {user ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link 
                  href="/shops"
                  className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all text-sm w-full sm:w-auto text-center"
                >
                  Marketplace
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-8 py-4 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-all text-sm font-bold flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register?role=client"
                  className="btn-premium flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/30 active:scale-95"
                >
                  Join as Client
                </Link>
                <Link
                  href="/auth/register?role=shop"
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-600/30 active:scale-95 hover:bg-indigo-500"
                >
                  Join as Shop
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* The Golden Path Stepper - HCI: Progressive Disclosure */}
      <section className="space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-row justify-between items-center gap-2 p-2 glass rounded-3xl md:rounded-[2.5rem] border border-white/5">
          {steps.map((step) => {
            const isActive = activeStep === step.id;
            const isCompleted = activeStep > step.id;
            return (
              <button 
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`relative flex-1 w-full flex flex-col items-center gap-2 md:gap-3 p-4 md:p-6 rounded-2xl md:rounded-[2rem] transition-all duration-500 ${
                  isActive ? "bg-white/10 shadow-xl" : "hover:bg-white/5"
                }`}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isActive ? "bg-blue-600 text-white scale-110 rotate-12" : isCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                }`}>
                  <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex flex-col items-center">
                  <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
                    isActive ? "text-blue-400" : "text-slate-600"
                  }`}>Step 0{step.id}</span>
                  <span className={`text-xs md:text-sm font-bold ${
                    isActive ? "text-white" : "text-slate-400"
                  }`}>{step.title}</span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="step-indicator"
                    className="absolute -bottom-1 w-6 md:w-8 h-1 bg-blue-500 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Step Content */}
        <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 min-h-[400px] md:min-h-[450px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center w-full"
            >
              <div className="space-y-6 md:space-y-8">
                <div>
                  <span className="inline-block px-4 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black mb-4 md:mb-6 uppercase tracking-[0.2em] border border-blue-500/20">
                    Engine Phase — {activeStep} / 5
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tight leading-tight">
                    {steps[activeStep - 1].title} <span className="text-blue-500">Requirements</span>
                  </h2>
                  <p className="text-base md:text-xl text-slate-400 leading-relaxed">
                    {steps[activeStep - 1].desc} Powered by our proprietary deterministic matching engine 
                    and integrated with global fabrication standards.
                  </p>
                </div>
                
                <ul className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-slate-300 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Deterministic Feature {activeStep}.{item}
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/upload"
                  className="inline-flex items-center gap-3 text-blue-400 font-black uppercase tracking-widest text-sm group"
                >
                  Configure This Module
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="relative group">
                <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-white/10 flex items-center justify-center p-12 relative overflow-hidden backdrop-blur-sm">
                  {/* Premium Abstract Visualizer */}
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                  <div className="grid grid-cols-3 gap-6 w-full relative z-10">
                    {[...Array(9)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          scale: [1, 1.15, 1],
                          backgroundColor: i % 2 === 0 ? ["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.4)", "rgba(59, 130, 246, 0.2)"] : ["rgba(99, 102, 241, 0.2)", "rgba(99, 102, 241, 0.4)", "rgba(99, 102, 241, 0.2)"]
                        }}
                        transition={{ 
                          duration: 3, 
                          delay: i * 0.1, 
                          repeat: Infinity 
                        }}
                        className="h-16 rounded-2xl border border-white/10 shadow-inner"
                      />
                    ))}
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-blue-500/20 rounded-full m-12"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                      <Zap className="w-12 h-12 text-white fill-white" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Stats - HCI: Social Proof and Transparency */}
      <footer className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-white/5">
        {[
          { label: "Active Machines", value: "842", unit: "Global Nodes", icon: Cpu },
          { label: "Precision Rate", value: "99.98", unit: "% Accuracy", icon: Activity },
          { label: "Fabricators", value: "128", unit: "Verified Shops", icon: Layers },
          { label: "Processing Speed", value: "0.14", unit: "ms latency", icon: Zap },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-3xl group transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black tracking-tighter">{stat.value}</span>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{stat.unit}</span>
            </div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
          </motion.div>
        ))}
      </footer>
    </main>
  );
}
