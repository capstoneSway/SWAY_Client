import { CARDS } from "@/constants/cards";
import { colors } from "@/constants/color";
import { requestInitialPermissions } from "@/utils/requestPermissions";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from "@react-native-cookies/cookies";
import firebase from "@react-native-firebase/app";
import * as Font from "expo-font"; // ✅ 폰트 import 추가
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import fetchUserInfo from "../api/fetchUserInfo";
import { getFcmToken } from "../api/getFcmToken";
import ensureValidToken from "../api/tokenManager";

const TAGS = ["Travel", "Foodie", "WorkOut", "Others"];

//  KST 기준 "May 24, 2025 7pm" 스타일 포맷 함수
function formatKSTDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    hour12: true,
  }).format(date);
}

export default function Home() {
  const navigation = useNavigation();
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>(); // 뒤로가기 하면 탭 current 상태로 와야 해서.
  const [activeTab, setActiveTab] = useState<"meetup" | "current">(
    tab === "current" ? "current" : "meetup"
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [timeTick, setTimeTick] = useState(0); // 실시간 갱신용
  const [fontsLoaded, setFontsLoaded] = useState(false); // ✅ 폰트 상태
  const [cards, setCards] = useState([...CARDS]);

  // 화면이 포커싱될 때마다 최신 CARDS 배열을 다시 적용
  useFocusEffect(
    useCallback(() => {
      setCards([...CARDS]);
    }, [])
  );

  // ✅ GasoekOne 폰트 로딩
  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        GasoekOne: require("@/assets/fonts/GasoekOne-Regular.ttf"),
      });
      setFontsLoaded(true);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const token = await ensureValidToken();
      if (!token) {
        await AsyncStorage.multiRemove(["@jwt", "@refreshToken"]);
        await CookieManager.clearAll();
        router.replace("/auth/signIn");
        return;
      }

      // 사용자 정보로 분기처리 재활용
      try {
        const userInfo = await fetchUserInfo(token);
        if (!userInfo.nickname) {
          console.log("🚧 닉네임 미설정 → /auth/signUsername");
          router.replace("/auth/signUsername");
        } else if (!userInfo.nationality) {
          console.log("🚧 국적 미설정 → /auth/signNationality");
          router.replace("/auth/signNationality");
        } else {
          console.log("✅ 모든 정보 설정 완료 → 홈 화면 진입");
        }
      } catch (err) {
        console.error("❌ 사용자 정보 조회 실패:", err);
        router.replace("/auth/signIn");
      }
    })();
  }, []);

  //  기본 헤더 제거
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useEffect(() => {
    requestInitialPermissions();
  }, []);

  useEffect(() => {
    try {
      const app = firebase.app();
      console.log("✅ Firebase Initialized:", app.name); // 보통 "[DEFAULT]"
    } catch (e) {
      console.log("❌ Firebase not initialized", e);
    }
  }, []);

  //  1분마다 포커싱 갱신을 위한 시간 트리거
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick((prev) => prev + 1);
    }, 60 * 1000); // 1분 간격
    return () => clearInterval(interval);
  }, []);

  // 로그인 토큰 검사
  useEffect(() => {
    (async () => {
      const token = await ensureValidToken();
      if (!token) {
        await AsyncStorage.multiRemove(["@jwt", "@refreshToken"]);
        // await CookieManager.clearAll();
        router.replace("/auth/signIn");
      }
    })();
  }, []);

  //  포커싱 대상 판단 함수 (KST 기준으로 3시간 이하 남았는지 확인)
  function isExpiringSoon(expiresAt: string): boolean {
    const now = new Date();
    const endTime = new Date(expiresAt);
    const remaining = endTime.getTime() - now.getTime(); // ⬅️ 여기만 쓰면 됨!
    return remaining > 0 && remaining <= 3 * 60 * 60 * 1000;
  }

  // 필터링 + 정렬된 카드 목록 생성
  const filteredCards = useMemo(() => {
    return CARDS.filter((c) => !selectedTag || c.tag === selectedTag)
      .map((c) => {
        const endTime = new Date(c.expiresAt);
        return {
          ...c,
          isFocused: isExpiringSoon(c.expiresAt),
          expiryTime: endTime,
        };
      })
      .sort((a, b) => {
        if (a.isFocused && !b.isFocused) return -1;
        if (!a.isFocused && b.isFocused) return 1;
        if (a.isFocused && b.isFocused) {
          const aTime = a.expiryTime.getTime();
          const bTime = b.expiryTime.getTime();
          if (aTime !== bTime) return aTime - bTime;
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [selectedTag, timeTick]); //  시간 변화 감지

  const renderCard = ({ item }: { item: (typeof filteredCards)[0] }) => {
    const isFocused = item.isFocused;

    return (
      <View style={[styles.card, isFocused && styles.cardFocused]}>
        <Text style={[styles.title, isFocused && styles.titleFocused]}>
          {item.title}
        </Text>

        <Text style={[styles.sub, isFocused && styles.subFocused]}>
          Open until {formatKSTDate(item.expiresAt)}
        </Text>

        <Text
          style={[styles.participants, isFocused && styles.participantsFocused]}
        >
          Participants: {item.participants}
        </Text>

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
      </View>
    );
  };

  // ✅ 폰트 로딩 안 됐을 때 기본 UI 제공
  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.WHITE,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.PURPLE_300} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/*  커스텀 헤더 */}
      <View style={styles.header}>
        <Text style={styles.logoText}>SWAY</Text>
        <Text style={styles.headerTitle}>Home</Text>
        <Pressable onPress={() => console.log("알림 버튼 눌림")}>
          <Ionicons name="notifications-outline" size={24} />
        </Pressable>
      </View>

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

      {/* 해시태그 필터 */}
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
          data={filteredCards}
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

      {/* ✅ 임시 로그인창 이동 버튼 */}
      <Pressable
        style={{
          position: "absolute",
          bottom: 8,
          alignSelf: "center",
          backgroundColor: colors.PURPLE_300,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
        }}
        onPress={() => router.replace("./auth")}
      >
        <Text style={{ color: colors.WHITE, fontWeight: "600" }}>
          🔐 로그인 창으로 가기
        </Text>
      </Pressable>

      <Pressable
        style={{
          position: "absolute",
          bottom: 80,
          alignSelf: "center",
          backgroundColor: colors.YELLOW_500,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
        }}
        onPress={async () => {
          const token = await getFcmToken();
          if (token) {
            console.log("[FCM 테스트 버튼] 토큰:", token);
          } else {
            console.log("[FCM 테스트 버튼] 토큰 발급 실패");
          }
        }}
      >
        <Text style={{ color: colors.BLACK, fontWeight: "600" }}>
          FCM 토큰 테스트
        </Text>
      </Pressable>

      {/* 플로팅 버튼 */}
      {activeTab === "meetup" && (
        <Pressable
          style={styles.fab}
          onPress={() => router.push("/meetup/createMeetUp")}
        >
          <Ionicons name="pencil" size={32} color={colors.WHITE} />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.WHITE },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_300,
  },
  logoText: {
    fontSize: 23,
    fontWeight: "bold",
    color: colors.PURPLE_300,
    fontFamily: "GasoekOne", // ✅ 폰트 적용
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 8,
  },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabItemActive: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.BLACK,
  },
  tabText: { fontSize: 16, color: colors.GRAY_500 },
  tabTextActive: { color: colors.BLACK, fontWeight: "600" },
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
  cardList: { padding: 16, paddingBottom: 120 },
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
  },
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
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    color: colors.GRAY_500,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
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
