"use client";

import React, { useState } from "react";
import { CreditCard, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export function PaymentButton({ orderId, amount }: { orderId: string, amount: number }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create PaymentIntent on backend
      const res = await axios.post(`${API_BASE_URL}/api/v1/payments/create-intent`, { order_id: orderId });
      const { clientSecret } = res.data;

      // 2. Load Stripe and open checkout
      // For this MVP, we'll use a simple alert or redirect to simulate the flow
      // In a real app, we'd use Elements or Checkout
      alert(`Stripe Payment Intent Created: ${clientSecret}\n\nIn a production environment, this would open the Stripe payment sheet.`);
      
      // Simulate success for now (since we don't have a real Stripe key/UI here)
      // In reality, the webhook would update the status to 'paid'
      setSuccess(true);
    } catch (e) {
      console.error(e);
      alert("Payment initiation failed.");
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
    <button
      onClick={handlePayment}
      disabled={loading}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
      Pay ${amount.toLocaleString()} (Escrow Hold)
    </button>
  );
}
