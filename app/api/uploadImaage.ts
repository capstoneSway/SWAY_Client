import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export async function uploadImage(roomId: number, imageUri: string) {
  const token = await AsyncStorage.getItem("@jwt");
  if (!token) throw new Error("No token found");

  const filename = imageUri.split("/").pop();
  const match = /\.(\w+)$/.exec(filename ?? "");
  const fileType = match ? `image/${match[1]}` : `image`;

  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    name: filename,
    type: fileType,
  } as any);
  // @ts-ignore
  console.log("🧪 FormData 내부:", formData._parts); // 디버깅용

  try {
    const response = await axios.post(
      `https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app/livechat/upload/${roomId}/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ 이미지 업로드 결과:", response.data);
    return response.data.image_url;
  } catch (error: any) {
    console.error(
      "❌ 이미지 업로드 실패:",
      error.response?.data || error.message
    );
    return null;
  }
}
