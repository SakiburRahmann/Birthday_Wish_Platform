"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, User, Lock, AlertTriangle, CheckCircle, ArrowRight, Copy, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateEvent() {
  const [recipientName, setRecipientName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdData, setCreatedData] = useState<{ slug: string; name: string } | null>(null);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Generate unique slug (Username)
    const baseSlug = recipientName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const randomId = Math.random().toString(36).substring(2, 6);
    const finalSlug = `${baseSlug}-${randomId}`;

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          recipient_name: recipientName,
          slug: finalSlug,
          manage_password: password, // In production, this should be hashed
          birthday_date: new Date().toISOString().split('T')[0], // Default to today
          theme_config: { theme: "minimalist-luxe" }
        }
      ])
      .select();

    if (error) {
      alert("Error creating page: " + error.message);
      setIsLoading(false);
    } else {
      setCreatedData({ slug: data[0].slug, name: data[0].recipient_name });
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] p-6 md:p-12 flex flex-col items-center justify-center font-sans">
      <div className="max-w-xl w-full">
        {!createdData && (
          <Link href="/" className="inline-flex items-center gap-2 text-[#6e6e73] hover:text-[#1d1d1f] transition-all mb-8">
            <ArrowLeft size={18} /> Back
          </Link>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[32px] border border-[#00000008] shadow-xl"
        >
          {createdData ? (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h1 className="text-3xl font-serif text-[#1d1d1f]">Page Created Successfully</h1>
                <p className="text-[#6e6e73] mt-2 text-sm">Now you can customize the profile and add content.</p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#f5f5f7] border border-black/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#6e6e73] font-bold">Your Management Username</p>
                      <p className="text-lg font-medium font-mono text-[#1d1d1f]">{createdData.slug}</p>
                    </div>
                    <button onClick={() => copyToClipboard(createdData.slug)} className="p-2 hover:bg-black/5 rounded-lg text-[#6e6e73]">
                      <Copy size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3 items-start">
                  <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Important Note</p>
                    <p className="text-xs text-amber-700 leading-relaxed mt-1">
                      Please save your **Username** and **Password** now. They cannot be changed or reset later. You will need them to login and edit this page.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Link href={`/b/${createdData.slug}/edit`}>
                  <button className="w-full py-4 rounded-xl bg-[#1d1d1f] text-white font-medium flex items-center justify-center gap-2 shadow-lg hover:bg-black transition-all">
                    Go to Dashboard & Customize <ArrowRight size={18} />
                  </button>
                </Link>
                <Link href={`/b/${createdData.slug}`} className="text-center text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-all">
                  View Public Page
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-serif mb-2 text-[#1d1d1f]">Create Birthday Page</h1>
              <p className="text-[#6e6e73] mb-10 text-sm">A dedicated profile for someone special.</p>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1d1d1f] flex items-center gap-2">
                    <User size={14} /> Birthday Person's Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Sarah Jones"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl border border-black/5 bg-[#fdfdfd] focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1d1d1f] flex items-center gap-2">
                    <Lock size={14} /> Management Password
                  </label>
                  <input
                    required
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl border border-black/5 bg-[#fdfdfd] focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#f5f5f7] border border-black/5 flex gap-3 items-start">
                  <AlertTriangle size={18} className="text-[#6e6e73] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#6e6e73] leading-relaxed">
                    A unique username will be generated based on the name. Make sure to remember your password as it cannot be recovered.
                  </p>
                </div>

                <motion.button
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-4 rounded-xl bg-[#1d1d1f] text-white font-medium text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Initialize Page"
                  )}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
