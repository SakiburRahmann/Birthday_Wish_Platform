"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, User, Calendar, FileText, Camera, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CreateEvent() {
  const [recipientName, setRecipientName] = useState("");
  const [birthdayDate, setBirthdayDate] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let profileImageUrl = "";

    // Upload profile image if selected
    if (profileImage) {
      const fileName = `${Date.now()}-${profileImage.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(`profiles/${fileName}`, profileImage);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("media")
          .getPublicUrl(`profiles/${fileName}`);
        profileImageUrl = publicUrlData.publicUrl;
      }
    }

    const baseSlug = recipientName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const randomId = Math.random().toString(36).substring(2, 6);
    const finalSlug = `${baseSlug}-${randomId}`;

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          recipient_name: recipientName,
          slug: finalSlug,
          birthday_date: birthdayDate,
          bio: bio,
          profile_image_url: profileImageUrl,
          theme_config: { theme: "minimalist-luxe" }
        }
      ])
      .select();

    if (error) {
      alert("Error creating page: " + error.message);
      setIsLoading(false);
    } else {
      setCreatedSlug(data[0].slug);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] p-6 md:p-12 flex flex-col items-center justify-center font-sans">
      <div className="max-w-2xl w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-[#6e6e73] hover:text-[#1d1d1f] transition-all mb-8">
          <ArrowLeft size={18} /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-3xl border border-[#00000008] shadow-xl"
        >
          {createdSlug ? (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h1 className="text-3xl font-serif text-[#1d1d1f]">Birthday Page Created</h1>
              <p className="text-[#6e6e73]">The profile is ready. Share the link below with guests.</p>
              
              <div className="p-4 rounded-xl bg-[#f5f5f7] border border-black/5 flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-[#6e6e73] font-bold">Public Link</span>
                <code className="text-sm font-medium break-all">{typeof window !== 'undefined' ? window.location.origin : ''}/b/{createdSlug}</code>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/b/${createdSlug}`);
                    alert("Link copied!");
                  }}
                  className="w-full py-4 rounded-xl bg-[#c5a059] text-white font-medium shadow-md hover:bg-[#b08e4a] transition-all"
                >
                  Copy Link
                </button>
                <Link href={`/b/${createdSlug}`} className="w-full py-4 rounded-xl bg-[#1d1d1f] text-white font-medium text-center">
                  View Page
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-serif mb-2 text-[#1d1d1f]">Create Birthday Profile</h1>
              <p className="text-[#6e6e73] mb-10">Set up a dedicated page for the celebration.</p>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1d1d1f] flex items-center gap-2">
                      <User size={14} /> Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Sarah Jones"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-5 py-3 rounded-xl border border-black/5 bg-[#fdfdfd] focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1d1d1f] flex items-center gap-2">
                      <Calendar size={14} /> Date of Birth
                    </label>
                    <input
                      required
                      type="date"
                      value={birthdayDate}
                      onChange={(e) => setBirthdayDate(e.target.value)}
                      className="w-full px-5 py-3 rounded-xl border border-black/5 bg-[#fdfdfd] focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1d1d1f] flex items-center gap-2">
                    <Camera size={14} /> Profile Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfileImage(e.target.files ? e.target.files[0] : null)}
                      className="block w-full text-sm text-[#6e6e73]
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[#f5f5f7] file:text-[#1d1d1f]
                        hover:file:bg-[#e8e8ed]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1d1d1f] flex items-center gap-2">
                    <FileText size={14} /> Bio / Intro
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell a little about the person..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl border border-black/5 bg-[#fdfdfd] focus:outline-none focus:ring-2 focus:ring-[#c5a05920] focus:border-[#c5a059] transition-all resize-none"
                  />
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
                    "Create Page"
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
