import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationListener } from "@/components/NotificationListener";
import { Toaster } from "@/components/ui/toaster";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Royal Fashion - Premium E-commerce",
  description: "Discover luxury fashion with our premium collection",
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
           <NotificationListener />
          <main className="min-h-screen">{children}</main>
              <Toaster />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}