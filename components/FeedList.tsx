import React, { useEffect, useState, useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { fetchBoardList, toggleLike, toggleScrap } from "@/app/api/board";
import { colors } from "@/constants/color";
import FeedItem from "./FeedItem";
import type { Post } from "@/app/type/types";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";

export default function FeedList() {
  const [posts, setPosts] = useState<Post[]>([]);

  // 게시글 목록 불러오기 (최초 진입 & 뒤로 복귀 시)
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const data = await fetchBoardList();
        setPosts(data);
      };
      load();
    }, [])
  );

  // 좋아요 처리 함수
  const handleLike = async (postId: number) => {
    try {
      const updated = await toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: updated.isLiked, likes: updated.like }
            : p
        )
      );
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  // 스크랩 처리 함수
  const handleScrap = async (postId: number) => {
    try {
      const updated = await toggleScrap(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isBookmarked: updated.isBookmarked,
                bookmarks: updated.bookmarkCount,
              }
            : p
        )
      );
    } catch (error) {
      console.error("Failed to toggle scrap:", error);
    }
  };

  return (
    <View style={styles.container}>
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
                  post: JSON.stringify(item),
                },
              })
            }
          />
        )}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  contentContainer: {
    paddingBottom: 12,
  },
});
