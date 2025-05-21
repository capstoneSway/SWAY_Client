import { fetchBoardList } from "@/app/api/board";
import CommonHeader from "@/components/CommonHeader";
import FeedItem from "@/components/FeedItem";
import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function BoardScreen() {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchBoardList();
        const raw = params?.newPost;

        if (raw && raw !== "undefined") {
          const newPost = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (newPost?.title && newPost?.description) {
            const updated = [newPost, ...data];
            setPosts(updated);
            setFilteredPosts(updated);
          } else {
            setPosts(data);
            setFilteredPosts(data);
          }
          router.setParams({});
        } else {
          setPosts(data);
          setFilteredPosts(data);
        }
      } catch (error) {
        console.error("❌ 게시글 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleSearch = () => {
    const keyword = searchText.toLowerCase();
    const filtered = posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(keyword) ||
        post.description?.toLowerCase().includes(keyword)
    );
    setFilteredPosts(filtered);
  };

  return (
    <View style={styles.container}>
      <CommonHeader title="Board" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.PURPLE_300} />
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search"
              placeholderTextColor={colors.GRAY_400}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              style={styles.searchInput}
            />
            <Pressable onPress={handleSearch}>
              <Ionicons
                name="search"
                size={20}
                color={colors.GRAY_500}
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          </View>

          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <FeedItem post={item} />}
            ListEmptyComponent={
              <Text style={{ padding: 16 }}>No posts available.</Text>
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </>
      )}

      <Pressable
        style={styles.writeButton}
        onPress={() => router.push("/post/newpost")}
      >
        <Ionicons name="pencil" size={32} color={colors.WHITE} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.GRAY_100,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.BLACK,
  },
  writeButton: {
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
    zIndex: 10,
  },
});
