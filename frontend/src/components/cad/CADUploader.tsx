"use client";

import React, { useState } from "react";
import { Upload, FileCode, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const CADViewer = dynamic(() => import("./CADViewer").then((mod) => mod.CADViewer), {
  ssr: false,
});

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
    <div className="space-y-8">
      {!result ? (
        <div className="glass p-12 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center space-y-6 transition-all hover:border-blue-500/50">
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Upload className="w-10 h-10 text-blue-400" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Upload CAD File</h3>
            <p className="text-slate-400 max-w-sm">
              Support for .stl, .step, .obj. AI analysis will begin immediately after upload.
            </p>
          </div>
          
          <input
            type="file"
            id="cad-upload"
            className="hidden"
            onChange={handleFileChange}
            accept=".stl,.obj,.step,.iges"
          />
          
          <label
            htmlFor="cad-upload"
            className="cursor-pointer px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-all border border-slate-700"
          >
            {file ? file.name : "Select File"}
          </label>

          {file && !loading && (
            <button
              onClick={handleUpload}
              className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all scale-105"
            >
              Start AI Analysis
            </button>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-blue-400 font-medium animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin" />
              AI is analyzing geometry...
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* 3D Preview */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileCode className="w-6 h-6 text-blue-400" />
              3D Geometry Preview
            </h3>
            <CADViewer url={result.file_url} />
          </div>

          {/* Analysis Result */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              AI Feasibility Report
            </h3>
            <div className="glass p-8 rounded-3xl space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-slate-500 text-xs uppercase tracking-widest block mb-1">Score</span>
                  <div className="text-4xl font-black text-blue-400">{result.feasibility_score}%</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-xs uppercase tracking-widest block mb-1">Process</span>
                  <div className="text-xl font-bold">{result.process_recommendation}</div>
                </div>
              </div>

              <div className="h-px bg-slate-800" />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-slate-500 text-[10px] uppercase tracking-widest block mb-1">Complexity</span>
                  <div className="font-bold capitalize">{result.analysis.complexity}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-slate-500 text-[10px] uppercase tracking-widest block mb-1">Est. Time</span>
                  <div className="font-bold">{result.analysis.estimated_hours} Hours</div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <span className="text-blue-400 text-[10px] uppercase tracking-widest block mb-2">Estimated Cost Range</span>
                <div className="text-2xl font-bold">
                  ${result.estimated_cost_low} — ${result.estimated_cost_high}
                </div>
                <p className="text-slate-500 text-xs mt-2 italic">
                  *Based on global manufacturing averages.
                </p>
              </div>

              <button 
                onClick={() => setResult(null)}
                className="w-full py-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition-all font-medium text-slate-400"
              >
                Upload Another File
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
