"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Package, FileCode, Store, DollarSign, CheckCircle2 } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LiveChat } from "@/components/chat/LiveChat";
import { MeetingScheduler } from "@/components/meetings/MeetingScheduler";
import { PaymentButton } from "@/components/orders/PaymentButton";
import { useAuthStore } from "@/store/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const ORDER_STAGES = ["pending", "paid", "in_progress", "qa", "shipped", "complete"];
const STAGE_LABELS: Record<string, string> = {
  pending: "Awaiting Payment", paid: "Payment Held", in_progress: "Manufacturing",
  qa: "Quality Check", shipped: "Shipped", complete: "Complete",
};

function OrderTimeline({ status }: { status: string }) {
  const currentIdx = ORDER_STAGES.indexOf(status);
  return (
    <div className="flex items-center gap-0 py-6 overflow-x-auto">
      {ORDER_STAGES.map((stage, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center flex-shrink-0 gap-2">
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                done ? "border-blue-500 bg-blue-500" : active ? "border-blue-400 bg-blue-400/20 ring-4 ring-blue-500/20" : "border-slate-700 bg-slate-900"
              }`}>
                {done && <div className="w-3 h-3 rounded-full bg-white" />}
                {active && <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-tight text-center max-w-[60px] leading-tight ${
                active ? "text-blue-400" : done ? "text-slate-400" : "text-slate-700"
              }`}>{STAGE_LABELS[stage]}</span>
            </div>
            {i < ORDER_STAGES.length - 1 && (
              <motion.div
                className={`h-0.5 flex-1 min-w-[20px] mb-5 ${done ? "bg-blue-500" : "bg-slate-800"}`}
                animate={{ scaleX: done ? 1 : 0.3 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const fetchOrder = async () => {
    try {
      const session = useAuthStore.getState().session;
      if (!session) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setOrder(res.data);
    } catch (err) {
      console.error("Error fetching order:", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
  }, [orderId]);

  const releasePayment = async () => {
    try {
      const session = useAuthStore.getState().session;
      if (!session) return;

      await axios.post(`${API_BASE_URL}/api/v1/payments/release/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      fetchOrder();
    } catch (e) {
      console.error(e);
    }
  };

  const advanceStatus = async (nextStatus: string) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/v1/orders/${orderId}/status`, {
        status: nextStatus
      }, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().session?.access_token}` }
      });
      fetchOrder();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-32">
        <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
        <p className="text-slate-400">Order not found.</p>
        <Link href="/orders" className="text-blue-400 mt-4 inline-block hover:underline">← Back to Orders</Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <Link href="/orders" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Detail</h1>
            <p className="text-slate-500 text-sm font-mono">#{order.id?.slice(0, 8)}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "CAD File", value: order.cad_files?.file_name || "—", icon: FileCode, color: "text-blue-400" },
              { label: "Shop", value: order.shops?.name || "—", icon: Store, color: "text-indigo-400" },
              { label: "Amount", value: `$${order.amount?.toLocaleString() || "—"}`, icon: DollarSign, color: "text-green-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                <div className="font-bold text-sm truncate">{value}</div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8 pt-8 border-t border-white/5">
          <OrderTimeline status={order.status} />
          
          <div className="flex items-center gap-4">
            {/* Client Actions */}
            {user?.user_metadata?.role === "client" && (
              <>
                {order.status === "pending" && (
                  <PaymentButton orderId={orderId} amount={order.amount} />
                )}
                {order.status === "shipped" && (
                  <button 
                    onClick={releasePayment}
                    className="bg-green-600 hover:bg-green-500 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-2xl shadow-green-600/20 transition-all active:scale-95"
                  >
                    Release Funds to Shop
                  </button>
                )}
              </>
            )}

            {/* Shop Actions */}
            {user?.user_metadata?.role === "shop" && (
              <>
                {order.status === "paid" && (
                  <button 
                    onClick={() => advanceStatus("in_progress")}
                    className="bg-blue-600 hover:bg-blue-500 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-2xl shadow-blue-600/20 transition-all active:scale-95"
                  >
                    Start Manufacturing
                  </button>
                )}
                {order.status === "in_progress" && (
                  <button 
                    onClick={() => advanceStatus("qa")}
                    className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-2xl shadow-indigo-600/20 transition-all active:scale-95"
                  >
                    Move to Quality Check
                  </button>
                )}
                {order.status === "qa" && (
                  <button 
                    onClick={() => advanceStatus("shipped")}
                    className="bg-cyan-600 hover:bg-cyan-500 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-2xl shadow-cyan-600/20 transition-all active:scale-95"
                  >
                    Mark as Shipped
                  </button>
                )}
              </>
            )}

            {order.status === "complete" && (
              <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-black uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" /> Order Fulfilled
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Chat + Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
          <h2 className="font-bold mb-4 text-slate-300">Order Chat</h2>
          <LiveChat orderId={orderId} currentUserId={currentUserId || ""} />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
          <h2 className="font-bold mb-4 text-slate-300">Consultation Meetings</h2>
          <MeetingScheduler orderId={orderId} />
        </motion.div>
      </div>
    </main>
  );
}
