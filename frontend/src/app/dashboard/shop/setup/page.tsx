"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Store, MapPin, DollarSign, Wrench, Package, 
  ArrowRight, Loader2, CheckCircle2, AlertCircle 
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const CAPABILITIES = ["CNC Machining", "3D Printing (FDM)", "3D Printing (SLA)", "Laser Cutting", "Woodworking", "Injection Molding", "Finishing"];
const MATERIALS = ["Aluminum", "Steel", "PLA", "ABS", "Resin", "Oak", "Pine", "Plywood", "Acrylic"];

export default function SetupShopPage() {
  const { user, session } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location_city: "",
    hourly_rate: "",
    capabilities: [] as string[],
    materials: [] as string[],
  });

  useEffect(() => {
    const fetchShop = async () => {
      if (!session?.access_token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/shops/my-shop`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (res.data) {
          setFormData({
            name: res.data.name || "",
            description: res.data.description || "",
            location_city: res.data.address || "",
            hourly_rate: res.data.hourly_rate?.toString() || "",
            capabilities: res.data.capabilities || [],
            materials: res.data.materials || [],
          });
          setIsEdit(true);
        }
      } catch (err) {
        console.log("No existing shop found, starting fresh setup.");
      } finally {
        setFetching(false);
      }
    };
    fetchShop();
  }, [session]);

  const toggleItem = (list: "capabilities" | "materials", item: string) => {
    setFormData(prev => ({
      ...prev,
      [list]: prev[list].includes(item) 
        ? prev[list].filter(i => i !== item)
        : [...prev[list], item]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_BASE_URL}/api/v1/shops/`, {
        ...formData,
        hourly_rate: parseFloat(formData.hourly_rate),
      }, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/shop"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create shop profile.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 rounded-[3rem] text-center max-w-md border border-emerald-500/20"
        >
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-4 text-white">
            Shop {isEdit ? "Updated" : "Created"}!
          </h1>
          <p className="text-slate-400">Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <span className="text-blue-500 font-black uppercase tracking-[0.2em] text-[10px] mb-3 block">
          {isEdit ? "Profile Management" : "Partnership Setup"}
        </span>
        <h1 className="text-5xl font-black tracking-tight mb-4">
          {isEdit ? "Edit Your" : "Setup Your"} <span className="text-blue-500">Shop Profile</span>
        </h1>
        <p className="text-slate-400 text-lg">
          {isEdit ? "Update your shop information to keep your profile competitive." : "Complete your profile to start receiving manufacturing requests from global clients."}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/5 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold">General Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Shop Name</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="e.g. Precision CNC Works"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Location (City)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  required
                  value={formData.location_city}
                  onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-11 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="e.g. New York"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">About Your Shop</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
              placeholder="Tell clients about your expertise and machines..."
            />
          </div>

          <div className="w-full md:w-1/2 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Hourly Rate (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                required
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-11 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="e.g. 75"
              />
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold">Capabilities</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {CAPABILITIES.map(cap => (
              <button
                key={cap}
                type="button"
                onClick={() => toggleItem("capabilities", cap)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
                  formData.capabilities.includes(cap) 
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" 
                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {cap}
              </button>
            ))}
          </div>
        </section>

        {/* Materials */}
        <section className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold">Supported Materials</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {MATERIALS.map(mat => (
              <button
                key={mat}
                type="button"
                onClick={() => toggleItem("materials", mat)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
                  formData.materials.includes(mat) 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !formData.name || formData.capabilities.length === 0}
          className="btn-premium w-full py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              {isEdit ? "Save Profile Changes" : "Initialize Shop Account"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </main>
  );
}
