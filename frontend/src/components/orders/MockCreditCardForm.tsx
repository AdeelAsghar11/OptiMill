"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Lock, Calendar, ShieldCheck, Loader2, X } from "lucide-react";

interface MockCreditCardFormProps {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function MockCreditCardForm({ amount, onSuccess, onClose }: MockCreditCardFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Format card number: 0000 0000 0000 0000
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  // Format expiry: MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").substring(0, 4);
    const formatted = val.length >= 3 ? `${val.slice(0, 2)}/${val.slice(2)}` : val;
    setExpiry(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate validation and processing delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Secure Checkout</h3>
                <p className="text-slate-500 text-xs uppercase tracking-widest">Mock Payment Gateway</p>
              </div>
            </div>

            <div className="mb-8 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-center">
              <span className="text-slate-400 text-xs block mb-1">Total to Authorize</span>
              <span className="text-3xl font-black text-white">${amount.toLocaleString()}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter ml-1">Cardholder Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter ml-1">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    required
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter ml-1">Expiry Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      required
                      type="text"
                      value={expiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter ml-1">CVV</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      required
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
                      placeholder="•••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Authorize & Hold Funds</>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4">
                <ShieldCheck className="w-3 h-3" /> Encrypted Sandbox Payment
              </div>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
            >
              <ShieldCheck className="w-10 h-10 text-green-400" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Payment Authorized</h3>
            <p className="text-slate-400 text-sm mb-6">
              Funds for <strong>${amount.toLocaleString()}</strong> have been successfully authorized and moved to escrow.
            </p>
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
