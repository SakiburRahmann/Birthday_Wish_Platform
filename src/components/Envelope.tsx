"use client";

import { motion } from "framer-motion";
import { MailOpen } from "lucide-react";

interface EnvelopeProps {
  onOpen: () => void;
  recipientName: string;
}

export default function Envelope({ onOpen, recipientName }: EnvelopeProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] cursor-pointer group"
      onClick={onOpen}
    >
      <motion.div
        whileHover={{ y: -5 }}
        className="relative w-80 h-56 bg-white border border-[#00000008] shadow-luxe rounded-xl flex flex-col items-center justify-center gap-4 overflow-hidden"
      >
        {/* Decorative Seal */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#c5a059]" />
        
        <div className="w-16 h-16 rounded-full bg-[#fdfdfd] border border-[#c5a05920] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <MailOpen size={32} className="text-[#c5a059]" />
        </div>
        
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-[#6e6e73] mb-1">To someone special</p>
          <h2 className="text-2xl font-serif text-[#1d1d1f]">{recipientName}</h2>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
      </motion.div>
      
      <p className="mt-8 text-sm text-[#6e6e73] animate-pulse">Click to unbox the love</p>
    </motion.div>
  );
}
