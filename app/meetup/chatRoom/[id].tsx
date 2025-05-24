import ChatInput from "@/components/chatBottomCTA";
import { CARDS } from "@/constants/cards";
import { colors } from "@/constants/color";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 메시지 타입 선언 어차피 빼둘 것.
type Message = {
  id: number;
  text: string;
  sender: string;
};

function formatKSTDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}

const currentUser = "Gildong"; // 하드코딩. 가져와야죠.

export default function ChatRoom() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const numericId = Number(id);
  const meetup = CARDS.find((card) => card.id === numericId);
  const router = useRouter();

  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Top", sender: "Eva" },
    { id: 2, text: "Middle", sender: "Eva" },
    { id: 3, text: "Bottom", sender: "Eva" },
    { id: 4, text: "Single", sender: "John" },
    { id: 5, text: "Single", sender: "Eva" },
    { id: 6, text: "나랏말싸미", sender: "Kate" },
    { id: 7, text: "듕귁에달아", sender: "Kate" },
    { id: 8, text: "문댜와로서로", sender: "Kate" },
    { id: 9, text: "사맛디아니홀쎄", sender: "Kate" },
    { id: 10, text: ";;", sender: "Gildong" },
    { id: 11, text: "술드심?", sender: "Gildong" },
  ]);

  const [remainingSeconds, setRemainingSeconds] = useState(24 * 60 * 60); // 24시간(초)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function formatTime(seconds: number) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  //  버블 타입 결정 함수
  function getBubbleType(
    index: number,
    messages: Message[]
  ): "single" | "top" | "middle" | "bottom" {
    const current = messages[index];
    const prev = messages[index - 1];
    const next = messages[index + 1];

    const isPrevSame = prev?.sender === current.sender;
    const isNextSame = next?.sender === current.sender;

    if (!isPrevSame && !isNextSame) return "single"; // 앞, 뒤가 불일치하면 단독 버블
    if (!isPrevSame && isNextSame) return "top"; // 앞 다르고 뒤 같으면 발화 시작 버블
    if (isPrevSame && isNextSame) return "middle"; // 앞 뒤 모두 같으면 중간 버블
    return "bottom"; // 아니면 끝 버블
  }

  if (!id || isNaN(numericId) || !meetup) {
    return (
      <View style={styles.container}>
        <Text style={styles.noticeText}>
          채팅방 정보를 찾을 수 없습니다. (id: {id})
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <SafeAreaView edges={["top"]} style={{ backgroundColor: "white" }}>
              <StatusBar barStyle="dark-content" backgroundColor="white" />
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{meetup.title}</Text>
                <View style={styles.rightSection}>
                  <View style={styles.timerContainer}>
                    <FontAwesome5
                      name="history"
                      size={16}
                      color={colors.YELLOW_500}
                    />
                    <Text style={styles.timerText}>
                      {formatTime(remainingSeconds)}
                    </Text>
                  </View>
                  <Pressable onPress={() => router.back()}>
                    <Ionicons name="close" size={20} color="#000" />
                  </Pressable>
                </View>
              </View>
            </SafeAreaView>
          ),
        }}
      />

      <View style={styles.container}>
        <Text style={styles.date}>{formatKSTDate(meetup.meetupTime)}</Text>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>{"<채팅방 안내사항>"}</Text>
          <Text style={styles.noticeText}>{"말하기 전에 생각했나요?"}</Text>
        </View>

        <View style={styles.chatArea}>
          {messages.map((msg, index) => {
            const bubbleType = getBubbleType(index, messages);
            const isMine = msg.sender === currentUser;
            const showSender =
              !isMine && (bubbleType === "single" || bubbleType === "top");

            return (
              <View key={msg.id} style={{ marginBottom: 2 }}>
                {showSender && <Text style={styles.sender}>{msg.sender}</Text>}

                <View
                  style={[
                    styles.bubble,
                    {
                      //  정렬 방향 (내 챗, 님 챗)
                      alignSelf: isMine ? "flex-end" : "flex-start",
                      backgroundColor: isMine
                        ? colors.PURPLE_300
                        : colors.PURPLE_100, // 색상 분기
                    },

                    // 버블 모양 결정
                    //  내 메시지면 무조건 둥글게
                    isMine && {
                      borderRadius: 18,
                    },

                    //  남 메시지면 bubbleType 기준 분기
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
                  <Text
                    style={{
                      textAlign: isMine ? "right" : "left",
                      color: isMine ? colors.WHITE : colors.BLACK,
                    }}
                  >
                    {msg.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <ChatInput
          value={chatText}
          onChangeText={setChatText}
          onSend={(text) => {
            if (text.trim() === "") return;
            const newMessage: Message = {
              id: messages.length + 1,
              text,
              sender: currentUser,
            };
            setMessages((prev) => [...prev, newMessage]);
            setChatText("");
          }}
        />
      </View>
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
    paddingBottom: 22,
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
    alignSelf: "flex-start",
  },
});
