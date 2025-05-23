import ChatInput from "@/components/chatBottomCTA";
import { CARDS } from "@/constants/cards";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ChatRoom() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const numericId = Number(id);
  const meetup = CARDS.find((card) => card.id === numericId);

  // ✅ 입력 상태 관리
  const [chatText, setChatText] = useState("");

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
          title: meetup.title,
          headerBackButtonDisplayMode: "minimal",
          headerBackTitle: "",
          headerTitleAlign: "center",
        }}
      />

      <View style={styles.container}>
        <Text style={styles.date}>{meetup.date}</Text>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>{"<채팅방 안내사항>"}</Text>
        </View>

        <View style={styles.chatArea}>
          <Text style={styles.sender}>Eva</Text>
          <View style={styles.bubble}>
            <Text>Sample</Text>
          </View>
          <View style={styles.bubble}>
            <Text>It's sample text</Text>
          </View>
        </View>

        {/* ✅ ChatInput 상태 주입 */}
        <ChatInput
          value={chatText}
          onChangeText={setChatText}
          onSend={(text) => {
            console.log("보낸 메시지:", text);
            setChatText(""); // 전송 후 초기화
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
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
