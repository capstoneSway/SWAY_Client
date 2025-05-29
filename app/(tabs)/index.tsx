import { colors } from "@/constants/color";
import formatDateTime from "@/utils/formatDataTime";
import { requestInitialPermissions } from "@/utils/requestPermissions";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from "@react-native-cookies/cookies";
import firebase from "@react-native-firebase/app";
import * as Clipboard from "expo-clipboard";
import * as Font from "expo-font";
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
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { deleteLightning } from "../api/deleteLightning";
import { fetchLightningCards } from "../api/fetchLightningList";
import fetchMyLightningCards from "../api/fetchMyLightningCards";
import fetchUserInfo from "../api/fetchUserInfo";
import { getFcmToken } from "../api/getFcmToken";
import { leaveLightning } from "../api/leaveLightning"; // 탈퇴 API import 추가
import ensureValidToken from "../api/tokenManager";

const TAGS = ["Travel", "Foodie", "WorkOut", "Others"];

export default function Home() {
  const navigation = useNavigation();
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<"meetup" | "current">(
    tab === "current" ? "current" : "meetup"
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [timeTick, setTimeTick] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [filteredCards, setFilteredCards] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [currentLoading, setCurrentLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  function extractEmail(fullUsername: string): string {
    const parts = fullUsername.split("_");
    return parts.length > 1 ? parts.slice(1).join("_") : fullUsername;
  }

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        GasoekOne: require("@/assets/fonts/GasoekOne-Regular.ttf"),
      });
      setFontsLoaded(true);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setCurrentLoading(true);
        try {
          let data;

          if (activeTab === "current") {
            const token = await ensureValidToken();

            // 사용자 정보 먼저 받아서 이메일 추출
            const userInfo = await fetchUserInfo(token);
            const email = extractEmail(userInfo?.username || "");
            setUserEmail(email);

            // 참여중인 번개 가져오기
            data = await fetchMyLightningCards();

            // 이메일 기준으로 필터링
            data = data.filter(
              (item: any) =>
                Array.isArray(item.participants) &&
                item.participants.some((p: any) => p.email === email)
            );

            // 호스트 여부 태그 지정
            data = data.map((item: any) => {
              const tags: string[] = [];
              if (
                item.host?.email === email &&
                item.participants.some((p: any) => p.email === email)
              ) {
                tags.push("hosted");
              } else if (
                item.host?.email !== email &&
                item.participants.some((p: any) => p.email === email)
              ) {
                tags.push("participated");
              }
              return { ...item, tags };
            });
          } else {
            data = await fetchLightningCards(selectedTag || undefined);
            //  participants가 0명인 번개는 필터링해서 삭제처리
            data = data.filter((item: any) => {
              return (
                Array.isArray(item.participants) && item.participants.length > 0
              );
            });
          }

          // 정렬 및 시급한 항목 강조 표시
          const result = data
            .map((c: any) => ({
              ...c,
              isFocused: isExpiringSoon(c.expiresAt),
              expiryTime: new Date(c.expiresAt),
            }))
            .sort((a: any, b: any) => {
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

          setFilteredCards(result);
          setHasFetched(true);
        } catch (err) {
          console.error("⚠️ 번개모임 불러오기 실패", err);
        } finally {
          setCurrentLoading(false);
        }
      })();
    }, [selectedTag, timeTick, activeTab])
  );

  useEffect(() => {
    (async () => {
      const token = await ensureValidToken();
      if (!token) {
        await AsyncStorage.multiRemove(["@jwt", "@refreshToken"]);
        await CookieManager.clearAll();
        router.replace("/auth/signIn");
        return;
      }

      try {
        const userInfo = await fetchUserInfo(token);
        if (!userInfo.nickname) {
          router.replace("/auth/signUsername");
        } else if (!userInfo.nationality) {
          router.replace("/auth/signNationality");
        }
      } catch (err) {
        router.replace("/auth/signIn");
      }
    })();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useEffect(() => {
    requestInitialPermissions();
  }, []);

  useEffect(() => {
    try {
      const app = firebase.app();
      console.log("✅ Firebase Initialized:", app.name);
    } catch (e) {
      console.log("❌ Firebase not initialized", e);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick((prev) => prev + 1);
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  function isExpiringSoon(expiresAt: string): boolean {
    const now = new Date();
    const endTime = new Date(expiresAt);
    const diffMs = endTime.getTime() - now.getTime();
    return diffMs > 0 && diffMs <= 3 * 60 * 60 * 1000; // 3시간 이내 true
  }

  const renderCard = ({ item }: { item: any }) => {
    const isFocused = item.isFocused;
    const endTimeString = item.expiresAt || item.end_time;
    const endTime = new Date(endTimeString);
    const isValidDate = !isNaN(endTime.getTime());

    const participantsText = Array.isArray(item.participants)
      ? `${item.participants.length}/${item.max_participant}`
      : item.participants;

    const isHost = item.host?.email === userEmail;
    const isParticipated = item.tags?.includes("participated");

    if (!item) {
      console.log("❌ item is null or undefined!");
      return null;
    }

    const handleDelete = async (id: number) => {
      try {
        await deleteLightning(id);
        Alert.alert("Close Successful", "The meetup has been closed");
        setFilteredCards((prev) => prev.filter((card) => card.id !== id));
      } catch (error) {
        Alert.alert(
          "Delete Failed",
          "Failed to delete the meetup for some reason. Please try again."
        );
      }
    };

    const handleLeave = async (id: number) => {
      try {
        await leaveLightning(id);
        Alert.alert("Left", "You have successfully left the meetup.");
        setFilteredCards((prev) => prev.filter((card) => card.id !== id));
      } catch (error) {
        Alert.alert("Error", "Failed to leave the meetup. Please try again.");
      }
    };

    return (
      <View style={[styles.card, isFocused && styles.cardFocused]}>
        <Text style={[styles.title, isFocused && styles.titleFocused]}>
          {item.title}
        </Text>
        <Text style={[styles.sub, isFocused && styles.subFocused]}>
          {isValidDate
            ? `Open until ${formatDateTime(endTime)}`
            : "Open until N/A"}
        </Text>
        <Text
          style={[styles.participants, isFocused && styles.participantsFocused]}
        >
          Participants: {participantsText}
          {"  "}
          {item.tags?.map((tag: string, i: number) => (
            <Text
              key={i}
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: tag === "hosted" ? colors.PURPLE_300 : colors.YELLOW_500,
                marginLeft: 8,
              }}
            >
              {tag === "hosted" ? "Hosted" : "Participated"}
            </Text>
          ))}
        </Text>

        {activeTab === "current" ? (
          <View style={{ flexDirection: "row", marginTop: 8 }}>
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
                {item.status === "closed"
                  ? "Closed"
                  : activeTab === "current"
                  ? "Info"
                  : "Register"}
              </Text>
            </Pressable>

            {isHost && (
              <>
                <Pressable
                  style={[
                    styles.btn,
                    styles.btnDefault,
                    {
                      backgroundColor: colors.GRAY_300,
                      marginLeft: 8,
                      alignSelf: "flex-end",
                    },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/meetup/editMeetUp",
                      params: { id: item.id.toString() },
                    })
                  }
                >
                  <Text style={[styles.btnText, { color: colors.BLACK }]}>
                    Edit
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.btn,
                    styles.btnDefault,
                    {
                      backgroundColor: colors.RED_500,
                      marginLeft: 8,
                      alignSelf: "flex-end",
                    },
                  ]}
                  onPress={() => {
                    Alert.alert(
                      "Delete Confirmation",
                      "Are you sure you want to delete this meetup?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => handleDelete(item.id),
                        },
                      ]
                    );
                  }}
                >
                  <Text style={[styles.btnText, { color: colors.WHITE }]}>
                    Close
                  </Text>
                </Pressable>
              </>
            )}

            {!isHost && isParticipated && item.status !== "closed" && (
              <Pressable
                style={[
                  styles.btn,
                  {
                    backgroundColor: colors.RED_500,
                    marginLeft: 8,
                    alignSelf: "flex-end",
                  },
                ]}
                onPress={() => {
                  Alert.alert(
                    "Leave Confirmation",
                    "Are you sure you want to leave this meetup?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Leave",
                        style: "destructive",
                        onPress: () => handleLeave(item.id),
                      },
                    ]
                  );
                }}
              >
                <Text style={[styles.btnText, { color: colors.WHITE }]}>
                  Leave
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
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
        )}
      </View>
    );
  };

  const handleFcmTest = async () => {
    try {
      const token = await getFcmToken();
      if (token) {
        setFcmToken(token);
        setTokenError(null);
        Clipboard.setStringAsync(token);
        Alert.alert("복사됨", "FCM 토큰이 클립보드에 복사되었습니다.");
      } else {
        setFcmToken(null);
        setTokenError("토큰 발급에 실패했습니다.");
        Clipboard.setStringAsync("failed!!");
      }
    } catch (e) {
      setFcmToken(null);
      setTokenError("토큰 발급 중 에러가 발생했습니다.");
    } finally {
      setModalVisible(true);
    }
  };

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
      {/* 헤더 */}
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
      {currentLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.PURPLE_300} />
        </View>
      ) : (
        <FlatList
          data={filteredCards}
          renderItem={renderCard}
          keyExtractor={(i) => i.id.toString()}
          contentContainerStyle={styles.cardList}
          ListEmptyComponent={
            !currentLoading && hasFetched ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  {activeTab === "current"
                    ? "You're not in any chat rooms right now."
                    : "No meet ups found."}
                </Text>
                {activeTab === "current" && (
                  <Text style={styles.emptyText}>
                    Join a meet up to get started!
                  </Text>
                )}
              </View>
            ) : null
          }
        />
      )}

      {/* 로그인 창 이동 버튼 */}
      <Pressable
        style={{
          position: "absolute",
          bottom: 12,
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

      {/* FCM 테스트 버튼 */}
      <Pressable
        style={{
          position: "absolute",
          bottom: 64,
          alignSelf: "center",
          backgroundColor: colors.YELLOW_500,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
        }}
        onPress={handleFcmTest}
      >
        <Text style={{ color: colors.BLACK, fontWeight: "600" }}>
          FCM 토큰 테스트
        </Text>
      </Pressable>

      {activeTab === "meetup" && (
        <Pressable
          style={styles.fab}
          onPress={() => router.push("/meetup/createMeetUp")}
        >
          <Ionicons name="pencil" size={32} color={colors.WHITE} />
        </Pressable>
      )}

      {/* FCM 모달 */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>FCM 토큰 정보</Text>
            <ScrollView
              style={{ maxHeight: 150, marginVertical: 10 }}
              keyboardShouldPersistTaps="handled"
            >
              {tokenError ? (
                <Text style={styles.errorText}>{tokenError}</Text>
              ) : (
                <Text selectable style={styles.tokenText}>
                  {fcmToken}
                </Text>
              )}
            </ScrollView>
            <Pressable
              onPress={() => {
                Clipboard.setStringAsync(fcmToken || "failed");
                Alert.alert("복사됨", "FCM 토큰이 클립보드에 복사되었습니다.");
              }}
            >
              <Text>복사하기</Text>
            </Pressable>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    fontFamily: "GasoekOne",
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
    height: 30,
  },
  btnDefault: { backgroundColor: colors.PURPLE_300 },
  btnFocused: { backgroundColor: colors.YELLOW_500 },
  btnClosed: { backgroundColor: colors.GRAY_500 },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.WHITE,
    textAlign: "center",
    lineHeight: 15,
  },
  btnTextFocused: { color: colors.PURPLE_300 },
  btnTextClosed: { color: colors.WHITE },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    color: colors.GRAY_500,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  tokenText: {
    fontSize: 14,
    color: "#333",
  },
  errorText: {
    fontSize: 14,
    color: colors.RED_500,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: colors.PURPLE_300,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
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
