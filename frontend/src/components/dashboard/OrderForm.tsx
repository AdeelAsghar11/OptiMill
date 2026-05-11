"use client";

import React from "react";

export const OrderForm = ({ onNext }: { onNext: (data: any) => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      fabric_type: formData.get("fabric_type"),
      required_tolerance: parseFloat(formData.get("tolerance") as string),
      quantity: parseInt(formData.get("quantity") as string),
    };
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-xs text-slate-500 uppercase block mb-2">Material Type</label>
          <select name="fabric_type" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-1 ring-blue-500 outline-none">
            <option value="Silk">Silk (High Risk)</option>
            <option value="Denim">Denim (Standard)</option>
            <option value="Cotton">Cotton (Standard)</option>
            <option value="Satin">Satin (High Risk)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase block mb-2">Required Tolerance (mm)</label>
          <input name="tolerance" type="number" step="0.01" defaultValue="0.1" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-1 ring-blue-500 outline-none" />
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-500 uppercase block mb-2">Order Quantity</label>
        <input name="quantity" type="number" defaultValue="500" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-1 ring-blue-500 outline-none" />
      </div>
      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-all">
        Run OptiMill Engine
      </button>
    </form>
  );
};
