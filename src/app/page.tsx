"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

function AccountCard({ account, highlighted = false }: { account: Account; highlighted?: boolean }) {
  return (
    <a
      href={account.profileUrl}
      target="_blank"
      rel="noreferrer"
      className="account-link"
      aria-label={`${account.displayName} Instagram profile`}
    >
      <Card className={highlighted ? "account-card account-card-active" : "account-card"}>
        <CardHeader>
          <Badge>@{account.handle}</Badge>
          <CardTitle>{account.displayName}</CardTitle>
        </CardHeader>
        <CardContent>
          <strong>{compactNumber(account.followers)}</strong>
          <p>Instagram followers</p>
        </CardContent>
      </Card>
    </a>
  );
}

function StatCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <Card className="stat-card">
      <CardHeader>
        <Badge>{label}</Badge>
      </CardHeader>
      <CardContent>
        <strong>{value}</strong>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
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
        <div>
          <Badge>instagram follower tracker</Badge>
          <h1>Vozinha Tracker</h1>
          <p className="lede">Live-style Instagram follower counts for @vozinha1 and @tombrady.</p>
        </div>
        <Button onClick={refresh} disabled={loading} aria-label="Refresh follower counts" variant="outline">
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          refresh
        </Button>
      </header>

      <section className="ticker" aria-label="Follower counts">
        <AccountCard account={vozinha} highlighted />
        <AccountCard account={brady} />
      </section>

      <section className="stats" aria-label="Race status">
        <StatCard label="gap" value={compactNumber(gapAbs)} description="Instagram followers separating the two accounts." />
        <StatCard label="needed" value={needed === 0 ? "0" : fullNumber(needed)} description="Followers Vozinha needs to move ahead." />
        <StatCard label="progress" value={percent(data.progress)} description="Vozinha followers as a share of Tom Brady followers." />
      </section>

      <div className="progress-group">
        <Progress value={data.progress} aria-label="Instagram follower progress to Tom Brady" />
        <p>Progress compares Vozinha Instagram followers against Tom Brady current count.</p>
      </div>

      {(error || data.warning) && <p className="warning">{error ?? data.warning}</p>}

      <footer>
        <span>{new Date(data.updatedAt).toLocaleString()}</span>
        <Badge>{data.source}</Badge>
      </footer>
    </main>
  );
}
