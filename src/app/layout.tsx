import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

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
      <body className="bg-background text-parchment-200 selection:bg-gold selection:text-black antialiased min-h-screen flex flex-col">
        <AuthProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#181d26",
                borderColor: "rgba(255,255,255,0.1)",
                color: "#e6edf3",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
