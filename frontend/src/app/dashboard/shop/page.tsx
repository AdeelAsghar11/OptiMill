"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCode, Clock, CheckCircle2, XCircle, Loader2,
  ChevronDown, ChevronUp, DollarSign, Send
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const STATUS_COLORS: Record<string, string> = {
  pending:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  quoted:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  accepted: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

function QuoteForm({ requestId, onSubmit }: { requestId: string; onSubmit: () => void }) {
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/v1/quotes/submit`, {
        request_id: requestId,
        amount: parseFloat(amount),
        delivery_days: parseInt(days),
        notes,
      });
      onSubmit();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4"
    >
      <h4 className="font-semibold text-sm text-blue-300">Submit Your Quote</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Amount (USD)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 250"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Delivery (days)</label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="e.g. 7"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional notes for the client..."
        rows={2}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={!amount || !days || loading}
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Send Quote
      </button>
    </motion.div>
  );
}

function RequestCard({ req, index }: { req: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(req.status === "quoted");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass rounded-2xl p-5 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <FileCode className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="font-semibold">{req.cad_files?.file_name || "CAD File"}</p>
            <p className="text-slate-500 text-xs">
              From: <span className="text-slate-300">{req.profiles?.full_name || "Client"}</span>
              {" · "}Qty: {req.quantity}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${STATUS_COLORS[req.status] || ""}`}>
            {req.status}
          </span>
          {req.cad_files?.feasibility_score && (
            <span className="px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
              {req.cad_files.feasibility_score}% feasible
            </span>
          )}
        </div>
      </div>

      {req.message && (
        <p className="text-slate-400 text-sm pl-12 italic">"{req.message}"</p>
      )}

      {req.cad_files?.process_recommendation && (
        <p className="text-slate-500 text-xs pl-12">
          Recommended: <span className="text-blue-400 font-medium">{req.cad_files.process_recommendation}</span>
        </p>
      )}

      {!submitted && req.status === "pending" && (
        <div className="pl-12">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-blue-400 text-sm font-semibold hover:text-blue-300 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? "Cancel" : "Submit Quote"}
          </button>
          <AnimatePresence>
            {expanded && (
              <QuoteForm
                requestId={req.id}
                onSubmit={() => { setSubmitted(true); setExpanded(false); }}
              />
            )}
          </AnimatePresence>
        </div>
      )}
      {submitted && (
        <div className="pl-12 flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle2 className="w-4 h-4" /> Quote submitted successfully
        </div>
      )}
    </motion.div>
  );
}

export default function ShopDashboardPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/v1/quotes/requests/incoming`)
      .then((r) => setRequests(r.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = requests.filter((r) => r.status === "pending");
  const quoted  = requests.filter((r) => r.status === "quoted");

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Shop <span className="text-blue-500">Dashboard</span>
        </h1>
        <p className="text-slate-400">Manage incoming quote requests and track your active orders.</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Pending Requests", value: pending.length, color: "text-yellow-400" },
          { label: "Quotes Sent", value: quoted.length, color: "text-blue-400" },
          { label: "Total Requests", value: requests.length, color: "text-white" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <span className="text-slate-500 text-xs uppercase tracking-widest block mb-1">{label}</span>
            <span className={`text-3xl font-black ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-24">
          <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">No requests yet</p>
          <p className="text-slate-600 text-sm mt-2">Quote requests will appear here once clients find your shop.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">All Requests</h2>
          {requests.map((r, i) => <RequestCard key={r.id} req={r} index={i} />)}
        </div>
      )}
    </main>
  );
}
