import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vozinha Tracker",
  description: "Live-style follower race tracker for @vozinha1 vs @tombrady.",
  openGraph: {
    title: "Vozinha Tracker",
    description: "Watch @vozinha1 chase Tom Brady's Instagram follower count.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
