"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowRight, RefreshCw, Shield, Zap, Heart } from "lucide-react";
import { Show, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-violet-600/35">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Hero Section */}
        <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-950/20 px-3.5 py-1 text-xs text-violet-400 font-medium mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            Empowering peer-to-peer trading
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Swap things you have for <br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
              things you need
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-zinc-400 leading-relaxed">
            Ditch the price tags. SwapSphere lets you list items you no longer use and trade them directly with other students and creators. Fast, secure, and completely cashless.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 w-full sm:w-auto justify-center"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 w-full sm:w-auto justify-center cursor-pointer">
                  <span>Start Swapping Now</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignInButton>
            </Show>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mx-auto max-w-6xl px-6 py-16 z-10 w-full">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="group rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-950/40 text-violet-400 border border-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-100">P2P Swaps</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Offer items from your own inventory in exchange for other listings. Negotiate agreements directly.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-950/40 text-violet-400 border border-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-100">Real-time Negotiation</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Connect and chat instantly with item owners using our integrated real-time negotiation window.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-950/40 text-violet-400 border border-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-100">Supabase Secure Auth</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Rest easy with secure credentials, user profiles, and Row-Level Security safeguarding your trade data.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/80 bg-zinc-950 py-8 text-center text-xs text-zinc-500 z-10">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SwapSphere. Built for developers and students.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> using Next.js & Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}
