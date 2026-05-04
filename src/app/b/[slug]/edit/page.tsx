"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import FestiveBackground from "@/components/FestiveBackground";
import { ArrowLeft, Save, Camera, FileText, Calendar, Lock, Loader2, CheckCircle, ExternalLink, Sparkles, Image as ImageIcon, Music, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function EditProfile() {
  const { slug } = useParams();
  const router = useRouter();
  
  const [event, setEvent] = useState<any>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [bio, setBio] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  useEffect(() => {
    async function fetchEvent() {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (data) {
        setEvent(data);
        setName(data.recipient_name);
        setDate(data.birthday_date);
        setBio(data.bio || "");
        setMusicUrl(data.music_url || "");
        setCurrentImageUrl(data.profile_image_url || "");
      }
      setIsLoading(false);
    }
    fetchEvent();
  }, [slug]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (event && passwordInput === event.manage_password) {
      setIsAuthorized(true);
    } else {
      alert("Incorrect password.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let finalImageUrl = currentImageUrl;

    if (profileImage) {
      const fileName = `${Date.now()}-${profileImage.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(`profiles/${fileName}`, profileImage);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("media")
          .getPublicUrl(`profiles/${fileName}`);
        finalImageUrl = publicUrlData.publicUrl;
      }
    }

    const { error } = await supabase
      .from("events")
      .update({
        recipient_name: name,
        birthday_date: date,
        bio: bio,
        music_url: musicUrl,
        profile_image_url: finalImageUrl,
      })
      .eq("id", event.id);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}><Loader2 size={32} className="text-[#c5a059]" /></motion.div></div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Profile not found.</div>;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen relative bg-[#fdfdfd] flex items-center justify-center p-6 font-sans">
        <FestiveBackground />
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="max-w-md w-full glass p-10 rounded-[40px] shadow-2xl relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4 text-[#1d1d1f]">
              <Lock size={24} />
            </div>
            <h1 className="text-3xl font-serif text-[#1d1d1f]">Studio Access</h1>
            <p className="text-sm text-[#6e6e73] mt-2">Enter your password to customize this celebration.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              placeholder="Enter Management Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all text-lg shadow-sm"
            />
            <button className="w-full py-4 rounded-2xl bg-[#1d1d1f] text-white font-medium shadow-lg hover:bg-black transition-all btn-shimmer">
              Unlock Studio
            </button>
            <Link href={`/b/${slug}`} className="block text-center text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-all">
              Back to public page
            </Link>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-white font-sans pb-20">
      <FestiveBackground />
      
      <nav className="sticky top-0 z-50 glass border-b border-black/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href={`/b/${slug}`} className="group flex items-center gap-2 text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-all">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Exit to Public Profile
          </Link>
          <div className="flex items-center gap-6">
            <AnimatePresence>
              {isSuccess && (
                <motion.span 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-sm text-green-600 flex items-center gap-1 font-medium"
                >
                  <CheckCircle size={14} /> Changes Saved
                </motion.span>
              )}
            </AnimatePresence>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2.5 rounded-full bg-[#1d1d1f] text-white text-sm font-medium flex items-center gap-2 shadow-lg hover:bg-black transition-all disabled:opacity-50 btn-shimmer"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 space-y-16">
        <header className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif text-[#1d1d1f] flex items-center gap-3">
              <Sparkles className="text-[#c5a059]" /> Celebration Studio
            </h1>
            <p className="text-[#6e6e73] text-lg">Curate every detail of {name}'s special day.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar: Visuals */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass p-8 rounded-[40px] shadow-xl border-white/50"
            >
              <label className="text-xs font-bold uppercase tracking-widest text-[#c5a059] block mb-6">Profile Portrait</label>
              <div className="aspect-square rounded-[32px] bg-[#f5f5f7] border-2 border-dashed border-black/5 flex flex-col items-center justify-center overflow-hidden relative group">
                {currentImageUrl || profileImage ? (
                  <img 
                    src={profileImage ? URL.createObjectURL(profileImage) : currentImageUrl} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Camera size={48} className="text-[#6e6e73]/20" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer">
                  <Camera size={24} className="text-white mb-2" />
                  <span className="text-white text-xs font-bold">Replace Photo</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setProfileImage(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
            </motion.div>

            <div className="glass p-8 rounded-[40px] shadow-lg border-white/50 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                <Music size={14} /> Background Music
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6e6e73]">MP3 Direct Link</label>
                  <div className="relative">
                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e6e73]" />
                    <input
                      type="text"
                      placeholder="https://example.com/song.mp3"
                      value={musicUrl}
                      onChange={(e) => setMusicUrl(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-black/5 bg-[#fdfdfd] text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a05920] transition-all"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-[#6e6e73] leading-relaxed italic">
                  Paste a direct link to an MP3 file (e.g., from Dropbox or a public URL) to play background music on the profile.
                </p>
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-10 rounded-[40px] shadow-xl border-white/50 space-y-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all text-lg shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                    Birthday Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all text-lg shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                  Biography / Story
                </label>
                <textarea
                  rows={8}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a story or a warm welcome message..."
                  className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all resize-none text-lg leading-relaxed shadow-sm"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
