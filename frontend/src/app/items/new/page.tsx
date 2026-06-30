"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { PlusCircle, Upload, AlertCircle, RefreshCw, ArrowLeft, Ticket, ToggleLeft, ToggleRight, Info } from "lucide-react";
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

  // Coupon-specific state (now mandatory)
  const [couponCode, setCouponCode] = useState("");
  const [couponExpiry, setCouponExpiry] = useState("");

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

  // Validate coupon expiry is in the future
  const isCouponValid = (): boolean => {
    if (!couponCode.trim()) {
      setError("Please enter the coupon code.");
      return false;
    }
    if (!couponExpiry) {
      setError("Please enter the coupon expiry date.");
      return false;
    }
    const expiry = new Date(couponExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiry <= today) {
      setError("Coupon expiry date must be in the future. Expired coupons cannot be listed.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    setError(null);
    if (!isCouponValid()) return;

    setLoading(true);

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
        // Coupon fields — now mandatory for all listings
        is_coupon: true,
        coupon_code: couponCode.trim().toUpperCase(),
        coupon_expiry: couponExpiry,
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
      <div className="flex min-h-screen bg-zinc-50 flex-col items-center justify-center text-zinc-500 gap-2">
        <RefreshCw className="h-6 w-6 animate-spin text-zinc-850" />
        <span className="text-xs">Authenticating session...</span>
      </div>
    );
  }

  if (!user) return null;

  // Compute min date for expiry picker (tomorrow)
  const minExpiry = new Date();
  minExpiry.setDate(minExpiry.getDate() + 1);
  const minExpiryStr = minExpiry.toISOString().split("T")[0];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-2xl px-4 py-8 sm:px-6 w-full z-10">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Marketplace
        </Link>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-zinc-900">
            <PlusCircle className="h-5.5 w-5.5 text-zinc-900" />
            <span>List a Coupon for Swap</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Fill in the details below to upload a coupon and put it in the SwapSphere marketplace.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">

          <div className="space-y-4 border border-emerald-200 bg-emerald-50/50 rounded-xl p-4">
            <div className="flex items-start gap-2 text-[10px] text-emerald-700 font-medium">
              <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>
                Your coupon code is stored securely and will only be shared with the other party through the
                escrow system once both sides have accepted and deposited their codes.
              </span>
            </div>

            {/* Coupon Code */}
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. SAVE50, FLAT200OFF, SUMMER25"
                className="w-full rounded-xl bg-white border border-zinc-200 px-4 py-3 text-xs font-mono text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 uppercase"
                style={{ textTransform: "uppercase" }}
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={couponExpiry}
                min={minExpiryStr}
                onChange={(e) => setCouponExpiry(e.target.value)}
                className="w-full rounded-xl bg-white border border-zinc-200 px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-zinc-400 mt-1">Only future-dated coupons can be listed. Expired coupons will be rejected.</p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Coupon / Deal Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flat 50% Off Powerbank, BookMyShow ₹200 Off"
              className="w-full rounded-xl bg-white border border-zinc-200 px-4 py-3 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </div>

          {/* Category & Condition Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-white border border-zinc-200 px-4 py-3.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-xl bg-white border border-zinc-200 px-4 py-3.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 cursor-pointer"
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
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the coupon — what brand/platform, what discount, any restrictions or T&C."
              className="w-full rounded-xl bg-white border border-zinc-200 px-4 py-3.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 resize-none"
            />
          </div>

          {/* Preferred Trade */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              What do you want in exchange? (Preferred Trade)
            </label>
            <input
              type="text"
              value={preferredTrade}
              onChange={(e) => setPreferredTrade(e.target.value)}
              placeholder="e.g. Swiggy coupon, Zomato discount, any food delivery coupon"
              className="w-full rounded-xl bg-white border border-zinc-200 px-4 py-3 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
              Coupon Screenshot / Brand Logo (Optional)
            </label>

            {imagePreview ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 max-w-md">
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-red-700 border border-red-200 shadow-xs hover:bg-red-50 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 bg-zinc-50 rounded-xl p-8 hover:bg-zinc-100 hover:border-zinc-300 cursor-pointer transition-all max-w-md">
                <Upload className="h-8 w-8 text-zinc-400 mb-2 stroke-[1.5]" />
                <span className="text-xs text-zinc-700 font-semibold">Upload photo</span>
                <span className="text-[10px] text-zinc-400 mt-1">PNG, JPG, JPEG up to 5MB</span>
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
            className="w-full mt-4 rounded-xl bg-zinc-900 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-zinc-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            <span>{loading ? "Publishing Listing..." : "Publish Listing"}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
