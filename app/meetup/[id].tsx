// MeetUpDetail.tsx
import FixedBottomCTA from "@/components/FixedBottomCTA";
import { colors } from "@/constants/color";
import { countries } from "@/constants/country";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { joinLightning } from "../api/joinLightning";

export default function MeetUpDetail() {
  const defaultProfile = require("@/assets/images/default_profile.png");
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [meetup, setMeetup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getFlagByCode = (code: string) => {
    const found = countries.find((c) => c.code === code);
    return found ? found.flag : null;
  };

  // 임시 계산용: createdAt + 24시간
  const calculateExpiresAt = (createdAt: string) => {
    const base = new Date(createdAt);
    return new Date(base.getTime() + 24 * 60 * 60 * 1000);
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
        console.error("❌ 모임 정보 불러오기 실패", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    console.log("participantAvatars:", meetup?.participantAvatars);
  }, [meetup]);

  const handleJoin = async () => {
    if (meetup.status === "closed") {
      Alert.alert("The meetup is closed.");
      return;
    }

    try {
      const res = await joinLightning(meetup.id);
      console.log("✅ 참가 성공 응답 데이터:", res);

      // 새로 받은 participants로 상태 업데이트하거나 필요 시 다시 fetch
      if (res.participants) {
        setMeetup((prev: any) => ({
          ...prev,
          participants: res.participants.map((p: any) => p.username || p.email),
          participantAvatars: res.participants, // 필요에 따라
        }));
      }

      router.push({
        pathname: "/meetup/chatRoom/[id]",
        params: { id: meetup.id.toString() },
      });
    } catch (err: any) {
      console.error(
        "❌ 번개 참가 실패:",
        err.response?.data || err.message || err
      );
      Alert.alert(
        "Join Failed",
        err.response?.data?.message || "Unable to join the meetup."
      );
    }
  };

  if (!meetup) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>The requested meetup could not be found.</Text>
      </SafeAreaView>
    );
  }

  function capitalizeFirstLetter(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

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
                    { marginLeft: i === 0 ? 0 : -10 },
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
                  {/* countryCode 정보가 없으므로 국기는 생략하거나 호스트 프로필에만 띄우기 */}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.tagRow}>
            <Text style={styles.tag}>
              #{capitalizeFirstLetter(meetup.category)}
            </Text>
            <FontAwesome5
              name={
                meetup.gender === "Male"
                  ? "mars"
                  : meetup.gender === "Female"
                  ? "venus"
                  : "transgender"
              }
              size={22}
              color={colors.PURPLE_300}
              style={{ paddingTop: 8, marginLeft: 4 }}
            />
          </View>

          <Text style={styles.description}>{meetup.content}</Text>
        </View>

        {meetup.status !== "closed" && (
          <FixedBottomCTA label="Join" enabled={true} onPress={handleJoin} />
        )}
      </SafeAreaView>

      <View style={styles.openUntilRow}>
        <Ionicons name="hourglass-outline" size={16} color={colors.BLACK} />
        <Text style={styles.openUntilText}>
          Open Until: {expiresAt.toLocaleString()}
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
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    flexShrink: 1,
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
  flag: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: "absolute",
    bottom: -2,
    right: 0,
  },
  moreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.PURPLE_100,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -10,
    marginTop: 1,
  },
  moreText: { fontSize: 12, color: colors.BLACK },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    marginTop: 10,
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
