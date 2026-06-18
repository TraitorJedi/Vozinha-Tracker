import { NextResponse } from "next/server";
import { fullNumber } from "@/lib/format";
import { findPrintfulProduct, findPrintfulVariant, getDefaultProductSelection } from "@/lib/printful-products";

export const dynamic = "force-dynamic";

type PrintfulSyncProductResponse = {
  result?: {
    id?: number;
    external_id?: string;
    name?: string;
    thumbnail_url?: string | null;
  };
};

function parsePositiveInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^0-9]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (configured) return configured.startsWith("http") ? configured : `https://${configured}`;
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const followers = parsePositiveInteger(body.followers);
  if (!followers) {
    return NextResponse.json({ error: "A current follower count is required." }, { status: 400 });
  }

  const requestedProductId = typeof body.productId === "string" ? body.productId : undefined;
  const requestedVariantId = typeof body.variantId === "string" ? body.variantId : undefined;
  const defaultSelection = getDefaultProductSelection();
  const product = requestedProductId ? findPrintfulProduct(requestedProductId) : defaultSelection.product;

  if (!product) {
    return NextResponse.json(
      { error: `Unknown product '${requestedProductId}'. Choose one of the approved Vozinha.app products.` },
      { status: 400 }
    );
  }

  const variant = requestedVariantId ? findPrintfulVariant(product, requestedVariantId) : product.variants[0];
  if (!variant) {
    return NextResponse.json(
      { error: `Unknown variant '${requestedVariantId}' for ${product.name}. Choose an approved size/color option.` },
      { status: 400 }
    );
  }

  const apiKey = process.env.PRINTFUL_API_KEY;
  const printfulVariantId = parsePositiveInteger(process.env[variant.envVar]);
  const artworkUrl = `${getBaseUrl(request)}/api/printful/was-here-artwork?followers=${followers}&format=${product.artworkFormat}`;

  if (!apiKey || !printfulVariantId) {
    return NextResponse.json(
      {
        error: `${product.name} (${variant.label}) is not configured in Vercel yet.`,
        missing: [!apiKey && "PRINTFUL_API_KEY", !printfulVariantId && variant.envVar].filter(Boolean),
        product: { id: product.id, name: product.name },
        variant: { id: variant.id, label: variant.label },
        artworkUrl
      },
      { status: 503 }
    );
  }

  const productName = `${product.name}: I was here at ${fullNumber(followers)} followers`;
  const headers: HeadersInit = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  if (process.env.PRINTFUL_STORE_ID) {
    headers["X-PF-Store-Id"] = process.env.PRINTFUL_STORE_ID;
  }

  const response = await fetch("https://api.printful.com/store/products", {
    method: "POST",
    headers,
    body: JSON.stringify({
      sync_product: {
        name: productName
      },
      sync_variants: [
        {
          variant_id: printfulVariantId,
          retail_price: process.env.PRINTFUL_RETAIL_PRICE ?? product.defaultRetailPrice,
          files: [
            {
              type: product.fileType,
              url: artworkUrl
            }
          ]
        }
      ]
    })
  });

  const payload = (await response.json().catch(() => ({}))) as PrintfulSyncProductResponse & { error?: unknown };

  if (!response.ok) {
    return NextResponse.json(
      {
        error: `Printful product creation failed for ${product.name} (${variant.label}).`,
        details: payload,
        artworkUrl
      },
      { status: response.status }
    );
  }

  return NextResponse.json({
    product: payload.result,
    selection: {
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      variantLabel: variant.label
    },
    artworkUrl
  });
}
