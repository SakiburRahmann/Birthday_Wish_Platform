"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon, Heart, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#fdfdfd] overflow-hidden font-sans">
      <main className="relative z-10 max-w-4xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 leading-tight tracking-tight text-[#1d1d1f]">
            Personalized <br />
            <span className="italic text-[#c5a059]">Birthday Profiles</span>
          </h1>

          <p className="text-xl text-[#6e6e73] font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Create a dedicated profile for your loved ones. Share photos, tell their story, and collect wishes from friends.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/create">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl bg-[#1d1d1f] text-white font-medium text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all"
              >
                Create Birthday Page <ArrowRight size={20} />
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl bg-white border border-black/10 text-[#1d1d1f] font-medium text-lg flex items-center gap-3 shadow-sm hover:shadow-md transition-all"
              >
                Manage Existing Page
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-xl bg-white border border-[#00000005] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-4 text-[#c5a059]">
              <ImageIcon size={20} />
            </div>
            <h3 className="font-serif text-xl mb-2">Photo Profiles</h3>
            <p className="text-sm text-[#6e6e73]">Add a profile photo and bio to personalize the celebration.</p>
          </div>
          <div className="p-6 rounded-xl bg-white border border-[#00000005] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-4 text-[#c5a059]">
              <Users size={20} />
            </div>
            <h3 className="font-serif text-xl mb-2">Friend Wishes</h3>
            <p className="text-sm text-[#6e6e73]">Easy sharing so everyone can post their birthday messages.</p>
          </div>
          <div className="p-6 rounded-xl bg-white border border-[#00000005] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-4 text-[#c5a059]">
              <Heart size={20} />
            </div>
            <h3 className="font-serif text-xl mb-2">Interactive Wall</h3>
            <p className="text-sm text-[#6e6e73]">A live wall where all messages and photos appear in real-time.</p>
          </div>
        </div>
      </main>

      <footer className="mt-20 text-sm text-[#6e6e73] font-light">
        © 2024 Birthday Profile Platform
      </footer>
    </div>
  );
}
