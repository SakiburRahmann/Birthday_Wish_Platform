"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Camera, FileText, Calendar, Lock, Loader2, CheckCircle, ExternalLink } from "lucide-react";
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]"><Loader2 className="animate-spin text-[#c5a059]" /></div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Profile not found.</div>;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#fdfdfd] flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white p-8 rounded-3xl border border-black/5 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4 text-[#1d1d1f]">
              <Lock size={20} />
            </div>
            <h1 className="text-2xl font-serif text-[#1d1d1f]">Manage Profile</h1>
            <p className="text-sm text-[#6e6e73] mt-1">Enter your password to edit this page.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Management Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border border-black/5 bg-[#fdfdfd] focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all"
            />
            <button className="w-full py-3.5 rounded-xl bg-[#1d1d1f] text-white font-medium shadow-md hover:bg-black transition-all">
              Login to Dashboard
            </button>
            <Link href={`/b/${slug}`} className="block text-center text-xs text-[#6e6e73] hover:text-[#1d1d1f]">
              Back to public page
            </Link>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-sans pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href={`/b/${slug}`} className="text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] flex items-center gap-2">
            <ArrowLeft size={16} /> View Profile
          </Link>
          <div className="flex items-center gap-4">
            {isSuccess && <span className="text-sm text-green-600 flex items-center gap-1 font-medium"><CheckCircle size={14} /> Saved</span>}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 rounded-full bg-[#1d1d1f] text-white text-sm font-medium flex items-center gap-2 shadow-md hover:bg-black transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-serif text-[#1d1d1f]">Dashboard</h1>
          <p className="text-[#6e6e73]">Customize the birthday profile and add content.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left Column: Media */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#6e6e73]">Profile Photo</label>
              <div className="aspect-square rounded-3xl bg-[#f5f5f7] border-2 border-dashed border-black/5 flex flex-col items-center justify-center overflow-hidden relative group">
                {currentImageUrl || profileImage ? (
                  <img 
                    src={profileImage ? URL.createObjectURL(profileImage) : currentImageUrl} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Camera size={32} className="text-[#6e6e73]/20" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                  <span className="text-white text-xs font-medium">Change Photo</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setProfileImage(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="md:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#6e6e73]">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#6e6e73]">Date of Birth</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#6e6e73]">Bio / Introduction</label>
              <textarea
                rows={6}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about the birthday person..."
                className="w-full px-5 py-3 rounded-xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Gallery Section Placeholder */}
        <div className="pt-12 border-t border-black/5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif text-[#1d1d1f]">Photo Gallery</h2>
            <button className="text-sm font-medium text-[#c5a059] flex items-center gap-1 hover:underline">
              <Plus size={16} /> Add Photos
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="aspect-square rounded-2xl bg-[#f5f5f7] border-2 border-dashed border-black/5 flex items-center justify-center text-[#6e6e73]/30">
              Empty
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Plus({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
