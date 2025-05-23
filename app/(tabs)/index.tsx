// app/(tabs)/index.tsx
import { CARDS } from "@/constants/cards";
import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from "@react-native-cookies/cookies";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ensureValidToken from "../api/tokenManager";

const TAGS = ["Travel", "Foodie", "WorkOut", "Others"];

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"meetup" | "current">("meetup");
  // 기본 선택없음으로 변경
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [focusedCard, setFocusedCard] = useState<number>(1);

  useEffect(() => {
    (async () => {
      const token = await ensureValidToken();
      if (!token) {
        await AsyncStorage.multiRemove(["@jwt", "@refreshToken"]);
        await CookieManager.clearAll();
        router.replace("/auth/signIn");
      }
    })();
  }, []);

  const renderCard = ({ item }: { item: (typeof CARDS)[0] }) => {
    const isFocused = focusedCard === item.id;

    return (
      <Pressable
        style={[styles.card, isFocused && styles.cardFocused]}
        onPress={() =>
          setFocusedCard((prev) => (prev === item.id ? 0 : item.id))
        }
      >
        {/* 타이틀 */}
        <Text style={[styles.title, isFocused && styles.titleFocused]}>
          {item.title}
        </Text>

        {/* Open until */}
        <Text style={[styles.sub, isFocused && styles.subFocused]}>
          Open until {item.date}
        </Text>

        {/* Participants */}
        <Text
          style={[styles.participants, isFocused && styles.participantsFocused]}
        >
          Participants: {item.participants}
        </Text>

        {/* 버튼 */}
        <Pressable
          disabled={item.status === "closed"}
          onPress={() =>
            router.push({
              pathname: "/meetup/[id]",
              params: { id: item.id.toString() },
            })
          }
          style={[
            styles.btn,
            item.status === "closed"
              ? styles.btnClosed
              : isFocused
              ? styles.btnFocused
              : styles.btnDefault,
          ]}
        >
          <Text
            style={[
              styles.btnText,
              isFocused && styles.btnTextFocused,
              item.status === "closed" && styles.btnTextClosed,
            ]}
          >
            {item.status === "closed" ? "Closed" : "Register"}
          </Text>
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* 탭 */}
      <View style={styles.tabs}>
        {["Meet Ups", "Current"].map((label) => {
          const isMeetup = label === "Meet Ups";
          const isActive =
            (isMeetup && activeTab === "meetup") ||
            (!isMeetup && activeTab === "current");
          return (
            <Pressable
              key={label}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(isMeetup ? "meetup" : "current")}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 해시태그 */}
      {activeTab === "meetup" && (
        <View style={styles.tagList}>
          {TAGS.map((tag) => {
            const sel = selectedTag === tag;
            return (
              <Pressable
                key={tag}
                style={[styles.tag, sel && styles.tagSel]}
                onPress={() => setSelectedTag(sel ? null : tag)}
              >
                <Text style={[styles.tagText, sel && styles.tagTextSel]}>
                  #{tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* 카드 리스트 */}
      {activeTab === "meetup" ? (
        <FlatList
          data={CARDS.filter((c) => !selectedTag || c.tag === selectedTag)}
          renderItem={renderCard}
          keyExtractor={(i) => i.id.toString()}
          contentContainerStyle={styles.cardList}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            You're not in any chat rooms right now.
          </Text>
          <Text style={styles.emptyText}>Join a meet up to get started!</Text>
        </View>
      )}

      {/* 플로팅 버튼 */}
      {activeTab === "meetup" && (
        <Pressable
          style={styles.fab}
          onPress={() => router.push("/meetup/createMeetUp")}
        >
          <Ionicons name="pencil" size={32} color={colors.WHITE} />
        </Pressable>
      )}
    </View>
  );
}

const W = Dimensions.get("window").width;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.WHITE },

  /* 탭 */
  tabs: {
    flexDirection: "row",
    marginBottom: 8,
  },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabItemActive: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.BLACK,
  },
  tabText: { fontSize: 14, color: colors.GRAY_500 },
  tabTextActive: { color: colors.BLACK, fontWeight: "600" },

  /* 해시태그 */
  tagList: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
  },
  tag: {
    backgroundColor: colors.PURPLE_100,
    borderRadius: 10,
    height: 28,
    justifyContent: "center",
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  tagSel: { backgroundColor: colors.PURPLE_300 },
  tagText: { fontSize: 14, color: colors.PURPLE_300 },
  tagTextSel: { fontSize: 14, color: colors.WHITE },

  /* 카드 리스트 여백 */
  cardList: { padding: 16, paddingBottom: 120 },

  /* 카드 공통 */
  card: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  cardFocused: {
    backgroundColor: colors.PURPLE_300,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },

  /* 텍스트 간격 */
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.PURPLE_300,
    marginTop: 24,
    marginBottom: 2,
  },
  titleFocused: {
    color: colors.WHITE,
  },
  sub: {
    fontSize: 16,
    color: colors.BLACK,
    marginBottom: 12,
  },
  subFocused: {
    color: colors.WHITE,
  },
  participants: {
    fontSize: 14,
    color: colors.GRAY_600,
  },
  participantsFocused: {
    color: colors.WHITE,
  },

  /* 버튼 */
  btn: {
    alignSelf: "flex-end",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 80,
    alignItems: "center",
  },
  btnDefault: { backgroundColor: colors.PURPLE_300 },
  btnFocused: { backgroundColor: colors.YELLOW_500 },
  btnClosed: { backgroundColor: colors.GRAY_500 },
  btnText: { fontSize: 14, fontWeight: "600", color: colors.WHITE },
  btnTextFocused: { color: colors.PURPLE_300 },
  btnTextClosed: { color: colors.WHITE },

  /* 빈 상태 */
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    color: colors.GRAY_500,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },

  /* 플로팅 버튼*/
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: colors.PURPLE_300,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 0.5,
    elevation: 2,
  },
});
