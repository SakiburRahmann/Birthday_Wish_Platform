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
      className="p-8 rounded-2xl bg-white border border-[#00000005] shadow-soft flex flex-col justify-between min-h-[250px] relative overflow-hidden group"
    >
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      
      <p className="text-xl font-serif leading-relaxed text-[#1d1d1f] relative z-10 italic">
        "{message}"
      </p>
      
      <div className="mt-8 relative z-10">
        <div className="w-8 h-[1px] bg-[#c5a059] mb-4 group-hover:w-16 transition-all duration-500" />
        <p className="text-sm font-medium tracking-wider uppercase text-[#6e6e73]">
          — {sender}
        </p>
      </div>

      {/* Subtle corner accent */}
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-[#c5a05908] to-transparent" />
    </motion.div>
  );
}
