import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Bookmate — The Letterboxd for Book Lovers",
  description:
    "Track books you've read, save those you want to read, write reviews, and share lists with friends on Bookmate.",
  keywords: ["books", "reading tracker", "book reviews", "letterboxd for books", "reading diary"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-parchment-200 selection:bg-gold selection:text-black antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
