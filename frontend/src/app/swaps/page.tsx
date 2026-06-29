"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { RefreshCw, MessageSquare, ArrowRightLeft, AlertCircle, Calendar } from "lucide-react";
import Link from "next/link";

interface Profile {
  username: string;
  avatar_url: string | null;
}

interface ItemSummary {
  id: string;
  title: string;
  image_url: string | null;
}

interface SwapRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_item_id: string;
  receiver_item_id: string;
  status: string;
  created_at: string;
  sender_profile: Profile;
  receiver_profile: Profile;
  sender_item: ItemSummary;
  receiver_item: ItemSummary;
}

export default function SwapsDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing" | "history">("incoming");
  const [error, setError] = useState<string | null>(null);

  // Authentication Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const fetchSwaps = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Supabase credentials are missing. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your env variables.");
      setLoading(false);
      return;
    }

    try {
      // Fetch swaps where user is sender or receiver
      // Since supabase doesn't support complex OR joins easily in JS client,
      // we can fetch all swap requests and join sender and receiver profiles and items.
      const { data, error } = await supabase
        .from("swap_requests")
        .select(`
          id,
          sender_id,
          receiver_id,
          sender_item_id,
          receiver_item_id,
          status,
          created_at,
          sender_profile: profiles!swap_requests_sender_id_fkey (
            username,
            avatar_url
          ),
          receiver_profile: profiles!swap_requests_receiver_id_fkey (
            username,
            avatar_url
          ),
          sender_item: items!swap_requests_sender_item_id_fkey (
            id,
            title,
            image_url
          ),
          receiver_item: items!swap_requests_receiver_item_id_fkey (
            id,
            title,
            image_url
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSwaps((data as any) || []);
    } catch (err: any) {
      console.error("Error loading swaps:", err);
      setError("Failed to fetch trade swaps: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSwaps();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-zinc-50 flex-col items-center justify-center text-zinc-550 gap-2">
        <RefreshCw className="h-6 w-6 animate-spin text-zinc-800" />
        <span className="text-xs">Authenticating session...</span>
      </div>
    );
  }

  if (!user) return null;

  // Filter swap requests based on selected tab
  const incomingSwaps = swaps.filter((s) => s.receiver_id === user.id && s.status === "Pending");
  const outgoingSwaps = swaps.filter((s) => s.sender_id === user.id && s.status === "Pending");
  const historySwaps = swaps.filter((s) => s.status !== "Pending");

  const getFilteredSwaps = () => {
    switch (activeTab) {
      case "incoming":
        return incomingSwaps;
      case "outgoing":
        return outgoingSwaps;
      case "history":
        return historySwaps;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "completed":
        return "bg-zinc-900 text-zinc-50 border-zinc-950";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "cancelled":
        return "bg-zinc-50 text-zinc-500 border-zinc-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const currentList = getFilteredSwaps();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-zinc-900">
            <ArrowRightLeft className="h-5.5 w-5.5 text-zinc-900" />
            <span>My Swap Requests</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Review and negotiate trade listings with other SwapSphere users.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === "incoming" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Incoming Swaps
            {incomingSwaps.length > 0 && (
              <span className="absolute -top-1.5 -right-3 px-1.5 py-0.5 rounded-full bg-zinc-900 text-[9px] font-bold text-white leading-none">
                {incomingSwaps.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("outgoing")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === "outgoing" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Outgoing Requests
            {outgoingSwaps.length > 0 && (
              <span className="absolute -top-1.5 -right-3 px-1.5 py-0.5 rounded-full bg-zinc-900 text-[9px] font-bold text-white leading-none">
                {outgoingSwaps.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "history" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Past Swaps ({historySwaps.length})
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-650">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Swap Requests list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-zinc-500">
            <RefreshCw className="h-6 w-6 animate-spin text-zinc-800" />
            <span className="text-xs">Loading requests...</span>
          </div>
        ) : currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-200 rounded-2xl bg-white/50">
            <ArrowRightLeft className="h-10 w-10 text-zinc-400 stroke-[1.5] mb-3" />
            <p className="text-sm font-semibold text-zinc-700">No swap requests</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-normal">
              {activeTab === "incoming"
                ? "You haven't received any trade requests yet."
                : activeTab === "outgoing"
                ? "You haven't proposed any trades yet. Visit the Marketplace to request a swap!"
                : "No past or completed swaps."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((swap) => {
              const partnerProfile = swap.sender_id === user.id ? swap.receiver_profile : swap.sender_profile;
              const isIncoming = swap.receiver_id === user.id;

              return (
                <div
                  key={swap.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm hover:border-zinc-300 transition-all"
                >
                  {/* Items Display */}
                  <div className="flex flex-1 items-center gap-4 min-w-0">
                    {/* Item 1 */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="h-14 w-14 rounded-lg overflow-hidden bg-zinc-50 border border-zinc-200">
                        {swap.sender_item?.image_url ? (
                          <img src={swap.sender_item.image_url} alt={swap.sender_item.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[9px] text-zinc-400">No Img</div>
                        )}
                      </div>
                      <span className="text-[9px] text-zinc-500 font-semibold truncate max-w-[60px]">
                        {isIncoming ? "Their Offer" : "My Offer"}
                      </span>
                    </div>

                    {/* Trade Icon */}
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full border border-zinc-200 bg-zinc-50">
                      <ArrowRightLeft className="h-3.5 w-3.5 text-zinc-950" />
                    </div>

                    {/* Item 2 */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="h-14 w-14 rounded-lg overflow-hidden bg-zinc-50 border border-zinc-200">
                        {swap.receiver_item?.image_url ? (
                          <img src={swap.receiver_item.image_url} alt={swap.receiver_item.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[9px] text-zinc-400">No Img</div>
                        )}
                      </div>
                      <span className="text-[9px] text-zinc-500 font-semibold truncate max-w-[60px]">
                        {isIncoming ? "My Item" : "Their Item"}
                      </span>
                    </div>

                    {/* Swap summary description */}
                    <div className="ml-2 min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-800 line-clamp-1">
                        @{partnerProfile.username}'s "{swap.sender_id === user.id ? swap.receiver_item?.title : swap.sender_item?.title}"
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getStatusColor(swap.status)}`}>
                          {swap.status}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-zinc-200" />
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(swap.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 flex-shrink-0">
                    <Link
                      href={`/swaps/${swap.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-zinc-900 text-white px-4 py-2.5 rounded-xl hover:bg-zinc-800 shadow-sm transition-all cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Negotiate & Chat</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
