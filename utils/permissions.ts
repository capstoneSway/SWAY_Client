// utils/permissions.ts
import * as Application from "expo-application";
import * as ImagePicker from "expo-image-picker";
import * as IntentLauncher from "expo-intent-launcher";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Alert, Linking, Platform } from "react-native";

export type PermissionState = "granted" | "denied" | "undetermined";

async function openSettings() {
  if (Platform.OS === "ios") {
    await Linking.openURL("app-settings:");
  } else {
    const pkg = Application.applicationId;
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
      { data: `package:${pkg}` }
    );
  }
}

async function requestWithPrompt<T extends { status: string }>(
  fn: () => Promise<T>,
  label: string
): Promise<PermissionState> {
  const { status: raw } = await fn();
  const status = (raw as PermissionState) ?? "undetermined";
  if (status === "denied") {
    Alert.alert(
      `${label} 권한이 필요합니다`,
      `${label} 권한이 거부되어 있습니다.\n설정에서 허용해주세요.`,
      [
        { text: "취소", style: "cancel" },
        { text: "설정 열기", onPress: openSettings },
      ]
    );
  }
  return status;
}

// 📷 카메라 권한 (ImagePicker 에서 제공)
export function requestCameraPermission() {
  return requestWithPrompt(
    () => ImagePicker.requestCameraPermissionsAsync(),
    "카메라"
  );
}

// 🖼 갤러리(미디어 라이브러리) 권한
export function requestGalleryPermission() {
  return requestWithPrompt(
    () => ImagePicker.requestMediaLibraryPermissionsAsync(),
    "갤러리"
  );
}

// 📍 위치 권한
export function requestLocationPermission() {
  return requestWithPrompt(
    () => Location.requestForegroundPermissionsAsync(),
    "위치"
  );
}

// 🔔 알림 권한
export function requestNotificationPermission() {
  return requestWithPrompt(
    () => Notifications.requestPermissionsAsync(),
    "알림"
  );
}
