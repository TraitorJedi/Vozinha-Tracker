import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ProviderPayload = Record<string, unknown>;

type AccountSnapshot = {
  handle: "vozinha1" | "tombrady";
  displayName: string;
  followers: number;
  profileUrl: string;
};

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? Math.round(parsed) : null;
  }
  return null;
}

function fromProviderPayload(payload: ProviderPayload, key: "vozinha1" | "tombrady"): number | null {
  const direct = asNumber(payload[key]);
  if (direct !== null) return direct;

  const accounts = payload.accounts;
  if (accounts && typeof accounts === "object" && key in accounts) {
    const account = (accounts as Record<string, unknown>)[key];
    if (typeof account === "object" && account !== null && "followers" in account) {
      return asNumber((account as { followers?: unknown }).followers);
    }
  }

  return null;
}

async function fetchFromCustomProvider() {
  const url = process.env.IG_FOLLOWER_API_URL;
  if (!url) return null;

  const headers: HeadersInit = {
    Accept: "application/json"
  };

  if (process.env.IG_FOLLOWER_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.IG_FOLLOWER_API_TOKEN}`;
  }

  const response = await fetch(url, {
    headers,
    cache: "no-store",
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Follower provider returned ${response.status}`);
  }

  const payload = (await response.json()) as ProviderPayload;
  const vozinha = fromProviderPayload(payload, "vozinha1");
  const brady = fromProviderPayload(payload, "tombrady");

  if (vozinha === null || brady === null) {
    throw new Error("Follower provider response did not include both counts.");
  }

  return { vozinha, brady, source: "custom-provider" };
}

function fetchFromEnvironment() {
  const vozinha = asNumber(process.env.VOZINHA_FOLLOWERS ?? 9_200_000);
  const brady = asNumber(process.env.TOM_BRADY_FOLLOWERS ?? 15_400_000);

  return {
    vozinha: vozinha ?? 9_200_000,
    brady: brady ?? 15_400_000,
    source: process.env.VOZINHA_FOLLOWERS || process.env.TOM_BRADY_FOLLOWERS ? "env" : "demo"
  };
}

export async function GET() {
  let counts = fetchFromEnvironment();
  let warning: string | undefined;

  try {
    const providerCounts = await fetchFromCustomProvider();
    if (providerCounts) counts = providerCounts;
  } catch (error) {
    warning = error instanceof Error ? error.message : "Follower provider failed.";
  }

  const accounts: AccountSnapshot[] = [
    {
      handle: "vozinha1",
      displayName: "Vozinha",
      followers: counts.vozinha,
      profileUrl: "https://www.instagram.com/vozinha1/"
    },
    {
      handle: "tombrady",
      displayName: "Tom Brady",
      followers: counts.brady,
      profileUrl: "https://www.instagram.com/tombrady/"
    }
  ];

  const gap = counts.brady - counts.vozinha;
  const progress = counts.brady > 0 ? (counts.vozinha / counts.brady) * 100 : 0;

  return NextResponse.json({
    accounts,
    gap,
    progress,
    leader: gap > 0 ? "tombrady" : gap < 0 ? "vozinha1" : "tied",
    source: counts.source,
    warning,
    updatedAt: new Date().toISOString()
  });
}
