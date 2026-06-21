"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import { X, RefreshCw, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";

interface Item {
  id: string;
  title: string;
  category: string;
  condition: string;
  image_url: string | null;
  status: string;
}

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverItemId: string;
  receiverItemTitle: string;
  onSuccess: (swapRequestId: string) => void;
}

export default function SwapModal({
  isOpen,
  onClose,
  receiverId,
  receiverItemId,
  receiverItemTitle,
  onSuccess,
}: SwapModalProps) {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchMyItems();
    }
  }, [isOpen, user]);

  const fetchMyItems = async () => {
    if (!user) return;
    setFetchingItems(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "Available");

      if (error) throw error;
      setMyItems(data || []);
      if (data && data.length > 0) {
        setSelectedItemId(data[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching items:", err);
      setError("Failed to load your items.");
    } finally {
      setFetchingItems(false);
    }
  };

  const handleProposeSwap = async () => {
    if (!user || !selectedItemId) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Create the swap request
      const { data, error } = await supabase
        .from("swap_requests")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          sender_item_id: selectedItemId,
          receiver_item_id: receiverItemId,
          status: "Pending",
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Set the status of BOTH items to "Pending" to prevent other trade requests or modifications
      // Wait, we don't strictly have to set item status to Pending unless we want to lock them. Let's do it to keep database consistency.
      await supabase.from("items").update({ status: "Pending" }).eq("id", selectedItemId);
      await supabase.from("items").update({ status: "Pending" }).eq("id", receiverItemId);

      onSuccess(data.id);
    } catch (err: any) {
      console.error("Error creating swap:", err);
      setError(err.message || "Failed to propose swap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal box */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="h-5 w-5 text-violet-500 animate-spin-slow" />
          <h2 className="text-lg font-bold text-zinc-100">Propose a Swap</h2>
        </div>

        <p className="text-xs text-zinc-400 mb-6">
          You are requesting to swap your item for <strong className="text-zinc-200">"{receiverItemTitle}"</strong>. Select which of your items you would like to offer.
        </p>

        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {fetchingItems ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <RefreshCw className="h-6 w-6 text-zinc-500 animate-spin" />
            <span className="text-xs text-zinc-500">Loading your listings...</span>
          </div>
        ) : myItems.length === 0 ? (
          <div className="flex flex-col items-center text-center py-6 border border-dashed border-zinc-800 rounded-xl mb-6">
            <p className="text-sm text-zinc-400 mb-3">You don't have any items available to trade.</p>
            <Link
              href="/items/new"
              onClick={onClose}
              className="flex items-center gap-1 text-xs font-semibold bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              List an Item First
            </Link>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Choose an item to offer:
            </label>
            <div className="max-h-60 overflow-y-auto pr-1 space-y-2.5">
              {myItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedItemId === item.id
                      ? "border-violet-500 bg-violet-600/10 shadow-md shadow-violet-950/20"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  <div className="h-12 w-12 rounded-lg bg-zinc-950 overflow-hidden flex-shrink-0 border border-zinc-800">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-600">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] uppercase tracking-wider text-violet-400 font-medium">
                        {item.category}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-zinc-700" />
                      <span className="text-[9px] text-zinc-500 font-medium">
                        {item.condition}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-800 py-3 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProposeSwap}
            disabled={loading || myItems.length === 0}
            className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Submit Proposal"}
          </button>
        </div>
      </div>
    </div>
  );
}
