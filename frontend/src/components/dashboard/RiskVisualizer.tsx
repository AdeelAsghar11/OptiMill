"use client";

import React from "react";
import { AlertCircle, ShieldCheck } from "lucide-react";

export const RiskVisualizer = ({ riskData }: { riskData: any }) => {
  if (!riskData) return <div className="animate-pulse">Analyzing...</div>;

  const isHigh = riskData.risk_level === "High";

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl flex items-center gap-4 ${isHigh ? "bg-red-500/10 border border-red-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
        {isHigh ? <AlertCircle className="w-8 h-8 text-red-500" /> : <ShieldCheck className="w-8 h-8 text-emerald-500" />}
        <div>
          <h4 className={`font-bold ${isHigh ? "text-red-400" : "text-emerald-400"}`}>
            Risk Level: {riskData.risk_level}
          </h4>
          <p className="text-sm text-slate-400">Total Score: {riskData.total_risk_score}/100</p>
        </div>
      </div>

      <div className="space-y-3">
        <h5 className="text-xs font-bold uppercase text-slate-500 tracking-widest">Deterministic Risk Factors</h5>
        {riskData.factors.map((f: any, i: number) => (
          <div key={i} className="glass p-4 rounded-xl border-l-4 border-amber-500">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-sm">{f.name}</span>
              <span className="text-xs text-amber-500">+{f.impact_score}% Impact</span>
            </div>
            <p className="text-xs text-slate-400">{f.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
