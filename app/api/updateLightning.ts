import { api } from "./axios";

interface UpdateMeetUpPayload {
  title: string;
  content: string;
  max_participant: number;
  gender: string; // 'all' | 'male' | 'female'
  category: string; // 'travel' | 'foodie' | 'workout' | 'others'
  background_pic: string;
}

export default async function updateLightningMeetUp(
  id: string,
  token: string,
  payload: UpdateMeetUpPayload
): Promise<any> {
  try {
    const response = await api.put(`/lightning/${id}/update/`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("📦 status:", error.response.status);
      console.error("📦 data:", JSON.stringify(error.response.data, null, 2));
      console.error("📦 headers:", error.response.headers);
    } else {
      console.error("💥 Error:", error.message);
    }
    throw error;
  }
}
