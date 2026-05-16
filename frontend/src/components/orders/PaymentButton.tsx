"use client";

import React, { useState } from "react";
import { CreditCard, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

import { MockCreditCardForm } from "./MockCreditCardForm";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function PaymentButton({ orderId, amount }: { orderId: string, amount: number }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleMockSuccess = async () => {
    setLoading(true);
    setShowModal(false);
    try {
      const { session } = (await import("@/store/useAuthStore")).useAuthStore.getState();
      
      await axios.post(`${API_BASE_URL}/api/v1/payments/mock-pay`, 
        { order_id: orderId },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      
      setSuccess(true);
      setTimeout(() => window.location.reload(), 2000);
    } catch (e) {
      console.error(e);
      alert("Mock payment failed backend sync.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-green-400 font-bold bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
        <CheckCircle className="w-5 h-5" /> Authorized & Held
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
        Pay ${amount.toLocaleString()} (Escrow Hold)
      </button>

      {showModal && (
        <MockCreditCardForm 
          amount={amount}
          onSuccess={handleMockSuccess}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
