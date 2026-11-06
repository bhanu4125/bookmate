"use client";

import { Check, Bookmark, BookOpen, Ban } from "lucide-react";
import { ReadingStatus } from "@/types";

interface ReadingStatusToggleProps {
  currentStatus: ReadingStatus | null;
  onChange: (newStatus: ReadingStatus) => void;
  disabled?: boolean;
}

export default function ReadingStatusToggle({
  currentStatus,
  onChange,
  disabled = false,
}: ReadingStatusToggleProps) {
  const options: {
    status: ReadingStatus;
    label: string;
    icon: any;
    activeColor: string;
  }[] = [
    {
      status: "read",
      label: "Read",
      icon: Check,
      activeColor: "bg-emerald text-white border-emerald shadow-glow-emerald",
    },
    {
      status: "currently-reading",
      label: "Reading",
      icon: BookOpen,
      activeColor: "bg-blue-600 text-white border-blue-500 shadow-md",
    },
    {
      status: "want-to-read",
      label: "Want to Read",
      icon: Bookmark,
      activeColor: "bg-gold text-slate-950 border-gold shadow-glow",
    },
    {
      status: "dnf",
      label: "DNF",
      icon: Ban,
      activeColor: "bg-red-500/80 text-white border-red-500",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = currentStatus === opt.status;

        return (
          <button
            key={opt.status}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.status)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all duration-200 disabled:opacity-50 ${
              isActive
                ? opt.activeColor
                : "bg-background-elevated hover:bg-background-border text-parchment-300 border-white/5 hover:border-white/10"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

