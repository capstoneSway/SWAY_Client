// app/api/utils.ts
import { HistoryItem } from "./rate";

// app/api/utils.ts
export function parseCurrencyCode(code: string): {
  code: string;
  unit: number;
} {
  // "JPY(100)" → ["JPY", "100)"], ["100", ""]
  const [base, rest] = code.split("(");
  const unit = rest ? parseInt(rest.replace(")", ""), 10) : 1;
  return { code: base, unit: unit || 1 };
}
