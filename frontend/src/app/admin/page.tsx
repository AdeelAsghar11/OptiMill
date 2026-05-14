"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, ShieldCheck, AlertTriangle, Plus, Save, 
  Users, Store, Activity, CheckCircle, XCircle, Search, Book
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "overview" || activeTab === "engine") {
        const res = await axios.get(`${API_BASE_URL}/api/v1/admin/rules`);
        setRules(res.data);
      }
      if (activeTab === "users") {
        const res = await axios.get(`${API_BASE_URL}/api/v1/admin/users`);
        setUsers(res.data);
      }
      if (activeTab === "shops") {
        const res = await axios.get(`${API_BASE_URL}/api/v1/admin/shops`);
        setShops(res.data);
      }
      if (activeTab === "knowledge") {
        const res = await axios.get(`${API_BASE_URL}/api/v1/admin/knowledge-base`);
        setMappings(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerifyShop = async (shopId, currentStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/v1/admin/shops/${shopId}/verify`, null, {
        params: { verified: !currentStatus }
      });
      setShops(shops.map(s => s.id === shopId ? { ...s, verified: !currentStatus } : s));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin <span className="text-blue-500">Dashboard</span></h1>
          <p className="text-slate-400">Manage platform users, shops, and deterministic engine logic.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "users", label: "Users", icon: Users },
            { id: "shops", label: "Shops", icon: Store },
            { id: "engine", label: "Risk Engine", icon: Settings },
            { id: "knowledge", label: "Knowledge Base", icon: Book },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <StatCard title="Total Users" value={users.length || "—"} icon={Users} color="text-blue-400" />
            <StatCard title="Active Shops" value={shops.length || "—"} icon={Store} color="text-indigo-400" />
            <StatCard title="Risk Rules" value={rules.length || "—"} icon={ShieldCheck} color="text-emerald-400" />
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{u.full_name || "Unknown"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.role === "admin" ? "bg-amber-500/10 text-amber-400" : u.role === "shop" ? "bg-indigo-500/10 text-indigo-400" : "bg-blue-500/10 text-blue-400"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === "shops" && (
          <motion.div 
            key="shops"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-6 py-4">Shop Name</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {shops.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{s.profiles?.full_name || "—"}</td>
                    <td className="px-6 py-4">
                      {s.verified ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleVerifyShop(s.id, s.verified)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          s.verified ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        {s.verified ? "Revoke" : "Verify"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === "engine" && (
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 glass rounded-2xl overflow-hidden">
               {/* Engine logic table from previous version */}
               <table className="w-full text-left">
                <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Rule Name</th>
                    <th className="px-6 py-4">Logic</th>
                    <th className="px-6 py-4">Impact</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium">{rule.name}</td>
                      <td className="px-6 py-4 font-mono text-[10px] text-blue-400">{rule.description}</td>
                      <td className="px-6 py-4 text-amber-500 font-bold">+15%</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          rule.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"
                        }`}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="glass p-6 rounded-2xl h-fit">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Global Protection
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Active rules are automatically applied to all incoming CAD analysis requests.
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Logic Rule
              </button>
            </div>
          </div>
        )}

        {activeTab === "knowledge" && (
          <motion.div 
            key="knowledge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Design Type</th>
                    <th className="px-6 py-4">Material</th>
                    <th className="px-6 py-4">Typical Quantity Range</th>
                    <th className="px-6 py-4">Use Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mappings.map((m) => (
                    <tr key={m.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold capitalize">{m.design_type}</td>
                      <td className="px-6 py-4 text-blue-400">{m.material_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{m.typical_quantity_range}</td>
                      <td className="px-6 py-4 italic text-slate-500 text-sm">{m.use_case}</td>
                    </tr>
                  ))}
                  {mappings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No mappings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add New Mapping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="glass p-8 rounded-3xl relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 transition-transform group-hover:scale-150 duration-700`} />
      <Icon className={`w-8 h-8 ${color} mb-4 relative z-10`} />
      <div className="text-4xl font-black mb-1 relative z-10">{value}</div>
      <div className="text-slate-500 text-xs uppercase tracking-widest relative z-10">{title}</div>
    </div>
  );
}
