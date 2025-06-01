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

const DEFAULT_IMAGE = require("@/assets/images/default_profile.png");

interface BlockedUser {
  id: number; // ✅ 삭제 요청에 사용될 PK
  blocked_user_id: number;
  nickname: string;
  created_at: string;
}

export default function BlockedUserScreen() {
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

        //console.log("🟣 차단 유저 응답:", response.data);
        setUsers(response.data);
      } catch (error) {
        console.error("❌ 차단 유저 불러오기 실패:", error);
      }
    };

    fetchBlockedUsers();
  }, []);

  const confirmUnblock = (id: number, name: string) => {
    //console.log("🧩 unblock 요청 보낼 ID:", id);

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

            const url = `/mypage/settings/block-user/${id}/`;
            //console.log("🧪 DELETE 요청 URL:", url);

            await api.delete(url, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            setUsers((prev) => prev.filter((user) => user.id !== id)); // ✅ id 기준으로 제거
          } catch (error) {
            console.error("❌ 차단 해제 실패:", error);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: BlockedUser }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <Image source={DEFAULT_IMAGE} style={styles.avatar} />
        <Text style={styles.name}>{item.nickname}</Text>
      </View>
      <TouchableOpacity
        onPress={() => confirmUnblock(item.id, item.nickname)} // ✅ blocked_user_id → id
      >
        <Ionicons name="close" size={24} color="#111" />
      </TouchableOpacity>
    </View>
  );

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
        keyExtractor={(item) => item.id.toString()} // ✅ id 기준으로 key 설정
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
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "500" },
});
