import fetchAllNotifications from "@/app/api/notification/fetchAllNotifications";
import readNotification from "@/app/api/notification/readNotification";
import { colors } from "@/constants/color";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

/**
 * 알림 타입별 레이블 정의 (API type 필드값과 일치시켜야 함)
 * - board: 게시글 관련 알림
 * - 번개모임: 번개(모임) 관련 알림
 * - comment: 댓글 알림 (확장용)
 * - chat: 채팅 알림 (확장용)
 * --> 일단 작성 시점 백엔드에서 받아온 배열의 필드입니다. 데이터 필드가 번개모임은 진짜 번개모임 그대로여서..
 */
const NOTI_TYPE_LABEL = {
  board: "Comment",
  번개모임: "Meetup",
  chat: "Chat",
  댓글: "Comment",
};

//

/**
 * Notification 타입 정의 (서버 응답 JSON 구조에 맞췄습니다.)
 */
type Notification = {
  id: number; // 알림의 고유 ID라고 생각됩니다.
  type: keyof typeof NOTI_TYPE_LABEL; // 알림 종류 -> 위에 정의한 키입니다. 보드 번개모임 코멘트 챗..
  title?: string; // (옵션) 제목 - 예지님 담당입니다. 논의에 따라 message에서 파싱하거나 친절을 바라거나...
  message: string;
  is_read: boolean; // 읽음 여부 -> 읽음 표시 칩도 백엔드 명세서 보고 만들어는 놓았는데, 그냥 밀어서 읽음 처리 api 발생시키고 플랫리스트에서 삭제하는 구조가 그려집니다.
  created_at?: string; // 생성일
};

/**
 * 알림 목록을 FlatList로 표시하는 모듈형 컴포넌트
 * - fetchAllNotifications: 전체 알림 불러오기
 * - readNotification: 개별 알림 읽음 처리
 * - 상기한 두 개만 일단 반영해 놓았습니다. noti 전체 명세서를 확인할 필요가 있습니다.
 */

function cleanMessage(msg: string): string {
  return msg.replace(/\s?\([^)]+\)/g, ""); // 괄호와 그 안의 내용 제거
}

export default function NotificationList() {
  // 알림 데이터 배열 State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // 로딩 상태 표시 State -> 인디케이터
  const [loading, setLoading] = useState(true);

  /**
   * 알림 목록 불러오기 (최신순)
   * - API 호출 후 notifications state에 저장입니다.
   */
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const list = await fetchAllNotifications();
      // undefined/null 대응 -> 실제로는 나올 일 없습니다.
      setNotifications(list ?? []);
    } finally {
      setLoading(false);
    }
  };

  function formatKST(utcStr?: string) {
    if (!utcStr) return "";
    const date = new Date(utcStr);
    if (isNaN(date.getTime())) return utcStr;
    // 예시: 2025. 6. 5. 20:38
    return date
      .toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/,\s?/, " ") // 혹시나 쉼표 들어가면 한 번 치환
      .trim();
  }

  // 1. 화면 진입/포커스될 때마다 알림 갱신으로 기본 입니다.
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  // 2. 밀어 당겨서 수동 새로고침입니다. 알림에 굳이? 싶으면 제거할 수도 있겠져..
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  /**
   * 알림 읽음 처리
   * - 서버에 읽음 요청 → 목록 다시 불러옵니다.
   */
  const handleRead = async (id: number) => {
    await readNotification(id);
    loadNotifications();
  };

  /**
   * FlatList의 각 아이템 렌더 함수
   * - type 라벨(Pill), message, 시간, 읽음 버튼(안 읽었을 때만) 표시
   * - 읽은 알림 연회색 배경, 안 읽은 알림 하얀색 배경인데, 밀어서 아예 지워버리는 걸로 확정하면 고쳐야 됩니다.
   */
  const renderItem = ({ item }: { item: Notification }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: item.is_read ? colors.GRAY_100 : colors.WHITE },
      ]}
    >
      {/* 첫 줄: 유형 라벨(Pill) + (옵션) 제목 */}
      <View style={styles.row}>
        <View style={styles.typeChip}>
          <Text style={styles.typeChipText}>
            {/* 타입에 없는 값이 들어오면 "알림" */}
            {NOTI_TYPE_LABEL[item.type] || "알림"}
          </Text>
        </View>
        {/* title 필드는 거의 안 쓰이나, 확장시 대비 */}
        {item.title && (
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        )}
      </View>
      {/* 둘째 줄: message 본문 */}
      <Text style={styles.message} numberOfLines={3}>
        {cleanMessage(item.message)}
      </Text>
      {/* 하단: 생성일(시간) + 읽음 버튼 */}
      <View style={styles.bottomRow}>
        {/* 시간 문자열: '2025-06-04 15:39' 형태로 포매팅해둿어요. 제가볼땐 제일 직관적이라서. 근데 번개랑 맞춘다면 utils에 formatDataTime으로 갈아치울 수 있겠져? */}
        <Text style={styles.timeText}>{formatKST(item.created_at)}</Text>

        {/* 안 읽은 알림만 읽음 버튼 표시 */}
        {!item.is_read && (
          <Pressable style={styles.readBtn} onPress={() => handleRead(item.id)}>
            <Text style={styles.readBtnText}>읽음</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  // 로딩 중이면 ActivityIndicator 표시 아까 setLoading 상태함수입니다
  if (loading) {
    return (
      <ActivityIndicator
        style={{ marginTop: 80 }}
        size="large"
        color={colors.PURPLE_300}
      />
    );
  }

  // 알림 목록 FlatList 렌더링
  return (
    <FlatList
      data={notifications} // 알림 데이터
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()} // 각 알림의 고유 id 사용
      ItemSeparatorComponent={() => <View style={styles.separator} />} // 카드 사이 구분선
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      ListEmptyComponent={
        // 알림 없을 때 안내 메시지
        <Text
          style={{
            color: colors.GRAY_500,
            textAlign: "center",
            marginTop: 32,
          }}
        >
          You have no notifications at the moment.
        </Text>
      }
    />
  );
}

/**
 * - typeChip: 유형 라벨
 * - card: 알림 카드(읽음/안읽음 색상)
 * - message: 본문(짧게 잘림)
 * - bottomRow: 시간 + 읽음 버튼 정렬
 */
const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 14,
    marginVertical: 2,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  typeChip: {
    backgroundColor: colors.PURPLE_100,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginRight: 8,
  },
  typeChipText: {
    color: colors.PURPLE_300,
    fontWeight: "700",
    fontSize: 13,
  },
  title: {
    color: colors.BLACK,
    fontWeight: "bold",
    fontSize: 15,
    flexShrink: 1,
    maxWidth: "78%",
  },
  message: {
    color: colors.GRAY_700,
    fontSize: 14,
    marginTop: 1,
    marginBottom: 2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "space-between",
  },
  timeText: {
    color: colors.GRAY_500,
    fontSize: 11,
  },
  readBtn: {
    backgroundColor: colors.PURPLE_100,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginLeft: 12,
  },
  readBtnText: {
    color: colors.PURPLE_300,
    fontWeight: "bold",
    fontSize: 13,
  },
  separator: {
    height: 1,
    backgroundColor: colors.GRAY_200,
    marginVertical: 2,
    marginLeft: 8,
    marginRight: 8,
  },
});
