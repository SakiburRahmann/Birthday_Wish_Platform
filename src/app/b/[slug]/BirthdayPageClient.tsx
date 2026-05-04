"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import WishCard from "@/components/WishCard";
import FestiveBackground from "@/components/FestiveBackground";
import confetti from "canvas-confetti";
import { 
  Plus, Share2, Calendar, MessageSquare, Image as ImageIcon, Volume2, 
  VolumeX, Music, Settings, Sparkles, ChevronDown 
} from "lucide-react";
import Link from "next/link";

export function BirthdayPageClient({ initialEvent, slug }: { initialEvent: any, slug: string }) {
  const [event, setEvent] = useState<any>(initialEvent);
  const [wishes, setWishes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(!initialEvent);
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
              particleCount: 150,
              spread: 100,
              origin: { y: 0.7 },
              colors: ["#c5a059", "#1d1d1f", "#ffffff", "#f9f0ff"]
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
    if (!event || !event.birthday_date) return;

    const calculateTime = () => {
      const target = new Date(`${event.birthday_date}T00:00:00`).getTime();
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
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [event?.birthday_date]);

  const toggleMusic = () => {
    if (isMusicPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
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
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
        <Loader2 size={48} className="text-[#c5a059]" />
      </motion.div>
    </div>
  );

  if (!event) return <div className="min-h-screen flex items-center justify-center">Profile not found.</div>;

  return (
    <div className="min-h-screen relative bg-white selection:bg-[#c5a05920] selection:text-[#c5a059] overflow-x-hidden">
      <FestiveBackground />

      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full glass border-white/50 shadow-luxe">
        {event.music_url && (
          <>
            <button onClick={toggleMusic} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-all text-[#1d1d1f]">
              {isMusicPlaying ? <Volume2 size={20} className="animate-pulse text-[#c5a059]" /> : <VolumeX size={20} />}
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

      <main className="relative z-10 pt-32 pb-48 px-6 max-w-6xl mx-auto space-y-40">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative w-48 h-48 md:w-72 md:h-72 rounded-full p-2 bg-white shadow-2xl mb-12"
          >
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#c5a05920]">
              {event.profile_image_url ? (
                <img src={event.profile_image_url} alt={event.recipient_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#f5f5f7] text-8xl font-serif text-[#c5a059]">
                  {event.recipient_name.charAt(0)}
                </div>
              )}
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -inset-6 border border-dashed border-[#c5a05940] rounded-full pointer-events-none" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6 max-w-3xl">
            <h1 className="text-6xl md:text-9xl font-serif text-[#1d1d1f] tracking-tighter leading-none">
              {event.recipient_name}
            </h1>
            <p className="text-xl md:text-3xl text-[#6e6e73] font-light italic leading-relaxed">
              "{event.bio || "Celebrating a special life today."}"
            </p>
          </motion.div>

          {/* Timer or Message */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-16">
            {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 ? (
              <div className="glass px-12 py-10 rounded-[40px] shadow-2xl border-white/50">
                <h2 className="text-4xl md:text-7xl font-serif text-gradient">Happy Birthday! 🎂</h2>
                <p className="text-[#6e6e73] mt-4 font-bold tracking-[0.3em] uppercase text-xs">The celebration has begun</p>
              </div>
            ) : (
              <div className="flex gap-4 md:gap-10 justify-center">
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Mins", value: timeLeft.minutes },
                  { label: "Secs", value: timeLeft.seconds }
                ].map((unit, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl glass flex items-center justify-center text-3xl md:text-5xl font-serif text-[#1d1d1f] shadow-xl mb-3">
                      {unit.value.toString().padStart(2, '0')}
                    </div>
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#c5a059] font-black">{unit.label}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mt-20 text-[#6e6e73]/20">
            <ChevronDown size={32} />
          </motion.div>
        </section>

        {/* Life Journey Timeline */}
        {event.milestone_years && event.milestone_years.length > 0 && (
          <section className="space-y-20 relative">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-serif text-[#1d1d1f]">The Story So Far</h2>
              <div className="w-24 h-1 bg-[#c5a059] mx-auto rounded-full" />
            </div>
            
            <div className="relative max-w-4xl mx-auto pl-12 md:pl-0">
              {/* Timeline Line */}
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#c5a05900] via-[#c5a05940] to-[#c5a05900]" />
              
              <div className="space-y-24">
                {event.milestone_years.map((ms: any, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className={`relative flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Circle on line */}
                    <div className="absolute left-[-25px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-[#c5a059] shadow-[0_0_20px_#c5a059]" />
                    
                    <div className="flex-1 text-left md:text-right w-full">
                      <div className={`space-y-2 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                        <span className="text-3xl md:text-5xl font-serif text-[#c5a059]">{ms.year}</span>
                        <h3 className="text-2xl font-serif text-[#1d1d1f]">{ms.title}</h3>
                        <p className="text-[#6e6e73] leading-relaxed max-w-md mx-0 md:mx-auto md:ml-0 md:mr-0 inline-block">
                          {ms.note}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Memory Wall (Masonry Gallery) */}
        {event.gallery && event.gallery.length > 0 && (
          <section className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-serif text-[#1d1d1f]">Memory Wall</h2>
              <p className="text-[#6e6e73] font-light italic">A collection of beautiful moments captured through the years.</p>
            </div>
            
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {event.gallery.map((img: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="break-inside-avoid rounded-3xl overflow-hidden glass p-3 shadow-xl cursor-pointer"
                >
                  <div className="rounded-2xl overflow-hidden aspect-auto">
                    <img src={img} className="w-full h-auto object-cover" />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Video Wall */}
        {event.videos && event.videos.length > 0 && (
          <section className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-serif text-[#1d1d1f]">Video Memories</h2>
              <p className="text-[#6e6e73] font-light italic">Heartfelt messages and special clips saved forever.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {event.videos.map((url: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className="rounded-[48px] overflow-hidden glass p-4 shadow-luxe transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-2">
                    <div className="rounded-[32px] overflow-hidden aspect-video bg-black relative">
                      <video 
                        src={url} 
                        controls 
                        onPlay={() => {
                          if (isMusicPlaying) {
                            audioRef.current?.pause();
                            setIsMusicPlaying(false);
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#c5a05910] rounded-full blur-3xl -z-10 group-hover:bg-[#c5a05920] transition-all" />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Wishes Section */}
        <section id="guestbook" className="space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 border-b border-black/5 pb-8">
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-4xl md:text-6xl font-serif text-[#1d1d1f] flex items-center gap-4 justify-center md:justify-start">
                <MessageSquare size={48} className="text-[#c5a059]" /> Guestbook
              </h2>
              <p className="text-lg text-[#6e6e73] font-light">{wishes.length} hearts have shared their love.</p>
            </div>
            <Link href={`/b/${slug}/wish`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 rounded-full bg-[#1d1d1f] text-white font-medium text-lg flex items-center gap-3 shadow-2xl btn-shimmer"
              >
                <Plus size={24} /> Add Your Wish
              </motion.button>
            </Link>
          </div>

          <div className="bento-grid">
            <AnimatePresence mode="popLayout">
              {wishes.map((wish, index) => (
                <WishCard key={wish.id} index={index} sender={wish.sender_name} message={wish.message} />
              ))}
            </AnimatePresence>
            {wishes.length === 0 && (
              <div className="col-span-full py-32 text-center glass rounded-[60px] border-dashed border-2 border-[#c5a05920]">
                <Sparkles size={48} className="mx-auto text-[#c5a05920] mb-4" />
                <p className="text-[#6e6e73] font-serif italic text-xl">The guestbook is waiting for its first heartfelt message.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="relative z-10 py-20 text-center border-t border-black/5 bg-white/30 backdrop-blur-sm">
        <p className="text-[#1d1d1f] font-serif text-2xl mb-2">Celebrating {event.recipient_name}</p>
        <p className="text-[#6e6e73] text-sm font-light uppercase tracking-widest">A lifetime of beautiful memories</p>
      </footer>
    </div>
  );
}

function Loader2({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  );
}
