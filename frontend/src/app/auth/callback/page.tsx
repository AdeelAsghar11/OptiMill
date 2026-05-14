"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase client automatically handles the session in the URL hash.
    // We just need to wait a moment and redirect.
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/auth/login");
      }
    };
    
    handleCallback();
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#0a0a0b]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-slate-400">Verifying authentication...</p>
      </div>
    </div>
  );
}
