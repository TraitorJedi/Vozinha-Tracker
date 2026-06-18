import { NextResponse } from "next/server";
import { fullNumber } from "@/lib/format";
import type { PrintfulArtworkFormat } from "@/lib/printful-products";

export const dynamic = "force-dynamic";

const BRAND = "Vozinha.app";
const ARTWORK_FONT_FAMILY = "JetBrains Mono, Arial, Helvetica, sans-serif";

const ARTWORK_FORMATS: Record<PrintfulArtworkFormat, { width: number; height: number }> = {
  "apparel-front": { width: 4500, height: 5400 },
  "poster-vertical": { width: 5400, height: 7200 },
  "mug-wrap": { width: 2700, height: 1050 },
  "sticker-square": { width: 3000, height: 3000 }
};

function parseFollowers(value: string | null) {
  const parsed = Number(String(value ?? "").replace(/[^0-9]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

function parseFormat(value: string | null): PrintfulArtworkFormat {
  return value && value in ARTWORK_FORMATS ? (value as PrintfulArtworkFormat) : "apparel-front";
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => {
    switch (character) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      default:
        return "&apos;";
    }
  });
}

function grid(width: number, height: number, step: number) {
  const horizontal = Array.from({ length: Math.floor(height / step) }, (_, index) => `M0 ${(index + 1) * step}h${width}`);
  const vertical = Array.from({ length: Math.floor(width / step) }, (_, index) => `M${(index + 1) * step} 0v${height}`);
  return [...horizontal, ...vertical].join("");
}

function artworkSvg(format: PrintfulArtworkFormat, followerText: string, message: string) {
  const { width, height } = ARTWORK_FORMATS[format];
  const safeFollowers = escapeXml(followerText);
  const safeMessage = escapeXml(message);
  const safeBrand = escapeXml(BRAND);

  if (format === "mug-wrap") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#000403"/>
  <path d="${grid(width, height, 350)}" stroke="#00f29a" stroke-opacity="0.14" stroke-width="5"/>
  <text x="${width / 2}" y="220" text-anchor="middle" fill="#00f29a" font-family="${ARTWORK_FONT_FAMILY}" font-size="120" font-weight="800" letter-spacing="10">${safeBrand}</text>
  <text x="${width / 2}" y="500" text-anchor="middle" fill="#f3f4ff" font-family="${ARTWORK_FONT_FAMILY}" font-size="170" font-weight="900">I was here at</text>
  <text x="${width / 2}" y="720" text-anchor="middle" fill="#00f29a" font-family="${ARTWORK_FONT_FAMILY}" font-size="210" font-weight="900">${safeFollowers}</text>
  <text x="${width / 2}" y="900" text-anchor="middle" fill="#a5a4c2" font-family="${ARTWORK_FONT_FAMILY}" font-size="110" font-weight="800" letter-spacing="8">followers</text>
</svg>`;
  }

  if (format === "sticker-square") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" rx="420" fill="#000403"/>
  <circle cx="1500" cy="1500" r="1260" fill="#00f29a" fill-opacity="0.08" stroke="#00f29a" stroke-width="28"/>
  <text x="1500" y="770" text-anchor="middle" fill="#00f29a" font-family="${ARTWORK_FONT_FAMILY}" font-size="190" font-weight="800" letter-spacing="14">${safeBrand}</text>
  <text x="1500" y="1320" text-anchor="middle" fill="#f3f4ff" font-family="${ARTWORK_FONT_FAMILY}" font-size="260" font-weight="900">I was here at</text>
  <text x="1500" y="1700" text-anchor="middle" fill="#00f29a" font-family="${ARTWORK_FONT_FAMILY}" font-size="330" font-weight="900">${safeFollowers}</text>
  <text x="1500" y="2040" text-anchor="middle" fill="#a5a4c2" font-family="${ARTWORK_FONT_FAMILY}" font-size="170" font-weight="800" letter-spacing="10">followers</text>
</svg>`;
  }

  const brandY = format === "poster-vertical" ? 1960 : 1760;
  const hereY = format === "poster-vertical" ? 3120 : 2450;
  const atY = format === "poster-vertical" ? 3700 : 2940;
  const countY = format === "poster-vertical" ? 4310 : 3450;
  const followersY = format === "poster-vertical" ? 4820 : 3860;
  const footerY = format === "poster-vertical" ? 6200 : 4620;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#000403"/>
  <path d="${grid(width, height, format === "poster-vertical" ? 900 : 760)}" stroke="#00f29a" stroke-opacity="0.16" stroke-width="8"/>
  <circle cx="${width / 2}" cy="${height * 0.45}" r="${Math.min(width, height) * 0.34}" fill="#00f29a" fill-opacity="0.08"/>
  <text x="${width / 2}" y="${brandY}" text-anchor="middle" fill="#00f29a" font-family="${ARTWORK_FONT_FAMILY}" font-size="250" font-weight="800" letter-spacing="18">${safeBrand}</text>
  <text x="${width / 2}" y="${hereY}" text-anchor="middle" fill="#f3f4ff" font-family="${ARTWORK_FONT_FAMILY}" font-size="390" font-weight="900">I was here</text>
  <text x="${width / 2}" y="${atY}" text-anchor="middle" fill="#f3f4ff" font-family="${ARTWORK_FONT_FAMILY}" font-size="265" font-weight="800">at</text>
  <text x="${width / 2}" y="${countY}" text-anchor="middle" fill="#00f29a" font-family="${ARTWORK_FONT_FAMILY}" font-size="420" font-weight="900">${safeFollowers}</text>
  <text x="${width / 2}" y="${followersY}" text-anchor="middle" fill="#a5a4c2" font-family="${ARTWORK_FONT_FAMILY}" font-size="240" font-weight="700" letter-spacing="10">followers</text>
  <text x="${width / 2}" y="${footerY}" text-anchor="middle" fill="#a5a4c2" font-family="${ARTWORK_FONT_FAMILY}" font-size="130" font-weight="700">${safeMessage} · ${safeBrand}</text>
</svg>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const followers = parseFollowers(url.searchParams.get("followers"));
  const format = parseFormat(url.searchParams.get("format"));
  const followerText = followers ? fullNumber(followers) : "the beginning";
  const message = `I was here at ${followerText} followers`;

  return new NextResponse(artworkSvg(format, followerText, message), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}
