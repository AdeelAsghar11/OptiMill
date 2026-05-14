"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Wrench, CheckCircle2, ArrowRight } from "lucide-react";
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
  latitude?: number;
  longitude?: number;
}

interface ShopCardProps {
  shop: Shop;
  index: number;
  userLocation?: { lat: number; lon: number } | null;
}

export function ShopCard({ shop, index, userLocation }: ShopCardProps) {
  const distance = (userLocation && shop.latitude && shop.longitude)
    ? calculateDistance(userLocation.lat, userLocation.lon, shop.latitude, shop.longitude)
    : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass rounded-2xl p-6 flex flex-col gap-4 hover:border-blue-500/30 transition-all duration-300 group cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/20">
            <Wrench className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg leading-tight">{shop.name}</h3>
              {shop.is_verified && (
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              )}
            </div>
            {(shop.location_city || shop.location_country) && (
              <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {[shop.location_city, shop.location_country].filter(Boolean).join(", ")}
                {distance !== null && (
                  <span className="ml-1 text-blue-400 font-bold">
                    • {distance.toFixed(1)} km away
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        {shop.rating !== undefined && shop.rating > 0 && (
          <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-yellow-300">{shop.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {shop.description && (
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{shop.description}</p>
      )}

      {/* Capabilities */}
      {shop.capabilities?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {shop.capabilities.slice(0, 4).map((cap) => (
            <span
              key={cap}
              className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium"
            >
              {cap}
            </span>
          ))}
          {shop.capabilities.length > 4 && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-500 text-xs">
              +{shop.capabilities.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-slate-500 text-sm">
          {shop.hourly_rate ? (
            <><span className="text-white font-bold">${shop.hourly_rate}/hr</span></>
          ) : (
            "Rate on request"
          )}
        </span>
        <Link
          href={`/shops/${shop.id}`}
          className="flex items-center gap-1.5 text-blue-400 text-sm font-semibold group-hover:gap-2.5 transition-all"
        >
          View Profile <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
