"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ItemCard, { Item } from "@/components/ItemCard";
import { RefreshCw, Search, Tag, AlertCircle, LayoutGrid, User as UserIcon } from "lucide-react";

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

  const [activeTab, setActiveTab] = useState<"marketplace" | "my-listings">("marketplace");
  const [items, setItems] = useState<Item[]>([]);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [myItemsLoading, setMyItemsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error, setError] = useState<string | null>(null);

  // Authentication Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Fetch All Marketplace Items
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
          is_coupon,
          coupon_expiry,
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

  // Fetch My Listings (ALL statuses including Pending, Swapped)
  const fetchMyItems = async () => {
    if (!user) return;
    setMyItemsLoading(true);
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
          is_coupon,
          coupon_expiry,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyItems((data as any) || []);
    } catch (err: any) {
      console.error("Error loading my items:", err);
    } finally {
      setMyItemsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMarketplaceItems();
      fetchMyItems();
    }
  }, [user]);

  // Client-side filtering and search logic (marketplace tab)
  useEffect(() => {
    let result = items;

    if (selectedCategory !== "All") {
      result = result.filter(
        (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

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

  const currentList = activeTab === "marketplace" ? filteredItems : myItems;
  const currentLoading = activeTab === "marketplace" ? loading : myItemsLoading;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              {activeTab === "marketplace" ? "Marketplace" : "My Listings"}
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              {activeTab === "marketplace"
                ? "Browse items available for exchange or post your own listing to swap."
                : "All items and coupons you have listed, including pending and swapped ones."}
            </p>
          </div>

          {/* Search bar — only on marketplace tab */}
          {activeTab === "marketplace" && (
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
          )}
        </div>

        {/* Tabs: Marketplace | My Listings */}
        <div className="flex border-b border-zinc-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "marketplace"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Marketplace
          </button>
          <button
            onClick={() => {
              setActiveTab("my-listings");
              fetchMyItems();
            }}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 relative ${
              activeTab === "my-listings"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <UserIcon className="h-3.5 w-3.5" />
            My Listings
            {myItems.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-zinc-900 text-[9px] font-bold text-white leading-none">
                {myItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Category Filters — only on marketplace tab */}
        {activeTab === "marketplace" && (
          <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-none border-b border-zinc-200 mb-8">
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
        )}

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Listings Feed */}
        {currentLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
            <RefreshCw className="h-6 w-6 animate-spin text-zinc-800" />
            <span className="text-xs">Fetching listings...</span>
          </div>
        ) : currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-2xl bg-white/50 shadow-xs">
            <Tag className="h-10 w-10 text-zinc-400 stroke-[1.5] mb-3" />
            <p className="text-sm font-semibold text-zinc-700">
              {activeTab === "my-listings" ? "You haven't listed anything yet" : "No items found"}
            </p>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-normal">
              {activeTab === "my-listings"
                ? "Click \"+ List Item\" in the navbar to create your first listing."
                : "Try adjusting your search query, selecting another category, or list an item of your own!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentList.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
