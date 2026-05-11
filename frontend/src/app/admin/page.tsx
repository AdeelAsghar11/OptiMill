"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, ShieldCheck, AlertTriangle, Plus, Save } from "lucide-react";

const initialRules = [
  { id: "R01", name: "Material Tension Rule", code: "machine.age > 5 && fabric === 'silk'", score: 25, status: "Active" },
  { id: "R02", name: "Precision Threshold", code: "order.tolerance < machine.precision", score: 50, status: "Active" },
  { id: "R03", name: "Shift Overload", code: "machine.utilization > 0.9", score: 15, status: "Inactive" },
];

export default function AdminPanel() {
  const [rules, setRules] = useState(initialRules);

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Engine <span className="text-blue-500">Control Panel</span></h1>
          <p className="text-slate-400">Manage deterministic logic and manufacturing risk parameters.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-all">
          <Plus className="w-4 h-4" /> Add New Rule
        </button>
      </header>

      <div className="grid grid-cols-3 gap-8">
        {/* Rules Table */}
        <div className="col-span-2 glass rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-6 py-4">Rule Name</th>
                <th className="px-6 py-4">Logic Condition</th>
                <th className="px-6 py-4">Impact</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-medium">{rule.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-blue-400">{rule.code}</td>
                  <td className="px-6 py-4">
                    <span className="text-amber-500 font-bold">+{rule.score}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      rule.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"
                    }`}>
                      {rule.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Global Config Sidebar */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <Settings className="w-5 h-5" />
              <h3 className="font-semibold">Global Surcharges</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase block mb-1">Base Quality Buffer</label>
                <input type="text" defaultValue="5%" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase block mb-1">Max Risk Threshold</label>
                <input type="text" defaultValue="80%" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ring-blue-500" />
              </div>
              <button className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-all">
                <Save className="w-4 h-4" /> Save Config
              </button>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border-amber-500/20">
            <div className="flex items-center gap-2 mb-4 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold">Logic Health</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Deterministic engine is currently evaluating 3 active rules across 50 production lines. No logic conflicts detected.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-flex">
              <ShieldCheck className="w-3 h-3" /> AUDIT PASSED
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
