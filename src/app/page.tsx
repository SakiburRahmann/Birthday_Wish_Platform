"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Heart, Stars } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#fdfdfd] overflow-hidden">
      {/* Background subtle elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#c5a059] blur-[120px] opacity-20"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#c5a059] blur-[150px] opacity-10"
        />
      </div>

      <main className="relative z-10 max-w-4xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#00000008] shadow-sm mb-8">
            <Sparkles size={16} className="text-[#c5a059]" />
            <span className="text-xs font-medium tracking-wider uppercase text-[#6e6e73]">The New Way to Celebrate</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-serif font-light mb-8 leading-tight tracking-tight text-[#1d1d1f]">
            Give them a <br />
            <span className="italic text-[#c5a059]">Cinematic</span> Surprise.
          </h1>

          <p className="text-xl md:text-2xl text-[#6e6e73] font-light max-w-2xl mx-auto mb-12 leading-relaxed">
            Create an immersive, themed journey of wishes and memories for someone special. Fast, beautiful, and forever.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link href="/create">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-full bg-[#1d1d1f] text-white font-medium text-lg flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all"
              >
                Start a Journey <ArrowRight size={20} />
              </motion.button>
            </Link>
            
            <button className="px-8 py-4 rounded-full bg-white border border-[#00000008] text-[#1d1d1f] font-medium text-lg hover:bg-[#f5f5f7] transition-all">
              View Examples
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
        >
          <div className="p-6 rounded-2xl bg-white border border-[#00000005] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-4">
              <Stars size={20} className="text-[#c5a059]" />
            </div>
            <h3 className="font-serif text-xl mb-2">Themed Worlds</h3>
            <p className="text-sm text-[#6e6e73]">Choose from curated visual experiences tailored to their personality.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-[#00000005] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-4">
              <Heart size={20} className="text-[#c5a059]" />
            </div>
            <h3 className="font-serif text-xl mb-2">Collaborative Love</h3>
            <p className="text-sm text-[#6e6e73]">Collect wishes, photos, and memories from everyone in one beautiful space.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-[#00000005] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-4">
              <Sparkles size={20} className="text-[#c5a059]" />
            </div>
            <h3 className="font-serif text-xl mb-2">Live Surprise</h3>
            <p className="text-sm text-[#6e6e73]">Real-time updates mean they see the love as it happens on their big day.</p>
          </div>
        </motion.div>
      </main>

      <footer className="absolute bottom-8 text-sm text-[#6e6e73] font-light">
        © 2024 Birthday Wish Platform. Made with ❤️ for your loved ones.
      </footer>
    </div>
  );
}
