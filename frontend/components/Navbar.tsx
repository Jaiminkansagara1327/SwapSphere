"use client";

import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-zinc-900 group-hover:rotate-180 transition-transform duration-500 ease-in-out"
            >
              <path
                d="M7 17V4M7 4L3 8M7 4L11 8"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 7V20M17 20L13 16M17 20L21 16"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-base font-bold tracking-tight text-zinc-900">
              swapsphere
            </span>
          </Link>

          {/* Main nav links for logged in users */}
          <Show when="signed-in">
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">
                Marketplace
              </Link>
              <Link href="/swaps" className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors">
                <RefreshCw className="h-3.5 w-3.5" />
                My Swaps
              </Link>
            </nav>
          </Show>
        </div>

        {/* User state and actions */}
        <div className="flex items-center gap-4">
          <Show when="signed-in">
            <>
              {/* Add Listing Link */}
              <Link
                href="/items/new"
                className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 shadow-xs transition-all duration-200"
              >
                <Plus className="h-3.5 w-3.5 text-zinc-500" />
                <span>List Item</span>
              </Link>

              {/* Profile display & UserButton */}
              <div className="flex items-center gap-3 border-l border-zinc-100 pl-4 h-5">
                <UserButton />
              </div>
            </>
          </Show>
          <Show when="signed-out">
            <div className="flex items-center gap-5">
              <SignInButton mode="modal">
                <button className="text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-all duration-200 shadow-sm cursor-pointer">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
