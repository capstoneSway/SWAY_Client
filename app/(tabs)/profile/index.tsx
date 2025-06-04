import { api } from "@/app/api/axios";
import { toggleLike } from "@/app/api/board";
import { fetchUserInfo } from "@/app/api/fetchUserInfo";
import FeedItem from "@/components/FeedItem";
import { colors } from "@/constants/color";
import { countries } from "@/constants/country";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");

const tabs = [
  { key: "meetups", label: "My Meet Ups" },
  { key: "posts", label: "My Post" },
  { key: "book", label: "Bookmark" },
];

const statusLabelMap = {
  inProgress: "In Progress",
  canceled: "Canceled",
  done: "Done",
};

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [scrappedPosts, setScrappedPosts] = useState([]);
  const [participatedMeetups, setParticipatedMeetups] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [myUsername, setMyUsername] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const token = await AsyncStorage.getItem("@jwt");
    const username = await AsyncStorage.getItem("myUsername");
    if (!token || !username) return;

    setMyUsername(username);

    const userInfo = await fetchUserInfo(token);
    setUser(userInfo);

    const res = await api.get("/mypage/");

    const postsWithAuthor = res.data.my_posts.map((post) => ({
      ...post,
      title: post.title,
      description: post.content,
      createdAt: post.date,
      imageUris: (post.images ?? []).map((img) => img.image_url),
      author: {
        username: username,
        nickname: post.nickname,
        imageUri: post.profile_image,
        nationality: post.nationality,
      },
    }));

    const scrapsWithAuthor = res.data.scrapped_posts.map((post) => ({
      ...post,
      title: post.title,
      description: post.content,
      createdAt: post.date,
      imageUris: (post.images ?? []).map((img) => img.image_url),
      author: {
        username: post.username,
        nickname: post.nickname,
        imageUri: post.profile_image,
        nationality: post.nationality,
      },
    }));

    const sortMeetups = (meetups) => {
      return meetups.slice().sort((a, b) => {
        const isAInProgress = a.status === "inProgress";
        const isBInProgress = b.status === "inProgress";
        if (isAInProgress && !isBInProgress) return -1;
        if (!isAInProgress && isBInProgress) return 1;
        return (
          new Date(b.meeting_date).getTime() -
          new Date(a.meeting_date).getTime()
        );
      });
    };

    const sortedMeetups = sortMeetups(res.data.participanted_lightening || []);

    setMyPosts(postsWithAuthor);
    setScrappedPosts(scrapsWithAuthor);
    setParticipatedMeetups(sortedMeetups); // ✅ 정렬된 결과를 적용
  };

  useEffect(() => {
    if (activeTab === "book" || activeTab === "posts") {
      fetchData(); // Bookmark 또는 My Post 탭을 선택했을 때 fetchData 호출
    }
  }, [activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const renderMeetup = ({ item }) => {
    const now = new Date();
    const endTime = new Date(item.end_time);

    // end_time이 지났으면 상태를 강제로 done으로 표시
    const isEnded = now > endTime;
    const displayStatus = isEnded ? "done" : item.status;

    //console.log("🟡 번개 상태 확인:", {
    //title: item.title,
    //status: item.status,
    //displayStatus,
    //end_time: item.end_time,
    //});

    return (
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
              displayStatus === "done" && styles.statusDone,
              displayStatus === "canceled" && styles.statusCancel,
            ]}
          >
            <Text style={styles.statusText}>
              {statusLabelMap[displayStatus]}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const handlePostLikeToggle = async (postId) => {
    try {
      const result = await toggleLike(postId);
      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                is_liked: result.isLiked,
                like_count: result.isLiked
                  ? p.like_count + 1
                  : Math.max(p.like_count - 1, 0),
              }
            : p
        )
      );
      setScrappedPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                is_liked: result.isLiked,
                like_count: result.isLiked
                  ? p.like_count + 1
                  : Math.max(p.like_count - 1, 0),
              }
            : p
        )
      );
    } catch (err) {
      console.error("좋아요 토글 실패:", err);
    }
  };

  const handleScrapToggle = async (post) => {
    try {
      const res = await api.post(`/board/${post.id}/scrap/`);
      //console.log("✅ scrap toggle response:", res.data);

      if (res.data.scrapped === false) {
        // 스크랩 해제 시 목록에서 제거
        setScrappedPosts((prev) => prev.filter((p) => p.id !== post.id));
      } else if (res.data.scrapped === true) {
        // 스크랩 추가 시 목록에 없으면 추가
        setScrappedPosts((prev) => {
          const alreadyExists = prev.some((p) => p.id === post.id);
          return alreadyExists ? prev : [post, ...prev];
        });
      }
    } catch (err) {
      console.error("❌ Scrap toggle failed:", err);
      Alert.alert("Error", "Failed to update bookmark status.");
    }
  };

  const renderFeedItem = (item, isMyPostTab = false) => {
    const handleNavigate = () => {
      router.push(`/board/${item.id}`);
    };

    return (
      <TouchableOpacity activeOpacity={0.9} onPress={handleNavigate}>
        <FeedItem
          key={`mypage-post-${item.id}`}
          post={item}
          isDetail={true}
          onCommentPress={handleNavigate}
          onLikePress={() => handlePostLikeToggle(item.id)}
          onScrapPress={() => handleScrapToggle(item)}
          {...(isMyPostTab && {
            onDelete: async () => {
              setMyPosts((prev) => prev.filter((p) => p.id !== item.id));
            },
            onEdit: () =>
              router.push({
                pathname: "/post/newpost",
                params: {
                  id: item.id,
                  edit: "true",
                  title: item.title,
                  description: item.description,
                },
              }),
          })}
        />
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    if (activeTab === "book") {
      fetchData(); // Bookmark 탭 선택 시 스크랩 목록을 최신 상태로 동기화
    }
  }, [activeTab]);

  const renderContent = () => {
    if (activeTab === "meetups") {
      return participatedMeetups.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: colors.GRAY_700 }}>No meetups yet.</Text>
        </View>
      ) : (
        <FlatList
          data={participatedMeetups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMeetup}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 80, alignItems: "center" }}
        />
      );
    } else if (activeTab === "posts") {
      return myPosts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: colors.GRAY_700 }}>No posts yet.</Text>
        </View>
      ) : (
        <FlatList
          data={myPosts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderFeedItem(item, true)}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      );
    } else {
      return scrappedPosts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: colors.GRAY_700 }}>No bookmarks yet.</Text>
        </View>
      ) : (
        <FlatList
          data={scrappedPosts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderFeedItem(item, false)}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      );
    }
  };

  const countryData =
    user && user.nationality
      ? countries.find(
          (c) => c.name.toLowerCase() === user.nationality.toLowerCase()
        )
      : undefined;

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
        <View style={styles.avatarWrapper}>
          <Image
            source={
              user?.profile_image
                ? { uri: user.profile_image }
                : require("@/assets/images/default_profile.png")
            }
            style={styles.avatar}
          />
        </View>
        <Text style={styles.username}>
          {countryData?.emoji || "🌐"} {user?.nickname || "User"}
        </Text>
      </View>
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={styles.tabItem}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </View>
      {renderContent()}
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
    left: SCREEN_W / 2 - 40,
    fontSize: 18,
    fontWeight: "600",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 15,
  },
  avatarWrapper: {
    position: "relative",
    width: 120,
    height: 120,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 100,
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
  postContainer: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    width: SCREEN_W * 0.95,
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 15,
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
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
});
