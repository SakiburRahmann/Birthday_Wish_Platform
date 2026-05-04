"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Sparkles, Wand2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateEvent() {
  const [recipientName, setRecipientName] = useState("");
  const [slug, setSlug] = useState("");
  const [birthdayDate, setBirthdayDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          recipient_name: recipientName,
          slug: slug.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          birthday_date: birthdayDate,
          theme_config: { theme: "minimalist-luxe" }
        }
      ])
      .select();

    if (error) {
      alert("Error creating event: " + error.message);
      setIsLoading(false);
    } else {
      router.push(`/b/${data[0].slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-xl w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-[#6e6e73] hover:text-[#1d1d1f] transition-all mb-12">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-serif mb-2 text-[#1d1d1f]">Start a New Journey</h1>
          <p className="text-[#6e6e73] mb-12">Fill in the details to create a magical space for your loved one.</p>

          <form onSubmit={handleCreate} className="space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1d1d1f] flex items-center gap-2">
                Who is the birthday person? <Sparkles size={14} className="text-[#c5a059]" />
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Sarah"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-[#00000008] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1d1d1f]">
                What should the link be?
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[#6e6e73] text-sm">birthday-wish.com/b/</span>
                <input
                  required
                  type="text"
                  placeholder="sarah-2024"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-2xl border border-[#00000008] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1d1d1f]">
                When is the big day?
              </label>
              <input
                required
                type="date"
                value={birthdayDate}
                onChange={(e) => setBirthdayDate(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-[#00000008] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all text-lg"
              />
            </div>

            <motion.button
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-5 rounded-2xl bg-[#1d1d1f] text-white font-medium text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Create Magical Space <Wand2 size={20} />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
