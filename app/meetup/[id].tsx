import FixedBottomCTA from "@/components/FixedBottomCTA";
import { CARDS } from "@/constants/cards";
import { colors } from "@/constants/color";
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
  const navigation = useNavigation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

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
              style={{ paddingBottom: 16 }}
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

        <Image source={{ uri: meetup.image }} style={styles.image} />

        <View style={styles.infoBox}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              [{meetup.title}, {titleDate}]
            </Text>
            <View style={styles.avatars}>
              {meetup.participantAvatars.slice(0, 3).map((uri, i) => (
                <Image
                  key={`${uri}-${i}`}
                  source={{ uri }}
                  style={[styles.avatar, { marginLeft: i === 0 ? 0 : -10 }]}
                  resizeMode="cover"
                />
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
              <FontAwesome5 name="mars" size={20} color={colors.PURPLE_300} />
            )}
            {meetup.gender === "Female" && (
              <FontAwesome5 name="venus" size={20} color={colors.PURPLE_300} />
            )}
            {meetup.gender === "All" && (
              <FontAwesome5
                name="transgender"
                size={20}
                color={colors.PURPLE_300}
              />
            )}
          </View>

          <Text style={styles.description}>{meetup.content}</Text>

          <View style={styles.openUntilRow}>
            <Ionicons name="hourglass-outline" size={16} color={colors.BLACK} />
            <Text style={styles.openUntilText}>
              Open Until: {formatKSTDate(meetup.expiresAt)}
            </Text>
          </View>
        </View>

        {meetup.status !== "closed" && (
          <FixedBottomCTA label="Join" enabled={true} onPress={handleJoin} />
        )}
      </SafeAreaView>
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
    aspectRatio: 1.6,
    backgroundColor: colors.GRAY_200,
  },

  infoBox: {
    backgroundColor: colors.WHITE,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 60,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: -15,
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
  avatars: {
    flexDirection: "row",
    zIndex: 2,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.WHITE,
    zIndex: 1, // <- 추가
  },

  moreBadge: {
    width: 36,
    height: 36,
    borderRadius: 50,
    backgroundColor: colors.PURPLE_100,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -10,
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

  openUntilWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.WHITE,
  },

  openUntilRow: {
    flexDirection: "row",
    alignItems: "center",
    bottom: -260,
  },

  openUntilText: {
    fontSize: 18,
    color: colors.BLACK,
    marginLeft: 4,
  },
});
