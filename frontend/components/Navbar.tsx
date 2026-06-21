"use client";

import Link from "next/link";
import { PlusCircle, RefreshCw } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-bold text-lg shadow-md group-hover:from-violet-500 group-hover:to-indigo-400 transition-all duration-300">
              S
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-200 bg-clip-text text-transparent group-hover:from-violet-300 group-hover:to-indigo-100 transition-colors">
              SwapSphere
            </span>
          </Link>

          {/* Main nav links for logged in users */}
          <Show when="signed-in">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
              <Link href="/dashboard" className="hover:text-zinc-100 transition-colors">
                Marketplace
              </Link>
              <Link href="/swaps" className="flex items-center gap-1.5 hover:text-zinc-100 transition-colors">
                <RefreshCw className="h-4 w-4" />
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
                className="flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-violet-500 transition-colors duration-200"
              >
                <PlusCircle className="h-4 w-4" />
                <span>List Item</span>
              </Link>

              {/* Profile display & UserButton */}
              <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
                <div className="flex flex-col text-right hidden sm:block">
                  <span className="text-xs font-medium text-zinc-200">
                    {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    @{user?.username || "user"}
                  </span>
                </div>
                <UserButton />
              </div>
            </>
          </Show>
          <Show when="signed-out">
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer">
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
