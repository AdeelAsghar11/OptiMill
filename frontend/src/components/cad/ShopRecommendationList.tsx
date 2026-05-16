"use client";

import React, { useState, useEffect } from "react";
import { Store, Star, MapPin, CheckCircle, ChevronRight, Loader2, Send, Zap, Plus, Search, CheckSquare, Square } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Recommendation {
  id: string;
  name: string;
  description: string;
  location_city: string;
  rating: number;
  match_score: number;
  is_verified: boolean;
  match_details: {
    capability_match: number;
    material_match: number;
    rating_factor: number;
    proximity_factor: number;
  };
}

export function ShopRecommendationList({ cadFileId, directShopId }: { cadFileId: string; directShopId?: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAllShops, setShowAllShops] = useState(false);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await axios.get(`${API_BASE_URL}/api/v1/cad/${cadFileId}/recommendations`, {
          params: { limit: showAllShops ? 50 : limit },
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        
        let data = res.data;
        
        // If directShopId is provided and not in the list, fetch it and add it
        if (directShopId && !data.find((s: Recommendation) => s.id === directShopId)) {
          const shopRes = await axios.get(`${API_BASE_URL}/api/v1/shops/${directShopId}`);
          if (shopRes.data?.shop) {
            const directShop = {
              ...shopRes.data.shop,
              match_score: 1.0, // Force high match if explicitly requested
              match_details: {
                capability_match: 1.0,
                material_match: 1.0,
                rating_factor: 1.0,
                proximity_factor: 1.0
              }
            };
            data = [directShop, ...data];
          }
        }

        setRecommendations(data);
        
        // Auto-select all by default
        setSelectedIds(new Set(data.map((s: Recommendation) => s.id)));
      } catch (e) {
        console.error("Failed to fetch recommendations:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [cadFileId, limit, showAllShops, directShopId]);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleMultiRequest = async () => {
    if (selectedIds.size === 0) return;
    
    setRequesting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await axios.post(`${API_BASE_URL}/api/v1/quotes/multi-request`, {
        cad_file_id: cadFileId,
        shop_ids: Array.from(selectedIds),
        quantity: 1,
        message: "Requesting quote based on AI shop recommendation."
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

  if (loading && recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Scanning global manufacturing network...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-400" />
            Manufacturing Partners
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {selectedIds.size} of {recommendations.length} shops selected
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!requestSuccess ? (
            <button
              onClick={handleMultiRequest}
              disabled={requesting || selectedIds.size === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
            >
              {requesting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 fill-white" />
              )}
              Send Requests ({selectedIds.size})
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-400/10 px-4 py-2.5 rounded-xl border border-emerald-400/20">
              <CheckCircle className="w-3.5 h-3.5" />
              Requests Dispatched
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {recommendations.map((shop, index) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              <div 
                onClick={() => toggleSelection(shop.id)}
                className={`glass p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedIds.has(shop.id) 
                    ? "border-blue-500/50 bg-blue-500/5" 
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    {selectedIds.has(shop.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-700" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-bold text-slate-100">{shop.name}</h5>
                      {shop.is_verified && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400/10" />
                      )}
                      {directShopId === shop.id && (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">Direct Request</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-3 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {shop.rating || "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {shop.location_city}
                      </span>
                    </div>
                    
                    <div className="text-[10px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg inline-block">
                      {shop.match_details.capability_match > 0.8 ? "Process Expert" : "Verified Partner"}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-xl font-black text-blue-400">
                      {Math.round(shop.match_score * 100)}%
                    </div>
                    <Link 
                      href={`/shops/${shop.id}`} 
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-slate-500 hover:text-blue-400 font-black uppercase tracking-widest flex items-center gap-1 group/link"
                    >
                      Profile <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!showAllShops && recommendations.length >= limit && (
          <button
            onClick={() => setShowAllShops(true)}
            className="w-full py-4 rounded-2xl border border-dashed border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Discover More Shops
          </button>
        )}
      </div>

      {requestSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400"
        >
          <p className="text-sm font-medium mb-4">
            Successfully sent quote requests to {selectedIds.size} partners. You'll be notified as they respond.
          </p>
          <Link 
            href={`/quotes/compare?cad_file_id=${cadFileId}`} 
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
          >
            Compare Quotes <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
