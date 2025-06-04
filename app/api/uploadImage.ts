import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as FileSystem from "expo-file-system";

const BASE_URL =
  "https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app";

/**
 * Android 권한 요청 함수 (API 33 이상 대응)
 */
import { PermissionsAndroid, Platform } from "react-native";

async function requestMediaPermission() {
  if (Platform.OS === "android") {
    const apiLevel = Platform.Version; // 예: 31, 32, 33...

    let permission;

    if (apiLevel >= 33) {
      permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
    } else {
      permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    }

    console.log("요청할 권한:", permission);

    const granted = await PermissionsAndroid.request(permission);

    console.log("부여된 권한:", granted);

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error(`이미지 접근 권한이 거부되었습니다. (${permission})`);
    }
  }
}

/**
 * Android에서 content:// URI를 file:// URI로 변환
 */
async function normalizeUri(uri: string): Promise<string> {
  if (Platform.OS === "android" && uri.startsWith("content://")) {
    const destPath = `${FileSystem.cacheDirectory}${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: destPath });
    return destPath;
  }
  return uri;
}

/**
 * 실제 이미지 업로드 함수
 */
export async function uploadImage(roomId: number, imageUri: string) {
  try {
    await requestMediaPermission();

    const token = await AsyncStorage.getItem("@jwt");
    if (!token) throw new Error("JWT 토큰이 없습니다.");

    const fileUri = await normalizeUri(imageUri); // <-- 핵심 추가
    const filename = fileUri.split("/").pop() || `image-${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const fileType = match ? `image/${match[1]}` : `image/jpeg`;

    const formData = new FormData();
    formData.append("image", {
      uri: fileUri,
      name: filename,
      type: fileType,
    } as any);

    console.log("📤 이미지 업로드 중:", fileUri);

    const response = await axios.post(
      `${BASE_URL}/livechat/upload/${roomId}/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ 이미지 업로드 성공:", response.data);
    return response.data.image_url;
  } catch (error: any) {
    console.error(
      "❌ 이미지 업로드 실패:",
      error.response?.data || error.message
    );
    return null;
  }
}
