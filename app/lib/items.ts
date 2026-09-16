import { promises as fs } from "fs";
import path from "path";

export type Tier = {
  name: string;
  price: number;
  hours: number;
  delivery: string;
  market: string;
  includes: string[];
};

export type Product = {
  sku: string;
  slug: string;
  kind: "product" | "pack" | "subscription" | "payment_tool";
  cat: string;
  sub?: string;
  name: string;
  short: string;
  desc: string;
  image: string;
  tiers: Tier[];
  basePrice: number;
  baseMarket: string;
};

type RawProduct = Omit<Product, "slug" | "image" | "basePrice" | "baseMarket">;

type ItemsFile = {
  _meta: Record<string, unknown>;
  products: RawProduct[];
};

const ITEMS_PATH = path.join(
  process.cwd(),
  "income",
  "wayl",
  "items.json",
);

function toSlug(sku: string): string {
  return sku.toLowerCase();
}

function normalizeProduct(raw: RawProduct): Product {
  const firstTier = raw.tiers?.[0];
  return {
    ...raw,
    slug: toSlug(raw.sku),
    image: `/wayl-images/${raw.sku}.png`,
    basePrice: firstTier?.price ?? 0,
    baseMarket: firstTier?.market ?? "IQ",
  };
}

async function readProducts(): Promise<Product[]> {
  const raw = await fs.readFile(ITEMS_PATH, "utf-8");
  const data = JSON.parse(raw) as ItemsFile;
  return data.products.map(normalizeProduct);
}

export async function getProducts(): Promise<Product[]> {
  return readProducts();
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const products = await readProducts();
  return products.find((p) => p.slug === slug);
}

export async function getAllProductSlugs(): Promise<string[]> {
  const products = await readProducts();
  return products.map((p) => p.slug);
}
