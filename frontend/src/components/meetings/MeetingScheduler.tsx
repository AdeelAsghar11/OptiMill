"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, Video, Plus, CheckCircle2,
  XCircle, Loader2, ExternalLink
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const STATUS_STYLES: Record<string, string> = {
  scheduled:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed:  "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled:  "bg-red-500/10 text-red-400 border-red-500/20",
};

interface MeetingSchedulerProps {
  orderId: string;
}

export function MeetingScheduler({ orderId }: MeetingSchedulerProps) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    scheduled_at: "",
    duration_minutes: "60",
    meeting_url: "",
    notes: "",
  });

  const fetchMeetings = () => {
    const session = useAuthStore.getState().session;
    if (!session) return;

    axios.get(`${API_BASE_URL}/api/v1/meetings/${orderId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
      .then((r) => setMeetings(r.data))
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMeetings(); }, [orderId]);

  const handleSchedule = async () => {
    if (!form.title || !form.scheduled_at) return;
    setSubmitting(true);
    try {
      const session = useAuthStore.getState().session;
      if (!session) return;

      await axios.post(`${API_BASE_URL}/api/v1/meetings/`, {
        order_id: orderId,
        title: form.title,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        duration_minutes: parseInt(form.duration_minutes),
        meeting_url: form.meeting_url || null,
        notes: form.notes || null,
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setShowForm(false);
      setForm({ title: "", scheduled_at: "", duration_minutes: "60", meeting_url: "", notes: "" });
      fetchMeetings();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (meetingId: string, status: string) => {
    try {
      const session = useAuthStore.getState().session;
      if (!session) return;

      await axios.patch(`${API_BASE_URL}/api/v1/meetings/${meetingId}`, { status }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setMeetings((prev) => prev.map((m) => m.id === meetingId ? { ...m, status } : m));
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-semibold text-sm">Meetings</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            showForm ? "bg-slate-700 text-slate-400" : "bg-indigo-600 hover:bg-indigo-500 text-white"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          {showForm ? "Cancel" : "Schedule"}
        </button>
      </div>

      {/* Schedule Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 py-4 border-b border-white/5 bg-indigo-500/5 space-y-3"
          >
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">New Meeting</h4>
            <input
              type="text"
              placeholder="Title (e.g. Design Review)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block uppercase tracking-widest">Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                  className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block uppercase tracking-widest">Duration (min)</label>
                <input
                  type="number"
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                  className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <input
              type="url"
              placeholder="Meeting URL (Google Meet / Zoom)"
              value={form.meeting_url}
              onChange={(e) => setForm({ ...form, meeting_url: e.target.value })}
              className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <textarea
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
            <button
              onClick={handleSchedule}
              disabled={!form.title || !form.scheduled_at || submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
              Confirm Meeting
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meetings List */}
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-8">
            <Video className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">No meetings scheduled yet.</p>
          </div>
        ) : (
          meetings.map((m) => (
            <div key={m.id} className="flex items-start gap-3 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Video className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm truncate">{m.title}</span>
                  <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${STATUS_STYLES[m.status]}`}>
                    {m.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-slate-500 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(m.scheduled_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {m.duration_minutes}min
                  </span>
                </div>
                {m.notes && <p className="text-slate-500 text-xs mt-1 italic">"{m.notes}"</p>}
                <div className="flex items-center gap-2 mt-2">
                  {m.meeting_url && (
                    <a
                      href={m.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Join
                    </a>
                  )}
                  {m.status === "scheduled" && (
                    <>
                      <button
                        onClick={() => handleUpdate(m.id, "completed")}
                        className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-semibold transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </button>
                      <button
                        onClick={() => handleUpdate(m.id, "cancelled")}
                        className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-semibold transition-colors"
                      >
                        <XCircle className="w-3 h-3" /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
