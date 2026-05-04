"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import WishCard from "@/components/WishCard";
import confetti from "canvas-confetti";
import { Plus, Share2, Calendar, MapPin, MessageSquare, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BirthdayPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [wishes, setWishes] = useState<any[]>([]);
  const [isOpened, setIsOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (eventData) {
        setEvent(eventData);
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

    const channel = supabase
      .channel("realtime-wishes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wishes" },
        (payload) => {
          if (event && payload.new.event_id === event.id) {
            setWishes((prev) => [payload.new, ...prev]);
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.8 },
              colors: ["#c5a059", "#1d1d1f"]
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug, event?.id]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
      <div className="w-10 h-10 border-2 border-[#c5a05920] border-t-[#c5a059] rounded-full animate-spin" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
      <p className="font-serif text-2xl text-[#6e6e73]">Profile not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfdfd] pb-24 font-sans">
      {/* Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
        <Link href={`/b/${slug}/wish`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center shadow-xl"
          >
            <Plus size={24} />
          </motion.button>
        </Link>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied!");
          }}
          className="w-14 h-14 rounded-full bg-white border border-black/5 text-[#1d1d1f] flex items-center justify-center shadow-lg"
        >
          <Share2 size={22} />
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden bg-[#f5f5f7]">
        {event.profile_image_url ? (
          <img 
            src={event.profile_image_url} 
            alt={event.recipient_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#fdfdfd] to-[#f5f5f7]">
            <span className="text-9xl font-serif text-[#00000005] select-none">
              {event.recipient_name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdfdfd] via-transparent to-transparent" />
      </section>

      {/* Profile Header */}
      <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10">
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl border border-black/5">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-[#c5a059] mb-4">
                <Calendar size={18} />
                <span className="text-sm font-medium tracking-wide uppercase">
                  Birthday: {new Date(event.birthday_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif text-[#1d1d1f] mb-6">
                {event.recipient_name}
              </h1>
              {event.bio && (
                <p className="text-lg text-[#6e6e73] leading-relaxed max-w-2xl">
                  {event.bio}
                </p>
              )}
            </div>
            
            <div className="flex gap-4">
              <div className="text-center px-6 py-4 rounded-2xl bg-[#f5f5f7]">
                <p className="text-2xl font-serif text-[#1d1d1f]">{wishes.length}</p>
                <p className="text-[10px] uppercase tracking-widest text-[#6e6e73]">Wishes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs/Sections */}
        <div className="mt-16 space-y-16">
          {/* Wishes Section */}
          <div>
            <div className="flex items-center gap-3 mb-8 border-b border-black/5 pb-4">
              <MessageSquare size={20} className="text-[#c5a059]" />
              <h2 className="text-2xl font-serif text-[#1d1d1f]">Guestbook</h2>
            </div>
            
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
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-black/10">
                  <p className="text-[#6e6e73] font-serif italic">No wishes posted yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Gallery Placeholder (Premium Idea) */}
          {event.gallery && event.gallery.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8 border-b border-black/5 pb-4">
                <ImageIcon size={20} className="text-[#c5a059]" />
                <h2 className="text-2xl font-serif text-[#1d1d1f]">Gallery</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {event.gallery.map((img: string, i: number) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-[#f5f5f7]">
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
