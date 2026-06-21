"use client";

import Link from "next/link";
import { Tag, MapPin, RefreshCw } from "lucide-react";

export interface Item {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  image_url: string | null;
  preferred_trade: string | null;
  status: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  // Determine condition color badge classes
  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "new":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "like new":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "good":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "fair":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700/80 hover:shadow-lg hover:shadow-violet-950/10">
      {/* Listing Status Badge */}
      {item.status !== "Available" && (
        <span className="absolute top-3 left-3 z-10 rounded-full bg-zinc-950/80 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20 backdrop-blur-sm">
          {item.status}
        </span>
      )}

      {/* Image container */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
            <Tag className="h-10 w-10 stroke-[1.5]" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-violet-400 font-semibold">
            {item.category}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getConditionColor(item.condition)}`}>
            {item.condition}
          </span>
        </div>

        <h3 className="text-base font-semibold text-zinc-100 line-clamp-1 group-hover:text-violet-400 transition-colors">
          <Link href={`/items/${item.id}`}>
            <span className="absolute inset-0" />
            {item.title}
          </Link>
        </h3>

        <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2">
          {item.description}
        </p>

        {/* Preferred Exchange Info */}
        <div className="mt-auto pt-4 border-t border-zinc-800/80 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
            <RefreshCw className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
            <span className="font-medium text-zinc-400">Looking for:</span>
            <span className="line-clamp-1 text-zinc-200">{item.preferred_trade || "Open to offers"}</span>
          </div>

          {/* User metadata */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/40">
            <div className="flex items-center gap-1.5">
              {item.profiles?.avatar_url ? (
                <img
                  src={item.profiles.avatar_url}
                  alt={item.profiles.username}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <div className="h-5 w-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[8px] font-bold text-zinc-400">
                  U
                </div>
              )}
              <span className="text-[11px] text-zinc-400 font-medium">
                @{item.profiles?.username || "user"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
