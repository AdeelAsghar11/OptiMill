"use client";

import React, { useState } from "react";
import { 
  Upload, 
  AlertCircle, 
  Loader2, 
  Target, 
  Box, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Activity, 
  DollarSign,
  ChevronRight
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const CADViewer = dynamic(() => import("./CADViewer").then((mod) => mod.CADViewer), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full glass rounded-3xl animate-pulse" />
});

import { MaterialList } from "./MaterialList";
import { ShopRecommendationList } from "./ShopRecommendationList";
import { ExternalSupplierList } from "./ExternalSupplierList";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function CADUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to upload a file.");
      }

      const response = await axios.post(`${API_BASE_URL}/api/v1/cad/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${session.access_token}`
        },
      });

      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to upload and analyze CAD file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div 
            key="uploader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-16 border-2 border-dashed border-white/10 flex flex-col items-center justify-center space-y-8 text-center group cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: loading ? 360 : 0 }}
                transition={{ duration: 2, repeat: loading ? Infinity : 0, ease: "linear" }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform"
              >
                {loading ? <RefreshCw className="w-10 h-10 text-blue-400" /> : <Upload className="w-10 h-10 text-blue-400" />}
              </motion.div>
              {!loading && (
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-3xl font-black tracking-tight">
                {file ? file.name : "Upload Engineering Asset"}
              </h3>
              <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
                Seamlessly analyze .stl, .step, or .obj files. Our AI engine will evaluate geometry, complexity, and costs in seconds.
              </p>
            </div>
            
            <input
              type="file"
              id="cad-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".stl,.obj,.step,.iges"
            />
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label
                htmlFor="cad-upload"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all border border-white/10 text-sm uppercase tracking-widest"
              >
                {file ? "Change File" : "Select File"}
              </label>

              {file && !loading && (
                <button
                  onClick={handleUpload}
                  className="btn-premium px-12 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-sm shadow-2xl"
                >
                  Begin Analysis
                </button>
              )}
            </div>

            {loading && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 text-blue-400 font-black uppercase tracking-[0.2em] text-xs">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extracting Geometric Features...
                </div>
                <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  />
                </div>
              </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-red-400 bg-red-400/10 px-6 py-3 rounded-2xl border border-red-400/20 text-sm font-bold"
              >
                <AlertCircle className="w-5 h-5" />
                {error}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
            {/* Left Column: Visuals - HCI: Recognition over Recall */}
            <div className="lg:col-span-5 space-y-8">
              <div className="glass-card p-4 rounded-[2.5rem] overflow-hidden sticky top-32">
                <div className="flex items-center justify-between mb-4 px-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Box className="w-4 h-4" /> 3D Digital Twin
                  </h4>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors"><Download className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <CADViewer url={result.file_url} />
                <div className="mt-4 p-6 bg-blue-600/5 border-t border-white/5 rounded-b-[2rem]">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                    <span>Geometry Status: Verified</span>
                    <span>Ready for fabrication</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Intelligence - HCI: Progressive Disclosure */}
            <div className="lg:col-span-7 space-y-12 pb-24">
              <header className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Analysis Complete</span>
                  <span className="text-slate-500 text-xs font-medium">{new Date().toLocaleDateString()} — ID: {result.id.slice(0,8)}</span>
                </div>
                <h2 className="text-5xl font-black tracking-tight">{result.file_name}</h2>
              </header>

              {/* Top Level Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Feasibility Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-blue-400">{result.feasibility_score}</span>
                    <span className="text-lg font-bold text-slate-600">/ 100</span>
                  </div>
                </div>
                <div className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Inferred Design Type</span>
                  <div className="text-2xl font-black capitalize text-white mb-1">{result.analysis.design_type || "Mechanical Part"}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500">{result.analysis.design_category || "Manufacturing"}</div>
                </div>
              </div>

              {/* Manufacturing Config */}
              <div className="glass-card p-10 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Complexity Class</span>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${result.analysis.complexity === 'simple' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_10px_currentColor]`} />
                      <span className="text-lg font-bold capitalize">{result.analysis.complexity}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recommended Method</span>
                    <div className="flex items-center gap-3">
                      <Box className="w-5 h-5 text-indigo-400" />
                      <span className="text-lg font-bold">{result.process_recommendation}</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Estimated Cost Range (USD)</span>
                    <DollarSign className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-4xl font-black tracking-tighter">
                    ${result.estimated_cost_low.toLocaleString()} — ${result.estimated_cost_high.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 font-medium uppercase tracking-widest">
                    *Deterministic estimate based on volume, material, and regional rates.
                  </p>
                </div>

                <div className="space-y-8 pt-4">
                  <MaterialList cadFileId={result.id} />
                  
                  <div className="h-px bg-white/5" />
                  
                  {result.analysis.materials && result.analysis.materials.length > 0 && (
                    <ExternalSupplierList materialType={result.analysis.materials[0]} />
                  )}

                  <div className="h-px bg-white/5" />

                  <ShopRecommendationList cadFileId={result.id} />
                </div>

                <button 
                  onClick={() => setResult(null)}
                  className="w-full py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all font-black uppercase tracking-[0.2em] text-xs text-slate-400 hover:text-white"
                >
                  Analyze Another Asset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
