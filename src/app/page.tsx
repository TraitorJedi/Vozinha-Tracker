"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { compactNumber, fullNumber, percent } from "@/lib/format";

type Account = {
  handle: "vozinha1" | "tombrady";
  displayName: string;
  followers: number;
  profileUrl: string;
};

type FollowerResponse = {
  accounts: Account[];
  gap: number;
  progress: number;
  leader: "vozinha1" | "tombrady" | "tied";
  source: string;
  warning?: string;
  updatedAt: string;
};

const fallbackData: FollowerResponse = {
  accounts: [
    {
      handle: "vozinha1",
      displayName: "Vozinha",
      followers: 9_200_000,
      profileUrl: "https://www.instagram.com/vozinha1/"
    },
    {
      handle: "tombrady",
      displayName: "Tom Brady",
      followers: 15_400_000,
      profileUrl: "https://www.instagram.com/tombrady/"
    }
  ],
  gap: 6_200_000,
  progress: 59.7402597403,
  leader: "tombrady",
  source: "demo",
  updatedAt: new Date().toISOString()
};

function getAccount(data: FollowerResponse, handle: Account["handle"]) {
  return data.accounts.find((account) => account.handle === handle)!;
}

function useFollowers() {
  const [data, setData] = useState<FollowerResponse>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setError(null);
      const response = await fetch("/api/followers", { cache: "no-store" });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const nextData = (await response.json()) as FollowerResponse;
      setData(nextData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refresh counts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return { data, loading, error, refresh };
}

export default function Home() {
  const { data, loading, error, refresh } = useFollowers();
  const vozinha = getAccount(data, "vozinha1");
  const brady = getAccount(data, "tombrady");
  const gapAbs = Math.abs(data.gap);
  const needed = Math.max(0, data.gap + 1);

  return (
    <main className="shell">
      <header className="topbar">
        <h1>Vozinha Tracker</h1>
        <button onClick={refresh} disabled={loading} aria-label="Refresh follower counts">
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          refresh
        </button>
      </header>

      <section className="ticker" aria-label="Follower counts">
        <a className="ticker-card active" href={vozinha.profileUrl} target="_blank" rel="noreferrer">
          <span>@{vozinha.handle}</span>
          <strong>{compactNumber(vozinha.followers)}</strong>
        </a>
        <a className="ticker-card" href={brady.profileUrl} target="_blank" rel="noreferrer">
          <span>@{brady.handle}</span>
          <strong>{compactNumber(brady.followers)}</strong>
        </a>
      </section>

      <section className="stats" aria-label="Race status">
        <div>
          <span>gap</span>
          <strong>{compactNumber(gapAbs)}</strong>
        </div>
        <div>
          <span>needed</span>
          <strong>{needed === 0 ? "0" : fullNumber(needed)}</strong>
        </div>
        <div>
          <span>progress</span>
          <strong>{percent(data.progress)}</strong>
        </div>
      </section>

      <div className="progress-bar" aria-label="Progress to Tom Brady">
        <div style={{ width: `${Math.min(100, data.progress)}%` }} />
      </div>

      {(error || data.warning) && <p className="warning">{error ?? data.warning}</p>}

      <footer>
        <span>{new Date(data.updatedAt).toLocaleString()}</span>
        <span>{data.source}</span>
      </footer>
    </main>
  );
}
