import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/color";
import { router } from "expo-router";
import { api } from "@/app/api/axios";
import EditNicknameModal from "@/components/EditNicknameModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import deleteAccount from "../api/deleteAccount";
import { countries } from "@/constants/country";
import * as ImagePicker from "expo-image-picker";
import eventEmitter from "@/utils/eventEmitter";
import logout from "../api/logout";
import { fetchUserInfo } from "../api/fetchUserInfo";

interface User {
  profileImageUrl: string;
  country: string;
  nickname: string;
}

const COMMUNITY_ITEMS = [
  { key: "restriction", label: "Restriction History", icon: "chevron-forward" },
  { key: "blocked", label: "Blocked User List", icon: "chevron-forward" },
  { key: "guidelines", label: "Community Guidelines", icon: "open-outline" },
];

const ACCOUNT_ITEMS = [
  { key: "logout", label: "Log Out" },
  { key: "delete", label: "Delete account" },
];

const SERVER_KEYS: Record<string, string> = {
  posts: "post_noti",
  comments: "comment_noti",
  meetups: "meetup_noti",
  chats: "chat_noti",
};

const NOTIFICATION_LABELS: Record<string, string> = {
  posts: "Posts",
  comments: "Comments",
  meetups: "Meetups",
  chats: "Meetup Chats",
};

export default function SettingsScreen() {
  const navigation = useNavigation();

  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [checkResult, setCheckResult] = useState<boolean | null>(null);
  const [switches, setSwitches] = useState<{
    posts: boolean;
    comments: boolean;
    meetups: boolean;
    chats: boolean;
  }>({
    posts: true,
    comments: true,
    meetups: true,
    chats: true,
  });

  const scrollRef = useRef<ScrollView>(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    const loadUserAndSettings = async () => {
      try {
        const token = await AsyncStorage.getItem("@jwt");
        if (!token) return;

        const data = await fetchUserInfo(token);
        if (data) {
          setUser({
            profileImageUrl: data.profile_image,
            country: data.nationality,
            nickname: data.nickname,
          });
        }

        const res = await api.get("/mypage/settings/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSwitches({
          posts: res.data.post_noti,
          comments: res.data.comment_noti,
          meetups: res.data.meetup_noti,
          chats: res.data.chat_noti,
        });
      } catch (error) {
        console.log("설정 불러오기 실패:", error);
      }
    };

    loadUserAndSettings();
  }, []);

  const countryData =
    user && user.country
      ? countries.find(
          (c) => c.name.toLowerCase() === user.country.toLowerCase()
        )
      : undefined;

  const onToggle = async (key: keyof typeof switches) => {
    const updated = { ...switches, [key]: !switches[key] };
    setSwitches(updated); // UI에서 즉시 반영

    try {
      const token = await AsyncStorage.getItem("@jwt");
      if (!token) return;

      await api.patch(
        "/mypage/settings/",
        { [SERVER_KEYS[key]]: updated[key] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("⚠️ 서버에 설정 변경 실패:", error);
    }
  };

  const handleCheckNickname = async () => {
    try {
      const token = await AsyncStorage.getItem("@jwt");
      if (!token) {
        console.warn("❌ JWT 토큰 없음 (로그인 필요)");
        return;
      }

      const res = await api.get(
        `/accounts/check-nickname/?nickname=${nickname}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCheckResult(res.data.available); // true or false
    } catch (error) {
      console.error("❌ 닉네임 중복 확인 실패:", error);
      setCheckResult(false);
    }
  };

  const handleSubmitNickname = async () => {
    try {
      await api.put("/accounts/set-nickname/", { nickname });
      setModalVisible(false);
      setUser((prev) => (prev ? { ...prev, nickname } : prev));
      eventEmitter.emit("nicknameChanged");
    } catch (error) {
      console.warn("닉네임 변경 실패", error);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await logout(); // 서버에 로그아웃 요청 (필요 시)
      await AsyncStorage.removeItem("@jwt"); // 토큰 삭제
      router.replace("/auth/signIn"); // 로그인 화면으로 이동
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // 계정 삭제 핸들러
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(); // 서버에 계정 삭제 요청
      await AsyncStorage.removeItem("@jwt"); // 토큰 삭제
      router.replace("/auth/signIn"); // 로그인 화면으로 이동
    } catch (error) {
      console.error("계정 삭제 실패:", error);
    }
  };

  // ✅ 최종 클라이언트용 업로드 코드 예시
  const pickImageAndUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      const token = await AsyncStorage.getItem("@jwt");
      if (!token) return;

      const formData = new FormData();
      formData.append("profile_image_changed", {
        uri: selectedAsset.uri,
        name: "profile.jpg",
        type: "image/jpeg",
      } as any);

      try {
        const res = await fetch(
          "https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app/accounts/user/info/image-update/",
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              // Content-Type 생략 (자동 설정됨)
            },
            body: formData,
          }
        );

        if (!res.ok) throw new Error("Upload failed");
        setUser((prev) =>
          prev ? { ...prev, profileImageUrl: selectedAsset.uri } : prev
        );
      } catch (err) {
        console.error("❌ 프로필 사진 업로드 실패:", err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
                user?.profileImageUrl
                  ? { uri: user.profileImageUrl }
                  : require("@/assets/images/default_profile.png")
              }
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.avatarOverlay}
              onPress={async () => await pickImageAndUpload()}
            >
              <Ionicons name="camera-outline" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.nameWrapper}>
            <Text style={styles.flag}>{countryData?.emoji || "🌐"}</Text>
            <Text style={styles.name}>{user?.nickname || "User"}</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
                setNickname("");
                setCheckResult(null);
              }}
            >
              <Ionicons
                name="pencil"
                size={18}
                color="#8B8B94"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
            <EditNicknameModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              nickname={nickname}
              onChangeNickname={(text) => {
                setNickname(text);
                setCheckResult(null);
              }}
              onCheckNickname={handleCheckNickname}
              onSubmit={handleSubmitNickname}
              checkResult={checkResult}
            />
          </View>
        </View>
        <View style={styles.divider} />

        {/* Community */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community</Text>
          {COMMUNITY_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.row}
              onPress={() => {
                if (item.key === "restriction") {
                  router.push("/setting/restriction");
                } else if (item.key === "blocked") {
                  router.push("/setting/blocked");
                }
              }}
            >
              <Text style={styles.rowText}>{item.label}</Text>
              <Ionicons name={item.icon as any} size={20} color="#8B8B94" />
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.divider} />

        {/* Notification */}
        {switches ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>
            {(Object.keys(switches) as (keyof typeof switches)[]).map((key) => (
              <View key={key} style={styles.row}>
                <Text style={styles.rowText}>{NOTIFICATION_LABELS[key]}</Text>
                <Switch
                  value={switches[key]}
                  onValueChange={() => onToggle(key)}
                  trackColor={{ true: colors.PURPLE_300 }}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>
            <Text style={{ color: "#999", paddingVertical: 12 }}>
              Loading settings...
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {ACCOUNT_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.row}
              onPress={() => {
                if (item.key === "logout") setLogoutModalVisible(true);
                else if (item.key === "delete") setDeleteModalVisible(true);
              }}
            >
              <Text style={styles.rowText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.divider} />

        {/* Feedback */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push("/setting/feedback")}
          >
            <Text style={styles.sectionTitle}>Feedback</Text>
            <Ionicons name="chevron-forward" size={20} color="#B8B8B8" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 로그아웃 확인 모달 */}
      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>See you next time! 👋</Text>
            <Text style={styles.modalText}>
              You'll be logged out,{"\n"}but we'll be here for you.
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={handleLogout}
              >
                <Text style={styles.modalConfirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 계정 삭제 확인 모달 */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Leaving SWAY? 😢</Text>
            <Text style={styles.modalText}>
              All your data will be deleted.{"\n"}Are you sure you want to go?
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.modalConfirmText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.WHITE },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#eee" },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 10,
  },
  avatarWrapper: { position: "relative" },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  nameWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  flag: { fontSize: 40 },
  name: { fontSize: 24, fontWeight: "500", marginLeft: 8 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.BLACK,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowText: { fontSize: 14 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalCancel: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    alignItems: "center",
  },
  modalConfirm: {
    flex: 1,
    padding: 12,
    backgroundColor: "#6F4AE2", // SWAY 보라색
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#333",
    fontWeight: "600",
  },
  modalConfirmText: {
    color: "white",
    fontWeight: "600",
  },
});
