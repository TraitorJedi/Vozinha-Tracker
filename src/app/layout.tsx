import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vozinha.app"),
  title: {
    default: "Vozinha Tracker — Can Vozinha Catch Tom Brady?",
    template: "%s | Vozinha Tracker"
  },
  description: "Track the live-style Instagram follower race as @vozinha1 chases @tombrady.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Vozinha Tracker — Can Vozinha Catch Tom Brady?",
    description: "Track the live-style follower race between @vozinha1 and @tombrady.",
    url: "/",
    siteName: "Vozinha Tracker",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Vozinha Tracker follower race preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Vozinha Tracker — Can Vozinha Catch Tom Brady?",
    description: "Watch @vozinha1 chase @tombrady in a live-style Instagram follower race.",
    images: ["/opengraph-image"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
