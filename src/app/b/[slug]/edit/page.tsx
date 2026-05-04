"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import FestiveBackground from "@/components/FestiveBackground";
import { 
  ArrowLeft, Save, Camera, FileText, Calendar, Lock, Loader2, CheckCircle, 
  Sparkles, Image as ImageIcon, Music, Link as LinkIcon, Plus, Trash2, 
  ChevronRight, QrCode, Download, Share2, Video, Play 
} from "lucide-react";
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
  
  // Gallery & Video State
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  
  // Milestones State
  const [milestones, setMilestones] = useState<any[]>([]);

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
        setGalleryUrls(data.gallery || []);
        setVideoUrls(data.videos || []);
        setMilestones(data.milestone_years || []);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'gallery' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (type === 'gallery') setIsUploadingGallery(true);
    else setIsUploadingVideo(true);

    const newUrls = type === 'gallery' ? [...galleryUrls] : [...videoUrls];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("media")
        .upload(`${type}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Upload error:", error);
        alert(`Upload failed (${file.name}): ${error.message}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from("media")
        .getPublicUrl(`${type}/${fileName}`);
      newUrls.push(publicUrlData.publicUrl);
    }

    if (type === 'gallery') {
      setGalleryUrls(newUrls);
      setIsUploadingGallery(false);
    } else {
      setVideoUrls(newUrls);
      setIsUploadingVideo(false);
    }
  };

  const removeFile = (index: number, type: 'gallery' | 'video') => {
    if (type === 'gallery') setGalleryUrls(prev => prev.filter((_, i) => i !== index));
    else setVideoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addMilestone = () => {
    setMilestones([...milestones, { year: new Date().getFullYear().toString(), title: "New Milestone", note: "" }]);
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index][field] = value;
    setMilestones(newMilestones);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
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
        gallery: galleryUrls,
        videos: videoUrls,
        milestone_years: milestones,
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full glass p-10 rounded-[40px] shadow-2xl relative z-10">
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
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-white font-sans pb-32">
      <FestiveBackground />
      
      <nav className="sticky top-0 z-50 glass border-b border-black/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href={`/b/${slug}`} className="group flex items-center gap-2 text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-all">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Exit to Public Profile
          </Link>
          <div className="flex items-center gap-6">
            {isSuccess && <span className="text-sm text-green-600 flex items-center gap-1 font-medium"><CheckCircle size={14} /> Changes Saved</span>}
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

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 space-y-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-serif text-[#1d1d1f] flex items-center gap-3">
              <Sparkles className="text-[#c5a059]" /> Celebration Studio
            </h1>
            <p className="text-[#6e6e73] text-lg">Curate every detail of {name}'s special day.</p>
          </div>
          
          <div className="flex gap-3">
            <div className="p-4 rounded-3xl glass shadow-md border-white/50 flex items-center gap-4">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-black/5">
                <QrCode size={40} className="text-[#1d1d1f]" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6e6e73]">Guest Access QR</p>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="text-[10px] font-medium text-[#c5a059] flex items-center gap-1 hover:underline">
                    <Download size={10} /> Print for Party
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar: Media & Assets */}
          <div className="lg:col-span-4 space-y-8">
            {/* Profile Portrait */}
            <section className="glass p-8 rounded-[40px] shadow-xl border-white/50">
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
            </section>

            {/* Music Section */}
            <section className="glass p-8 rounded-[40px] shadow-lg border-white/50 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                <Music size={14} /> Background Music
              </h3>
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e6e73]" />
                <input
                  type="text"
                  placeholder="Direct MP3 URL..."
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/5 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a05920] transition-all"
                />
              </div>
            </section>
          </div>

          {/* Main Editor Sections */}
          <div className="lg:col-span-8 space-y-12">
            {/* Essential Details */}
            <section className="glass p-10 rounded-[40px] shadow-xl border-white/50 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">Birthday Person</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all text-lg shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">Birthday Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all text-lg shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">Intro Story / Bio</label>
                <textarea
                  rows={6}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a heartfelt introduction..."
                  className="w-full px-6 py-4 rounded-2xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all resize-none text-lg leading-relaxed shadow-sm"
                />
              </div>
            </section>

            {/* Memory Wall (Gallery) */}
            <section className="glass p-10 rounded-[40px] shadow-xl border-white/50">
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif text-[#1d1d1f] flex items-center gap-3">
                    <ImageIcon size={24} className="text-[#c5a059]" /> Memory Wall
                  </h2>
                  <p className="text-xs text-[#6e6e73]">Upload childhood photos, funny moments, and more.</p>
                </div>
                <div className="relative">
                  <button 
                    disabled={isUploadingGallery}
                    className="px-6 py-2.5 rounded-full bg-[#c5a059] text-white text-xs font-bold uppercase tracking-widest shadow-md hover:bg-[#b58a49] transition-all flex items-center gap-2"
                  >
                    {isUploadingGallery ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Add Photos
                  </button>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, 'gallery')}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryUrls.map((url, i) => (
                  <motion.div 
                    key={i}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-square rounded-2xl overflow-hidden relative group shadow-sm border border-black/5"
                  >
                    <img src={url} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeFile(i, 'gallery')}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Video Wall */}
            <section className="glass p-10 rounded-[40px] shadow-xl border-white/50">
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif text-[#1d1d1f] flex items-center gap-3">
                    <Video size={24} className="text-[#c5a059]" /> Video Memories
                  </h2>
                  <p className="text-xs text-[#6e6e73]">Upload short clips, birthday wishes, and special messages.</p>
                </div>
                <div className="relative">
                  <button 
                    disabled={isUploadingVideo}
                    className="px-6 py-2.5 rounded-full bg-[#1d1d1f] text-white text-xs font-bold uppercase tracking-widest shadow-md hover:bg-black transition-all flex items-center gap-2"
                  >
                    {isUploadingVideo ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Add Videos
                  </button>
                  <input 
                    type="file" 
                    multiple 
                    accept="video/*" 
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videoUrls.map((url, i) => (
                  <motion.div 
                    key={i}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-video rounded-2xl overflow-hidden relative group shadow-sm border border-black/5 bg-black/5"
                  >
                    <video src={url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                      <Play size={32} className="text-white opacity-80" />
                    </div>
                    <button 
                      onClick={() => removeFile(i, 'video')}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Life Journey (Milestones) */}
            <section className="glass p-10 rounded-[40px] shadow-xl border-white/50">
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif text-[#1d1d1f] flex items-center gap-3">
                    <Sparkles size={24} className="text-[#c5a059]" /> Life Journey
                  </h2>
                  <p className="text-xs text-[#6e6e73]">Add key milestones and memories from through the years.</p>
                </div>
                <button 
                  onClick={addMilestone}
                  className="px-6 py-2.5 rounded-full border border-[#c5a05920] text-[#c5a059] text-xs font-bold uppercase tracking-widest hover:bg-[#c5a05905] transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Add Year
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {milestones.map((ms, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-6 rounded-3xl bg-black/5 border border-black/5 flex flex-col md:flex-row gap-4 items-start"
                    >
                      <div className="w-24 shrink-0">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#6e6e73] mb-1 block">Year</label>
                        <input
                          type="text"
                          value={ms.year}
                          onChange={(e) => updateMilestone(i, "year", e.target.value)}
                          className="w-full bg-white border border-black/5 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c5a05920]"
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6e6e73] mb-1 block">Event Title</label>
                          <input
                            type="text"
                            value={ms.title}
                            onChange={(e) => updateMilestone(i, "title", e.target.value)}
                            className="w-full bg-white border border-black/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c5a05920]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6e6e73] mb-1 block">Memory Note</label>
                          <textarea
                            rows={2}
                            value={ms.note}
                            onChange={(e) => updateMilestone(i, "note", e.target.value)}
                            placeholder="A short note about this year..."
                            className="w-full bg-white border border-black/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c5a05920] resize-none"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => removeMilestone(i)}
                        className="mt-6 p-2 rounded-xl text-[#6e6e73]/40 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
