/**
 * utils.ts
 *  - API 로부터 받은 history + today 데이터를
 *    시작일~종료일 사이에 빠진 날짜 없이 채워주는 헬퍼
 */
import { HistoryItem } from "./rate";

/**
 * fillMissingDates
 *  - API 에서 간헐적으로 빠져올 수 있는 일부 날짜를
 *    '직전 받은 rate' 로 메꿔서
 *    차트에 빈 구간 없이 그리기 위함
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
