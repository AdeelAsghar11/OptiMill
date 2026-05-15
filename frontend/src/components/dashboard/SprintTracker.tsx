"use client";

import React from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const tasks = [
  { id: "T01", title: "Backend Environment (Prod)", status: "done" },
  { id: "T02", title: "Machine Rate Curation", status: "done" },
  { id: "T03", title: "Risk Engine Logic", status: "done" },
  { id: "T04", title: "Matching & Quoting API", status: "done" },
  { id: "T05", title: "Scheduling Logic", status: "done" },
  { id: "T06", title: "Premium UI Scaffold", status: "done" },
];

export const SprintTracker = () => {
  return (
    <div className="glass p-6 rounded-2xl w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gradient">Sprint Tracker</h3>
        <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded">M1-M4 Sync</span>
      </div>
      
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 group">
            {task.status === "done" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : task.status === "loading" ? (
              <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
            ) : (
              <Circle className="w-5 h-5 text-slate-600" />
            )}
            <span className={`text-sm ${task.status === "done" ? "text-slate-400 line-through" : "text-slate-200"}`}>
              {task.title}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-white/5">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-400">Overall Progress</span>
          <span className="text-emerald-400">100%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 w-[100%]" />
        </div>
      </div>
    </div>
  );
};
