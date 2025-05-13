import axios from "axios";

export default async function fetchUserInfo(jwtAccessToken: string) {
  try {
    const response = await axios.get(
      "https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app/accounts/user/info/",
      {
        headers: {
          Authorization: `Bearer ${jwtAccessToken}`,
        },
      }
    );
    console.log("🟢 사용자 정보:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 사용자 정보 로드 오류:", error);
    return null;
  }
}
