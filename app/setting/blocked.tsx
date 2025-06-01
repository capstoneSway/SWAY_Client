import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/axios";
import { countries } from "@/constants/country";

const DEFAULT_IMAGE = require("@/assets/images/default_profile.png");

interface BlockedUser {
  id: number;
  blocked_user_id: number;
  nickname: string;
  created_at: string;
  image_url: string;
  nationality?: string;
}

export default function BlockedUserListScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState<BlockedUser[]>([]);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("@jwt");
        if (!token) {
          console.warn("❌ JWT 토큰 없음 (로그인 필요)");
          return;
        }

        const response = await api.get("/mypage/settings/block-user/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data);
      } catch (error) {
        console.error("❌ 차단 유저 불러오기 실패:", error);
      }
    };

    fetchBlockedUsers();
  }, []);

  const confirmUnblock = (id: number, name: string) => {
    Alert.alert("Unblock User", `Do you really want to unblock ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unblock",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("@jwt");
            if (!token) {
              console.warn("❌ JWT 토큰 없음");
              return;
            }

            await api.delete(`/mypage/settings/block-user/${id}/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            setUsers((prev) => prev.filter((user) => user.id !== id));
          } catch (error) {
            console.error("❌ 차단 해제 실패:", error);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: BlockedUser }) => {
    const profileImage = item.image_url
      ? { uri: item.image_url }
      : DEFAULT_IMAGE;

    // ✅ 국가 이름으로 국기 이미지 찾기
    const matchedCountry = countries.find((c) => c.name === item.nationality);
    const flagImage = matchedCountry?.flag;

    return (
      <View style={styles.userRow}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image source={profileImage} style={styles.avatar} />
            {flagImage && <Image source={flagImage} style={styles.flag} />}
          </View>
          <Text style={styles.name}>{item.nickname}</Text>
        </View>
        <TouchableOpacity
          onPress={() => confirmUnblock(item.id, item.nickname)}
        >
          <Ionicons name="close" size={24} color="#111" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked User List</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  flag: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fff",
  },
  name: { fontSize: 16, fontWeight: "500" },
});
