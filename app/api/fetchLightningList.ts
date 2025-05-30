import { api } from "./axios";

export async function fetchLightningCards(category?: string) {
  let res;
  if (category) {
    res = await api.get(
      `/lightning/category/?category=${category.toLowerCase()}`
    );
  } else {
    res = await api.get("/lightning/");
  }

  return res.data.map((item: any) => ({
    ...item,
    expiresAt: item.end_time, // 반드시 end_time을 expiresAt으로 세팅
    image: item.background_pic,
  }));
}
