export function discountRate(price: number): number {
  if (price >= 300) return 0.3;
  if (price > 100) return 0.2;
  if (price > 0) return 0.1;
  return 0;
}

export function discountedPrice(price: number): number {
  return Math.round(price * (1 - discountRate(price)));
}
