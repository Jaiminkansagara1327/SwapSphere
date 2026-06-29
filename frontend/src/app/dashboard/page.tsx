"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ItemCard, { Item } from "@/components/ItemCard";
import { RefreshCw, Search, Tag, AlertCircle } from "lucide-react";

const CATEGORIES = [
  "All",
  "Electronics",
  "Books",
  "Fashion",
  "Home",
  "Games",
  "Sports",
  "Other"
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error, setError] = useState<string | null>(null);

  // Authentication Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Fetch Marketplace Items
  const fetchMarketplaceItems = async () => {
    setLoading(true);
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Supabase credentials are missing. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your env variables.");
      setLoading(false);
      return;
    }
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
            username,
            avatar_url
          )
        `)
        .eq("status", "Available")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems((data as any) || []);
      setFilteredItems((data as any) || []);
    } catch (err: any) {
      console.error("Error loading marketplace items:", err);
      setError("Failed to fetch listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMarketplaceItems();
    }
  }, [user]);

  // Client-side filtering and search logic
  useEffect(() => {
    let result = items;

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter(
        (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          (item.preferred_trade && item.preferred_trade.toLowerCase().includes(query))
      );
    }

    setFilteredItems(result);
  }, [searchQuery, selectedCategory, items]);

  if (authLoading || (!user && authLoading)) {
    return (
      <div className="flex min-h-screen bg-zinc-50 flex-col items-center justify-center text-zinc-500 gap-2">
        <RefreshCw className="h-5 w-5 animate-spin text-zinc-900" />
        <span className="text-xs">Authenticating session...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full z-10">
        {/* Marketplace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Marketplace
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Browse items available for exchange or post your own listing to swap.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items or categories..."
              className="w-full rounded-lg bg-white border border-zinc-200 pl-10 pr-4 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-none border-b border-zinc-250 mb-8">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold border whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === category
                  ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                  : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-650">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Listings Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
            <RefreshCw className="h-6 w-6 animate-spin text-zinc-800" />
            <span className="text-xs">Fetching active listings...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-2xl bg-white/50 shadow-xs">
            <Tag className="h-10 w-10 text-zinc-450 stroke-[1.5] mb-3" />
            <p className="text-sm font-semibold text-zinc-700">No items found</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-normal">
              Try adjusting your search query, selecting another category, or list a item of your own!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
