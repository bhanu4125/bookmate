import Link from "next/link";
import { BookOpen, Heart, Github, Twitter, Disc } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-background-subtle py-14 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 ambient-glow opacity-30 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-gold/10 text-gold border border-gold/25">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight text-parchment-100">
                Bookmate
              </span>
            </Link>
            <p className="text-xs text-parchment-muted leading-relaxed font-sans">
              The social network for book lovers. Track what you read, log half-star ratings, write rich reviews, and discover next reads through friends.
            </p>
            <p className="text-[11px] text-parchment-muted/60 italic font-serif">
              “A reader lives a thousand lives before he dies.”
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-parchment-300 mb-4 font-sans">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-parchment-muted">
              <li>
                <Link href="/explore" className="hover:text-gold transition-colors">
                  Trending Books
                </Link>
              </li>
              <li>
                <Link href="/explore?genre=Fiction" className="hover:text-gold transition-colors">
                  High-Concept Fiction
                </Link>
              </li>
              <li>
                <Link href="/explore?genre=Sci-Fi" className="hover:text-gold transition-colors">
                  Sci-Fi & Cyberpunk
                </Link>
              </li>
              <li>
                <Link href="/explore?genre=Classics" className="hover:text-gold transition-colors">
                  Timeless Classics
                </Link>
              </li>
              <li>
                <Link href="/lists" className="hover:text-gold transition-colors">
                  Curated Shelves
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-parchment-300 mb-4 font-sans">
              Community
            </h4>
            <ul className="space-y-2.5 text-xs text-parchment-muted">
              <li>
                <Link href="/activity" className="hover:text-gold transition-colors">
                  Friends Activity Feed
                </Link>
              </li>
              <li>
                <Link href="/diary" className="hover:text-gold transition-colors">
                  The Reading Diary
                </Link>
              </li>
              <li>
                <Link href="/profile/claire_reads" className="hover:text-gold transition-colors">
                  Member Profiles
                </Link>
              </li>
              <li>
                <Link href="/lists" className="hover:text-gold transition-colors">
                  User Lists
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Ethos */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-parchment-300 mb-4 font-sans">
              Editorial Ethos
            </h4>
            <p className="text-xs text-parchment-muted leading-relaxed">
              Crafted with an uncompromising focus on tactile typography, fast optimistic UI, and community-first reading logs.
            </p>
            <div className="mt-4 flex items-center gap-3 text-parchment-muted">
              <span className="p-2 rounded-lg bg-white/5 hover:text-parchment-100 cursor-pointer">
                <Twitter className="w-3.5 h-3.5" />
              </span>
              <span className="p-2 rounded-lg bg-white/5 hover:text-parchment-100 cursor-pointer">
                <Github className="w-3.5 h-3.5" />
              </span>
              <span className="p-2 rounded-lg bg-white/5 hover:text-parchment-100 cursor-pointer">
                <Disc className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-parchment-muted gap-4">
          <p>© {new Date().getFullYear()} Bookmate. Made for thoughtful readers worldwide.</p>
          <p className="flex items-center gap-1.5">
            Designed with <Heart className="w-3 h-3 text-gold fill-gold" /> for the love of print & story
          </p>
        </div>
      </div>
    </footer>
  );
}

