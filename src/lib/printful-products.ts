export type PrintfulArtworkFormat = "apparel-front" | "poster-vertical" | "mug-wrap" | "sticker-square";

export type PrintfulProductVariant = {
  id: string;
  label: string;
  size?: string;
  color?: string;
  envVar: string;
};

export type PrintfulProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  fileType: string;
  artworkFormat: PrintfulArtworkFormat;
  defaultRetailPrice: string;
  variants: PrintfulProductVariant[];
};

export const PRINTFUL_PRODUCTS: PrintfulProduct[] = [
  {
    id: "classic-tee",
    name: "Classic Tee",
    category: "Apparel",
    description: "A front-print tee using the standard Vozinha.app milestone design.",
    fileType: "front",
    artworkFormat: "apparel-front",
    defaultRetailPrice: "29.00",
    variants: [
      { id: "black-s", label: "Black / S", color: "Black", size: "S", envVar: "PRINTFUL_VARIANT_CLASSIC_TEE_BLACK_S" },
      { id: "black-m", label: "Black / M", color: "Black", size: "M", envVar: "PRINTFUL_VARIANT_CLASSIC_TEE_BLACK_M" },
      { id: "black-l", label: "Black / L", color: "Black", size: "L", envVar: "PRINTFUL_VARIANT_CLASSIC_TEE_BLACK_L" },
      { id: "black-xl", label: "Black / XL", color: "Black", size: "XL", envVar: "PRINTFUL_VARIANT_CLASSIC_TEE_BLACK_XL" },
      { id: "white-s", label: "White / S", color: "White", size: "S", envVar: "PRINTFUL_VARIANT_CLASSIC_TEE_WHITE_S" },
      { id: "white-m", label: "White / M", color: "White", size: "M", envVar: "PRINTFUL_VARIANT_CLASSIC_TEE_WHITE_M" },
      { id: "white-l", label: "White / L", color: "White", size: "L", envVar: "PRINTFUL_VARIANT_CLASSIC_TEE_WHITE_L" },
      { id: "white-xl", label: "White / XL", color: "White", size: "XL", envVar: "PRINTFUL_VARIANT_CLASSIC_TEE_WHITE_XL" }
    ]
  },
  {
    id: "hoodie",
    name: "Hoodie",
    category: "Apparel",
    description: "A cozy hoodie with the count locked on the front print area.",
    fileType: "front",
    artworkFormat: "apparel-front",
    defaultRetailPrice: "49.00",
    variants: [
      { id: "black-s", label: "Black / S", color: "Black", size: "S", envVar: "PRINTFUL_VARIANT_HOODIE_BLACK_S" },
      { id: "black-m", label: "Black / M", color: "Black", size: "M", envVar: "PRINTFUL_VARIANT_HOODIE_BLACK_M" },
      { id: "black-l", label: "Black / L", color: "Black", size: "L", envVar: "PRINTFUL_VARIANT_HOODIE_BLACK_L" },
      { id: "black-xl", label: "Black / XL", color: "Black", size: "XL", envVar: "PRINTFUL_VARIANT_HOODIE_BLACK_XL" }
    ]
  },
  {
    id: "mug",
    name: "Mug",
    category: "Home",
    description: "A wide wrap layout with Vozinha.app anchoring the brand.",
    fileType: "default",
    artworkFormat: "mug-wrap",
    defaultRetailPrice: "18.00",
    variants: [
      { id: "white-11oz", label: "White / 11 oz", color: "White", size: "11 oz", envVar: "PRINTFUL_VARIANT_MUG_WHITE_11OZ" },
      { id: "white-15oz", label: "White / 15 oz", color: "White", size: "15 oz", envVar: "PRINTFUL_VARIANT_MUG_WHITE_15OZ" }
    ]
  },
  {
    id: "poster",
    name: "Poster",
    category: "Wall Art",
    description: "A vertical milestone poster for the exact follower count.",
    fileType: "default",
    artworkFormat: "poster-vertical",
    defaultRetailPrice: "24.00",
    variants: [
      { id: "12x18", label: "12×18 in", size: "12×18", envVar: "PRINTFUL_VARIANT_POSTER_12X18" },
      { id: "18x24", label: "18×24 in", size: "18×24", envVar: "PRINTFUL_VARIANT_POSTER_18X24" }
    ]
  },
  {
    id: "sticker",
    name: "Sticker",
    category: "Accessories",
    description: "A compact badge version of the standard design.",
    fileType: "default",
    artworkFormat: "sticker-square",
    defaultRetailPrice: "8.00",
    variants: [
      { id: "3x3", label: "3×3 in", size: "3×3", envVar: "PRINTFUL_VARIANT_STICKER_3X3" },
      { id: "4x4", label: "4×4 in", size: "4×4", envVar: "PRINTFUL_VARIANT_STICKER_4X4" }
    ]
  }
];

export function findPrintfulProduct(productId: string | undefined) {
  return PRINTFUL_PRODUCTS.find((product) => product.id === productId) ?? null;
}

export function findPrintfulVariant(product: PrintfulProduct, variantId: string | undefined) {
  return product.variants.find((variant) => variant.id === variantId) ?? null;
}

export function getDefaultProductSelection() {
  const product = PRINTFUL_PRODUCTS[0];
  const variant = product.variants[0];
  return { product, variant };
}
