import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AIChatWidget from "./components/AIChatWidget"; // <-- Import komponen widget

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oneklik.id",
  description: "Satu Klik untuk Semua Tautanmu",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        
        {/* Chatbot akan muncul di pojok kanan bawah setiap halaman */}
        <AIChatWidget />
        
      </body>
    </html>
  );
}