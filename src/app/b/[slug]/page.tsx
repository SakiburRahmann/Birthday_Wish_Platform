"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import WishCard from "@/components/WishCard";
import FestiveBackground from "@/components/FestiveBackground";
import confetti from "canvas-confetti";
import { Plus, Share2, Calendar, MessageSquare, Image as ImageIcon, Volume2, VolumeX, Music, Settings } from "lucide-react";
import Link from "next/link";

export default function BirthdayPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [wishes, setWishes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#c5a059", "#1d1d1f", "#ffffff"]
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug, event?.id]);

  useEffect(() => {
    if (!event) return;

    const timer = setInterval(() => {
      const target = new Date(event.birthday_date).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [event]);

  const toggleMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"); // Replace with soft festive track
      audioRef.current.loop = true;
    }
    
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      if (event.music_url) {
        audioRef.current.play();
      }
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  useEffect(() => {
    if (isMusicPlaying && event?.music_url && !audioRef.current) {
      audioRef.current = new Audio(event.music_url);
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    } else if (audioRef.current && event?.music_url) {
      if (audioRef.current.src !== event.music_url) {
        audioRef.current.src = event.music_url;
        if (isMusicPlaying) audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    }
  }, [isMusicPlaying, event?.music_url]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-12 h-12 border-4 border-[#c5a05920] border-t-[#c5a059] rounded-full" 
      />
    </div>
  );

  if (!event) return <div className="min-h-screen flex items-center justify-center">Profile not found.</div>;

  return (
    <div className="min-h-screen relative bg-white selection:bg-[#c5a05920] selection:text-[#c5a059]">
      <FestiveBackground />

      {/* Floating Header Controls */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full glass border-white/50 shadow-luxe">
        {event.music_url && (
          <>
            <button onClick={toggleMusic} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-all text-[#1d1d1f]">
              {isMusicPlaying ? <Volume2 size={20} className="animate-pulse" /> : <VolumeX size={20} />}
            </button>
            <div className="h-4 w-px bg-black/10 mx-1" />
          </>
        )}
        <button 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied!");
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-black/5 transition-all text-sm font-medium text-[#1d1d1f]"
        >
          <Share2 size={16} /> Share
        </button>
        <Link href={`/b/${slug}/edit`}>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-all text-[#1d1d1f]">
            <Settings size={20} />
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center">
          {/* Profile Photo with Spring Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative w-48 h-48 md:w-64 md:h-64 rounded-full p-2 bg-white shadow-2xl mb-12"
          >
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#c5a05920]">
              {event.profile_image_url ? (
                <img src={event.profile_image_url} alt={event.recipient_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#f5f5f7] text-6xl font-serif text-[#c5a059]">
                  {event.recipient_name.charAt(0)}
                </div>
              )}
            </div>
            {/* Festive decoration elements */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-dashed border-[#c5a05920] rounded-full pointer-events-none" 
            />
          </motion.div>

          {/* Name & Bio */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 max-w-2xl"
          >
            <h1 className="text-5xl md:text-8xl font-serif text-[#1d1d1f] tracking-tight leading-none">
              {event.recipient_name}
            </h1>
            <p className="text-xl md:text-2xl text-[#6e6e73] font-light italic leading-relaxed">
              "{event.bio || "Celebrating a special life today."}"
            </p>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 flex gap-4 md:gap-8"
          >
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Mins", value: timeLeft.minutes },
              { label: "Secs", value: timeLeft.seconds }
            ].map((unit, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl glass flex items-center justify-center text-2xl md:text-4xl font-serif text-[#1d1d1f] shadow-lg mb-2">
                  {unit.value.toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-[#c5a059] font-bold">{unit.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Wishes Section */}
        <div className="mt-32">
          <div className="flex justify-between items-end mb-12 border-b border-black/5 pb-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-serif text-[#1d1d1f] flex items-center gap-3">
                <MessageSquare size={28} className="text-[#c5a059]" /> The Guestbook
              </h2>
              <p className="text-sm text-[#6e6e73]">{wishes.length} people have shared their love.</p>
            </div>
            <Link href={`/b/${slug}/wish`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full bg-[#1d1d1f] text-white font-medium flex items-center gap-2 shadow-lg btn-shimmer"
              >
                <Plus size={20} /> Write a Wish
              </motion.button>
            </Link>
          </div>

          <div className="bento-grid">
            <AnimatePresence mode="popLayout">
              {wishes.length > 0 ? (
                wishes.map((wish, index) => (
                  <motion.div
                    key={wish.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <WishCard
                      index={index}
                      sender={wish.sender_name}
                      message={wish.message}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-24 text-center glass rounded-[40px] border-dashed border-2 border-[#c5a05920]">
                  <p className="text-[#6e6e73] font-serif italic text-lg">Waiting for the first wish to arrive...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Media Gallery (Upcoming) */}
        {event.gallery && event.gallery.length > 0 && (
          <div className="mt-32">
            <h2 className="text-3xl font-serif text-[#1d1d1f] mb-12 flex items-center gap-3">
              <ImageIcon size={28} className="text-[#c5a059]" /> Moments Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {event.gallery.map((img: string, i: number) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="aspect-[3/4] rounded-3xl overflow-hidden glass shadow-xl"
                >
                  <img src={img} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Background audio track */}
      <footer className="relative z-10 py-12 text-center text-sm text-[#6e6e73] font-light">
        Made with ❤️ for {event.recipient_name}
      </footer>
    </div>
  );
}
