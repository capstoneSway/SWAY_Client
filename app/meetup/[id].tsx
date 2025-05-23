import FixedBottomCTA from "@/components/FixedBottomCTA";
import { CARDS } from "@/constants/cards";
import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MeetUpDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const meetup = CARDS.find((card) => card.id === Number(id));

  if (!meetup) {
    return (
      <View style={styles.container}>
        <Text>해당 모임을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const handleJoin = () => {
    if (meetup.status === "closed") {
      Alert.alert("모임이 마감되었습니다", "죄송해요. 방금 마감되었어요.");
      return;
    }

    router.push({
      pathname: "/meetup/chatRoom/[id]",
      params: { id: meetup.id.toString() },
    });

    console.log("▶️ 받은 id:", id);
    console.log("▶️ Number(id):", Number(id));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Meet Up",
          headerTintColor: colors.BLACK,
          headerBackButtonDisplayMode: "minimal",
          headerBackTitle: "",
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable onPress={() => {}} style={{ paddingHorizontal: 16 }}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.BLACK}
              />
            </Pressable>
          ),
        }}
      />

      <View style={styles.container}>
        {/* ─── 배너 이미지 ─── */}
        <Image source={{ uri: meetup.image }} style={styles.image} />

        {/* ─── 본문 ─── */}
        <View style={styles.content}>
          <Text style={styles.title}>{meetup.title}</Text>

          <Text style={styles.tags}>#{meetup.tag}</Text>
          <Text style={styles.description}>Open until {meetup.date}</Text>

          <Text style={styles.participants}>{meetup.participants}</Text>

          <View style={styles.openUntilRow}>
            <Ionicons name="time-outline" size={16} color={colors.BLACK} />
            <Text style={styles.openUntilText}>{meetup.date}</Text>
          </View>
        </View>

        {/* ─── 하단 CTA ─── */}
        {meetup.status !== "closed" && (
          <FixedBottomCTA label="Join" enabled={true} onPress={handleJoin} />
        )}
      </View>
    </>
  );
}

const W = Dimensions.get("window").width;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.WHITE },

  image: { width: W, height: W * 0.6, backgroundColor: colors.GRAY_200 },

  content: {
    padding: 16,
    paddingBottom: 80,
  },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  participants: { fontSize: 14, color: colors.GRAY_600, marginBottom: 8 },
  tags: { fontSize: 14, color: colors.PURPLE_300, marginBottom: 8 },
  description: { fontSize: 14, color: colors.GRAY_600, marginBottom: 12 },

  openUntilRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  openUntilText: {
    fontSize: 14,
    color: colors.BLACK,
    marginLeft: 4,
  },
});
