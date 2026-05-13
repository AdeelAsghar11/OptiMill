"use client";

import React from "react";
import { CADUploader } from "@/components/cad/CADUploader";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold tracking-tight mb-4"
        >
          Analyze your <span className="text-blue-500">Design</span>
        </motion.h1>
        <p className="text-slate-400 max-w-xl">
          Upload your CAD design to get an instant AI-powered report on manufacturability, 
          estimated costs, and complexity.
        </p>
      </header>

      <section>
        <CADUploader />
      </section>
    </main>
  );
}
