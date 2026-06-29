"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import SwapModal from "@/components/SwapModal";
import { Tag, RefreshCw, AlertCircle, Trash2, ArrowLeft, Calendar, User as UserIcon } from "lucide-react";
import Link from "next/link";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface Item {
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
  profiles?: Profile;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ItemDetail({ params }: PageProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { id } = use(params);

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const fetchItemDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("items")
        .select(`
          id,
          user_id,
          title,
          description,
          category,
          condition,
          image_url,
          preferred_trade,
          status,
          created_at,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setItem(data as any);
    } catch (err: any) {
      console.error("Error loading item details:", err);
      setError("Failed to load item details. It might have been deleted.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      fetchItemDetails();
    }
  }, [user, id]);

  const handleDeleteItem = async () => {
    if (!item || !user || deleting) return;
    if (!confirm("Are you sure you want to delete this listing?")) return;

    setDeleting(true);
    setError(null);

    try {
      const { error } = await supabase.from("items").delete().eq("id", item.id);
      if (error) throw error;

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error deleting item:", err);
      setError("Failed to delete item listing: " + err.message);
      setDeleting(false);
    }
  };

  const handleSwapSuccess = (swapRequestId: string) => {
    setIsSwapModalOpen(false);
    router.push(`/swaps/${swapRequestId}`);
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "new":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "like new":
        return "bg-teal-50 text-teal-800 border-teal-200";
      case "good":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "fair":
        return "bg-amber-50 text-amber-850 border-amber-200";
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-200";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-zinc-50 flex-col items-center justify-center text-zinc-500 gap-2">
        <RefreshCw className="h-5 w-5 animate-spin text-zinc-900" />
        <span className="text-xs">Loading item details...</span>
      </div>
    );
  }

  if (!user) return null;

  if (error || !item) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <AlertCircle className="h-10 w-10 text-red-600 mb-3" />
          <p className="text-sm font-semibold text-zinc-700">{error || "Item not found"}</p>
          <Link href="/dashboard" className="mt-4 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-800 shadow-xs">
            Back to Marketplace
          </Link>
        </main>
      </div>
    );
  }

  const isOwner = item.user_id === user.id;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 w-full z-10">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Marketplace
        </Link>

        {/* Content Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-zinc-200/80 p-6 sm:p-8 rounded-xl shadow-xs">
          {/* Image Block */}
          <div className="flex flex-col">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-50 border border-zinc-150 animate-fade-in">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-zinc-400">
                  <Tag className="h-12 w-12 stroke-[1.2]" />
                </div>
              )}
            </div>

            {/* Owner Section */}
            <div className="mt-6 flex items-center gap-3 bg-zinc-50 border border-zinc-200/85 p-4 rounded-lg">
              {item.profiles?.avatar_url ? (
                <img src={item.profiles.avatar_url} alt={item.profiles.username} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}
              <div>
                <p className="text-[9px] text-zinc-450 font-bold uppercase tracking-wider">Posted By</p>
                <p className="text-xs font-bold text-zinc-800">@{item.profiles?.username || "user"}</p>
              </div>
            </div>
          </div>

          {/* Details Block */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Badge line */}
              <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                  {item.category}
                </span>
                <span className="h-1 w-1 rounded-full bg-zinc-200" />
                <span className={`rounded-md border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getConditionColor(item.condition)}`}>
                  {item.condition}
                </span>
                {item.status !== "Available" && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-zinc-200" />
                    <span className="rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                      {item.status}
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl font-bold text-zinc-900 mb-4">{item.title}</h1>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span>Listed on {new Date(item.created_at).toLocaleDateString()}</span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Description</h3>
                <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">{item.description}</p>
              </div>

              {/* Preferred Trade */}
              <div className="mb-8 p-4 rounded-lg bg-zinc-50 border border-zinc-200/80">
                <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-zinc-450" />
                  <span>Looking for in exchange:</span>
                </h3>
                <p className="text-xs text-zinc-800 font-bold">
                  {item.preferred_trade || "Open to any trade proposals!"}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-zinc-100">
              {isOwner ? (
                <button
                  onClick={handleDeleteItem}
                  disabled={deleting}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-50 border border-red-200 py-3.5 text-xs font-bold text-red-650 shadow-xs hover:bg-red-100/60 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{deleting ? "Deleting listing..." : "Delete Listing"}</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsSwapModalOpen(true)}
                  disabled={item.status !== "Available"}
                  className="w-full rounded-lg bg-zinc-900 py-3.5 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {item.status === "Available" ? "Propose a Swap" : "Listing is Pending / Traded"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Swap Modal */}
      {item && (
        <SwapModal
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          receiverId={item.user_id}
          receiverItemId={item.id}
          receiverItemTitle={item.title}
          onSuccess={handleSwapSuccess}
        />
      )}
    </div>
  );
}
