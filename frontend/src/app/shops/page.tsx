"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Loader2, Factory, Map as MapIcon, LayoutGrid } from "lucide-react";
import dynamic from "next/dynamic";

const ShopMap = dynamic(() => import("@/components/maps/ShopMap").then(mod => mod.ShopMap), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-900 animate-pulse rounded-3xl" />
});
import axios from "axios";
import { ShopCard } from "@/components/shops/ShopCard";

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

  const fetchShops = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedCap) params.capability = selectedCap;
      if (selectedMat) params.material = selectedMat;

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
  }, [selectedCap, selectedMat]);

  const filtered = shops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase()) ||
    s.location_city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <Factory className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Shop Discovery</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold tracking-tight mb-3"
        >
          Find the right <span className="text-blue-500">manufacturing partner</span>
        </motion.h1>
        <p className="text-slate-400 max-w-xl">
          Browse verified CNC and 3D printing shops. Filter by capabilities, materials, and location to find your perfect match.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search shops by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent pl-10 pr-4 py-3 text-sm placeholder-slate-600 outline-none focus:ring-0"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
            showFilters || selectedCap || selectedMat
              ? "bg-blue-600 text-white"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {(selectedCap || selectedMat) ? "(Active)" : ""}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-3 font-semibold">Capabilities</h4>
            <div className="flex flex-wrap gap-2">
              {ALL_CAPABILITIES.map((cap) => (
                <button
                  key={cap}
                  onClick={() => setSelectedCap(selectedCap === cap ? null : cap)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCap === cap
                      ? "bg-blue-600 text-white border border-blue-500"
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-blue-500/50"
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-3 font-semibold">Materials</h4>
            <div className="flex flex-wrap gap-2">
              {ALL_MATERIALS.map((mat) => (
                <button
                  key={mat}
                  onClick={() => setSelectedMat(selectedMat === mat ? null : mat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedMat === mat
                      ? "bg-indigo-600 text-white border border-indigo-500"
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-indigo-500/50"
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* View Toggle & Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <p className="text-slate-500 text-sm">
          <span className="text-white font-bold">{filtered.length}</span> shops found
        </p>
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === "grid" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === "map" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Map View
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading shops...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-32">
          <Factory className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">No shops found</p>
          <p className="text-slate-600 text-sm mt-2">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filtered.map((shop, i) => (
                <ShopCard key={shop.id} shop={shop} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ShopMap shops={filtered} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </main>
  );
}
