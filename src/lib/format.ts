export function compactNumber(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: value >= 10_000_000 ? 1 : 2
  }).format(value);
}

export function fullNumber(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}

export function percent(value: number): string {
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value)}%`;
}
