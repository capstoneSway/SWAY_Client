// ProfileScreen.tsx
import React, { useState } from "react";
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
  ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/color";
import { useFonts } from "expo-font";

const { width: SCREEN_W } = Dimensions.get("window");

// — Types
interface Meetup {
  id: string;
  title: string;
  date: string;
  time: string;
  tag: string;
  joined: number;
}

type TabKey = "meetups" | "posts" | "book";

interface Tab {
  key: TabKey;
  label: string;
}

// — Dummy Data
const dummyMeetups: Meetup[] = [
  {
    id: "1",
    title: "Hongdae Cafe Tour",
    date: "April 6, 2025",
    time: "6pm",
    tag: "Foodie",
    joined: 5,
  },
  {
    id: "2",
    title: "Seongsu",
    date: "March 18, 2025",
    time: "3pm",
    tag: "WorkOut",
    joined: 3,
  },
  {
    id: "3",
    title: "Gwanghwamun History Walk",
    date: "May 2, 2025",
    time: "4pm",
    tag: "Culture",
    joined: 8,
  },
];

const tabs: Tab[] = [
  { key: "meetups", label: "My Meet Ups" },
  { key: "posts", label: "My Post" },
  { key: "book", label: "Bookmark" },
];

const ProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("meetups");
  const [fontsLoaded] = useFonts({
    GasoekOne: require("@/assets/fonts/GasoekOne-Regular.ttf"),
  });
  if (!fontsLoaded) return null;

  const renderMeetup = ({ item }: ListRenderItemInfo<Meetup>) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>
        Meetup Date: {item.date} {item.time}
      </Text>
      <View style={styles.badgeRow}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>#{item.tag}</Text>
        </View>
        <View style={styles.countBadge}>
          <Ionicons name="people" size={12} style={{ marginRight: 4 }} />
          <Text style={styles.countText}>{item.joined} joined</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.logoText}>SWAY</Text>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} />
        </TouchableOpacity>
      </View>

      {/* 프로필 */}
      <View style={styles.profileSection}>
        <Image
          // 실제 URI로 교체하거나 require() 사용
          source={require("@/assets/images/default_profile.png")}
          style={styles.avatar}
        />
        <Text style={styles.username}>🇺🇸 Kristen</Text>
      </View>

      {/* 탭 */}
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

      {/* 콘텐츠 */}
      <View style={styles.content}>
        {activeTab === "meetups" ? (
          <FlatList<Meetup>
            data={dummyMeetups}
            keyExtractor={(item) => item.id}
            renderItem={renderMeetup}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={{ color: colors.GRAY_700 }}>
              {activeTab === "posts" ? "No posts yet." : "No bookmarks yet."}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

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
    paddingVertical: 20,
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
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
});
