"use client";

import Link from "next/link";
import { Tag, RefreshCw } from "lucide-react";

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
        return "bg-emerald-50 text-emerald-700 border-emerald-250";
      case "like new":
        return "bg-teal-50 text-teal-700 border-teal-250";
      case "good":
        return "bg-sky-50 text-sky-700 border-sky-250";
      case "fair":
        return "bg-amber-50 text-amber-700 border-amber-250";
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-250";
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
      {/* Listing Status Badge */}
      {item.status !== "Available" && (
        <span className="absolute top-3 left-3 z-10 rounded-md bg-white/95 px-2.5 py-0.5 text-[9px] font-bold text-amber-800 border border-amber-200 shadow-xs uppercase tracking-wider">
          {item.status}
        </span>
      )}

      {/* Image container */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-50 border-b border-zinc-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-103"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-zinc-400">
            <Tag className="h-8 w-8 stroke-[1.2]" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] uppercase tracking-widest text-zinc-450 font-bold">
            {item.category}
          </span>
          <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getConditionColor(item.condition)}`}>
            {item.condition}
          </span>
        </div>

        <h3 className="text-sm font-bold text-zinc-900 line-clamp-1 group-hover:underline transition-all">
          <Link href={`/items/${item.id}`}>
            <span className="absolute inset-0" />
            {item.title}
          </Link>
        </h3>

        <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Preferred Exchange Info */}
        <div className="mt-auto pt-4 border-t border-zinc-100 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <RefreshCw className="h-3.5 w-3.5 text-zinc-450 flex-shrink-0" />
            <span className="font-semibold text-zinc-450 text-[11px]">Swap:</span>
            <span className="line-clamp-1 text-zinc-800 font-semibold">{item.preferred_trade || "Open to offers"}</span>
          </div>

          {/* User metadata */}
          <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-100/60">
            <div className="flex items-center gap-1.5">
              {item.profiles?.avatar_url ? (
                <img
                  src={item.profiles.avatar_url}
                  alt={item.profiles.username}
                  className="h-4.5 w-4.5 rounded-full object-cover"
                />
              ) : (
                <div className="h-4.5 w-4.5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[7px] font-bold text-zinc-500">
                  U
                </div>
              )}
              <span className="text-[10px] text-zinc-400 font-medium">
                @{item.profiles?.username || "user"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
