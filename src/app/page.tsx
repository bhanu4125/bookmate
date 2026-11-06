"use client";

import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
      <div className="absolute inset-0 ambient-glow pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center z-10 max-w-2xl"
      >
        <span className="text-xs uppercase tracking-widest text-gold font-semibold mb-3 inline-block">
          The Social Network for Book Lovers
        </span>
        <h1 className="font-serif text-6xl md:text-7xl font-bold text-parchment-100 tracking-tight mb-6">
          Bookmate
        </h1>
        <p className="text-parchment-muted text-lg mb-8 leading-relaxed font-sans">
          Track books you read. Save those you want to read. Tell your friends what’s good.
        </p>
      </motion.div>
    </main>
  );
}

