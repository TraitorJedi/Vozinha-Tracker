"use client";

import { RefreshCw, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { compactNumber, fullNumber, percent } from "@/lib/format";
import { PRINTFUL_PRODUCTS } from "@/lib/printful-products";

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

type PrintfulProductResponse = {
  product?: {
    id?: number;
    name?: string;
    thumbnail_url?: string | null;
  };
  artworkUrl?: string;
  selection?: { productName: string; variantLabel: string };
  error?: string;
  missing?: string[];
};

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
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [productMessage, setProductMessage] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState(PRINTFUL_PRODUCTS[0].id);
  const selectedProduct = PRINTFUL_PRODUCTS.find((product) => product.id === selectedProductId) ?? PRINTFUL_PRODUCTS[0];
  const [selectedVariantId, setSelectedVariantId] = useState(selectedProduct.variants[0].id);
  const selectedVariant = selectedProduct.variants.find((variant) => variant.id === selectedVariantId) ?? selectedProduct.variants[0];

  function chooseProduct(productId: string) {
    const product = PRINTFUL_PRODUCTS.find((item) => item.id === productId) ?? PRINTFUL_PRODUCTS[0];
    setSelectedProductId(product.id);
    setSelectedVariantId(product.variants[0].id);
  }

  async function createWasHereProduct() {
    try {
      setCreatingProduct(true);
      setProductMessage(null);
      const response = await fetch("/api/printful/was-here", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followers: vozinha.followers,
          productId: selectedProduct.id,
          variantId: selectedVariant.id
        })
      });
      const payload = (await response.json()) as PrintfulProductResponse;

      if (!response.ok) {
        const missing = payload.missing?.length ? ` Missing: ${payload.missing.join(", ")}.` : "";
        throw new Error(`${payload.error ?? "Unable to create product."}${missing}`);
      }

      setProductMessage(
        `Created ${payload.selection?.productName ?? selectedProduct.name} (${payload.selection?.variantLabel ?? selectedVariant.label}) product #${
          payload.product?.id ?? "new"
        } for ${fullNumber(vozinha.followers)} followers.`
      );
    } catch (err) {
      setProductMessage(err instanceof Error ? err.message : "Unable to create Printful product.");
    } finally {
      setCreatingProduct(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="brand-row">
            <span className="brand">vozinha.fyi</span>
            <Badge>instagram live</Badge>
          </div>
          <p className="eyebrow">Vozinha · Instagram followers · Live</p>
          <h1>Vozinha Tracker</h1>
          <p className="lede">Instagram follower counts for @vozinha1 and @tombrady.</p>
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
      </div>

      <section className="was-here card" aria-label="Create an I was here product">
        <div>
          <Badge>printful</Badge>
          <h2>I was here at {fullNumber(vozinha.followers)} followers</h2>
          <p>
            Create a limited product using the current live @vozinha1 follower count. Every layout anchors the brand with
            Vozinha.app and uses the standard “I was here at X followers” design system.
          </p>
          <div className="product-picker" aria-label="Choose a Printful product">
            <label>
              Product
              <select value={selectedProduct.id} onChange={(event) => chooseProduct(event.target.value)}>
                {PRINTFUL_PRODUCTS.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} · {product.category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Size / color
              <select value={selectedVariant.id} onChange={(event) => setSelectedVariantId(event.target.value)}>
                {selectedProduct.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="product-description">{selectedProduct.description}</p>
        </div>
        <Button onClick={createWasHereProduct} disabled={creatingProduct || loading} size="lg">
          <ShoppingBag size={17} />
          {creatingProduct ? "creating..." : `make ${selectedProduct.name.toLowerCase()}`}
        </Button>
      </section>

      {productMessage && <p className={productMessage.toLowerCase().includes("created") ? "success" : "warning"}>{productMessage}</p>}
      {(error || data.warning) && <p className="warning">{error ?? data.warning}</p>}

      <footer>
        <Badge>{data.source}</Badge>
      </footer>
    </main>
  );
}
