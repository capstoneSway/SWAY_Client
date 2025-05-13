import { api } from "./axios";

export interface Memo {
  id: string;
  date: string;
  rate: number;
  from: string;
  to: string;
  amount: number;
  text: string;
}

export const fetchMemos = () => api.get<Memo[]>("/memos"); // GET /memos

export const postMemo = (memo: {
  from: string;
  to: string;
  amount: number;
  text: string;
}) => api.post("/memos", memo); // POST /memos
