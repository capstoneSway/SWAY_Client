import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchBoardList, toggleLike, toggleScrap } from "@/app/api/board";
import type { Post } from "@/app/type/types";
import { colors } from "@/constants/color";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FeedItem from "./FeedItem";

export type FeedListRef = {
  reload: () => void;
};

const FeedList = forwardRef<FeedListRef>((_, ref) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [originalPosts, setOriginalPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const isFocused = useIsFocused();
  const params = useLocalSearchParams();
  const router = useRouter();

  const refreshFlag = params.refresh === "true";

  const loadPosts = async () => {
    try {
      const data = await fetchBoardList();
      setPosts(data);
      setOriginalPosts(data);
    } catch (error) {
      console.error("❌ 게시글 불러오기 실패:", error);
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

  useImperativeHandle(ref, () => ({
    reload: () => {
      loadPosts();
    },
  }));

  useEffect(() => {
    if (isFocused) {
      if (refreshFlag) {
        loadPosts();
        router.replace("/board"); // refresh 후 주소에서 refresh 파라미터 제거
      } else {
        loadPosts();
        syncUpdatedPost();
      }
    }
  }, [isFocused, refreshFlag]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPosts();
      await syncUpdatedPost();
    } catch (error) {
      console.error("❌ 새로고침 실패:", error);
    } finally {
      setRefreshing(false);
    }
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
      console.error("❌ 좋아요 처리 실패:", error);
    }
  };

  const handleScrap = async (postId: number) => {
    try {
      const updated = await toggleScrap(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                is_scrapped: updated.isBookmarked,
                scrap_count: updated.isBookmarked
                  ? (p.scrap_count ?? 0) + 1
                  : Math.max((p.scrap_count ?? 1) - 1, 0),
              }
            : p
        )
      );
    } catch (error) {
      console.error("❌ 스크랩 처리 실패:", error);
    }
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
            onCommentPress={() =>
              router.push({
                pathname: "/board/[id]",
                params: {
                  id: String(item.id),
                },
              })
            }
          />
        )}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.contentContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={<Text style={styles.emptyText}>게시글이 없습니다.</Text>}
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
