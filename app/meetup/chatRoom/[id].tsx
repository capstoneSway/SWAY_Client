import useChatSocket from "@/app/api/chatSocket";
import fetchUserInfo from "@/app/api/fetchUserInfo";
import { leaveChatRoom } from "@/app/api/leaveChatLightning";
import { uploadImage } from "@/app/api/uploadImage";
import ChatInput from "@/components/chatBottomCTA";
import { colors } from "@/constants/color";
import { countries } from "@/constants/country";
import formatKSTDate from "@/utils/formatKSTDate";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
  sender: {
    nickname: string;
    profile_image: string | null;
    national_code: string | null;
    nationality: string | null;
  };
  message: string;
  picture: string | null;
  picture_url: string | null;
  created_at: string;
  image_url: string | null;
};

export default function ChatRoom() {
  const [isNearBottom, setIsNearBottom] = useState(true);
  const scrollOffset = useRef(0);

  function getFlagByCode(code?: string | null) {
    return countries.find((c) => c.code === code)?.flag;
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    scrollOffset.current = offsetY;
    const threshold = 50;
    const isBottom = contentHeight - layoutHeight - offsetY < threshold;
    setIsNearBottom(isBottom);
  }

  const { id, joined } = useLocalSearchParams<{
    id?: string;
    joined?: string;
  }>();

  const numericId = Number(id);
  const [meetup, setMeetup] = useState<any>(null);
  const router = useRouter();

  const scrollRef = useRef<ScrollView>(null);
  const [chatText, setChatText] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const { messages, sendMessage, isLoading } = useChatSocket(numericId);
  const [joinTime, setJoinTime] = useState<Date | null>(null);

  useEffect(() => {
    if (joined === "true") {
      const now = new Date();
      console.log(
        "🟣 새로 참가한 유저입니다. joinTime 설정:",
        now.toLocaleString()
      );
      setJoinTime(now);
    } else {
      console.log("🟢 기존 참가자입니다. 모든 메시지를 표시합니다.");
    }
  }, [joined]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("@jwt");
      if (!token) return;
      const me = await fetchUserInfo(token);
      if (me) setCurrentUser(me.nickname);
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
        console.log("API 응답:", res.data);

        const created = new Date(res.data.created_at).getTime(); // 로컬 기준 Date
        const now = Date.now();
        const remainingMs = 24 * 60 * 60 * 1000 - (now - created);
        const initialSeconds = Math.max(Math.floor(remainingMs / 1000), 0);

        console.log("생성 시간 (로컬):", new Date(created).toLocaleString());
        console.log("남은 시간 (초):", initialSeconds);

        setMeetup(res.data);
        setRemainingSeconds(initialSeconds);
      } catch (e) {
        console.error("모임 정보 불러오기 실패", e);
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
    const isPrevSame = prev?.sender?.nickname === current.sender?.nickname;

    const isNextSame = next?.sender?.nickname === current.sender?.nickname;
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
                            onPress: async () => {
                              try {
                                await leaveChatRoom(numericId);
                                router.replace("/(tabs)?tab=current");
                              } catch (err: any) {
                                const message =
                                  err.response?.data?.detail ===
                                  "호스트는 모임에서 나갈 수 없습니다."
                                    ? "You are the host of this meet-up and cannot leave it."
                                    : "Failed to leave the chat room. Please try again.";
                                Alert.alert("Error", message);
                              }
                            },
                          },
                        ],
                        { cancelable: true }
                      )
                    }
                    style={{ marginRight: 8 }}
                  >
                    <Image
                      source={require("@/assets/images/fire-exit.png")}
                      style={{ width: 26, height: 26 }}
                    />
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
          <Text style={styles.noticeTitle}>
            채팅방 정보를 찾을 수 없습니다. (id: {id})
          </Text>
        </View>
      ) : isLoading ? ( // 로딩 중인 경우
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={colors.PURPLE_300} />
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
            {/* 현재 시간 표시 */}
            <Text style={styles.date}>
              {formatKSTDate(new Date().toISOString())}
            </Text>

            {/* 안내 문구 */}
            <View style={styles.notice}>
              <Text style={styles.noticeTitle}>{"<Chat Room Guidelines>"}</Text>
              <Text style={styles.noticeContent}>
                {
                  "Welcome to your MeetUp chat room. You can connect and share messages with other members for 24 hours from the moment the MeetUp was created. After this period, the chat room will switch to read-only mode for your reference. Please be mindful and respectful in your conversations to help keep the community safe and enjoyable for everyone."
                }
              </Text>
            </View>
            <View style={styles.chatArea}>
              {messages
                .filter(
                  (msg) => !joinTime || new Date(msg.created_at) >= joinTime
                )
                .map((msg, index) => {
                  const bubbleType = getBubbleType(index);
                  const isMine = msg.sender?.nickname === currentUser;
                  const showProfile =
                    !isMine &&
                    (bubbleType === "single" || bubbleType === "top");
                  const isFirstOfGroup =
                    !isMine &&
                    (bubbleType === "top" || bubbleType === "single");

                  // console.log("👤 currentUser =", currentUser);
                  // console.log("👤 sender.nickname =", msg.sender?.nickname);
                  // console.log(
                  //   "🟢 isMine =",
                  //   msg.sender?.nickname === currentUser
                  // );

                  const imageUrl = msg.picture_url || msg.image_url;
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
                            <>
                              <Image
                                source={
                                  msg.sender?.profile_image
                                    ? { uri: msg.sender.profile_image }
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
                              {msg.sender?.national_code && (
                                <Image
                                  source={getFlagByCode(
                                    msg.sender.national_code
                                  )}
                                  style={{
                                    width: 15,
                                    height: 15,
                                    borderRadius: 7.5,
                                    position: "absolute",
                                    bottom: 0,
                                    right: 0,
                                    borderWidth: 0.5,
                                    borderColor: "white",
                                  }}
                                  resizeMode="contain"
                                />
                              )}
                            </>
                          ) : null}
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        {isFirstOfGroup && (
                          <Text style={[styles.sender, { marginBottom: 4 }]}>
                            {msg.sender?.nickname || ""}
                          </Text>
                        )}

                        <View
                          style={[
                            styles.bubble,
                            {
                              alignSelf: isMine ? "flex-end" : "flex-start",
                              backgroundColor: imageUrl
                                ? "transparent"
                                : isMine
                                ? colors.PURPLE_300
                                : colors.PURPLE_100,
                              marginTop: 2,
                              padding: imageUrl ? 0 : 6,
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
                          {imageUrl ? (
                            <Pressable
                              onPress={() =>
                                router.push({
                                  pathname: "/viewer/imageFullView",
                                  params: { src: encodeURIComponent(imageUrl) },
                                })
                              }
                            >
                              <Image
                                source={{ uri: imageUrl }}
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
                            </Pressable>
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
                sendMessage(text, null, currentUser);
                setChatText("");
              }}
              onImagePicked={async (uri) => {
                if (!uri) return;

                const uploadedUrl = await uploadImage(numericId, uri);
                if (!uploadedUrl) return;
                sendMessage("", uploadedUrl, currentUser);
              }}
              disabled={remainingSeconds <= 0}
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
  noticeTitle: {
    color: colors.GRAY_600,
    textAlign: "center",
    fontSize: 14,
  },

  noticeContent: {
    color: colors.GRAY_600,
    textAlign: "left",
    fontSize: 12,
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
