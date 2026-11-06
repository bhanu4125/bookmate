"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Sparkles, ArrowRight, Lock, User, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await login(identifier, password);
    setIsLoading(false);

    if (res.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(res.error || "Failed to log in.");
    }
  };

  const handleDemoLogin = async (demoUser: string, demoPass: string) => {
    setIdentifier(demoUser);
    setPassword(demoPass);
    setIsLoading(true);
    setError("");
    const res = await login(demoUser, demoPass);
    setIsLoading(false);
    if (res.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(res.error || "Demo login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute inset-0 ambient-glow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-panel p-8 md:p-10 rounded-2xl shadow-2xl relative z-10 border border-white/10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <span className="p-2.5 rounded-xl bg-gold/10 text-gold border border-gold/30 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </span>
            <span className="font-serif text-3xl font-bold tracking-tight text-parchment-100">
              Bookmate
            </span>
          </Link>
          <h2 className="text-xl font-medium text-parchment-200 mt-2">
            Welcome back, fellow reader
          </h2>
          <p className="text-xs text-parchment-muted mt-1">
            Log in to your reading diary and connect with friends
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-2">
              Username or Email
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="reader@bookmate.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background-elevated border border-background-border text-sm text-parchment-100 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-parchment-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background-elevated border border-background-border text-sm text-parchment-100 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-gold hover:bg-gold-dark text-slate-950 font-bold text-sm tracking-wide transition-all shadow-glow hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? "Signing in..." : "Sign In to Bookmate"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-parchment-muted uppercase tracking-wider mb-3 text-center">
            Or try a quick demo account
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin("claire_reads", "demo1234")}
              className="px-3 py-2.5 rounded-lg bg-background-elevated hover:bg-background-border border border-white/5 text-xs text-parchment-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Claire (Top Critic)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("julian_m", "demo1234")}
              className="px-3 py-2.5 rounded-lg bg-background-elevated hover:bg-background-border border border-white/5 text-xs text-parchment-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-emerald" />
              Julian (Sci-Fi Buff)
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-parchment-muted mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-gold font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
