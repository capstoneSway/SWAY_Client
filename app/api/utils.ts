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

/**
 * 주어진 기간(start ~ end) 내 누락된 날짜를
 * 이전 마지막 환율로 채워 7일 차트를 완성합니다.
 */
export function fillMissingDates(
  history: HistoryItem[], // API로 받은 history 배열
  start: string, // YYYY-MM-DD
  end: string // YYYY-MM-DD
): { dates: string[]; rates: number[] } {
  // 1. date->rate 맵 생성
  const map = new Map(history.map((h) => [h.date, h.rate]));
  const dates: string[] = [];
  const rates: number[] = [];

  // 2. 첫 lastRate를 히스토리 중 가장 이른 rate로 초기화
  let lastRate: number;
  if (history.length > 0) {
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    lastRate = sorted[0].rate;
  } else {
    // 히스토리가 없으면 1.0으로 안전 초기화
    lastRate = 1.0;
  }

  // 3. start ~ end 순회하며 값을 채움
  const cursor = new Date(start);
  const until = new Date(end);
  while (cursor <= until) {
    const key = cursor.toISOString().slice(0, 10);
    const rate = map.has(key) ? map.get(key)! : lastRate;
    dates.push(key);
    rates.push(rate);
    lastRate = rate;
    cursor.setDate(cursor.getDate() + 1);
  }

  return { dates, rates };
}
