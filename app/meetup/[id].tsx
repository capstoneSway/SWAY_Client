import FixedBottomCTA from "@/components/FixedBottomCTA";
import { CARDS } from "@/constants/cards";
import { colors } from "@/constants/color";
import { countries } from "@/constants/country";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import {
  Stack,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import React from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function MeetUpDetail() {
  const defaultProfile = require("@/assets/images/default_profile.png");

  const navigation = useNavigation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const getFlagByCode = (code: string) => {
    const found = countries.find((c) => c.code === code);
    return found ? found.flag : null;
  };

  const meetup = CARDS.find((card) => card.id === Number(id));
  if (!meetup) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>해당 모임을 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  const handleJoin = () => {
    if (meetup.status === "closed") {
      Alert.alert("모임이 마감되었습니다", "죄송해요. 방금 마감되었어요.");
      return;
    }
    router.push({
      pathname: "/meetup/chatRoom/[id]",
      params: { id: meetup.id.toString() },
    });
  };

  const titleDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
  }).format(new Date(meetup.meetupTime));

  let genderIcon = "⚧";
  if (meetup.gender === "Male") genderIcon = "♂";
  else if (meetup.gender === "Female") genderIcon = "♀";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ paddingLeft: 4, zIndex: 10 }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.BLACK}
              style={{ paddingBottom: 16, marginLeft: -4 }}
            />
          </Pressable>

          <Text style={styles.headerTitle}>Meet Up</Text>

          <Pressable
            onPress={() => {}}
            style={{ paddingRight: 0, paddingBottom: 16 }}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.BLACK}
            />
          </Pressable>
        </View>

        <Image
          source={
            typeof meetup.image === "string"
              ? { uri: meetup.image }
              : meetup.image
          }
          style={styles.image}
        />

        <View style={styles.infoBox}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              [{meetup.title}, {titleDate}]
            </Text>
            <View style={styles.avatars}>
              {meetup.participantAvatars.slice(0, 3).map((p, i) => (
                <View
                  key={i}
                  style={[
                    styles.avatarWrapper,
                    { marginLeft: i === 0 ? 0 : -10 },
                  ]}
                >
                  <Image
                    source={defaultProfile} // ✅ 고정 이미지
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                  <Image
                    source={getFlagByCode(p.countryCode)}
                    style={styles.flag}
                    resizeMode="cover"
                  />
                </View>
              ))}
              {meetup.participantAvatars.length > 3 && (
                <View style={styles.moreBadge}>
                  <Text style={styles.moreText}>
                    +{meetup.participantAvatars.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.tagRow}>
            <Text style={styles.tag}>#{meetup.tag}</Text>
            {meetup.gender === "Male" && (
              <>
                <Text style={styles.tag}>#</Text>
                <FontAwesome5
                  name="mars"
                  size={22}
                  color={colors.PURPLE_300}
                  style={{ paddingTop: 8 }}
                />
              </>
            )}
            {meetup.gender === "Female" && (
              <>
                <Text style={styles.tag}>#</Text>
                <FontAwesome5
                  name="venus"
                  size={22}
                  color={colors.PURPLE_300}
                  style={{ paddingTop: 8 }}
                />
              </>
            )}
            {meetup.gender === "All" && (
              <>
                <Text style={styles.tag}>#</Text>
                <FontAwesome5
                  name="transgender"
                  size={22}
                  color={colors.PURPLE_300}
                  style={{ paddingTop: 8 }}
                />
              </>
            )}
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
          Open Until: {formatKSTDate(meetup.expiresAt)}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },

  header: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_300,
    paddingBottom: 4,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    paddingBottom: 8,
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
    zIndex: 2,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4, // Android용
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: colors.WHITE,
    backgroundColor: colors.GRAY_200, // 혹시 이미지 로딩 안 될 때 대비
    zIndex: 1,
  },

  avatars: {
    flexDirection: "row",
    zIndex: 2,
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
    zIndex: 5,
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
  gender: {
    fontSize: 16,
    color: colors.PURPLE_300,
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
