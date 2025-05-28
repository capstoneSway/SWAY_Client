import messaging from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

// FCM 권한 요청
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === "ios") {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log("iOS 알림 권한 상태:", authStatus);
    return enabled;
  }

  if (Platform.OS === "android" && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    console.log("Android 알림 권한:", granted);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true;
};

// FCM 토큰 요청
export const getFcmToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    console.log("FCM Token:", token);
    return token;
  } catch (e) {
    console.error("FCM 토큰 가져오기 실패:", e);
    return null;
  }
};
