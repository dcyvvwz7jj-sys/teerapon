import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEARN FIGHT — 3D Combat Training Simulator",
  description: "Premium AAA browser-based 3D fighting game and combat training simulator. Train your fighter, master combat skills, and dominate the arena.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
