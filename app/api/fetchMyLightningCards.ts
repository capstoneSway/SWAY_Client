import { api } from "./axios";

export default async function fetchMyLightningCards() {
  const res = await api.get("/lightning/status/?status=inProgress");

  console.log("[서버 응답 - 원본 데이터]", res.data);

  const mapped = res.data.map((item: any) => ({
    ...item,
    expiresAt: item.end_time,
    image: item.background_pic,
  }));

  console.log("[가공된 데이터]", mapped);

  return mapped;
}
