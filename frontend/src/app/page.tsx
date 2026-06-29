"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowRight, RefreshCw, Shield, Zap } from "lucide-react";
import { Show, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900 selection:bg-zinc-900/10">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-200/30 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-zinc-100/40 rounded-full blur-[100px] pointer-events-none" />

        {/* Hero Section */}
        <section className="mx-auto max-w-4xl px-6 pt-32 pb-20 text-center z-10">
          <h1 className="text-4xl font-black tracking-tighter sm:text-7xl text-zinc-900 leading-[1.05] tracking-tight">
            Swap items you have. <br />
            <span className="text-zinc-400 font-extrabold">
              Get what you actually need.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-sm sm:text-base text-zinc-500 leading-relaxed">
            Ditch the price tags. swapsphere lets you list items you no longer use and trade them directly with other creators. Fast, secure, and completely cashless.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 rounded-lg bg-zinc-950 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-zinc-850 hover:shadow-lg transition-all duration-300 w-full sm:w-auto justify-center cursor-pointer"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-zinc-400" />
              </Link>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="group flex items-center gap-2 rounded-lg bg-zinc-950 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-zinc-850 hover:shadow-lg transition-all duration-300 w-full sm:w-auto justify-center cursor-pointer">
                  <span>Start Swapping Now</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-zinc-400" />
                </button>
              </SignInButton>
            </Show>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mx-auto max-w-6xl px-6 py-12 z-10 w-full">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="group rounded-2xl border border-zinc-200/60 bg-white p-6 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 text-zinc-900 border border-zinc-150 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                <RefreshCw className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-zinc-900 uppercase tracking-wider">P2P Swaps</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                Offer items from your own inventory in exchange for other listings. Negotiate agreements directly without intermediate currencies.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl border border-zinc-200/60 bg-white p-6 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 text-zinc-900 border border-zinc-150 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-zinc-900 uppercase tracking-wider">Real-time Negotiation</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                Connect and chat instantly with item owners using our integrated real-time negotiation panel. Set meetup coordinates on the fly.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl border border-zinc-200/60 bg-white p-6 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 text-zinc-900 border border-zinc-150 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-zinc-900 uppercase tracking-wider">Secure Escrow Auth</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                Rest easy with secure Clerk user credentials, user profiles, and Supabase Row-Level Security safeguarding all transactions.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white py-8 text-center text-xs text-zinc-400 z-10">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 swapsphere. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium text-zinc-500 uppercase tracking-widest text-[10px]">
            Join the trade revolution <Zap className="h-3.5 w-3.5 text-zinc-400 fill-zinc-400/20" />
          </p>
        </div>
      </footer>
    </div>
  );
}
