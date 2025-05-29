// ✅ 실시간 채팅으로 대체한 ChatRoom.tsx
// ❗️하드코딩된 UI 코드 절대 수정하지 않음

import useChatSocket from "@/app/api/chatSocket";
import fetchUserInfo from "@/app/api/fetchUserInfo";
import ChatInput from "@/components/chatBottomCTA";
import { colors } from "@/constants/color";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const defaultProfile = require("@/assets/images/default_profile.png");

export type ChatMessage = {
  id: number;
  room: number;
  sender_info: {
    nickname: string;
    profile_image: string | null;
  };
  message: string;
  picture: string | null;
  picture_url: string | null;
  created_at: string;
};

export default function ChatRoom() {
  const [isNearBottom, setIsNearBottom] = useState(true);
  const scrollOffset = useRef(0);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    scrollOffset.current = offsetY;
    const threshold = 50;
    const isBottom = contentHeight - layoutHeight - offsetY < threshold;
    setIsNearBottom(isBottom);
  }

  const { id } = useLocalSearchParams<{ id?: string }>();
  const numericId = Number(id);
  const [meetup, setMeetup] = useState<any>(null);
  const router = useRouter();

  const scrollRef = useRef<ScrollView>(null);
  const [chatText, setChatText] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const { messages, sendMessage } = useChatSocket(numericId);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("@jwt");
      if (!token) return;
      const me = await fetchUserInfo(token);
      if (me) setCurrentUser(me.username);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await axios.get(
          `https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app/lightning/${id}/`
        );
        console.log("✅ API 응답:", res.data);

        const created = new Date(res.data.created_at).getTime(); // 로컬 기준 Date
        const now = Date.now();
        const remainingMs = 24 * 60 * 60 * 1000 - (now - created);
        const initialSeconds = Math.max(Math.floor(remainingMs / 1000), 0);

        console.log("✅ 생성 시간 (로컬):", new Date(created).toLocaleString());
        console.log("⏳ 남은 시간 (초):", initialSeconds);

        setMeetup(res.data);
        setRemainingSeconds(initialSeconds);
      } catch (e) {
        console.error("❌ 모임 정보 불러오기 실패", e);
      }
    })();
  }, [id]);

  // 째깍째깍
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      if (isNearBottom) scrollRef.current?.scrollToEnd({ animated: true });
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      if (isNearBottom) scrollRef.current?.scrollToEnd({ animated: true });
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [isNearBottom]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  function formatTime(seconds: number) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  function getBubbleType(
    index: number
  ): "single" | "top" | "middle" | "bottom" {
    const current = messages[index];
    const prev = messages[index - 1];
    const next = messages[index + 1];
    const isPrevSame =
      prev?.sender_info?.nickname === current.sender_info?.nickname;

    const isNextSame =
      next?.sender_info?.nickname === current.sender_info?.nickname;
    if (!isPrevSame && !isNextSame) return "single";
    if (!isPrevSame && isNextSame) return "top";
    if (isPrevSame && isNextSame) return "middle";
    return "bottom";
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <SafeAreaView edges={["top"]} style={{ backgroundColor: "white" }}>
              <StatusBar barStyle="dark-content" backgroundColor="white" />
              <View style={styles.header}>
                <Pressable
                  onPress={() => router.replace("/(tabs)?tab=current")}
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={colors.BLACK}
                    style={{ marginLeft: 2 }}
                  />
                </Pressable>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {(meetup && meetup.title) || "Chat Room"}
                </Text>

                <View style={styles.rightSection}>
                  <View style={styles.timerContainer}>
                    <FontAwesome5
                      name="history"
                      size={14}
                      color={colors.YELLOW_500}
                      style={{ marginRight: 2 }}
                    />
                    <Text style={styles.timerText}>
                      {formatTime(remainingSeconds)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Leave the meet-up?",
                        "You'll also exit the chat room permanently. Are you sure?",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Exit",
                            style: "destructive",
                            onPress: () => router.back(),
                          },
                        ],
                        { cancelable: true }
                      )
                    }
                    style={{ marginRight: 8 }}
                  >
                    <Image source={require("@/assets/images/fire-exit.png")} />
                  </Pressable>
                </View>
              </View>
            </SafeAreaView>
          ),
        }}
      />

      {/* ⚠️ 조건에 따라 콘텐츠 분기 */}
      {!id || isNaN(numericId) || !meetup ? (
        <View style={styles.container}>
          <Text style={styles.noticeText}>
            채팅방 정보를 찾을 수 없습니다. (id: {id})
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.container}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 16,
              paddingHorizontal: 0,
            }}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            overScrollMode="never"
            onScroll={handleScroll}
          >
            <View style={styles.chatArea}>
              {messages.map((msg, index) => {
                const bubbleType = getBubbleType(index);
                const isMine = msg.sender_info?.nickname === currentUser;
                const showProfile =
                  !isMine && (bubbleType === "single" || bubbleType === "top");
                const isFirstOfGroup =
                  !isMine && (bubbleType === "top" || bubbleType === "single");

                return (
                  <View
                    key={`${msg.id}-${index}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: 4,
                      marginLeft: isMine ? "auto" : -24,
                      paddingLeft: 8,
                    }}
                  >
                    {!isMine && (
                      <View
                        style={{
                          width: 32,
                          marginRight: 8,
                          position: "relative",
                        }}
                      >
                        {isFirstOfGroup ? (
                          <Image
                            source={
                              msg.sender_info?.profile_image
                                ? { uri: msg.sender_info.profile_image }
                                : defaultProfile
                            }
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              borderWidth: 0.1,
                              overflow: "hidden",
                              resizeMode: "contain",
                            }}
                          />
                        ) : null}
                      </View>
                    )}

                    <View style={{ flex: 1 }}>
                      {isFirstOfGroup && (
                        <Text style={[styles.sender, { marginBottom: 4 }]}>
                          {msg.sender_info?.nickname || ""}
                        </Text>
                      )}

                      <View
                        style={[
                          styles.bubble,
                          {
                            alignSelf: isMine ? "flex-end" : "flex-start",
                            backgroundColor: msg.picture_url
                              ? "transparent"
                              : isMine
                              ? colors.PURPLE_300
                              : colors.PURPLE_100,
                            marginTop: 2,
                            padding: msg.picture_url ? 0 : 6,
                          },
                          isMine && { borderRadius: 18 },
                          !isMine &&
                            (bubbleType === "top" ||
                              bubbleType === "middle" ||
                              bubbleType === "single") && {
                              borderTopLeftRadius: 0,
                              borderTopRightRadius: 18,
                              borderBottomLeftRadius: 0,
                              borderBottomRightRadius: 18,
                            },
                          !isMine &&
                            bubbleType === "bottom" && {
                              borderTopLeftRadius: 0,
                              borderTopRightRadius: 18,
                              borderBottomLeftRadius: 18,
                              borderBottomRightRadius: 18,
                            },
                        ]}
                      >
                        {msg.picture_url ? (
                          <Image
                            source={{ uri: msg.picture_url }}
                            style={{
                              marginRight: -12,
                              width: 180,
                              height: 180,
                              borderRadius: 12,
                              resizeMode: "cover",
                              marginTop: -6,
                              marginBottom: -5,
                            }}
                          />
                        ) : (
                          <Text
                            style={{
                              textAlign: "left",
                              color: isMine ? colors.WHITE : colors.BLACK,
                              lineHeight: 20,
                            }}
                          >
                            {msg.message}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <View style={{ paddingHorizontal: 16, paddingRight: 14 }}>
            <ChatInput
              value={chatText}
              onChangeText={setChatText}
              onSend={(text) => {
                if (text.trim() === "") return;
                sendMessage(text, null);
                setChatText("");
              }}
              onImagePicked={(uri) => {
                sendMessage("", uri);
              }}
            />
          </View>
        </KeyboardAvoidingView>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.YELLOW_500,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    marginRight: 12,
  },
  timerText: {
    color: colors.YELLOW_500,
    fontWeight: "600",
    fontSize: 14,
    width: 80,
    textAlign: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 36,
    paddingTop: 16,
    position: "relative",
  },
  date: {
    alignSelf: "center",
    color: "#999",
    marginBottom: 8,
    fontSize: 12,
  },
  notice: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 100,
    maxHeight: 200,
  },
  noticeText: {
    color: "#888",
    textAlign: "center",
    fontSize: 14,
  },
  sender: {
    fontWeight: "600",
    marginBottom: 4,
  },
  chatArea: {
    flex: 1,
    marginBottom: 80,
  },
  bubble: {
    backgroundColor: "#f1e9fd",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginVertical: 2,
    minHeight: 30,
    maxHeight: undefined,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
});
