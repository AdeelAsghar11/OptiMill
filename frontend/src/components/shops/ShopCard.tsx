"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Wrench, CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { calculateDistance } from "@/lib/geo";

interface Shop {
  id: string;
  name: string;
  description?: string;
  location_city?: string;
  location_country?: string;
  capabilities: string[];
  materials: string[];
  hourly_rate?: number;
  rating?: number;
  is_verified?: boolean;
  lat?: number;
  lng?: number;
}


interface ShopCardProps {
  shop: Shop;
  index: number;
  userLocation?: { lat: number; lon: number } | null;
}

export function ShopCard({ shop, index, userLocation }: ShopCardProps) {
  const distance = (userLocation && shop.lat !== undefined && shop.lng !== undefined)
    ? calculateDistance(userLocation.lat, userLocation.lon, shop.lat, shop.lng)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="glass-card p-6 flex flex-col gap-6 hover:border-blue-500/50 group cursor-pointer relative overflow-hidden"
    >
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />

      {/* Header - HCI: Visual Hierarchy */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
            <Wrench className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-xl leading-tight text-white group-hover:text-blue-400 transition-colors">{shop.name}</h3>
              {shop.is_verified && (
                <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/10" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(shop.location_city || shop.location_country) && (
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-600" />
                  {[shop.location_city, shop.location_country].filter(Boolean).join(", ")}
                </p>
              )}
              {distance !== null && (
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest">
                  {distance.toFixed(1)} KM Away
                </span>
              )}
            </div>
          </div>
        </div>
        {shop.rating !== undefined && shop.rating > 0 && (
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-black text-white">{shop.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {shop.description && (
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 relative z-10 px-1">
          {shop.description}
        </p>
      )}

      {/* Capabilities - HCI: Recognition over Recall */}
      <div className="flex flex-wrap gap-2 relative z-10">
        {shop.capabilities?.slice(0, 3).map((cap) => (
          <span
            key={cap}
            className="px-3 py-1 rounded-lg bg-blue-500/5 border border-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest"
          >
            {cap}
          </span>
        ))}
        {shop.capabilities?.length > 3 && (
          <span className="px-3 py-1 rounded-lg bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            +{shop.capabilities.length - 3} More
          </span>
        )}
      </div>

      {/* Footer - HCI: Clear Action and Feedback */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">Standard Rate</span>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-lg font-black text-white">
              {shop.hourly_rate ? `$${shop.hourly_rate}` : "Quote"}
              {shop.hourly_rate && <span className="text-xs text-slate-500 font-medium ml-1">/ hr</span>}
            </span>
          </div>
        </div>

        <Link
          href={`/shops/${shop.id}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white text-slate-300 text-xs font-black uppercase tracking-widest transition-all duration-300 group/btn shadow-lg"
        >
          Profile <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>


    </motion.div>
  );
}
