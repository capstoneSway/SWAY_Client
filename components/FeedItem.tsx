import { toggleLike, toggleScrap } from "@/app/api/board";
import { colors } from "@/constants/color";
import Post from "@/type/types";
import { AntDesign, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Profile from "./Profile";

interface FeedItemProps {
  post: Post;
  isDetail?: boolean;
}

const FeedItem = ({ post, isDetail = false }: FeedItemProps) => {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);

  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked ?? false);
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmarks ?? 0);

  const [commentCount, setCommentCount] = useState(post.comments ?? 0);

  useEffect(() => {
    setIsLiked(post.isLiked ?? false);
    setLikeCount(post.likes ?? 0);
    setIsBookmarked(post.isBookmarked ?? false);
    setBookmarkCount(post.bookmarks ?? 0);
    setCommentCount(post.comments ?? 0);
  }, [post]);

  const ContainerComponent = isDetail ? View : Pressable;

  const handlePressFeed = () => {
    if (!isDetail) {
      router.push(`/board/${post.id}`);
    }
  };

  const handleLike = async () => {
    try {
      await toggleLike(post.id);
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("좋아요 실패:", error);
    }
  };

  const handleScrap = async () => {
    try {
      await toggleScrap(post.id);
      setIsBookmarked((prev) => !prev);
      setBookmarkCount((prev) => (isBookmarked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("스크랩 실패:", error);
    }
  };

  return (
    <ContainerComponent style={styles.container} onPress={handlePressFeed}>
      <View style={styles.contentContainer}>
        <Profile
          imageUri={post?.author?.imageUri ?? ""}
          nickname={post?.author?.nickname ?? "익명"}
          createdAt={post?.createdAt ?? new Date().toISOString()}
        />
        {post?.title ? <Text style={styles.title}>{post.title}</Text> : null}
        {post?.description ? (
          <Text style={styles.description}>{post.description}</Text>
        ) : null}
      </View>

      <View style={styles.menuContainer}>
        <Pressable style={styles.menu} onPress={handleLike}>
          <AntDesign
            name={isLiked ? "heart" : "hearto"}
            size={20}
            color={isLiked ? colors.RED_500 : colors.BLACK}
          />
          <Text style={isLiked ? styles.activeMenuText : styles.menuText}>
            {likeCount > 0 ? likeCount : ""}
          </Text>
        </Pressable>

        <Pressable style={styles.menu}>
          <FontAwesome6 name="comment" size={20} color={colors.BLACK} />
          <Text style={styles.menuText}>{commentCount}</Text>
        </Pressable>

        <Pressable style={styles.menu} onPress={handleScrap}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isBookmarked ? colors.PURPLE_300 : colors.BLACK}
          />
          <Text style={styles.menuText}>{bookmarkCount}</Text>
        </Pressable>
      </View>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 12,
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopColor: colors.GRAY_300,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  title: {
    fontSize: 16,
    color: colors.BLACK,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.BLACK,
    marginBottom: 14,
  },
  menu: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    width: "33%",
    marginHorizontal: 4,
  },
  menuText: {
    fontSize: 14,
    color: colors.GRAY_700,
    marginLeft: 4,
  },
  activeMenuText: {
    fontWeight: "600",
    color: colors.RED_500,
    marginLeft: 4,
  },
});

export default FeedItem;
