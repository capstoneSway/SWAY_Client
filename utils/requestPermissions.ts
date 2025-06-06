// utils/permissions.ts
import * as Application from "expo-application";
import * as ImagePicker from "expo-image-picker";
import * as IntentLauncher from "expo-intent-launcher";
import * as Notifications from "expo-notifications";
import { Alert, Linking, Platform } from "react-native";

// iOS/Android 공통 권한 상태 타입
export type PermissionState = "granted" | "denied" | "undetermined";

// 📱 설정창 열기 (iOS / Android 분기)
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

//  권한 요청 & 거부 시 Alert 처리 유틸
async function requestWithPrompt<T extends { status: string }>(
  fn: () => Promise<T>,
  label: string
): Promise<PermissionState> {
  const { status: raw } = await fn();
  const status = (raw as PermissionState) ?? "undetermined";

  if (status === "denied") {
    Alert.alert(
      `${label} permission is required.`,
      `${label} permission has been denied. \nPlease enable it in the settings.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: openSettings },
      ]
    );
  }

  return status;
}

// 📷 카메라 권한
export function requestCameraPermission() {
  return requestWithPrompt(
    () => ImagePicker.requestCameraPermissionsAsync(),
    "카메라"
  );
}

//  갤러리 권한
export function requestGalleryPermission() {
  return requestWithPrompt(
    () => ImagePicker.requestMediaLibraryPermissionsAsync(),
    "갤러리"
  );
}

//  알림 권한
export function requestNotificationPermission() {
  return requestWithPrompt(
    () => Notifications.requestPermissionsAsync(),
    "알림"
  );
}

//  앱 실행 시: 권한 하나씩 순차적으로 요청 (팝업 겹침 방지)
export async function requestInitialPermissions() {
  const permissions = [
    { fn: requestNotificationPermission, label: "알림" },
    { fn: requestGalleryPermission, label: "갤러리" },
    { fn: requestCameraPermission, label: "카메라" },
  ];

  for (const { fn, label } of permissions) {
    try {
      await fn(); // 권한 하나 요청하고 → 끝나면 다음으로 넘어감
    } catch (e) {
      console.warn(`${label} 권한 요청 중 오류 발생`, e);
    }
  }
}
