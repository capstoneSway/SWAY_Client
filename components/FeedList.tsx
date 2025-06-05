import { fetchBoardList, toggleLike, toggleScrap } from "@/app/api/board";
import type { Post } from "@/app/type/types";
import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import FeedItem from "./FeedItem";

export type FeedListRef = {
  reload: () => void;
};

const FeedList = forwardRef<FeedListRef>((_, ref) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [originalPosts, setOriginalPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const params = useLocalSearchParams();
  const router = useRouter();
  const refreshFlag = params.refresh === "true";

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchBoardList();
      setPosts(data);
      setOriginalPosts(data);
    } catch (error) {
      console.error("❌ 게시글 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncUpdatedPost = async () => {
    try {
      const savedPostStr = await AsyncStorage.getItem("@selectedPost");
      if (savedPostStr) {
        const savedPost: Post = JSON.parse(savedPostStr);
        setPosts((prev) =>
          prev.map((p) => (p.id === savedPost.id ? savedPost : p))
        );
        await AsyncStorage.removeItem("@selectedPost");
      }
    } catch (err) {
      console.error("❌ 상태 동기화 실패:", err);
    }
  };

  const insertNewPost = async () => {
    try {
      const savedPostStr = await AsyncStorage.getItem("@newPost");
      if (savedPostStr) {
        const newPost: Post = JSON.parse(savedPostStr);
        setPosts((prev) => [newPost, ...prev]);
        setOriginalPosts((prev) => [newPost, ...prev]);
        await AsyncStorage.removeItem("@newPost");
      }
    } catch (err) {
      console.error("❌ 새 게시글 반영 실패:", err);
    }
  };

  useImperativeHandle(ref, () => ({
    reload: () => loadPosts(),
  }));

  useEffect(() => {
    if (isFocused) {
      if (refreshFlag) {
        loadPosts().then(insertNewPost);
        router.replace("/board");
      } else {
        loadPosts().then(() => {
          syncUpdatedPost();
          insertNewPost();
        });
      }
    }
  }, [isFocused, refreshFlag]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    await syncUpdatedPost();
    await insertNewPost();
    setRefreshing(false);
  };

  const handleLike = async (postId: number) => {
    try {
      const updated = await toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                is_liked: updated.isLiked,
                like_count: updated.isLiked
                  ? (p.like_count ?? 0) + 1
                  : Math.max((p.like_count ?? 1) - 1, 0),
              }
            : p
        )
      );
    } catch (error) {
      console.error("❌ 좋아요 요청 실패:", error);
    }
  };

  const handleScrap = async (postId: number) => {
    try {
      const { isBookmarked } = await toggleScrap(postId);
      const updatedPost = posts.find((p) => p.id === postId);
      if (!updatedPost) return;

      const newPost = {
        ...updatedPost,
        is_scraped: isBookmarked,
        scrap_count: isBookmarked
          ? updatedPost.scrap_count + 1
          : Math.max(updatedPost.scrap_count - 1, 0),
      };

      setPosts((prev) => prev.map((p) => (p.id === postId ? newPost : p)));
      await AsyncStorage.setItem("@selectedPost", JSON.stringify(newPost));
    } catch (error) {
      console.error("❌ 스크랩 요청 실패:", error);
    }
  };

  const updatePostInFeed = (postId: number, updatedFields: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...updatedFields } : p))
    );
  };

  const handleSearch = () => {
    const keyword = searchText.toLowerCase();
    const filtered = originalPosts.filter(
      (post) =>
        post.title?.toLowerCase().includes(keyword) ||
        post.description?.toLowerCase().includes(keyword)
    );
    setPosts(filtered);
  };

  const handleCommentPress = (postId: number) => {
    const currentPost = posts.find((p) => p.id === postId);
    if (!currentPost) return;
    router.push({
      pathname: "/board/[id]",
      params: {
        id: String(postId),
        post: JSON.stringify(currentPost),
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search"
          placeholderTextColor={colors.GRAY_500}
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
        data={posts}
        renderItem={({ item }) => (
          <FeedItem
            post={item}
            onLikePress={() => handleLike(item.id)}
            onScrapPress={() => handleScrap(item.id)}
            onCommentPress={() => handleCommentPress(item.id)}
          />
        )}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.contentContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color={colors.GRAY_500}
              style={{ marginTop: 50 }}
            />
          ) : (
            <Text style={styles.emptyText}>No posts available.</Text>
          )
        }
      />
    </View>
  );
});

export default FeedList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  contentContainer: {
    paddingBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    color: colors.GRAY_500,
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
});
