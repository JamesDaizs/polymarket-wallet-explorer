export function classifyWhaleTier(amount_usd: number): string {
  if (amount_usd >= 100_000) return "whale";
  if (amount_usd >= 10_000) return "large";
  if (amount_usd >= 1_000) return "medium";
  return "small";
}
