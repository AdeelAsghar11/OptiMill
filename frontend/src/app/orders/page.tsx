"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Search, ChevronRight, Activity, Clock, DollarSign } from "lucide-react";

// Mock data for initial display, would come from API in real usage
const mockOrders = [
  { id: "ORD-721", fabric: "Silk Blend", qty: 500, status: "scheduled", date: "2024-05-11" },
  { id: "ORD-104", fabric: "Heavy Denim", qty: 1200, status: "analyzed", date: "2024-05-10" },
  { id: "ORD-992", fabric: "Fine Cotton", qty: 300, status: "pending", date: "2024-05-09" },
];

export default function OrderHistory() {
  const [orders, setOrders] = useState(mockOrders);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "scheduled": return "text-emerald-400 bg-emerald-500/10";
      case "analyzed": return "text-blue-400 bg-blue-500/10";
      case "quoted": return "text-amber-400 bg-amber-500/10";
      default: return "text-slate-400 bg-white/5";
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Order <span className="text-blue-500">Pipeline History</span></h1>
        <p className="text-slate-400">Track the lifecycle of every deterministic production orchestration.</p>
      </header>

      <div className="grid grid-cols-4 gap-6 mb-12">
        {[
          { label: "Active Orders", value: "12", icon: Package },
          { label: "Avg Risk Score", value: "24", icon: Activity },
          { label: "Total Volume", value: "5.4k", icon: Search },
          { label: "Pipeline Status", value: "Healthy", icon: Clock },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl">
            <stat.icon className="w-5 h-5 text-blue-400 mb-4" />
            <span className="text-slate-500 text-[10px] uppercase tracking-widest block mb-1">{stat.label}</span>
            <span className="text-2xl font-bold">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <h3 className="font-semibold">Recent Production Flows</h3>
          <div className="flex gap-2">
            <input type="text" placeholder="Search orders..." className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 ring-blue-500" />
          </div>
        </div>
        
        <div className="divide-y divide-white/5">
          {orders.map((order) => (
            <motion.div 
              key={order.id}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
              className="p-6 flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-blue-400">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold">{order.id} — {order.fabric}</h4>
                  <span className="text-xs text-slate-500">Quantity: {order.qty} units • Created {order.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase">Stage {order.status === "scheduled" ? "5/5" : "2/5"}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
