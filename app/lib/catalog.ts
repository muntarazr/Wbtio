import { promises as fs } from "fs";
import path from "path";

export type Market = "IQ" | "GC" | "INTL";

export type PriceRange = Record<Market, [number, number]>;

export type RecurringOffer = {
  n: string;
  pr: PriceRange;
};

export type Service = {
  id: string;
  n: string;
  t: "service" | "product";
  r: boolean;
  p: string;
  seg: string;
  mk: Market[];
  pr: PriceRange;
  d: string;
  st: string[];
  ch: string;
  rec?: RecurringOffer;
};

const CATALOG_PATH = path.join(
  process.cwd(),
  "income",
  "catalog",
  "catalog.json",
);

export async function getServices(): Promise<Service[]> {
  const raw = await fs.readFile(CATALOG_PATH, "utf-8");
  const data = JSON.parse(raw) as Service[];
  return data;
}

export async function getTopServices(limit = 6): Promise<Service[]> {
  const services = await getServices();
  return services.filter((s) => s.t === "service").slice(0, limit);
}
