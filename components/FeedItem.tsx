import {
  blockPostAuthor,
  deletePost,
} from "@/app/api/board";
import { Post } from "@/app/type/types";
import { colors } from "@/constants/color";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Profile from "./Profile";
import ReportModal from "./ReportModal";

interface FeedItemProps {
  post: Post;
  isDetail?: boolean;
  onCommentPress?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onLikePress?: () => void;  
  onScrapPress?: () => void;
  hideMenu?: boolean;
}

const FeedItem = ({
  post,
  isDetail = false,
  onCommentPress,
  onDelete,
  onEdit,
  onLikePress,
  onScrapPress,
  hideMenu,
}: FeedItemProps) => {
  const [isMyPost, setIsMyPost] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);

  useEffect(() => {
    const checkIsMyPost = async () => {
      const myUsername = await AsyncStorage.getItem("myUsername");
      if (myUsername && post?.author?.username) {
        setIsMyPost(post.author.username === myUsername);
      }
    };
    checkIsMyPost();
  }, [post]);

  const ContainerComponent = isDetail ? View : Pressable;

  const handlePressFeed = () => {
    if (!isDetail) {
      router.push({
        pathname: "/board/[id]",
        params: { id: String(post.id) },
      });
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete this post?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost(post.id);
            Alert.alert("Post deleted");

            if (isDetail) {
              router.back();
            } else {
              onDelete?.();
            }
            setShowMenu(false);
          } catch (error) {
            console.error("❌ Failed to delete post:", error);
            Alert.alert("Error", "Failed to delete the post. Please try again.");
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    setShowMenu(false);
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
    setReportVisible(true);
    setShowMenu(false);
  };

  const handleBlock = async () => {
    try {
      await blockPostAuthor(post.id);
      Alert.alert("Blocked", "You will no longer see posts from this user.");
      setShowMenu(false);
      if (isDetail) {
        router.back();
      }
    } catch (err) {
      console.error("Failed to block user:", err);
      Alert.alert("Error", "Failed to block the author.");
      setShowMenu(false);
    }
  };

  return (
    <ContainerComponent style={styles.container} onPress={handlePressFeed}>
      <View style={styles.contentContainer}>
        <View style={styles.profileRow}>
          <Profile
            imageUri={post?.author?.imageUri ?? ""}
            nickname={post?.author?.nickname ?? "Anonymous"}
            createdAt={post?.createdAt ?? new Date().toISOString()}
            nationality={post?.author?.nationality ?? ""}
          />
        </View>

        {post?.title ? <Text style={styles.title}>{post.title}</Text> : null}
        {post?.description ? (
          <Text style={styles.description}>{post.description}</Text>
        ) : null}

        {post.imageUris && post.imageUris.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {post.imageUris.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.menuContainer}>
        {/* 좋아요 */}
        <Pressable style={styles.menu} onPress={onLikePress}>
          <Feather
            name="heart"
            size={20}
            color={post.is_liked ? colors.RED_500 : colors.GRAY_700}
          />
          <Text
            style={[
              styles.menuText,
              post.is_liked && { color: colors.RED_500, fontWeight: "600" },
            ]}
          >
            {post.like_count ?? 0}
          </Text>
        </Pressable>

        {/* 댓글 */}
        <Pressable style={styles.menu} onPress={onCommentPress}>
          <Feather name="message-circle" size={20} color={colors.GRAY_700} />
          <Text style={styles.menuText}>{post.comment_count ?? 0}</Text>
        </Pressable>

        {/* 스크랩 */}
        <Pressable style={styles.menu} onPress={onScrapPress}>
          <Feather
            name="bookmark"
            size={20}
            color={post.is_scrapped ? colors.PURPLE_300 : colors.GRAY_700}
          />
          <Text
            style={[
              styles.menuText,
              post.is_scrapped && { color: colors.PURPLE_300, fontWeight: "600" },
            ]}
          >
            {post.scrap_count ?? 0}
          </Text>
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
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  imageScroll: {
    marginTop: 12,
    flexDirection: "row",
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.GRAY_100,
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopColor: colors.GRAY_300,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
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
});

export default FeedItem;
