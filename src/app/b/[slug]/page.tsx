"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Envelope from "@/components/Envelope";
import WishCard from "@/components/WishCard";
import confetti from "canvas-confetti";
import { Plus, Share2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function BirthdayPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [wishes, setWishes] = useState<any[]>([]);
  const [isOpened, setIsOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Get event
      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (eventData) {
        setEvent(eventData);
        
        // Get wishes
        const { data: wishesData } = await supabase
          .from("wishes")
          .select("*")
          .eq("event_id", eventData.id)
          .order("created_at", { ascending: false });

        setWishes(wishesData || []);
      }
      setIsLoading(false);
    }

    fetchData();

    // Subscribe to new wishes
    const channel = supabase
      .channel("realtime-wishes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wishes" },
        (payload) => {
          if (event && payload.new.event_id === event.id) {
            setWishes((prev) => [payload.new, ...prev]);
            if (isOpened) {
              confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#c5a059", "#1d1d1f"]
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug, event?.id, isOpened]);

  const handleOpen = () => {
    setIsOpened(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#c5a059", "#1d1d1f", "#ffffff"]
    });
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-2 border-[#c5a05920] border-t-[#c5a059] rounded-full"
      />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
      <p className="font-serif text-2xl text-[#6e6e73]">This celebration hasn't been created yet.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfdfd] pb-24">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        <Link href={`/b/${slug}/wish`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center shadow-2xl"
          >
            <Plus size={24} />
          </motion.button>
        </Link>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
          }}
          className="w-14 h-14 rounded-full bg-white border border-[#00000008] text-[#1d1d1f] flex items-center justify-center shadow-xl"
        >
          <Share2 size={24} />
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {!isOpened ? (
          <motion.div
            key="envelope"
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center min-h-screen"
          >
            <Envelope onOpen={handleOpen} recipientName={event.recipient_name} />
          </motion.div>
        ) : (
          <motion.div
            key="wishes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto pt-24 px-6"
          >
            <header className="text-center mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c5a05908] border border-[#c5a05910] mb-6"
              >
                <Sparkles size={16} className="text-[#c5a059]" />
                <span className="text-xs font-medium tracking-wider uppercase text-[#c5a059]">The Celebration is Live</span>
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-serif text-[#1d1d1f] mb-4">
                Happy Birthday, <span className="italic text-[#c5a059]">{event.recipient_name}</span>
              </h1>
              <p className="text-[#6e6e73] font-light text-lg">A collection of love and memories from everyone who cares about you.</p>
            </header>

            <div className="bento-grid">
              {wishes.length > 0 ? (
                wishes.map((wish, index) => (
                  <WishCard
                    key={wish.id}
                    index={index}
                    sender={wish.sender_name}
                    message={wish.message}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-24 bg-white rounded-3xl border border-dashed border-[#00000010]">
                  <p className="text-[#6e6e73] font-serif text-xl italic">No wishes yet. Be the first to leave one!</p>
                  <Link href={`/b/${slug}/wish`}>
                    <button className="mt-6 px-6 py-3 rounded-full bg-[#c5a059] text-white font-medium hover:bg-[#b08e4a] transition-all">
                      Add a Wish
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
