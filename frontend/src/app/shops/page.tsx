"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Loader2, Factory, Map as MapIcon, LayoutGrid, X, Sparkles, Target, Layers } from "lucide-react";
import dynamic from "next/dynamic";

const ShopMap = dynamic(() => import("@/components/maps/ShopMap").then(mod => mod.ShopMap), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full glass rounded-[2.5rem] animate-pulse flex items-center justify-center text-slate-500 font-black uppercase tracking-widest text-xs">Initializing Neural Map...</div>
});
import axios from "axios";
import { ShopCard } from "@/components/shops/ShopCard";
import { calculateDistance } from "@/lib/geo";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const ALL_CAPABILITIES = ["CNC Milling", "3D Printing (FDM)", "3D Printing (SLA)", "Laser Cutting", "Injection Molding", "Sheet Metal", "Welding"];
const ALL_MATERIALS = ["Aluminum", "Steel", "PLA", "ABS", "PETG", "Resin", "Titanium", "Carbon Fiber"];

export default function ShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCap, setSelectedCap] = useState<string | null>(null);
  const [selectedMat, setSelectedMat] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [geoBounds, setGeoBounds] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedCap) params.capability = selectedCap;
      if (selectedMat) params.material = selectedMat;
      if (geoBounds) {
        params.min_lat = geoBounds.min_lat;
        params.max_lat = geoBounds.max_lat;
        params.min_lon = geoBounds.min_lon;
        params.max_lon = geoBounds.max_lon;
      }

      const res = await axios.get(`${API_BASE_URL}/api/v1/shops/discover`, { params });
      setShops(res.data);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      });
    }
  }, [selectedCap, selectedMat, geoBounds]);

  const handleSearchArea = (bounds: any) => {
    setGeoBounds(bounds);
  };

  const filtered = shops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase()) ||
    s.address?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (userLocation && a.lat && b.lat) {
      const distA = calculateDistance(userLocation.lat, userLocation.lon, a.lat, a.lng);
      const distB = calculateDistance(userLocation.lat, userLocation.lon, b.lat, b.lng);
      return distA - distB;
    }
    return 0;
  });

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 space-y-12 pb-32">
      {/* Header - HCI: Impact and Clarity */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest"
          >
            <Factory className="w-3.5 h-3.5" />
            Shop Discovery
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black tracking-tight"
          >
            Global <span className="text-blue-500">Marketplace</span>
          </motion.h1>
          <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
            Browse verified CNC and 3D printing shops. Filter by capabilities, materials, and location to find your perfect manufacturing partner.
          </p>
        </div>

        {/* View Toggle - HCI: Interaction Consistency */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              viewMode === "grid" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-500 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Grid View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              viewMode === "map" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-500 hover:text-white"
            }`}
          >
            <MapIcon className="w-4 h-4" />
            Map View
          </button>
        </div>
      </div>

      {/* Search & Filter - HCI: Error Prevention & Feedback */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, city, or capability..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-card bg-white/5 border-white/10 px-14 py-5 text-sm font-medium placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all rounded-2xl"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-3 px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-lg ${
              showFilters || selectedCap || selectedMat
                ? "bg-blue-600 text-white border-blue-400 shadow-blue-600/20"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {(selectedCap || selectedMat) ? "• Active" : ""}
          </button>
        </div>

        {/* Filter Panel - HCI: Progressive Disclosure */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-10 grid grid-cols-1 md:grid-cols-2 gap-12 border-white/10"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Capability Focus</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_CAPABILITIES.map((cap) => (
                    <button
                      key={cap}
                      onClick={() => setSelectedCap(selectedCap === cap ? null : cap)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                        selectedCap === cap
                          ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/20"
                          : "bg-white/5 text-slate-400 border-white/10 hover:border-blue-500/30"
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Material Availability</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_MATERIALS.map((mat) => (
                    <button
                      key={mat}
                      onClick={() => setSelectedMat(selectedMat === mat ? null : mat)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                        selectedMat === mat
                          ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/20"
                          : "bg-white/5 text-slate-400 border-white/10 hover:border-indigo-500/30"
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              {(selectedCap || selectedMat) && (
                <div className="md:col-span-2 pt-6 border-t border-white/5 flex justify-end">
                  <button 
                    onClick={() => { setSelectedCap(null); setSelectedMat(null); }}
                    className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reset All Filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-px bg-white/5 flex-1" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
            {loading ? "Discovering Nodes..." : `${filtered.length} Manufacturing Nodes Identified`}
          </span>
          <div className="h-px bg-white/5 flex-1" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-blue-500 rounded-full blur-xl"
              />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Scanning Global Network...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-40 space-y-6 glass-card rounded-[3rem] border-dashed border-white/10"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
              <Factory className="w-10 h-10 text-slate-700" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">No Matching Nodes Found</h3>
              <p className="text-slate-500 max-w-sm mx-auto text-sm">
                We couldn't find any shops matching your specific criteria. Try expanding your search area or loosening the material constraints.
              </p>
            </div>
            <button 
              onClick={() => { setSearch(""); setSelectedCap(null); setSelectedMat(null); }}
              className="btn-premium px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest"
            >
              Reset Search Parameters
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {filtered.map((shop, i) => (
                  <ShopCard key={shop.id} shop={shop} index={i} userLocation={userLocation} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="perspective-1000"
              >
                <div className="glass-card p-4 rounded-[3rem] border-white/10 shadow-3xl">
                  <ShopMap shops={filtered} onSearchArea={handleSearchArea} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
