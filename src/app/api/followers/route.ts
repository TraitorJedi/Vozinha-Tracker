import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type InstagramHandle = "vozinha1" | "tombrady";
type ProviderPayload = Record<string, unknown>;

type AccountSnapshot = {
  handle: InstagramHandle;
  displayName: string;
  followers: number;
  profileUrl: string;
};

type CountResult = {
  vozinha: number;
  brady: number;
  source: string;
};

const ACCOUNTS: Record<InstagramHandle, { displayName: string; profileUrl: string }> = {
  vozinha1: {
    displayName: "Vozinha",
    profileUrl: "https://www.instagram.com/vozinha1/"
  },
  tombrady: {
    displayName: "Tom Brady",
    profileUrl: "https://www.instagram.com/tombrady/"
  }
};

const DEFAULT_COUNTS = {
  vozinha: 9_200_000,
  brady: 15_400_000
};

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "string") {
    const multiplier = value.trim().toLowerCase().endsWith("m") ? 1_000_000 : value.trim().toLowerCase().endsWith("k") ? 1_000 : 1;
    const parsed = Number(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? Math.round(parsed * multiplier) : null;
  }
  return null;
}

function fromProviderPayload(payload: ProviderPayload, key: InstagramHandle): number | null {
  const direct = asNumber(payload[key]);
  if (direct !== null) return direct;

  const accounts = payload.accounts;
  if (accounts && typeof accounts === "object" && key in accounts) {
    const account = (accounts as Record<string, unknown>)[key];
    if (typeof account === "object" && account !== null) {
      const accountPayload = account as Record<string, unknown>;
      return asNumber(accountPayload.followers ?? accountPayload.followersCount ?? accountPayload.follower_count);
    }
  }

  return null;
}

async function fetchJson(url: string, init?: RequestInit): Promise<ProviderPayload> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return (await response.json()) as ProviderPayload;
}

async function fetchFromCustomProvider(): Promise<CountResult | null> {
  const url = process.env.IG_FOLLOWER_API_URL;
  if (!url) return null;

  const headers: HeadersInit = { Accept: "application/json" };

  if (process.env.IG_FOLLOWER_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.IG_FOLLOWER_API_TOKEN}`;
  }

  const payload = await fetchJson(url, { headers });
  const vozinha = fromProviderPayload(payload, "vozinha1");
  const brady = fromProviderPayload(payload, "tombrady");

  if (vozinha === null || brady === null) {
    throw new Error("Follower provider response did not include both counts.");
  }

  return { vozinha, brady, source: "custom-provider" };
}

async function fetchFromApify(): Promise<CountResult | null> {
  const token = process.env.APIFY_TOKEN;
  const actor = process.env.APIFY_INSTAGRAM_ACTOR ?? "scrapebase/instagram-followers-count-scraper";
  if (!token) return null;

  const endpoint = `https://api.apify.com/v2/acts/${encodeURIComponent(actor).replace("%2F", "~")}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;
  const payload = await fetchJson(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernames: ["vozinha1", "tombrady"] })
  });

  const items = Array.isArray(payload) ? payload : Object.values(payload);
  const counts = Object.fromEntries(
    items.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      const username = String(record.username ?? record.handle ?? "").replace(/^@/, "").toLowerCase();
      const followers = asNumber(record.followers ?? record.followersCount ?? record.follower_count);
      return username && followers !== null ? [[username, followers]] : [];
    })
  );

  const vozinha = asNumber(counts.vozinha1);
  const brady = asNumber(counts.tombrady);
  if (vozinha === null || brady === null) throw new Error("Apify did not return both follower counts.");
  return { vozinha, brady, source: "apify" };
}

async function fetchInstastatisticsCount(handle: InstagramHandle): Promise<number> {
  const response = await fetch(`https://instastatistics.com/${handle}`, {
    headers: { "User-Agent": "VozinhaTracker/1.0 (+https://vercel.app)" },
    cache: "no-store",
    next: { revalidate: 0 }
  });

  if (!response.ok) throw new Error(`Instastatistics ${handle} returned ${response.status}`);

  const html = await response.text();
  const exactMatch = html.match(/Follower Counter[\s\S]*?([0-9][0-9,.]*)\s*Followers/i);
  const metaMatch = html.match(/has\s+([0-9][0-9,.]*)\s+Instagram followers/i);
  const count = asNumber(exactMatch?.[1] ?? metaMatch?.[1]);
  if (count === null) throw new Error(`Could not parse Instastatistics count for ${handle}.`);
  return count;
}

async function fetchFromInstastatistics(): Promise<CountResult | null> {
  if (process.env.INSTASTATISTICS_ENABLED === "false") return null;

  const [vozinha, brady] = await Promise.all([
    fetchInstastatisticsCount("vozinha1"),
    fetchInstastatisticsCount("tombrady")
  ]);

  return { vozinha, brady, source: "instastatistics" };
}

function fetchFromEnvironment(): CountResult {
  const vozinha = asNumber(process.env.VOZINHA_FOLLOWERS ?? DEFAULT_COUNTS.vozinha);
  const brady = asNumber(process.env.TOM_BRADY_FOLLOWERS ?? DEFAULT_COUNTS.brady);

  return {
    vozinha: vozinha ?? DEFAULT_COUNTS.vozinha,
    brady: brady ?? DEFAULT_COUNTS.brady,
    source: process.env.VOZINHA_FOLLOWERS || process.env.TOM_BRADY_FOLLOWERS ? "env" : "demo"
  };
}

export async function GET() {
  let counts = fetchFromEnvironment();
  const warnings: string[] = [];

  for (const provider of [fetchFromCustomProvider, fetchFromApify, fetchFromInstastatistics]) {
    try {
      const providerCounts = await provider();
      if (providerCounts) {
        counts = providerCounts;
        break;
      }
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "Follower provider failed.");
    }
  }

  const handles: InstagramHandle[] = ["vozinha1", "tombrady"];
  const accounts: AccountSnapshot[] = handles.map((handle) => ({
    handle,
    displayName: ACCOUNTS[handle].displayName,
    followers: handle === "vozinha1" ? counts.vozinha : counts.brady,
    profileUrl: ACCOUNTS[handle].profileUrl
  }));

  const gap = counts.brady - counts.vozinha;
  const progress = counts.brady > 0 ? (counts.vozinha / counts.brady) * 100 : 0;

  return NextResponse.json({
    accounts,
    gap,
    progress,
    leader: gap > 0 ? "tombrady" : gap < 0 ? "vozinha1" : "tied",
    source: counts.source,
    warning: warnings.length ? warnings.join(" ") : undefined,
    updatedAt: new Date().toISOString()
  });
}
