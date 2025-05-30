import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReactNode, useEffect, useRef, useState } from "react";

const BASE_URL =
  "https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app";

export type ChatMessage = {
  sender_email: any;
  nickname: ReactNode;
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

export default function useChatSocket(lightningId: string | number) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  const fetchInitialMessages = async (roomId: number, token: string) => {
    console.log("메시지 가져오기 시작: ", { roomId, token });
    try {
      const res = await fetch(`${BASE_URL}/livechat/messages/${roomId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("메시지 fetch 응답 상태:", res.status);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();

      const normalized = data.map((msg: any) => ({
        ...msg,
        sender: msg.sender ?? msg.sender_info, // 삽질. 백엔드가 기존 채팅방의 메시지는 sender_info로 보내주는데 실시간 웹소켓 메시지는 sender. 걍 내가 고침.
      }));

      console.log("초기 메시지:", data);
      setMessages(normalized);
    } catch (err) {
      console.error("초기 메시지 로딩 실패:", err);
    }
  };

  useEffect(() => {
    if (!lightningId) return;

    const connect = async () => {
      console.log("useChatSocket 시작: lightningId =", lightningId);

      const token = await AsyncStorage.getItem("@jwt");
      if (!token) {
        console.error("JWT not found");
        return;
      }
      console.log("JWT token:", token);

      const roomId =
        typeof lightningId === "string"
          ? parseInt(lightningId, 10)
          : lightningId;
      if (isNaN(roomId)) {
        console.error("Invalid lightningId");
        return;
      }
      console.log("연결 대상 roomId:", roomId);

      await fetchInitialMessages(roomId, token);

      const wsURL = `wss://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app/ws/chat/${roomId}/?token=${token}`;
      console.log("WebSocket 연결 시도:", wsURL);

      const ws = new WebSocket(wsURL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnected(true);
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);

          if (!data.sender || !data.sender.nickname) {
            console.warn("⚠️ sender.nickname 없음 → 메시지 무시됨:", data);
            return;
          }
          const normalized = {
            ...data,
            picture_url: data.picture_url ?? null,
          };

          setMessages((prev) => [...prev, normalized]);
        } catch (err) {
          console.error("❌ 메시지 파싱 오류", err);
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket error:", e);
      };

      ws.onclose = (e) => {
        console.log("WebSocket closed:", e.code, e.reason);
        setConnected(false);
      };
    };

    connect();

    return () => {
      console.log("useChatSocket cleanup: 연결 종료");
      wsRef.current?.close();
    };
  }, [lightningId]);

  const sendMessage = (
    message: string,
    image_url?: string,
    nickname?: string
  ) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload: any = {};
      if (message && message.trim()) payload.message = message;
      if (image_url) payload.image_url = image_url;
      if (nickname) {
        payload.sender = { nickname };
      }
      console.log("메시지 전송:", payload);
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.warn("⚠️ WebSocket not ready");
    }
  };

  return {
    messages,
    sendMessage,
    connected,
  };
}
