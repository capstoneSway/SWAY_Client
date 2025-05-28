import axios from "axios";

export default async function createLightningMeetUp(
  token: string,
  data: {
    title: string;
    content: string;
    max_participant: number;
    gender: string;
    category: string;
    background_pic: string;
  }
) {
  try {
    console.log("번개모임 생성 API 요청 시작", data);
    const response = await axios.post(
      "https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app/lightning/create/",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("번개모임 생성 성공:", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios 오류:", error.response?.data || error.message);
    } else {
      console.error("알 수 없는 오류:", error);
    }
    throw error;
  }
}
