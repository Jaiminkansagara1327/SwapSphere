"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ChatWindow from "@/components/ChatWindow";
import { RefreshCw, ArrowRightLeft, AlertCircle, ArrowLeft, Check, X, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface ItemDetails {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  category: string;
  condition: string;
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
  sender_item: ItemDetails;
  receiver_item: ItemDetails;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SwapNegotiation({ params }: PageProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { id } = use(params);

  const [swap, setSwap] = useState<SwapRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const fetchSwapDetails = async () => {
    if (!user || !id) return;
    setLoading(true);
    setError(null);

    try {
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
            id,
            username,
            avatar_url
          ),
          receiver_profile: profiles!swap_requests_receiver_id_fkey (
            id,
            username,
            avatar_url
          ),
          sender_item: items!swap_requests_sender_item_id_fkey (
            id,
            title,
            description,
            image_url,
            category,
            condition
          ),
          receiver_item: items!swap_requests_receiver_item_id_fkey (
            id,
            title,
            description,
            image_url,
            category,
            condition
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setSwap(data as any);
    } catch (err: any) {
      console.error("Error loading swap negotiation:", err);
      setError("Failed to fetch negotiation details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      fetchSwapDetails();
    }
  }, [user, id]);

  const handleUpdateStatus = async (newStatus: "Accepted" | "Rejected" | "Cancelled" | "Completed") => {
    if (!swap || !user || actionLoading) return;
    setActionLoading(true);
    setError(null);

    try {
      // 1. Update the Swap Request status
      const { error: updateError } = await supabase
        .from("swap_requests")
        .update({ status: newStatus })
        .eq("id", swap.id);

      if (updateError) throw updateError;

      // 2. Synchronize item statuses based on state transitions
      if (newStatus === "Rejected" || newStatus === "Cancelled") {
        // Revert both items back to "Available"
        await supabase.from("items").update({ status: "Available" }).eq("id", swap.sender_item_id);
        await supabase.from("items").update({ status: "Available" }).eq("id", swap.receiver_item_id);
      } else if (newStatus === "Completed") {
        // Lock both items as "Swapped" (no longer listed on marketplace)
        await supabase.from("items").update({ status: "Swapped" }).eq("id", swap.sender_item_id);
        await supabase.from("items").update({ status: "Swapped" }).eq("id", swap.receiver_item_id);
      }

      // Refresh page data
      await fetchSwapDetails();
    } catch (err: any) {
      console.error("Error updating swap status:", err);
      setError("Failed to update status: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-zinc-950 flex-col items-center justify-center text-zinc-500 gap-2">
        <RefreshCw className="h-6 w-6 animate-spin text-violet-500" />
        <span className="text-xs">Loading negotiation room...</span>
      </div>
    );
  }

  if (!user) return null;

  if (error || !swap) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <p className="text-sm font-semibold text-zinc-300">{error || "Negotiation details not found"}</p>
          <Link href="/swaps" className="mt-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-semibold">
            Back to My Swaps
          </Link>
        </main>
      </div>
    );
  }

  const isIncoming = swap.receiver_id === user.id;
  const partnerProfile = isIncoming ? swap.sender_profile : swap.receiver_profile;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "completed":
        return "bg-violet-550/10 text-violet-400 border-violet-550/20";
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "cancelled":
        return "bg-zinc-550/10 text-zinc-400 border-zinc-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 w-full z-10">
        {/* Back link */}
        <Link
          href="/swaps"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Swaps
        </Link>

        {/* Header summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <span>Negotiation Room with @{partnerProfile.username}</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Discuss meetup locations, exchange logistics, and coordinate terms in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-450 font-medium">Proposal Status:</span>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusBadge(swap.status)}`}>
              {swap.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Split Grid (Items side-by-side / Chat) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Side-by-Side Items Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-900/10 border border-zinc-800 p-6 rounded-2xl backdrop-blur">
              {/* Sender offered item */}
              <div className="flex flex-col border border-zinc-850 p-4 rounded-xl bg-zinc-950/20">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3">
                  {isIncoming ? "@" + swap.sender_profile.username + " Offers" : "My Offered Item"}
                </p>
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800">
                  {swap.sender_item?.image_url ? (
                    <img src={swap.sender_item.image_url} alt={swap.sender_item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-700">No Image</div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mt-4 line-clamp-1">{swap.sender_item?.title}</h3>
                <div className="flex items-center gap-2 mt-1 mb-3">
                  <span className="text-[10px] uppercase text-violet-400 font-semibold">{swap.sender_item?.category}</span>
                  <span className="h-1 w-1 bg-zinc-800 rounded-full" />
                  <span className="text-[10px] text-zinc-500 font-semibold">{swap.sender_item?.condition}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-normal line-clamp-3">{swap.sender_item?.description}</p>
              </div>

              {/* Receiver requested item */}
              <div className="flex flex-col border border-zinc-850 p-4 rounded-xl bg-zinc-950/20">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3">
                  {isIncoming ? "My Listing requested" : "Requested from @" + swap.receiver_profile.username}
                </p>
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800">
                  {swap.receiver_item?.image_url ? (
                    <img src={swap.receiver_item.image_url} alt={swap.receiver_item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-700">No Image</div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mt-4 line-clamp-1">{swap.receiver_item?.title}</h3>
                <div className="flex items-center gap-2 mt-1 mb-3">
                  <span className="text-[10px] uppercase text-violet-400 font-semibold">{swap.receiver_item?.category}</span>
                  <span className="h-1 w-1 bg-zinc-800 rounded-full" />
                  <span className="text-[10px] text-zinc-500 font-semibold">{swap.receiver_item?.condition}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-normal line-clamp-3">{swap.receiver_item?.description}</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-zinc-900/10 border border-zinc-800 p-6 rounded-2xl backdrop-blur">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Check className="h-4 w-4 text-violet-500" />
                <span>Trade Agreements Console</span>
              </h3>

              {actionLoading ? (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <RefreshCw className="h-4 w-4 animate-spin text-violet-500" />
                  <span>Syncing request state...</span>
                </div>
              ) : swap.status === "Pending" ? (
                isIncoming ? (
                  <div className="space-y-4">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      You received this proposal. Discuss details in the chat and decide whether to accept or decline the trade swap.
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateStatus("Accepted")}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-650 text-emerald-100 hover:bg-emerald-550 py-3 text-xs font-bold shadow transition-all border border-emerald-500/20"
                      >
                        <Check className="h-4 w-4" />
                        <span>Accept Proposal</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus("Rejected")}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-650/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white py-3 text-xs font-bold shadow transition-all"
                      >
                        <X className="h-4 w-4" />
                        <span>Decline Proposal</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      You proposed this swap. Discuss the trade with the seller. You can retract this request at any time.
                    </p>
                    <button
                      onClick={() => handleUpdateStatus("Cancelled")}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 text-zinc-350 hover:bg-zinc-700 hover:text-zinc-200 py-3 text-xs font-bold transition-all border border-zinc-750"
                    >
                      <X className="h-4 w-4" />
                      <span>Retract Proposal</span>
                    </button>
                  </div>
                )
              ) : swap.status === "Accepted" ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-450 leading-relaxed">
                    <Check className="h-5 w-5 flex-shrink-0" />
                    <span>
                      This swap has been accepted by both parties! Chat to arrange a safe physical hand-off. Once you have exchanged items, mark the trade as Completed.
                    </span>
                  </div>
                  <button
                    onClick={() => handleUpdateStatus("Completed")}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-650 to-indigo-650 text-white hover:from-violet-550 hover:to-indigo-550 py-3.5 text-xs font-bold shadow-lg shadow-violet-950/20 transition-all"
                  >
                    <span>Complete Exchange & Trade</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-xs text-zinc-500 leading-relaxed">
                  <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                  <span>
                    This negotiation is inactive. The proposal was {swap.status.toLowerCase()}. Item listings associated with rejected or cancelled trades are back on the marketplace.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Chat Section */}
          <div className="lg:col-span-1">
            <ChatWindow swapRequestId={swap.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
