"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import FestiveBackground from "@/components/FestiveBackground";
import { ArrowLeft, Lock, User, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GlobalLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase
      .from("events")
      .select("slug, manage_password")
      .eq("slug", username.trim())
      .single();

    if (error || !data) {
      alert("Invalid username or page not found.");
      setIsLoading(false);
      return;
    }

    if (data.manage_password === password) {
      // Direct to the edit page. The edit page itself also verifies the password.
      router.push(`/b/${data.slug}/edit`);
    } else {
      alert("Incorrect password.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-[#fdfdfd] flex items-center justify-center p-6 font-sans">
      <FestiveBackground />
      
      <div className="max-w-md w-full relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-[#6e6e73] hover:text-[#1d1d1f] transition-all mb-8">
          <ArrowLeft size={18} /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl p-10 rounded-[40px] border border-white shadow-2xl"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4 text-[#1d1d1f]">
              <Lock size={24} />
            </div>
            <h1 className="text-3xl font-serif text-[#1d1d1f]">Manage Profile</h1>
            <p className="text-sm text-[#6e6e73] mt-2">Enter your credentials to edit your page.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#6e6e73] ml-1">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73]" />
                <input
                  required
                  type="text"
                  placeholder="e.g. sarah-jones-a1b2"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#6e6e73] ml-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73]" />
                <input
                  required
                  type="password"
                  placeholder="Your access password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all"
                />
              </div>
            </div>

            <motion.button
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4 rounded-2xl bg-[#1d1d1f] text-white font-medium text-lg flex items-center justify-center gap-3 shadow-lg hover:bg-black transition-all disabled:opacity-50 btn-shimmer mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <>Login to Dashboard <ArrowRight size={20} /></>}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
