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
  Layers
} from "lucide-react";
import { SprintTracker } from "@/components/dashboard/SprintTracker";

const steps = [
  { id: 1, title: "Submit", icon: Layers, desc: "Input manufacturing requirements" },
  { id: 2, title: "Analyze", icon: Activity, desc: "Rule-based quality risk scoring" },
  { id: 3, title: "Match", icon: Cpu, desc: "Find optimal production line" },
  { id: 4, title: "Quote", icon: DollarSign, desc: "Deterministic cost calculation" },
  { id: 5, title: "Schedule", icon: Calendar, desc: "Risk-buffered timeline" },
];

export default function Dashboard() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <header className="flex justify-between items-start mb-16">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold tracking-tight mb-2"
          >
            Opti<span className="text-blue-500">Mill</span>
          </motion.h1>
          <p className="text-slate-400 max-w-md">
            Production-grade rule-based manufacturing orchestration. 
            Deterministic intelligence for complex garment manufacturing.
          </p>
        </div>
        <SprintTracker />
      </header>

      {/* The Golden Path Stepper */}
      <section className="mb-20">
        <div className="flex justify-between mb-8">
          {steps.map((step) => (
            <div 
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                activeStep >= step.id ? "opacity-100" : "opacity-40"
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 glass ${
                activeStep === step.id ? "ring-2 ring-blue-500 ring-offset-4 ring-offset-[#0a0a0b]" : ""
              }`}>
                <step.icon className={`w-6 h-6 ${activeStep >= step.id ? "text-blue-400" : "text-slate-400"}`} />
              </div>
              <span className="text-xs font-medium uppercase tracking-widest text-slate-500">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Dynamic Step Content */}
        <div className="glass rounded-3xl p-12 min-h-[400px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 gap-12 items-center"
            >
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-4 uppercase tracking-tighter">
                  Step {activeStep} of 5
                </span>
                <h2 className="text-4xl font-semibold mb-6">
                  {steps[activeStep - 1].title} Phase
                </h2>
                <p className="text-xl text-slate-400 leading-relaxed mb-8">
                  {steps[activeStep - 1].desc}. Powered by deterministic rules 
                  and realistic $12-$45/hr machine data.
                </p>
                <button 
                  onClick={() => setActiveStep(prev => prev < 5 ? prev + 1 : 1)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold transition-all group"
                >
                  {activeStep === 5 ? "Restart Demo" : "Advance Pipeline"}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-2xl glass p-8 flex items-center justify-center">
                  {/* Decorative Engine Visualizer */}
                  <div className="grid grid-cols-3 gap-4 w-full">
                    {[...Array(9)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ 
                          duration: 2, 
                          delay: i * 0.2, 
                          repeat: Infinity 
                        }}
                        className="h-12 rounded-lg bg-blue-500/20 border border-blue-500/30"
                      />
                    ))}
                  </div>
                  <Zap className="absolute w-12 h-12 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Stats / Footer */}
      <footer className="grid grid-cols-4 gap-6">
        {[
          { label: "Active Machines", value: "50", unit: "Rows" },
          { label: "Logic Rules", value: "18", unit: "Deterministic" },
          { label: "Avg Precision", value: "0.12", unit: "mm" },
          { label: "Engine Status", value: "Online", unit: "Real-time" },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl">
            <span className="text-slate-500 text-xs uppercase tracking-widest block mb-1">{stat.label}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-xs text-blue-400">{stat.unit}</span>
            </div>
          </div>
        ))}
      </footer>
    </main>
  );
}
