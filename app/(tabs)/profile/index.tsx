// ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ListRenderItemInfo,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/color";
import { useFonts } from "expo-font";
import fetchUserInfo from "@/app/api/fetchUserInfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { countries } from "@/constants/country";
import { useRouter } from "expo-router";
import { api } from "@/app/api/axios";
import eventEmitter from "@/utils/eventEmitter";
import { unscrapPost } from "@/app/api/scrapped";

const { width: SCREEN_W } = Dimensions.get("window");

interface Meetup {
  id: string;
  title: string;
  meeting_date: string;
  category: string;
  current_participant: number;
  status: "inProgress" | "Done" | "canceled";
}

const statusLabelMap: Record<string, string> = {
  inProgress: "In Progress",
  canceled: "Canceled",
  done: "Done",
};

interface User {
  profileImageUrl: string;
  country: string;
  nickname: string;
}

type TabKey = "meetups" | "posts" | "book";

type PostItem = {
  id: number;
  username: string;
  nickname: string;
  profile_image: string;
  nationality: string;
  title: string;
  content: string;
  images: string[];
  date: string;
  like_count: number;
  comment_count: number;
  scrap_count: number;
  is_liked: boolean;
  is_scraped: boolean;
};

interface Tab {
  key: TabKey;
  label: string;
}

const tabs: Tab[] = [
  { key: "meetups", label: "My Meet Ups" },
  { key: "posts", label: "My Post" },
  { key: "book", label: "Bookmark" },
];

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("meetups");
  const [fontsLoaded] = useFonts({
    GasoekOne: require("@/assets/fonts/GasoekOne-Regular.ttf"),
  });
  const [user, setUser] = useState<User | null>(null);
  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [scrappedPosts, setScrappedPosts] = useState<PostItem[]>([]);
  const [participatedMeetups, setParticipatedMeetups] = useState<Meetup[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("@jwt");
        if (!token) return;
        const data = await fetchUserInfo(token);
        if (data)
          setUser({
            profileImageUrl: data.profile_image,
            country: data.nationality,
            nickname: data.nickname,
          });
      } catch (error) {
        console.error("유저 정보 로드 실패:", error);
      }
    };
    loadUser();
    const handleNicknameChange = () => {
      loadUser();
    };
    eventEmitter.on("nicknameChanged", handleNicknameChange);
    return () => {
      eventEmitter.off("nicknameChanged", handleNicknameChange);
    };
  }, []);

  useEffect(() => {
    const fetchMyPage = async () => {
      try {
        const res = await api.get("/mypage/");
        setMyPosts(res.data.my_posts);
        setScrappedPosts(res.data.scrapped_posts);
        setParticipatedMeetups(res.data.participanted_lightening || []);
      } catch (err) {
        console.error("마이페이지 데이터 불러오기 실패", err);
      }
    };
    fetchMyPage();
  }, []);

  const countryData =
    user && user.country
      ? countries.find(
          (c) => c.name.toLowerCase() === user.country.toLowerCase()
        )
      : undefined;

  const renderMeetup = ({ item }: ListRenderItemInfo<Meetup>) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>
        Meetup Date:{" "}
        {new Date(item.meeting_date).toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </Text>
      <View style={styles.badgeRow}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>
            #{item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Ionicons name="people" size={12} style={{ marginRight: 4 }} />
          <Text style={styles.countText}>
            {item.current_participant} joined
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === "Done" && styles.statusDone,
            item.status === "canceled" && styles.statusCancel,
          ]}
        >
          <Text style={styles.statusText}>{statusLabelMap[item.status]}</Text>
        </View>
      </View>
    </View>
  );

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isPostOptionModalVisible, setPostOptionModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>SWAY</Text>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => router.push("/setting/settings")}>
          <Ionicons name="settings-outline" size={24} />
        </TouchableOpacity>
      </View>
      <View style={styles.profileSection}>
        <Image
          source={
            user?.profileImageUrl
              ? { uri: user.profileImageUrl }
              : require("@/assets/images/default_profile.png")
          }
          style={styles.avatar}
        />
        <Text style={styles.username}>
          {countryData?.emoji || "🌐"} {user?.nickname || "User"}
        </Text>
      </View>
      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(t.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === t.key && styles.tabTextActive,
              ]}
            >
              {t.label}
            </Text>
            {activeTab === t.key && <View style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>
        {activeTab === "meetups" ? (
          participatedMeetups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ color: colors.GRAY_700 }}>No meetups yet.</Text>
            </View>
          ) : (
            <FlatList
              data={participatedMeetups}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMeetup}
              contentContainerStyle={{ paddingBottom: 80 }}
            />
          )
        ) : activeTab === "posts" ? (
          myPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ color: colors.GRAY_700 }}>No posts yet.</Text>
            </View>
          ) : (
            <FlatList
              data={myPosts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.postContainer}>
                  <View style={styles.postHeader}>
                    <View style={styles.avatarWrapper}>
                      <Image
                        source={
                          item.profile_image
                            ? { uri: item.profile_image }
                            : require("@/assets/images/default_profile.png")
                        }
                        style={styles.postAvatar}
                      />
                      {/* 국기 이미지 (우하단 위치) */}
                      <Image
                        source={
                          countries.find((c) => c.name === item.nationality)
                            ?.flag
                            ? countries.find(
                                (c) => c.name === item.nationality
                              )!.flag
                            : require("@/assets/images/default_profile.png")
                        }
                        style={styles.flagBadge}
                      />
                    </View>

                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.postNickname}>{item.nickname}</Text>
                      <Text style={styles.postTime}>
                        {new Date(item.date).toLocaleString("en-US", {
                          hour: "numeric",
                          hour12: true,
                          weekday: "short",
                        })}{" "}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.postTitle}>{item.title}</Text>
                  <Text style={styles.postContent}>{item.content}</Text>

                  <View style={styles.iconRow}>
                    <View style={styles.iconWithCount}>
                      <Ionicons
                        name="heart-outline"
                        size={20}
                        color={colors.BLACK}
                      />
                      <Text style={styles.iconCount}>{item.like_count}</Text>
                    </View>
                    <View style={styles.iconWithCount}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={20}
                        color={colors.BLACK}
                      />
                      <Text style={styles.iconCount}>{item.comment_count}</Text>
                    </View>
                    <View style={styles.iconWithCount}>
                      <Ionicons
                        name="bookmark-outline"
                        size={20}
                        color={colors.BLACK}
                      />
                      <Text style={styles.iconCount}>{item.scrap_count}</Text>
                    </View>
                  </View>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 80 }}
            />
          )
        ) : scrappedPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ color: colors.GRAY_700 }}>No bookmarks yet.</Text>
          </View>
        ) : (
          <FlatList
            data={scrappedPosts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.postContainer}>
                <View style={styles.postHeader}>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={
                        item.profile_image
                          ? { uri: item.profile_image }
                          : require("@/assets/images/default_profile.png")
                      }
                      style={styles.postAvatar}
                    />
                    <Image
                      source={
                        countries.find((c) => c.name === item.nationality)?.flag
                          ? countries.find((c) => c.name === item.nationality)!
                              .flag
                          : require("@/assets/images/default_profile.png")
                      }
                      style={styles.flagBadge}
                    />
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.postNickname}>{item.nickname}</Text>
                    <Text style={styles.postTime}>
                      {new Date(item.date).toLocaleString("en-US", {
                        hour: "numeric",
                        hour12: true,
                        weekday: "short",
                      })}{" "}
                    </Text>
                  </View>
                </View>

                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postContent}>{item.content}</Text>

                <View style={styles.iconRow}>
                  <View style={styles.iconWithCount}>
                    <Ionicons
                      name="heart-outline"
                      size={20}
                      color={colors.BLACK}
                    />
                    <Text style={styles.iconCount}>{item.like_count}</Text>
                  </View>
                  <View style={styles.iconWithCount}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color={colors.BLACK}
                    />
                    <Text style={styles.iconCount}>{item.comment_count}</Text>
                  </View>
                  <View style={styles.iconWithCount}>
                    <Ionicons
                      name="bookmark"
                      size={20}
                      color={colors.PURPLE_300}
                      onPress={async () => {
                        try {
                          const token = await AsyncStorage.getItem("@jwt");
                          if (!token) {
                            Alert.alert("로그인 필요", "로그인이 필요합니다.");
                            return;
                          }

                          await api.delete(`/api/scrap/${item.id}/`, {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          });

                          setScrappedPosts((prev) =>
                            prev.filter((p) => p.id !== item.id)
                          );
                        } catch (err) {
                          console.error("스크랩 해제 실패:", err);
                          Alert.alert("오류", "스크랩 해제에 실패했습니다.");
                        }
                      }}
                    />

                    <Text
                      style={[styles.iconCount, { color: colors.PURPLE_300 }]}
                    >
                      {item.scrap_count}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.WHITE },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
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
    left: SCREEN_W / 2 - 40,
    fontSize: 18,
    fontWeight: "600",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 100,
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.GRAY_300,
  },
  username: {
    fontSize: 36,
    fontWeight: "500",
    marginTop: 20,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_300,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 16,
    color: colors.GRAY_700,
  },
  tabTextActive: {
    fontWeight: "700",
    color: colors.BLACK,
  },
  underline: {
    position: "absolute",
    bottom: 0,
    height: 2,
    width: "100%",
    backgroundColor: colors.BLACK,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 5,
    backgroundColor: "#fbfbfb",
  },
  card: {
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 8,
    marginHorizontal: 5,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.PURPLE_300,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.BLACK,
    marginTop: 4,
    marginBottom: 15,
  },
  badgeRow: {
    flexDirection: "row",
    marginVertical: 8,
  },
  tagBadge: {
    backgroundColor: colors.PURPLE_100,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    color: colors.BLACK,
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.GRAY_100,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 12,
    color: colors.BLACK,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.YELLOW_300,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 7,
  },
  statusText: { fontSize: 12 },
  statusDone: { backgroundColor: colors.GRAY_100 },
  statusCancel: { backgroundColor: colors.RED_100 },
  postContainer: {
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  postNickname: {
    fontSize: 14,
    fontWeight: "600",
  },

  postTime: {
    fontSize: 12,
    color: colors.GRAY_600,
    marginTop: 2,
  },

  postTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.BLACK,
    marginBottom: 4,
  },

  postContent: {
    fontSize: 14,
    color: colors.BLACK,
    marginBottom: 12,
  },

  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 6,
  },

  iconWithCount: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },

  iconCount: {
    marginLeft: 4,
    fontSize: 14,
  },
  avatarWrapper: {
    position: "relative",
    width: 40,
    height: 40,
  },

  flagBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.WHITE,
  },
});
