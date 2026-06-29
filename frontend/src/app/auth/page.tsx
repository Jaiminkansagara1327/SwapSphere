"use client";

import { useSearchParams } from "next/navigation";
import { SignIn, SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function AuthContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  return (
    <div className="flex flex-col items-center">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Home
      </Link>
      {tab === "register" ? (
        <SignUp routing="hash" signInUrl="/auth" />
      ) : (
        <SignIn routing="hash" signUpUrl="/auth?tab=register" />
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex min-h-screen bg-zinc-50 items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-zinc-900/5 rounded-full blur-[100px] pointer-events-none" />
      <Suspense fallback={<div className="text-xs text-zinc-500">Loading Auth...</div>}>
        <AuthContent />
      </Suspense>
    </div>
  );
}
