"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Star, CheckCircle2, Wrench, Clock, DollarSign,
  MessageCircle, ArrowLeft, Loader2, Package
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}`}
        />
      ))}
    </div>
  );
}

interface ShopProfile {
  id: string;
  name: string;
  description: string;
  location_city: string;
  location_country: string;
  is_verified: boolean;
  rating?: number;
  hourly_rate: number;
  capabilities: string[];
  materials: string[];
}

interface ShopReview {
  id: string;
  rating: number;
  comment: string;
  profiles?: {
    full_name: string | null;
  };
}

export default function ShopProfilePage() {
  const params = useParams();
  const shopId = params?.shopId as string;
  const [data, setData] = useState<{ shop: ShopProfile; reviews: ShopReview[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;
    axios.get(`${API_BASE_URL}/api/v1/shops/${shopId}`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [shopId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading shop profile...</span>
        </div>
      </div>
    );
  }

  if (!data?.shop) {
    return (
      <div className="text-center py-32">
        <p className="text-slate-400 text-lg">Shop not found.</p>
        <Link href="/shops" className="text-blue-400 mt-4 inline-block hover:underline">← Back to Discovery</Link>
      </div>
    );
  }

  const { shop, reviews } = data;

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Back button */}
      <Link href="/shops" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Shops
      </Link>

      {/* Shop Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
            <Wrench className="w-10 h-10 text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{shop.name}</h1>
              {shop.is_verified && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            {(shop.location_city || shop.location_country) && (
              <p className="text-slate-400 flex items-center gap-1.5 mb-3">
                <MapPin className="w-4 h-4" />
                {[shop.location_city, shop.location_country].filter(Boolean).join(", ")}
              </p>
            )}
            <p className="text-slate-300 max-w-2xl leading-relaxed">{shop.description || "No description provided."}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            {shop.rating !== undefined && shop.rating > 0 && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-yellow-400">{shop.rating.toFixed(1)}</span>
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </div>
                <span className="text-xs text-slate-500">{reviews.length} reviews</span>
              </div>
            )}
            {shop.hourly_rate && (
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase tracking-widest block">Rate</span>
                <span className="text-2xl font-bold text-blue-400">${shop.hourly_rate}<span className="text-base font-normal text-slate-500">/hr</span></span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Capabilities */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-400" /> Capabilities
            </h2>
            <div className="flex flex-wrap gap-2">
              {shop.capabilities?.length > 0 ? shop.capabilities.map((c: string) => (
                <span key={c} className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium">{c}</span>
              )) : <span className="text-slate-600 text-sm">No capabilities listed.</span>}
            </div>
          </motion.div>

          {/* Materials */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" /> Supported Materials
            </h2>
            <div className="flex flex-wrap gap-2">
              {shop.materials?.length > 0 ? shop.materials.map((m: string) => (
                <span key={m} className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">{m}</span>
              )) : <span className="text-slate-600 text-sm">No materials listed.</span>}
            </div>
          </motion.div>

          {/* Reviews */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" /> Customer Reviews
            </h2>
            {reviews.length === 0 ? (
              <p className="text-slate-600 text-sm">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-5">
                {reviews.map((r: ShopReview) => (
                  <div key={r.id} className="border-b border-white/5 pb-5 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{r.profiles?.full_name || "Anonymous"}</span>
                      <StarRating rating={r.rating} />
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{r.comment || <em className="text-slate-600">No comment.</em>}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right column: Actions */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg">Get a Quote</h2>
            <p className="text-slate-400 text-sm">Upload your CAD file and request a custom quote from this shop.</p>
            <Link
              href={`/upload?shop=${shopId}`}
              className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              <DollarSign className="w-5 h-5" /> Request Quote (CAD)
            </Link>
            <Link
              href={`/request?shop=${shopId}`}
              className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all"
            >
              <Package className="w-5 h-5 text-slate-400" /> Custom Request (No CAD)
            </Link>
            <button className="flex items-center justify-center gap-2 w-full py-3.5 border border-slate-700 hover:border-blue-500/50 rounded-xl text-slate-400 hover:text-white font-medium transition-all">
              <MessageCircle className="w-4 h-4" /> Message Shop
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4">Quick Stats</h2>
            <div className="space-y-3">
              {[
                { label: "Typical Turnaround", value: "3–7 days", icon: Clock },
                { label: "Min Order Value", value: "$50", icon: DollarSign },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm flex items-center gap-2">
                    <Icon className="w-4 h-4" /> {label}
                  </span>
                  <span className="text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
