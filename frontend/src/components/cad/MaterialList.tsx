"use client";

import React, { useState, useEffect } from "react";
import { Package, Info, Loader2, ExternalLink } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Material {
  id: string;
  material_name: string;
  material_category: string;
  estimated_quantity: number;
  unit: string;
  priority: string;
  supplier_type: string;
  inference_confidence: number;
}

interface CategorizedMaterials {
  structural: Material[];
  aesthetic: Material[];
  fastening: Material[];
  other: Material[];
}

export function MaterialList({ cadFileId }: { cadFileId: string }) {
  const [materials, setMaterials] = useState<CategorizedMaterials | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await axios.get(`${API_BASE_URL}/api/v1/cad/${cadFileId}/materials`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        setMaterials(res.data);
      } catch (e) {
        console.error("Failed to fetch materials:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchMaterials();
  }, [cadFileId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Inferring material requirements...</p>
      </div>
    );
  }

  if (!materials || Object.values(materials).every(arr => arr.length === 0)) {
    return (
      <div className="text-center p-8 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
        No material requirements inferred for this design.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-400" />
          Material Requirements
        </h4>
        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
          AI Inferred
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(materials).map(([category, list]) => {
          if (list.length === 0) return null;
          return (
            <div key={category} className="space-y-3">
              <h5 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold px-2">
                {category}
              </h5>
              <div className="space-y-2">
                {(list as Material[]).map((mat: Material) => (
                  <motion.div
                    key={mat.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => setSelectedMaterial(mat)}
                    className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50 hover:border-blue-500/30 cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">
                          {mat.material_name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {mat.estimated_quantity} {mat.unit}
                        </div>
                      </div>
                      <Info className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for t40 */}
      <AnimatePresence>
        {selectedMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedMaterial(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedMaterial.material_name}</h3>
                  <p className="text-blue-400 text-sm capitalize">{selectedMaterial.material_category} Material</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Quantity</span>
                  <div className="text-xl font-bold">{selectedMaterial.estimated_quantity} {selectedMaterial.unit}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Confidence</span>
                  <div className="text-xl font-bold">{(selectedMaterial.inference_confidence * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <p className="text-sm text-slate-400 leading-relaxed">
                    This material is typical for <strong>{selectedMaterial.material_category}</strong> use in this type of design. 
                    The estimated quantity is calculated based on the part volume and standard density factors.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <span className="text-sm font-medium">Supplier Type</span>
                  <span className="text-sm text-slate-300 font-bold">{selectedMaterial.supplier_type || "Standard"}</span>
                </div>
              </div>

              <button className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                Find Local Suppliers <ExternalLink className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
