"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { PlusCircle, Upload, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["Electronics", "Books", "Fashion", "Home", "Games", "Sports", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

export default function NewItem() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [condition, setCondition] = useState("Good");
  const [preferredTrade, setPreferredTrade] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    setLoading(true);
    setError(null);

    try {
      let imageUrl = null;

      // 1. Upload image to Supabase Storage if selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error("Failed to upload image: " + uploadError.message);
        }

        // Get public URL
        const { data } = supabase.storage.from("item-images").getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      // 2. Insert item into database
      const { error: insertError } = await supabase.from("items").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        image_url: imageUrl,
        preferred_trade: preferredTrade.trim() || null,
        status: "Available",
      });

      if (insertError) throw insertError;

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error creating item:", err);
      setError(err.message || "Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-zinc-950 flex-col items-center justify-center text-zinc-500 gap-2">
        <RefreshCw className="h-6 w-6 animate-spin text-violet-500" />
        <span className="text-xs">Authenticating session...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <main className="flex-1 mx-auto max-w-2xl px-4 py-8 sm:px-6 w-full z-10">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Marketplace
        </Link>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PlusCircle className="h-5.5 w-5.5 text-violet-400" />
            <span>List an Item for Swap</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Fill in the details below to upload a item and put it in the SwapSphere marketplace.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Item Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mechanical Keyboard, Introduction to Algorithms Book"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Category & Condition Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item's features, usability, and any potential wear and tear."
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* Preferred Trade */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              What do you want in exchange? (Preferred Trade)
            </label>
            <input
              type="text"
              value={preferredTrade}
              onChange={(e) => setPreferredTrade(e.target.value)}
              placeholder="e.g. Noise cancelling headphones, USB-C monitor, open to any books"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Item Image
            </label>

            {imagePreview ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 max-w-md">
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 rounded-lg bg-zinc-950/80 px-2 py-1 text-[10px] font-semibold text-red-400 border border-red-500/20 backdrop-blur-sm hover:bg-zinc-900"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 bg-zinc-950/40 rounded-xl p-8 hover:border-zinc-700 cursor-pointer transition-colors max-w-md">
                <Upload className="h-8 w-8 text-zinc-500 mb-2 stroke-[1.5]" />
                <span className="text-xs text-zinc-300 font-semibold">Upload item photo</span>
                <span className="text-[10px] text-zinc-500 mt-1">PNG, JPG, JPEG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-violet-950/30 hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            <span>{loading ? "Publishing Listing..." : "Publish Listing"}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
