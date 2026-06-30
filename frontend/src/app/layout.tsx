import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import HideClerkKeyless from "@/components/HideClerkKeyless";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <ClerkProvider>
          <HideClerkKeyless />
          {children}
        </ClerkProvider>
        {/* Suppress Clerk debug network errors from polluting the dev overlay */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var origError = console.error;
              console.error = function() {
                var msg = arguments[0];
                if (typeof msg === 'string' && msg.includes('[Clerk Debug]')) return;
                origError.apply(console, arguments);
              };
            })();
          `
        }} />
      </body>
    </html>
  );
}
