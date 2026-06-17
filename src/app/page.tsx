"use client";

import { Activity, ArrowUpRight, RefreshCw, Trophy, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

type HistoryPoint = {
  at: string;
  vozinha: number;
  brady: number;
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

function timeAgo(value: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
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

function useLocalHistory(data: FollowerResponse) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    const vozinha = getAccount(data, "vozinha1").followers;
    const brady = getAccount(data, "tombrady").followers;
    const point = { at: data.updatedAt, vozinha, brady };

    setHistory((current) => {
      const stored = window.localStorage.getItem("vozinha-history");
      const parsed = stored ? (JSON.parse(stored) as HistoryPoint[]) : current;
      const deduped = parsed.filter((item) => item.at !== point.at);
      const next = [...deduped, point].slice(-24);
      window.localStorage.setItem("vozinha-history", JSON.stringify(next));
      return next;
    });
  }, [data]);

  return history;
}

export default function Home() {
  const { data, loading, error, refresh } = useFollowers();
  const history = useLocalHistory(data);
  const vozinha = getAccount(data, "vozinha1");
  const brady = getAccount(data, "tombrady");

  const gapAbs = Math.abs(data.gap);
  const needed = Math.max(0, data.gap + 1);
  const status = data.leader === "vozinha1" ? "Vozinha has passed Brady" : data.leader === "tied" ? "It is a dead heat" : "Chasing Brady";

  const momentum = useMemo(() => {
    if (history.length < 2) return null;
    const first = history[0];
    const last = history[history.length - 1];
    return {
      vozinha: last.vozinha - first.vozinha,
      brady: last.brady - first.brady
    };
  }, [history]);

  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">
          <span className="live-dot" /> Vozinha · Instagram · Live-style tracker
        </div>
        <div className="hero-grid">
          <div>
            <h1>Vozinha Tracker</h1>
            <p className="subtitle">A clean follower race dashboard for @vozinha1 vs @tombrady, styled like a dark live market tracker.</p>
          </div>
          <div className="status-card">
            <span>{status}</span>
            <strong>{compactNumber(gapAbs)}</strong>
            <small>{data.leader === "tombrady" ? "followers behind" : data.leader === "vozinha1" ? "followers ahead" : "gap"}</small>
          </div>
        </div>
      </section>

      <section className="scoreboard">
        <article className="primary-card glow">
          <div className="card-topline">
            <span>@{vozinha.handle}</span>
            <a href={vozinha.profileUrl} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={16} /></a>
          </div>
          <h2>{compactNumber(vozinha.followers)}</h2>
          <p>{fullNumber(vozinha.followers)} followers</p>
        </article>

        <article className="primary-card">
          <div className="card-topline">
            <span>@{brady.handle}</span>
            <a href={brady.profileUrl} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={16} /></a>
          </div>
          <h2>{compactNumber(brady.followers)}</h2>
          <p>{fullNumber(brady.followers)} followers</p>
        </article>
      </section>

      <section className="progress-wrap">
        <div className="progress-copy">
          <span>Progress to Tom Brady</span>
          <strong>{percent(data.progress)}</strong>
        </div>
        <div className="progress-bar" aria-label="Progress to Tom Brady">
          <div style={{ width: `${Math.min(100, data.progress)}%` }} />
        </div>
      </section>

      <section className="metric-grid">
        <article className="metric-card">
          <Trophy />
          <span>Followers needed to pass</span>
          <strong>{needed === 0 ? "Already ahead" : fullNumber(needed)}</strong>
        </article>
        <article className="metric-card">
          <Activity />
          <span>Local-session Vozinha change</span>
          <strong>{momentum ? `${momentum.vozinha >= 0 ? "+" : ""}${fullNumber(momentum.vozinha)}` : "Collecting"}</strong>
        </article>
        <article className="metric-card">
          <Zap />
          <span>Data source</span>
          <strong>{data.source}</strong>
        </article>
      </section>

      <section className="history-card">
        <div className="section-title">
          <div>
            <span>Snapshots</span>
            <h3>Recent local history</h3>
          </div>
          <button onClick={refresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
        <div className="history-list">
          {history.slice().reverse().map((point) => (
            <div className="history-row" key={point.at}>
              <span>{timeAgo(point.at)}</span>
              <strong>Vozinha {compactNumber(point.vozinha)}</strong>
              <em>Brady {compactNumber(point.brady)}</em>
            </div>
          ))}
        </div>
        {(error || data.warning) && <p className="warning">{error ?? data.warning}</p>}
      </section>

      <footer>
        <span>Updated {new Date(data.updatedAt).toLocaleString()}</span>
        <span>Refreshes every 30s</span>
      </footer>
    </main>
  );
}
