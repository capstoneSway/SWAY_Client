import { api } from "./axios";

export default async function fetchMyLightningCards() {
  const res = await api.get("/lightning/status/?status=inProgress");

  const mapped = res.data.map((item: any) => ({
    ...item,
    expiresAt: item.end_time,
    image: item.background_pic,
  }));

  return mapped;
}
