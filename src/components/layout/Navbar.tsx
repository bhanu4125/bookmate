"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Search,
  Plus,
  User as UserIcon,
  LogOut,
  Bookmark,
  Calendar,
  Layers,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

interface NavbarProps {
  onOpenSearch?: () => void;
  onOpenLogModal?: () => void;
}

export default function Navbar({ onOpenSearch, onOpenLogModal }: NavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Explore", href: "/explore" },
    { label: "Lists", href: "/lists" },
    { label: "Diary", href: "/diary", requiresAuth: true },
    { label: "Community", href: "/activity" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="p-2 rounded-xl bg-gold/10 text-gold border border-gold/25 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-parchment-100 leading-none">
                Bookmate
              </span>
              <span className="text-[9px] uppercase tracking-widest text-parchment-muted font-sans font-medium">
                Letterboxd for Books
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              if (link.requiresAuth && !user) return null;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all ${
                    isActive
                      ? "text-gold bg-gold/10 border border-gold/20"
                      : "text-parchment-300 hover:text-parchment-100 hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center / Search Bar trigger */}
        <div className="flex-1 max-w-xs hidden lg:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-background-card border border-white/10 hover:border-white/20 text-xs text-parchment-muted hover:text-parchment-200 transition-all shadow-inner group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-parchment-muted group-hover:text-gold transition-colors" />
              <span>Search titles, authors, genres...</span>
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-background-elevated border border-white/10 text-[10px] text-parchment-muted">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Quick search button for mobile */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="p-2 rounded-xl bg-background-card border border-white/10 text-parchment-300 hover:text-parchment-100 lg:hidden"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {user ? (
            <>
              {/* Log Book Button */}
              <button
                type="button"
                onClick={onOpenLogModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold hover:bg-gold-dark text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-glow hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Log</span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-white/15 hover:border-gold/50 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatarUrl || `https://avatar.vercel.sh/${user.username}.png`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>

                {userMenuOpen && (
                  <div
                    onClick={() => setUserMenuOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                )}

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl glass-panel p-2 shadow-2xl border border-white/15 z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-xs font-semibold text-parchment-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-parchment-muted truncate">
                        @{user.username}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href={`/profile/${user.username}`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-parchment-200 hover:bg-white/10 transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-gold" />
                        <span>Profile & Top 4</span>
                      </Link>
                      <Link
                        href="/diary"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-parchment-200 hover:bg-white/10 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-emerald" />
                        <span>Reading Diary</span>
                      </Link>
                      <Link
                        href="/lists"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-parchment-200 hover:bg-white/10 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>My Lists</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-semibold text-parchment-200 hover:text-white hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 rounded-xl bg-gold hover:bg-gold-dark text-slate-950 text-xs uppercase tracking-wider font-bold transition-all shadow-glow hover:shadow-lg"
              >
                Create Account
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-background-card border border-white/10 md:hidden text-parchment-muted hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-2 bg-background-subtle">
          {navLinks.map((link) => {
            if (link.requiresAuth && !user) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-parchment-200 hover:bg-white/5"
              >
                {link.label}
              </Link>
            );
          })}
          {user && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenLogModal) onOpenLogModal();
              }}
              className="w-full mt-2 py-2.5 rounded-xl bg-gold text-slate-950 font-bold text-xs uppercase tracking-wider"
            >
              + Log a Book
            </button>
          )}
        </div>
      )}
    </header>
  );
}

