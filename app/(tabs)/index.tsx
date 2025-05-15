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

<<<<<<< HEAD
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
=======
// 권한 관련 임포트 부분 주석 처리
// import * as ImagePicker from "expo-image-picker";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";

// import {
//   PermissionState,
//   requestCameraPermission,
//   requestGalleryPermission,
//   requestLocationPermission,
//   requestNotificationPermission,
// } from "@/utils/permissions";
>>>>>>> 4a7f9093a90f01d2518441b4d62a9c997eca11a5

export default function TabIndex() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
<<<<<<< HEAD
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

  // 📌 권한 상태 초기화
  const resetPermissions = async () => {
    // 플래그 초기화
    await AsyncStorage.removeItem("@isVisited");
    await AsyncStorage.removeItem("@permissions");
    console.log("🔄 플래그 초기화 완료");

    // 권한 상태도 초기화 (강제로 undetermined으로 설정)
    const resetStatuses = {
      camera: "undetermined" as PermissionState,
      gallery: "undetermined" as PermissionState,
      location: "undetermined" as PermissionState,
      notifications: "undetermined" as PermissionState,
    };

    setPermStatuses(resetStatuses);
    console.log("🔄 권한 상태 초기화 완료 (undetermined)");
  };

  // 📌 권한 상태 로드
  const loadPermissions = async () => {
    const savedStatuses = await AsyncStorage.getItem("@permissions");
    if (savedStatuses) {
      const parsed = JSON.parse(savedStatuses);
      setPermStatuses(parsed);
    } else {
      // 저장된 상태가 없으면 네이티브 권한 상태 가져오기
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

  // 📌 컴포넌트 로드 시 권한 상태 초기화
=======

  // 권한 관련 코드 주석 처리
  // const [permStatuses, setPermStatuses] = useState<{
  //   camera: "undetermined" | "granted" | "denied";
  //   gallery: "undetermined" | "granted" | "denied";
  //   location: "undetermined" | "granted" | "denied";
  //   notifications: "undetermined" | "granted" | "denied";
  // }>({
  //   camera: "undetermined",
  //   gallery: "undetermined",
  //   location: "undetermined",
  //   notifications: "undetermined",
  // });

  // 권한 상태 초기화 관련 코드 주석 처리
  // const resetPermissions = async () => {
  //   await AsyncStorage.removeItem("@isVisited");
  //   await AsyncStorage.removeItem("@permissions");
  //   console.log("🔄 플래그 초기화 완료");

  //   const resetStatuses = {
  //     camera: "undetermined",
  //     gallery: "undetermined",
  //     location: "undetermined",
  //     notifications: "undetermined",
  //   };

  //   setPermStatuses(resetStatuses);
  //   console.log("🔄 권한 상태 초기화 완료 (undetermined)");
  // };

  // 권한 상태 로드 관련 코드 주석 처리
  // const loadPermissions = async () => {
  //   const savedStatuses = await AsyncStorage.getItem("@permissions");
  //   if (savedStatuses) {
  //     const parsed = JSON.parse(savedStatuses);
  //     setPermStatuses(parsed);
  //   } else {
  //     const initialStatuses = { camera: "undetermined", gallery: "undetermined", location: "undetermined", notifications: "undetermined" };
  //     setPermStatuses(initialStatuses);
  //     await AsyncStorage.setItem("@permissions", JSON.stringify(initialStatuses));
  //   }
  //   setIsLoading(false);
  // };

  // 권한 요청 관련 코드 주석 처리
  // const requestAllPermissions = async () => {
  //   const updatedStatuses = { ...permStatuses };

  //   if (updatedStatuses.camera === "undetermined") {
  //     updatedStatuses.camera = await requestCameraPermission();
  //   }

  //   if (updatedStatuses.gallery === "undetermined") {
  //     updatedStatuses.gallery = await requestGalleryPermission();
  //   }

  //   if (updatedStatuses.location === "undetermined") {
  //     updatedStatuses.location = await requestLocationPermission();
  //   }

  //   if (updatedStatuses.notifications === "undetermined") {
  //     updatedStatuses.notifications = await requestNotificationPermission();
  //   }

  //   setPermStatuses(updatedStatuses);
  //   await AsyncStorage.setItem("@permissions", JSON.stringify(updatedStatuses));
  // };

  // 권한 상태 로드 및 초기화 관련 코드 주석 처리
>>>>>>> 4a7f9093a90f01d2518441b4d62a9c997eca11a5
  useEffect(() => {
    const init = async () => {
      const visited = await AsyncStorage.getItem("@isVisited");
      if (!visited) {
<<<<<<< HEAD
        await requestAllPermissions();
        await AsyncStorage.setItem("@isVisited", "true");
      }
      await loadPermissions();
=======
        // await requestAllPermissions();
        await AsyncStorage.setItem("@isVisited", "true");
      }
      // await loadPermissions();
      setIsLoading(false);
>>>>>>> 4a7f9093a90f01d2518441b4d62a9c997eca11a5
    };

    init();
  }, []);

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <Text style={styles.title}>권한 상태 확인:</Text>
      <Text>카메라: {permStatuses.camera}</Text>
      <Text>갤러리: {permStatuses.gallery}</Text>
      <Text>위치: {permStatuses.location}</Text>
      <Text>알림: {permStatuses.notifications}</Text>

=======
>>>>>>> 4a7f9093a90f01d2518441b4d62a9c997eca11a5
      <Pressable
        onPress={() => router.push("/auth/signIn")}
        style={({ pressed }) => ({
          marginTop: 24,
          backgroundColor: pressed ? "lightgray" : "#000",
          paddingVertical: 12,
          paddingHorizontal: 24,
        })}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>
          로그인 화면으로 이동
        </Text>
<<<<<<< HEAD
      </Pressable>

      <Pressable
        onPress={resetPermissions}
        style={({ pressed }) => ({
          marginTop: 12,
          backgroundColor: pressed ? "lightcoral" : "#900",
          paddingVertical: 10,
          paddingHorizontal: 24,
        })}
      >
        <Text style={{ color: "#fff", fontSize: 14 }}>🔄 권한 초기화</Text>
=======
>>>>>>> 4a7f9093a90f01d2518441b4d62a9c997eca11a5
      </Pressable>

      {/* 권한 상태 확인 관련 코드 주석 처리 */}
      {/* <Text style={styles.title}>권한 상태 확인:</Text>
      <Text>카메라: {permStatuses.camera}</Text>
      <Text>갤러리: {permStatuses.gallery}</Text>
      <Text>위치: {permStatuses.location}</Text>
      <Text>알림: {permStatuses.notifications}</Text> */}

      {/* 권한 초기화 관련 버튼 주석 처리 */}
      {/* <Pressable
        onPress={resetPermissions}
        style={({ pressed }) => ({
          marginTop: 12,
          backgroundColor: pressed ? "lightcoral" : "#900",
          paddingVertical: 10,
          paddingHorizontal: 24,
        })}
      >
        <Text style={{ color: "#fff", fontSize: 14 }}>🔄 권한 초기화</Text>
      </Pressable> */}
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
});
