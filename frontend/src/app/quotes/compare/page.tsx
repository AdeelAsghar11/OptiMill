"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Clock, DollarSign, CheckCircle2, Loader2, ArrowLeft, Zap } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function QuoteComparePage() {
  const searchParams = useSearchParams();
  const cadFileId = searchParams?.get("cad_file_id");
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuotes() {
      if (!cadFileId) { setLoading(false); return; }
      
      try {
        const session = useAuthStore.getState().session;
        if (!session) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/v1/quotes/compare/${cadFileId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        setQuotes(res.data);
      } catch (err) {
        console.error("Error fetching quotes:", err);
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuotes();
  }, [cadFileId]);

  const handleAccept = async (quoteId: string) => {
    setAccepting(quoteId);
    try {
      const session = useAuthStore.getState().session;
      if (!session) return;

      await axios.post(`${API_BASE_URL}/api/v1/quotes/accept/${quoteId}`, {}, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setAccepted(quoteId);
    } catch (e) {
      console.error(e);
    } finally {
      setAccepting(null);
    }
  };

  // Find best (cheapest) and fastest quotes
  const bestPrice = quotes.length ? Math.min(...quotes.map((q) => q.amount)) : null;
  const fastestDelivery = quotes.length ? Math.min(...quotes.map((q) => q.delivery_days)) : null;

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Compare <span className="text-blue-500">Quotes</span>
        </h1>
        <p className="text-slate-400">
          {quotes.length > 0 ? `${quotes.length} shop${quotes.length > 1 ? "s" : ""} responded to your request.` : "Waiting for shops to respond..."}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-24">
          <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No quotes yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {quotes.map((q, i) => {
            const isBestPrice = q.amount === bestPrice;
            const isFastest  = q.delivery_days === fastestDelivery;
            const isAccepted = accepted === q.id;

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`glass rounded-2xl p-6 flex flex-col gap-5 relative transition-all duration-300 ${
                  isAccepted ? "border-green-500/50 shadow-lg shadow-green-500/10" : "hover:border-blue-500/30"
                }`}
              >
                {/* Badges */}
                <div className="absolute -top-3 left-4 flex gap-2">
                  {isBestPrice && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500 text-white text-[10px] font-bold shadow-lg">
                      <Zap className="w-3 h-3" /> Best Price
                    </span>
                  )}
                  {isFastest && !isBestPrice && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500 text-white text-[10px] font-bold shadow-lg">
                      <Clock className="w-3 h-3" /> Fastest
                    </span>
                  )}
                </div>

                {/* Shop Header */}
                <div>
                  <h3 className="font-bold text-lg">{q.shop?.name || "Shop"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {q.shop?.address && (
                      <span className="text-slate-500 text-xs">{q.shop.address}</span>
                    )}
                    {q.shop?.rating > 0 && (
                      <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {q.shop.rating?.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                {/* Price & Timeline */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                    <DollarSign className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <div className="text-2xl font-black">${q.amount.toLocaleString()}</div>
                    <span className="text-slate-500 text-xs">Total Cost</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                    <Clock className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                    <div className="text-2xl font-black">{q.delivery_days}</div>
                    <span className="text-slate-500 text-xs">Days</span>
                  </div>
                </div>

                {/* Notes */}
                {q.notes && (
                  <p className="text-slate-400 text-sm italic leading-relaxed">"{q.notes}"</p>
                )}

                {/* Accept Button */}
                {isAccepted ? (
                  <div className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" /> Order Created!
                  </div>
                ) : accepted ? (
                  <div className="py-3.5 rounded-xl border border-slate-700 text-slate-600 text-center text-sm">
                    Quote not selected
                  </div>
                ) : (
                  <button
                    onClick={() => handleAccept(q.id)}
                    disabled={!!accepting}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {accepting === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Accept This Quote
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </main>
  );
}
