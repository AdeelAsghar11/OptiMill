"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles, AlertCircle, FileText, Send } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ShopRecommendationList } from "@/components/cad/ShopRecommendationList";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const ALL_CAPABILITIES = ["CNC Milling", "3D Printing (FDM)", "3D Printing (SLA)", "Laser Cutting", "Injection Molding", "Sheet Metal", "Welding"];
const ALL_MATERIALS = ["Aluminum", "Steel", "PLA", "ABS", "PETG", "Resin", "Titanium", "Carbon Fiber"];

export default function ManualRequestPage() {
  const [description, setDescription] = useState("");
  const [capability, setCapability] = useState("");
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  const [showShops, setShowShops] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopIds, setSelectedShopIds] = useState<Set<string>>(new Set());
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  
  const { session } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const directShopId = searchParams?.get("shop");

  React.useEffect(() => {
    if (directShopId) {
      setShowShops(true);
      setLoadingShops(true);
      axios.get(`${API_BASE_URL}/api/v1/shops/${directShopId}`)
        .then(res => {
          if (res.data?.shop) {
            setShops([res.data.shop]);
            setSelectedShopIds(new Set([directShopId]));
          }
        })
        .finally(() => setLoadingShops(false));
    }
  }, [directShopId]);

  const handleFindShops = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowShops(true);
    setLoadingShops(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/shops/discover`, {
        params: { capability, material }
      });
      // Limit to top 8-10 shops
      const fetchedShops = res.data.slice(0, 10);
      setShops(fetchedShops);
      setSelectedShopIds(new Set(fetchedShops.map((s: any) => s.id)));
    } catch (e) {
      console.error("Failed to find shops", e);
    } finally {
      setLoadingShops(false);
    }
  };

  const handleMultiRequest = async () => {
    if (selectedShopIds.size === 0) return;
    setRequesting(true);
    try {
      if (!session) return;
      await axios.post(`${API_BASE_URL}/api/v1/quotes/multi-request`, {
        cad_file_id: null,
        shop_ids: Array.from(selectedShopIds),
        quantity: quantity,
        message: description
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setRequestSuccess(true);
    } catch (e) {
      console.error("Multi-quote request failed:", e);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 space-y-12 pb-32">
      <header className="mb-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black tracking-tight mb-4"
        >
          Custom <span className="text-blue-500">Order</span> Request
        </motion.h1>
        <p className="text-slate-400 max-w-xl text-lg">
          Create a manual request without a CAD file. Describe your needs, select materials, and our AI will match you with the best manufacturing partners.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className={`transition-all duration-500 ${showShops ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'}`}>
          <div className="glass-card p-8 rounded-[2rem]">
            <form onSubmit={handleFindShops} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Project Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your manufacturing needs in detail..."
                  rows={5}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Capability Needed</label>
                  <select
                    required
                    value={capability}
                    onChange={(e) => setCapability(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
                  >
                    <option value="">Select Process...</option>
                    {ALL_CAPABILITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Material Required</label>
                  <select
                    required
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
                  >
                    <option value="">Select Material...</option>
                    {ALL_MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full sm:w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-premium py-4 rounded-xl text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Find Matching Shops
              </button>
            </form>
          </div>
        </div>

        {showShops && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <div className="glass-card p-8 rounded-[2rem] h-full">
              {loadingShops ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-blue-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm font-bold uppercase tracking-widest">Analyzing Matches...</p>
                </div>
              ) : requestSuccess ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-400">Requests Dispatched</h3>
                  <p className="text-slate-400">Your custom order requests have been sent to {selectedShopIds.size} partners.</p>
                  <Link href="/dashboard/client" className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      Recommended Partners ({shops.length})
                    </h3>
                    <button
                      onClick={handleMultiRequest}
                      disabled={requesting || selectedShopIds.size === 0}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg"
                    >
                      {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Requests
                    </button>
                  </div>
                  
                  {shops.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No matching shops found for this capability and material.</div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
                      {shops.map(shop => (
                        <div 
                          key={shop.id}
                          onClick={() => {
                            const next = new Set(selectedShopIds);
                            if (next.has(shop.id)) next.delete(shop.id);
                            else next.add(shop.id);
                            setSelectedShopIds(next);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                            selectedShopIds.has(shop.id) ? "border-blue-500 bg-blue-500/10" : "border-slate-800 bg-white/5 hover:border-slate-700"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedShopIds.has(shop.id) ? "bg-blue-500 border-blue-500" : "border-slate-600"}`}>
                            {selectedShopIds.has(shop.id) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-100">{shop.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">{shop.location_city || "Global Partner"} • Rating: {shop.rating || "N/A"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
