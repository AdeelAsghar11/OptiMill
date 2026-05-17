"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardRedirectPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    const role = user.user_metadata?.role;
    if (role === "shop") {
      router.replace("/dashboard/shop");
    } else {
      // Default to /orders for clients/users
      router.replace("/orders");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">
        Routing to your dashboard...
      </p>
    </div>
  );
}
