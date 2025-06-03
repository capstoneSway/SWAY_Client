import "@/app/api/interceptors";
import { colors } from "@/constants/color";
import { countries } from "@/constants/country";
import formatDateTime from "@/utils/formatDataTime";
import { requestInitialPermissions } from "@/utils/requestPermissions";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from "@react-native-cookies/cookies";
import axios from "axios";
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
  Image,
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

export default function Home() {
  const [registerProcessing, setRegisterProcessing] = useState(false);
  const [infoProcessing, setInfoProcessing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fabDisabled, setFabDisabled] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<"meetup" | "current">(
    tab === "current" ? "current" : "meetup"
  );
  const defaultProfile = require("@/assets/images/default_profile.png");
  const TAGS = ["Travel", "Foodie", "WorkOut", "Others"];
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

  const fetchLightningDetail = async (id) => {
    try {
      const res = await axios.get(
        `https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app/lightning/${id}/`
      );
      console.log("\uD83D\uDCCC 번개 상세 정보:", res.data);
      Alert.alert(
        "번개모임 디버깅용",
        `콘솔에서 ID ${id}의 상세 정보를 확인하세요.`
      );
    } catch (error) {
      console.error("❌ 번개 상세 정보 fetch 실패:", error);
      Alert.alert("오류", "번개 정보를 불러오지 못했습니다.");
    }
  };

  const getFlagByCode = (code) => {
    if (!code) return null;
    const found = countries.find((c) => c.code === code);
    return found ? found.flag : null;
  };

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

            data = data.filter((item: any) => {
              // end_time, expiresAt, expiryTime 중 하나라도 있으면 사용
              const end = item.end_time || item.expiresAt || item.expiryTime;
              if (!end) return false; // 만료 정보 없으면 표시하지 않음
              return true;
            });

            // 호스트 여부 태그 지정
            data = data.map((item: any) => {
              const tags: string[] = [];
              if (item.host?.email === email) {
                tags.push("hosted");
              } else if (
                item.participants.some((p: any) => p.email === email)
              ) {
                tags.push("participated");
              }
              return { ...item, tags };
            });
          } else {
            // meet ups
            const token = await ensureValidToken();

            // 사용자 정보 먼저 받아서 이메일 추출
            const userInfo = await fetchUserInfo(token);
            const email = extractEmail(userInfo?.username || "");
            setUserEmail(email);

            data = await fetchLightningCards(selectedTag || undefined);

            data = data
              .filter((item: any) => {
                // participants가 1단 혹은 2단 배열인지 대응
                const participants = Array.isArray(item.participants?.[0])
                  ? item.participants[0]
                  : item.participants;
                return Array.isArray(participants) && participants.length > 0;
              })
              .filter((item: any) => {
                const end = item.end_time || item.expiresAt || item.expiryTime;
                if (!end) return false;
                return true;
              })
              .map((item: any) => {
                const participants = Array.isArray(item.participants?.[0])
                  ? item.participants[0]
                  : item.participants;
                const tags: string[] = [];

                if (item.host?.email === email) {
                  tags.push("hosted");
                } else if (
                  Array.isArray(participants) &&
                  participants.some((p: any) => p.email === email)
                ) {
                  tags.push("participated");
                }

                return { ...item, tags };
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
                // 둘 다 임박했으면 더 빨리 종료되는 쪽이 앞으로 가고, 만약 종료 시각까지 같아버리면 또 제목으로.
              }
              if (activeTab === "current") {
                const now = new Date().getTime();
                const aEnd = new Date(a.end_time).getTime();
                const bEnd = new Date(b.end_time).getTime();

                const aClosed = now > aEnd;
                const bClosed = now > bEnd;

                if (aClosed && !bClosed) return 1; // 종료된 a는 아래로
                if (!aClosed && bClosed) return -1; // 종료된 b는 아래로

                return aEnd - bEnd; // 둘 다 open이면 종료 임박 순
              } else {
                const aCreated = new Date(a.created_at).getTime();
                const bCreated = new Date(b.created_at).getTime();
                return bCreated - aCreated; // meetups: 최신 생성순
              }
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

  //  1분마다 포커싱 갱신을 위한 시간 트리거
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
    const isExpired = isValidDate && endTime.getTime() < new Date().getTime();

    const participantsText = Array.isArray(item.participants)
      ? `${item.participants.length}/${item.max_participant}`
      : item.participants;

    const isHost = item.host?.email === userEmail;
    const isParticipated = item.tags?.includes("participated");

    const infoColor = isFocused ? colors.WHITE : colors.PURPLE_300;
    const closeColor = isFocused ? colors.WHITE : colors.RED_500;
    const editColor = isFocused ? colors.WHITE : "black";

    if (!item) return null;

    const handleDelete = async (id: number) => {
      try {
        await deleteLightning(id);
        Alert.alert("Close Successful", "The meetup has been closed");
        setFilteredCards((prev) => prev.filter((card) => card.id !== id));
      } catch (error) {
        Alert.alert("Delete Failed", "Failed to delete the meetup.");
      }
    };

    const handleLeave = async (id: number) => {
      try {
        await leaveLightning(id);
        Alert.alert("Left", "You have successfully left the meetup.");
        setFilteredCards((prev) => prev.filter((card) => card.id !== id));
      } catch (error) {
        Alert.alert("Error", "Failed to leave the meetup.");
      }
    };

    return (
      <Pressable onLongPress={() => fetchLightningDetail(item.id)}>
        <View style={[styles.card, isFocused && styles.cardFocused]}>
          {activeTab === "current" && (
            <>
              <View style={styles.cardTopRow}>
                <Pressable
                  style={[
                    styles.cardActionTopLeft,
                    infoProcessing && { opacity: 0.5 },
                  ]}
                  disabled={infoProcessing}
                  onPress={async () => {
                    if (infoProcessing) return;
                    setInfoProcessing(true);
                    try {
                      await router.push({
                        pathname: "/meetup/[id]",
                        params: { id: item.id.toString() },
                      });
                    } finally {
                      // 혹시나 navigation이 실패해도 1초 후 다시 누를 수 있도록
                      setTimeout(() => setInfoProcessing(false), 1000);
                    }
                  }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={32}
                    color={infoColor}
                  />
                  <Text
                    style={[
                      styles.actionLabelInfo,
                      isFocused && { color: colors.WHITE },
                    ]}
                  >
                    Info
                  </Text>
                </Pressable>

                {activeTab === "current" &&
                  new Date(item.end_time) < new Date() && (
                    <View style={styles.closedBadge}>
                      <Text style={styles.closedBadgeText}>Closed</Text>
                    </View>
                  )}
              </View>

              {(isHost || (isParticipated && item.status !== "closed")) && (
                <Pressable
                  style={[
                    styles.cardActionTopRight,
                    {
                      position: "absolute",
                      top: 12,
                      right: 12,
                      bottom: 12,
                      zIndex: 999,
                      height: 60,
                    },
                  ]}
                  hitSlop={8}
                  onPress={() => {
                    Alert.alert(
                      isHost ? "Delete Confirmation" : "Leave Confirmation",
                      isHost
                        ? "Are you sure you want to delete this meetup?"
                        : "Are you sure you want to leave this meetup?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: isHost ? "Delete" : "Leave",
                          style: "destructive",
                          onPress: () =>
                            isHost
                              ? handleDelete(item.id)
                              : handleLeave(item.id),
                        },
                      ]
                    );
                  }}
                >
                  {isHost ? (
                    <AntDesign name="delete" size={28} color={closeColor} />
                  ) : (
                    <Image
                      source={require("@/assets/images/fire-exit.png")}
                      style={{
                        width: 26,
                        height: 26,
                        tintColor: closeColor,
                        marginRight: -10,
                      }}
                    />
                  )}
                  <Text
                    style={[
                      styles.actionLabelClose,
                      isFocused && { color: colors.WHITE },
                    ]}
                  >
                    {isHost ? "Close" : "Leave"}
                  </Text>
                </Pressable>
              )}
              {activeTab === "current" && isHost && (
                <Pressable
                  style={{
                    position: "absolute",
                    bottom: 12,
                    right: 4,
                    zIndex: 999,
                    backgroundColor: isFocused
                      ? colors.YELLOW_500
                      : colors.WHITE,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    elevation: 4,
                    opacity: isProcessing ? 0.5 : 1, // 클릭 중일 때 시각적으로 흐리게
                  }}
                  disabled={isProcessing} // 버튼 비활성화
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={async () => {
                    if (isProcessing) return;
                    setIsProcessing(true);
                    try {
                      await router.push({
                        pathname: "/meetup/editMeetUp",
                        params: { id: item.id.toString() },
                      });
                    } finally {
                      // navigation이 끝나면 false로 돌려도 되지만,
                      // 보통은 setTimeout으로 일정 시간 잠그는 게 안전
                      setTimeout(() => setIsProcessing(false), 1000);
                    }
                  }}
                >
                  <FontAwesome
                    name="edit"
                    size={28}
                    color={isFocused ? colors.PURPLE_300 : colors.BLACK}
                    style={{ marginRight: 2 }}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: isFocused ? colors.PURPLE_300 : colors.BLACK,
                    }}
                  >
                    Edit
                  </Text>
                </Pressable>
              )}
            </>
          )}

          {activeTab === "meetup" ? (
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text
                style={[
                  styles.title,
                  isFocused && styles.titleFocused,
                  { marginTop: 30 },
                ]}
              >
                {item.title}
              </Text>
              <Text style={[styles.sub, isFocused && styles.subFocused]}>
                {isValidDate
                  ? `Open until ${formatDateTime(endTime)}`
                  : "Open until N/A"}
              </Text>
              <Text
                style={[
                  styles.participants,
                  isFocused && styles.participantsFocused,
                  { marginTop: 4 },
                  { marginBottom: 30 }, // ✅ 간격 좁힘
                ]}
              >
                Participants: {participantsText}
                {"  "}
                {item.tags?.map((tag: string, i: number) => (
                  <Text
                    key={i}
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: isFocused
                        ? colors.YELLOW_500
                        : tag === "hosted"
                        ? colors.YELLOW_500
                        : colors.PURPLE_300,
                      marginLeft: 8,
                    }}
                  >
                    {tag === "hosted" ? "Hosted" : "Participated"}
                  </Text>
                ))}
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.title, isFocused && styles.titleFocused]}>
                {item.title}
              </Text>
              <Text style={[styles.sub, isFocused && styles.subFocused]}>
                {isValidDate
                  ? `Open until ${formatDateTime(endTime)}`
                  : "Open until N/A"}
              </Text>

              <View style={styles.avatars}>
                {item.participants?.slice(0, 3).map((p, i) => (
                  <View
                    key={p.id ?? i}
                    style={[
                      styles.avatarWrapper,
                      { marginLeft: i === 0 ? 0 : -10, zIndex: i },
                    ]}
                  >
                    <Image
                      source={
                        p.profile_image
                          ? { uri: p.profile_image }
                          : defaultProfile
                      }
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                    {p.national_code && (
                      <Image
                        source={getFlagByCode(p.national_code)}
                        style={styles.flag}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                ))}
                {item.participants && item.participants.length > 3 && (
                  <View style={styles.moreBadge}>
                    <Text style={styles.moreText}>
                      +{item.participants.length - 3}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.participants,
                  isFocused && styles.participantsFocused,
                ]}
              >
                Participants: {participantsText}
                {"  "}
                {item.tags?.map((tag: string, i: number) => (
                  <Text
                    key={i}
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: isFocused
                        ? colors.YELLOW_500
                        : tag === "hosted"
                        ? colors.YELLOW_500
                        : colors.PURPLE_300,
                      marginLeft: 8,
                    }}
                  >
                    {tag === "hosted" ? "Hosted" : "Participated"}
                  </Text>
                ))}
              </Text>
            </>
          )}

          {activeTab === "meetup" && (
            <Pressable
              style={[
                styles.registerButton,
                isFocused && styles.registerButtonFocused,
                registerProcessing && { opacity: 0.5 },
                isExpired && { backgroundColor: colors.GRAY_300 }, //  회색 처리
              ]}
              hitSlop={10}
              disabled={registerProcessing || isExpired} //  만료 시 비활성화
              onPress={async () => {
                if (registerProcessing || isExpired) return;
                setRegisterProcessing(true);
                try {
                  await router.push({
                    pathname: "/meetup/[id]",
                    params: { id: item.id.toString() },
                  });
                } finally {
                  setTimeout(() => setRegisterProcessing(false), 1000);
                }
              }}
            >
              <Text
                style={[
                  styles.registerButtonText,
                  isFocused && styles.registerButtonTextFocused,
                  isExpired && { color: colors.GRAY_600 },
                ]}
              >
                {isExpired
                  ? "Closed"
                  : isHost || isParticipated
                  ? "Info"
                  : "Register"}
              </Text>
            </Pressable>
          )}
        </View>
      </Pressable>
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
          onPress={() => {
            if (fabDisabled) return;
            setFabDisabled(true);
            router.push("/meetup/createMeetUp");
            setTimeout(() => setFabDisabled(false), 1000);
          }}
        >
          <Ionicons name="pencil" size={32} color={colors.WHITE} />
        </Pressable>
      )}

      {/* FCM 모달 */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>EAS Update</Text>
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
    position: "relative",
  },
  cardFocused: {
    backgroundColor: colors.PURPLE_300,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 32,
    marginBottom: 2,
    marginLeft: -4,
  },
  cardActionTopLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardActionTopRight: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 6,
    minHeight: 30,
  },
  cardActionBottomLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionLabelInfo: {
    fontSize: 16,
    marginLeft: -1,
    color: colors.PURPLE_300,
    fontWeight: "600",
  },
  actionLabelClose: {
    fontSize: 16,
    marginLeft: 2,
    color: colors.RED_500,
    fontWeight: "600",
  },
  actionLabelEdit: {
    fontSize: 16,
    marginLeft: 2,
    color: colors.BLACK,
    fontWeight: "600",
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.PURPLE_300,
    marginTop: 0,
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

  avatars: { flexDirection: "row" },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: "relative",
    overflow: "visible",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: colors.WHITE,
    backgroundColor: colors.GRAY_200,
  },
  flag: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: "absolute",
    bottom: -2,
    right: 0,
    borderWidth: 0,
    borderColor: colors.WHITE,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  moreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.PURPLE_100,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -10,
    zIndex: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    marginTop: 1,
  },
  moreText: {
    fontSize: 12,
    color: colors.BLACK,
  },
  registerButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: colors.PURPLE_300,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    zIndex: 10,
    minWidth: 80,
    maxWidth: 80,
    alignItems: "center",
  },
  registerButtonFocused: {
    backgroundColor: colors.YELLOW_500,
  },
  registerButtonText: {
    color: colors.WHITE,
    fontWeight: "bold",
  },
  registerButtonTextFocused: {
    color: colors.PURPLE_300,
  },

  closedBadge: {
    backgroundColor: colors.GRAY_300,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 10,
    alignSelf: "center",
  },
  closedBadgeText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: "700",
  },
});
