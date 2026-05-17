"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ClientDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/orders");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">
        Routing to client dashboard...
      </p>
    </div>
  );
}
