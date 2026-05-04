"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function WishSubmission() {
  const { slug } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();
      if (data) setEvent(data);
    }
    fetchEvent();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setIsLoading(true);

    const { error } = await supabase.from("wishes").insert([
      {
        event_id: event.id,
        sender_name: senderName,
        message: message,
      },
    ]);

    if (error) {
      alert("Error sending wish: " + error.message);
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        router.push(`/b/${slug}`);
      }, 3000);
    }
  };

  if (!event) return null;

  return (
    <div className="min-h-screen bg-[#fdfdfd] p-6 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full">
        <Link href={`/b/${slug}`} className="inline-flex items-center gap-2 text-[#6e6e73] hover:text-[#1d1d1f] transition-all mb-8">
          <ArrowLeft size={18} /> Back to Celebration
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[32px] border border-[#00000008] shadow-luxe"
        >
          {isSuccess ? (
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-[#c5a05908] flex items-center justify-center mx-auto mb-6">
                <Sparkles size={40} className="text-[#c5a059]" />
              </div>
              <h2 className="text-3xl font-serif text-[#1d1d1f] mb-4">Wish Sent!</h2>
              <p className="text-[#6e6e73]">Your message has been added to {event.recipient_name}'s celebration. Redirecting you back...</p>
            </motion.div>
          ) : (
            <>
              <h1 className="text-4xl font-serif text-[#1d1d1f] mb-2">Leave a Wish</h1>
              <p className="text-[#6e6e73] mb-8">For {event.recipient_name}'s special day.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1d1d1f]">Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Smith"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-[#00000008] bg-[#fdfdfd] focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1d1d1f]">Your Message</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Write something heartfelt..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-[#00000008] bg-[#fdfdfd] focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all resize-none"
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
                      Send Wish <Send size={18} />
                    </>
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
