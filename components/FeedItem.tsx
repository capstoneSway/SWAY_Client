import { toggleLike, toggleScrap } from "@/app/api/board";
import { colors } from "@/constants/color";
import Post from "@/type/types";
import { AntDesign, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Profile from "./Profile";

interface FeedItemProps {
  post: Post;
  isDetail?: boolean;
  onCommentPress?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const FeedItem = ({
  post,
  isDetail = false,
  onCommentPress,
  onDelete,
  onEdit,
}: FeedItemProps) => {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked ?? false);
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmarks ?? 0);
  const [commentCount, setCommentCount] = useState(post.commentCount ?? 0);

  const [showMenu, setShowMenu] = useState(false);
  const [isMyPost, setIsMyPost] = useState(false);

  useEffect(() => {
    const checkIsMyPost = async () => {
      const myId = await AsyncStorage.getItem("@userId");
      setIsMyPost(post?.userId?.toString() === myId);
    };
    checkIsMyPost();
  }, [post]);

  const ContainerComponent = isDetail ? View : Pressable;

  const handlePressFeed = () => {
    if (!isDetail) {
      router.push(`/board/${post.id}`);
    }
  };

  const handleLike = async () => {
    try {
      const updated = await toggleLike(post.id);
      setIsLiked(updated.isLiked);
      setLikeCount(updated.like);
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const handleScrap = async () => {
    try {
      const updated = await toggleScrap(post.id);
      setIsBookmarked(updated.isBookmarked);
      setBookmarkCount(updated.bookmarkCount);
    } catch (error) {
      console.error("Failed to bookmark:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete this post?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          onDelete?.();
          setShowMenu(false);
        },
      },
    ]);
  };

const handleEdit = () => {
  router.push({
    pathname: "/post/newpost",
    params: {
      edit: "true",
      id: post.id.toString(),
      title: post.title,
      description: post.description,
    },
  });
};

  const handleReport = () => {
    Alert.alert("Report submitted", "Thank you for your feedback.");
    setShowMenu(false);
  };

  return (
    <ContainerComponent style={styles.container} onPress={handlePressFeed}>
      <View style={styles.contentContainer}>
        <View style={styles.profileRow}>
          <Profile
            imageUri={post?.author?.imageUri ?? ""}
            nickname={post?.author?.nickname ?? "Anonymous"}
            createdAt={post?.createdAt ?? new Date().toISOString()}
          />

          {isDetail && (
            <Pressable onPress={() => setShowMenu(true)}>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.BLACK} />
            </Pressable>
          )}
        </View>

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

        <Pressable style={styles.menu} onPress={onCommentPress}>
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

      {/* Modal for ⋮ menu */}
      <Modal transparent visible={showMenu} animationType="fade">
        <Pressable style={styles.modalBackground} onPress={() => setShowMenu(false)}>
          <View style={styles.modalBox}>
            {isMyPost ? (
              <>
                <Pressable style={styles.menuItem} onPress={handleEdit}>
                  <Text style={styles.menuTextOnly}>Edit Post</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={handleDelete}>
                  <Text style={[styles.menuTextOnly, { color: "red" }]}>Delete Post</Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.menuItem} onPress={handleReport}>
                <Text style={styles.menuTextOnly}>Report Post</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
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
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    color: colors.RED,
    marginLeft: 4,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    paddingVertical: 12,
    width: 220,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuTextOnly: {
    fontSize: 16,
    color: colors.BLACK,
  },
});

export default FeedItem;
