// MeetUpDetail.tsx
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
import fetchUserInfo from "../api/fetchUserInfo";
import { joinLightning } from "../api/joinLightning";

export default function MeetUpDetail() {
  const [disabled, setDisabled] = useState(false);
  const defaultProfile = require("@/assets/images/default_profile.png");
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [meetup, setMeetup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [userGender, setUserGender] = useState<"male" | "female" | null>(null);

  const getFlagByCode = (code: string) => {
    const found = countries.find((c) => c.code === code);
    return found ? found.flag : null;
  };

  const calculateExpiresAt = (createdAt: string) => {
    const base = new Date(createdAt);
    return new Date(base.getTime() + 24 * 60 * 60 * 1000);
  };

  useEffect(() => {
    const loadUserInfo = async () => {
      const token = await AsyncStorage.getItem("@jwt");
      if (!token) return;

      const me = await fetchUserInfo(token);
      if (me?.gender === "male" || me?.gender === "female") {
        console.log("유저 성별:", me.gender);
        setUserGender(me.gender);
      }
    };
    loadUserInfo();
  }, []);

  const isGenderAllowed = () => {
    console.log("성별 제한 확인 중:", meetup?.gender, userGender);
    if (!meetup || !userGender) return true; // 데이터 아직 없으면 막지 않음
    if (meetup.gender === "all") return true;
    if (meetup.gender === "male" && userGender === "male") return true;
    if (meetup.gender === "female" && userGender === "female") return true;
    return false;
  };
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await axios.get(
          `https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app/lightning/${id}/`
        );
        console.log("API 응답 res.data:", res.data);
        setMeetup(res.data);
      } catch (e) {
        console.error("모임 정보 불러오기 실패", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleJoin = async () => {
    if (meetup.status === "closed") {
      Alert.alert("The meetup is closed.");
      return;
    }

    if (!isGenderAllowed()) {
      Alert.alert(
        "You are not eligible to join",
        "This meetup is restricted based on gender."
      );
      return;
    }

    if (disabled) return;
    setDisabled(true);
    setTimeout(() => setDisabled(false), 1000); // 1초 후 다시 활성화

    try {
      const token = await AsyncStorage.getItem("@jwt");
      if (!token) throw new Error("No access token found");

      const me = await fetchUserInfo(token);
      if (!me?.username) throw new Error("No username found");

      const alreadyJoined = meetup.participants?.some(
        (p: any) => p.username === me.username
      );

      if (alreadyJoined) {
        console.log("이미 참가 중 - 채팅방으로 이동");
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
      console.error(" 오류:", err);
      Alert.alert("Error", err.message || "Something went wrong.");
    }
  };

  function capitalizeFirstLetter(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  //  렌더 전에 meetup null 여부 확인
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

  //  meetup이 확실히 존재하는 이후 실행되는 부분
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

        <Image source={imageSource} style={styles.image} />

        <View style={styles.infoBox}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              [{meetup.title}, {titleDate}]
            </Text>
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

          <Text style={styles.description}>{meetup.content}</Text>
        </View>

        {meetup.status !== "closed" && !!userGender && (
          <FixedBottomCTA
            label="Join"
            enabled={!disabled}
            onPress={handleJoin}
          />
        )}
      </SafeAreaView>

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
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
