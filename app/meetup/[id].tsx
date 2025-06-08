import FixedBottomCTA from "@/components/FixedBottomCTA";
import { colors } from "@/constants/color";
import { countries } from "@/constants/country";
import formatDateTime from "@/utils/formatDataTime";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchUserInfo } from "../api/fetchUserInfo";
import { joinLightning } from "../api/joinLightning";

export default function MeetUpDetail() {
  const now = new Date(new Date().toISOString());
  const [disabled, setDisabled] = useState(false); // 버튼 중복 클릭 방지
  const defaultProfile = require("@/assets/images/default_profile.png");
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); // URL 파라미터에서 id 추출

  const [meetup, setMeetup] = useState<any>(null); // 모임 정보
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [userGender, setUserGender] = useState<"male" | "female" | null>(null); // 사용자 성별

  // 국가 코드에 해당하는 국기 이미지 반환
  const getFlagByCode = (code: string) => {
    const found = countries.find((c) => c.code === code);
    return found ? found.flag : null;
  };

  // created_at 기준으로 24시간 후의 만료시간 계산
  const calculateExpiresAt = (createdAt: string) => {
    const base = new Date(createdAt);
    return new Date(base.getTime() + 24 * 60 * 60 * 1000);
  };

  // 사용자 정보 불러오기 → 성별만 추출
  useEffect(() => {
    const loadUserInfo = async () => {
      const token = await AsyncStorage.getItem("@jwt");
      if (!token) return;

      const me = await fetchUserInfo(token);
      if (me?.gender === "male" || me?.gender === "female") {
        setUserGender(me.gender);
      }
    };
    loadUserInfo();
  }, []);

  // 모임에서 허용된 성별인지 확인
  const isGenderAllowed = () => {
    if (!meetup || !userGender) return true;
    if (meetup.gender === "all") return true;
    if (meetup.gender === "male" && userGender === "male") return true;
    if (meetup.gender === "female" && userGender === "female") return true;
    return false;
  };

  // 모임 상세 데이터 fetch
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await axios.get(
          `https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app/lightning/${id}/`
        );
        setMeetup(res.data);
        console.log("모임 정보:\n" + JSON.stringify(res.data, null, 2));
      } catch (e) {
        console.error("모임 정보 불러오기 실패", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // 참가 버튼 클릭 시 처리
  const handleJoin = async () => {
    const endTime = new Date(meetup.end_time);
    const token = await AsyncStorage.getItem("@jwt");
    if (!token) throw new Error("No access token found");

    const me = await fetchUserInfo(token);
    if (!me?.username) throw new Error("No username found");

    const alreadyJoined = meetup.participants?.some(
      (p: any) => p.username === me.username
    );

    // 만료/닫힘 여부 체크 전에 alreadyJoined 확인
    if (alreadyJoined) {
      router.push(`/meetup/chatRoom/${meetup.id}`);
      return;
    }

    // 아래 두 조건은 이제 'alreadyJoined'가 false인 경우에만 적용
    if (!alreadyJoined && now > endTime) {
      Alert.alert("This meetup has expired.", "You can no longer join.");
      return;
    }

    if (meetup.status === "closed") {
      Alert.alert("This meetup is closed.");
      return;
    }

    if (!isGenderAllowed()) {
      Alert.alert(
        "You are not eligible to join",
        "This meetup is restricted based on gender."
      );
      return;
    }

    if (meetup.current_participant >= meetup.max_participant) {
      Alert.alert("This meetup is full.", "No more participants can join.");
      return;
    }

    if (disabled) return;
    setDisabled(true);
    setTimeout(() => setDisabled(false), 1000); // 중복 클릭 방지

    try {
      const token = await AsyncStorage.getItem("@jwt");
      if (!token) throw new Error("No access token found");

      const me = await fetchUserInfo(token);
      if (!me?.username) throw new Error("No username found");

      const alreadyJoined = meetup.participants?.some(
        (p: any) => p.username === me.username
      );

      if (alreadyJoined) {
        router.push(`/meetup/chatRoom/${meetup.id}`);
      } else {
        Alert.alert(
          "Join this meetup?",
          "Would you like to join this meetup and enter the chat room?",
          [
            { text: "No", style: "cancel" },
            {
              text: "Yes",
              onPress: async () => {
                try {
                  const res = await joinLightning(meetup.id);
                  if (res.participants) {
                    setMeetup((prev: any) => ({
                      ...prev,
                      participants: res.participants,
                    }));
                  }
                  router.push(`/meetup/chatRoom/${meetup.id}`);
                } catch (err: any) {
                  console.error("참가 실패:", err.response?.data || err);
                  Alert.alert(
                    "Error",
                    err.message || "Failed to join the meetup."
                  );
                }
              },
            },
          ]
        );
      }
    } catch (err: any) {
      console.error("오류:", err);
      Alert.alert("Error", err.message || "Something went wrong.");
    }
  };

  // 카테고리 텍스트 첫 글자 대문자로 변환
  function capitalizeFirstLetter(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // 로딩 중 또는 데이터 없을 경우 로딩 화면 표시
  if (loading || !meetup) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.WHITE,
        }}
      >
        <ActivityIndicator size="large" color={colors.PURPLE_300} />
      </SafeAreaView>
    );
  }

  // 모임 상세 UI 렌더링
  const titleDate = new Date(meetup.meeting_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const expiresAt = meetup.expiresAt
    ? new Date(meetup.expiresAt)
    : calculateExpiresAt(meetup.created_at);

  const imageSource =
    typeof meetup.background_pic === "string" &&
    meetup.background_pic.startsWith("http")
      ? { uri: meetup.background_pic }
      : defaultProfile;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              router.replace("/(tabs)");
            }}
            style={{
              width: 44,
              height: 28,
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.BLACK} />
          </Pressable>
          <Text style={styles.headerTitle}>Meet Up</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 배경 이미지 */}
        <Image source={imageSource} style={styles.image} />

        {/* 정보 박스 */}
        <View style={styles.infoBox}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              [{meetup.title}, {titleDate}]
            </Text>

            {/* 참가자 아바타 표시 */}
            <View style={styles.avatars}>
              {meetup.participants?.slice(0, 3).map((p: any, i: number) => (
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
                  <Image
                    source={getFlagByCode(p.national_code)}
                    style={styles.flag}
                    resizeMode="cover"
                  />
                </View>
              ))}
              {meetup.participants && meetup.participants.length > 3 && (
                <View style={styles.moreBadge}>
                  <Text style={styles.moreText}>
                    +{meetup.participants.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* 해시태그 및 성별 아이콘 */}
          <View style={styles.tagRow}>
            <Text style={styles.tag}>
              #{capitalizeFirstLetter(meetup.category)}
            </Text>
            <FontAwesome5
              name={
                meetup.gender === "male"
                  ? "mars"
                  : meetup.gender === "female"
                  ? "venus"
                  : "transgender"
              }
              size={22}
              color={colors.PURPLE_300}
              style={{ paddingTop: 0, marginLeft: 0 }}
            />
          </View>

          {/* 모임 설명 */}
          <Text
            style={styles.description}
            numberOfLines={6} // 최대 6줄까지만 표시
            ellipsizeMode="tail" // 뒷부분에 … 붙음
          >
            {meetup.content}
          </Text>
        </View>

        {/* 하단 참가 버튼 */}
        {meetup.status !== "closed" && !!userGender && (
          <FixedBottomCTA
            label="Join"
            enabled={!disabled}
            onPress={handleJoin}
          />
        )}
      </SafeAreaView>

      {/* Open Until 표시 */}
      <View style={styles.openUntilRow}>
        <Ionicons name="hourglass-outline" size={16} color={colors.BLACK} />
        <Text style={styles.openUntilText}>
          Open Until: {formatDateTime(expiresAt)}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.WHITE },
  header: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_300,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 360,
    backgroundColor: colors.GRAY_200,
  },
  infoBox: {
    backgroundColor: colors.WHITE,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 60,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: -30,
    zIndex: 2,
    position: "relative",
  },
  titleRow: {
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    flexShrink: 1,
    marginTop: -28,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: "relative",
    overflow: "visible",
    marginBottom: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: colors.WHITE,
    backgroundColor: colors.GRAY_200,
  },
  avatars: { flexDirection: "row" },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    marginTop: -20,
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
    elevation: 4, // Android용
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
    elevation: 4, // Android용
    marginTop: 1,
  },
  moreText: {
    fontSize: 12,
    color: colors.BLACK,
  },

  tag: {
    fontSize: 16,
    color: colors.PURPLE_300,
    fontWeight: "600",
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: colors.GRAY_600,
    lineHeight: 20,
    marginBottom: 16,
  },
  openUntilRow: {
    position: "absolute",
    bottom: 110,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: colors.WHITE,
  },
  openUntilText: {
    fontSize: 18,
    color: colors.BLACK,
    marginLeft: 4,
  },
});
