"use client";

import React, { useState, useEffect } from "react";
import { Store, Star, MapPin, CheckCircle, ChevronRight, Loader2, Send, Zap } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
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

export function ShopRecommendationList({ cadFileId }: { cadFileId: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await axios.get(`${API_BASE_URL}/api/v1/cad/${cadFileId}/recommendations`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        setRecommendations(res.data);
      } catch (e) {
        console.error("Failed to fetch recommendations:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [cadFileId]);

  const handleMultiRequest = async () => {
    if (recommendations.length === 0) return;
    
    setRequesting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const top3Ids = recommendations.slice(0, 3).map(s => s.id);
      
      await axios.post(`${API_BASE_URL}/api/v1/quotes/multi-request`, {
        cad_file_id: cadFileId,
        shop_ids: top3Ids,
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Finding the best shops for your design...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
        No matching shops found for this specific design requirement.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold flex items-center gap-2">
          <Store className="w-5 h-5 text-indigo-400" />
          Recommended Fabricators
        </h4>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Top {recommendations.length} Matches</span>
          {!requestSuccess ? (
            <button
              onClick={handleMultiRequest}
              disabled={requesting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              {requesting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Zap className="w-3 h-3 fill-white" />
              )}
              Request Top 3 Quotes
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
              <CheckCircle className="w-3 h-3" />
              Requests Sent
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((shop, index) => (
          <motion.div
            key={shop.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <div className="glass p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-bold text-slate-100 group-hover:text-white">{shop.name}</h5>
                    {shop.is_verified && (
                      <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400/10" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {shop.rating || "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {shop.location_city}
                    </span>
                  </div>
                  
                  {/* Match reasoning */}
                  <div className="text-[11px] text-slate-400 bg-blue-500/5 px-3 py-2 rounded-lg border border-blue-500/10 inline-block">
                    {shop.match_details.capability_match > 0.8 ? (
                      <span className="text-blue-300 font-medium">Expert in recommended process</span>
                    ) : shop.match_details.material_match > 0.8 ? (
                      <span className="text-indigo-300 font-medium">Specializes in required materials</span>
                    ) : (
                      "High overall compatibility score"
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-blue-400">
                    {Math.round(shop.match_score * 100)}%
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Match</div>
                  
                  <Link href={`/shops/${shop.id}`} className="mt-4 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-bold group/btn">
                    View Profile <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Visual indicator for rank 1 */}
            {index === 0 && (
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
