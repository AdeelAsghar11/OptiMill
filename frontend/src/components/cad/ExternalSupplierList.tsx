"use client";

import React, { useState, useEffect } from "react";
import { Truck, MapPin, Star, ExternalLink, Loader2, Info } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Supplier {
  id: string;
  supplier_name: string;
  supplier_type: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  website: string;
  rating: number;
  api_source: string;
  distance_km?: number;
}

export function ExternalSupplierList({ materialType }: { materialType: string }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    async function init() {
      // 1. Get user location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLocation(loc);
          await fetchSuppliers(loc);
        }, () => {
          setLoading(false); // Permission denied or error
        });
      } else {
        setLoading(false);
      }
    }
    init();
  }, [materialType]);

  async function fetchSuppliers(loc: { lat: number; lon: number }) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await axios.post(`${API_BASE_URL}/api/v1/external-suppliers/search`, {
        material_type: materialType,
        latitude: loc.lat,
        longitude: loc.lon,
        radius_km: 25.0
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setSuppliers(res.data);
    } catch (e) {
      console.error("Failed to fetch external suppliers:", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 py-4">
        <Loader2 className="w-3 h-3 animate-spin" />
        Finding nearby {materialType} suppliers...
      </div>
    );
  }

  if (suppliers.length === 0) {
    return null; // Don't show anything if no external suppliers found
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold flex items-center gap-2 text-slate-200">
          <Truck className="w-4 h-4 text-emerald-400" />
          Nearby {materialType.charAt(0).toUpperCase() + materialType.slice(1)} Suppliers
        </h4>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
          External Sources
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {suppliers.map((supplier, index) => (
          <motion.div
            key={supplier.id || index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group"
          >
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-sm font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                  {supplier.supplier_name}
                </h5>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />
                    {supplier.address.split(',')[0]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    {supplier.rating || "4.0"}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {supplier.phone && (
                  <a href={`tel:${supplier.phone}`} className="p-2 bg-slate-800 hover:bg-emerald-500/20 rounded-lg transition-colors">
                    <Info className="w-3 h-3 text-slate-400 group-hover:text-emerald-400" />
                  </a>
                )}
                {supplier.website ? (
                  <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-emerald-500/20 rounded-lg transition-colors">
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-400" />
                  </a>
                ) : (
                   <div className="p-2 bg-slate-800/50 rounded-lg cursor-not-allowed">
                     <ExternalLink className="w-3 h-3 text-slate-700" />
                   </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <p className="text-[10px] text-slate-600 italic">
        Data provided by OpenStreetMap. Availability not guaranteed.
      </p>
    </div>
  );
}
