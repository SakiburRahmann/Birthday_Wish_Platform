"use client";

import { motion } from "framer-motion";

interface WishCardProps {
  sender: string;
  message: string;
  index: number;
}

export default function WishCard({ sender, message, index }: WishCardProps) {
  // Generate a slightly different rotation for each card to give it a handmade feel
  const rotation = (index % 3 - 1) * 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotation }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ y: -8, rotate: 0, transition: { duration: 0.3 } }}
      className="p-8 rounded-[32px] bg-white/80 backdrop-blur-xl border border-black/5 shadow-luxe flex flex-col justify-between min-h-[280px] relative overflow-hidden group"
    >
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      
      <div className="relative z-10">
        <p className="text-xl md:text-2xl font-serif leading-relaxed text-[#1d1d1f] italic">
          "{message}"
        </p>
      </div>
      
      <div className="mt-8 relative z-10 flex flex-col items-start">
        <div className="w-12 h-[2px] bg-[#c5a059] mb-4 group-hover:w-20 transition-all duration-700 ease-out" />
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#6e6e73]">
          {sender}
        </p>
      </div>

      {/* Decorative festive corner */}
      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#c5a05908] rounded-full blur-2xl group-hover:bg-[#c5a05915] transition-all duration-700" />
    </motion.div>

  );
}
