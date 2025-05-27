// TabIndex.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

import {
  PermissionState,
  requestCameraPermission,
  requestGalleryPermission,
  requestLocationPermission,
  requestNotificationPermission,
} from "@/utils/permissions";
//import CookieManager from "@react-native-cookies/cookies";
import ensureValidToken from "../api/tokenManager";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [permStatuses, setPermStatuses] = useState<{
    camera: PermissionState;
    gallery: PermissionState;
    location: PermissionState;
    notifications: PermissionState;
  }>({
    camera: "undetermined",
    gallery: "undetermined",
    location: "undetermined",
    notifications: "undetermined",
  });

  // 🔒 토큰 유효성 검사 및 자동 로그인
  useEffect(() => {
    const checkAuth = async () => {
      const token = await ensureValidToken();
      if (!token) {
        await AsyncStorage.multiRemove(["@jwt", "@refreshToken"]);
       // await CookieManager.clearAll();
        router.replace("/auth/signIn");
      }
    };
    checkAuth();
  }, []);

  // 📌 권한 요청
  const requestAllPermissions = async () => {
    const updatedStatuses = { ...permStatuses };

    if (updatedStatuses.camera === "undetermined") {
      updatedStatuses.camera = await requestCameraPermission();
    }

    if (updatedStatuses.gallery === "undetermined") {
      updatedStatuses.gallery = await requestGalleryPermission();
    }

    if (updatedStatuses.location === "undetermined") {
      updatedStatuses.location = await requestLocationPermission();
    }

    if (updatedStatuses.notifications === "undetermined") {
      updatedStatuses.notifications = await requestNotificationPermission();
    }

    setPermStatuses(updatedStatuses);
    await AsyncStorage.setItem("@permissions", JSON.stringify(updatedStatuses));
  };

  // 📌 권한 상태 로드
  const loadPermissions = async () => {
    const savedStatuses = await AsyncStorage.getItem("@permissions");
    if (savedStatuses) {
      setPermStatuses(JSON.parse(savedStatuses));
    } else {
      const camera = (await ImagePicker.getCameraPermissionsAsync())
        .status as PermissionState;
      const gallery = (await ImagePicker.getMediaLibraryPermissionsAsync())
        .status as PermissionState;
      const location = (await Location.getForegroundPermissionsAsync())
        .status as PermissionState;
      const notifications = (await Notifications.getPermissionsAsync())
        .status as PermissionState;

      const initialStatuses = { camera, gallery, location, notifications };
      setPermStatuses(initialStatuses);
      await AsyncStorage.setItem(
        "@permissions",
        JSON.stringify(initialStatuses)
      );
    }
    setIsLoading(false);
  };

  // 📌 초기 실행 시 권한 및 방문 여부 확인
  useEffect(() => {
    const init = async () => {
      const visited = await AsyncStorage.getItem("@isVisited");
      if (!visited) {
        await requestAllPermissions();
        await AsyncStorage.setItem("@isVisited", "true");
      }
      await loadPermissions();
    };

    init();
  }, []);

  const resetPermissions = async () => {
    await AsyncStorage.removeItem("@isVisited");
    await AsyncStorage.removeItem("@permissions");

    const resetStatuses = {
      camera: "undetermined" as PermissionState,
      gallery: "undetermined" as PermissionState,
      location: "undetermined" as PermissionState,
      notifications: "undetermined" as PermissionState,
    };

    setPermStatuses(resetStatuses);
    console.log("🔄 권한 초기화 완료");
  };

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>권한 상태 확인:</Text>
      <Text>카메라: {permStatuses.camera}</Text>
      <Text>갤러리: {permStatuses.gallery}</Text>
      <Text>위치: {permStatuses.location}</Text>
      <Text>알림: {permStatuses.notifications}</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/auth/signIn")}
      >
        <Text style={styles.buttonText}>로그인 화면으로 이동</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.logoutButton]}
        onPress={async () => {
          await AsyncStorage.multiRemove(["@jwt", "@refreshToken"]);
          //await CookieManager.clearAll();
          router.replace("/auth/signIn");
        }}
      >
        <Text style={[styles.buttonText, styles.logoutText]}>로그아웃</Text>
      </Pressable>

      <Pressable style={styles.resetButton} onPress={resetPermissions}>
        <Text style={styles.resetText}>🔄 권한 초기화</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  title: { fontSize: 18, marginBottom: 12 },
  button: {
    width: "100%",
    padding: 14,
    backgroundColor: "#007AFF",
    borderRadius: 6,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  logoutButton: { backgroundColor: "#FF3B30" },
  logoutText: { color: "#fff" },
  resetButton: {
    marginTop: 12,
    backgroundColor: "#900",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  resetText: {
    color: "#fff",
    fontSize: 14,
  },
});
