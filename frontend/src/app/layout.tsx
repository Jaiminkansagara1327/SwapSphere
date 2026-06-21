import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "SwapSphere - Items Swapping Platform",
  description: "Swap and trade items easily with others in SwapSphere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <ClerkProvider>
          <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
            <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-200 bg-clip-text text-transparent">
              SwapSphere
            </span>
            <div className="flex items-center gap-4">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-xs font-semibold bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-xs font-semibold bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-550 transition-colors">
                    Register
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
