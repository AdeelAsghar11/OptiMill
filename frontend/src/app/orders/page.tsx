"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Loader2, ArrowRight, FileCode, Store } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const ORDER_STAGES = ["pending", "paid", "in_progress", "qa", "shipped", "complete"];

const STAGE_LABELS: Record<string, string> = {
  pending:     "Awaiting Payment",
  paid:        "Payment Held",
  in_progress: "Manufacturing",
  qa:          "Quality Check",
  shipped:     "Shipped",
  complete:    "Complete",
};

const STAGE_COLORS: Record<string, string> = {
  pending:     "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
  paid:        "border-blue-500/50 bg-blue-500/10 text-blue-400",
  in_progress: "border-indigo-500/50 bg-indigo-500/10 text-indigo-400",
  qa:          "border-purple-500/50 bg-purple-500/10 text-purple-400",
  shipped:     "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
  complete:    "border-green-500/50 bg-green-500/10 text-green-400",
};

interface Order {
  id: string;
  amount: number;
  status: string;
  cad_files?: {
    file_name: string;
  };
  shops?: {
    name: string;
    location_city: string | null;
  };
}


function OrderProgress({ status }: { status: string }) {
  const currentIdx = ORDER_STAGES.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-4 overflow-x-auto pb-2">
      {ORDER_STAGES.map((stage, i) => {
        const done   = i < currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                done   ? "border-blue-500 bg-blue-500" :
                active ? "border-blue-400 bg-blue-400/20 ring-4 ring-blue-500/20" :
                         "border-slate-700 bg-slate-900"
              }`}>
                {done   && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                {active && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
              </div>
              <span className={`text-[9px] mt-1.5 font-semibold uppercase tracking-tight ${
                active ? "text-blue-400" : done ? "text-slate-400" : "text-slate-700"
              }`}>
                {STAGE_LABELS[stage].split(" ")[0]}
              </span>
            </div>
            {i < ORDER_STAGES.length - 1 && (
              <div className={`h-0.5 flex-1 min-w-[16px] transition-all ${done ? "bg-blue-500" : "bg-slate-800"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <FileCode className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="font-semibold">{order.cad_files?.file_name || "CAD File"}</p>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
              <Store className="w-3 h-3" />
              {order.shops?.name || "Shop"}
              {order.shops?.location_city && ` · ${order.shops.location_city}`}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-black">${order.amount?.toLocaleString()}</div>
          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg border text-[10px] font-bold ${STAGE_COLORS[order.status] || ""}`}>
            {STAGE_LABELS[order.status] || order.status}
          </span>
        </div>
      </div>
      <OrderProgress status={order.status} />
      <div className="flex justify-end mt-4">
        <Link
          href={`/orders/${order.id}`}
          className="flex items-center gap-1.5 text-blue-400 text-sm font-semibold hover:gap-2.5 transition-all"
        >
          View Details <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/orders/`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session]);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          My <span className="text-blue-500">Orders</span>
        </h1>
        <p className="text-slate-400">Track your manufacturing orders from payment to delivery.</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24">
          <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">No orders yet</p>
          <p className="text-slate-600 text-sm mt-2">Accept a quote to start your first order.</p>
          <Link href="/quotes/compare" className="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all">
            View Quotes
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((o, i) => <OrderCard key={o.id} order={o} index={i} />)}
        </div>
      )}
    </main>
  );
}
