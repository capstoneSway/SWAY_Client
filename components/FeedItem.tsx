import { blockPostAuthor, deletePost } from "@/app/api/board";
import { Post } from "@/app/type/types";
import { colors } from "@/constants/color";
import { Entypo, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
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

const MENU_WIDTH = 160;

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
  const menuBtnRef = useRef<View>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

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
            Alert.alert(
              "Error",
              "Failed to delete the post. Please try again."
            );
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

  const onMenuBtnPress = () => {
    if (menuBtnRef.current) {
      menuBtnRef.current.measureInWindow((x, y, width, height) => {
        const screenWidth = Dimensions.get("window").width;
        const screenHeight = Dimensions.get("window").height;
        const estimatedMenuHeight = (isMyPost ? 2 : 3) * 40 + 16;

        // 버튼 높이의 60% 지점 기준으로 메뉴 top 조정 (더 자연스럽게)
        let top = y + height * 0.6;
        let left = x + width - 10;

        if (left + MENU_WIDTH > screenWidth) {
          left = x - MENU_WIDTH + 10;
        }

        if (top < 8) top = 8;
        if (top + estimatedMenuHeight > screenHeight) {
          top = screenHeight - estimatedMenuHeight - 8;
        }

        setMenuPos({ top, left });
        setShowMenu(true);
      });
    } else {
      setShowMenu(true);
    }
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  return (
    <View>
      <ContainerComponent style={styles.container} onPress={handlePressFeed}>
        <View style={styles.contentContainer}>
          <View style={styles.profileRow}>
            <Profile
              imageUri={post?.author?.imageUri ?? ""}
              nickname={post?.author?.nickname ?? "Anonymous"}
              createdAt={post?.createdAt ?? new Date().toISOString()}
              nationality={post?.author?.nationality ?? ""}
            />
            {isDetail && !hideMenu && (
              <Pressable
                ref={menuBtnRef}
                onPress={onMenuBtnPress}
                style={styles.menuButton}
                hitSlop={10}
              >
                <Entypo
                  name="dots-three-vertical"
                  size={20}
                  color={colors.GRAY_700}
                />
              </Pressable>
            )}
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

          <Pressable style={styles.menu} onPress={onCommentPress}>
            <Feather name="message-circle" size={20} color={colors.GRAY_700} />
            <Text style={styles.menuText}>{post.comment_count ?? 0}</Text>
          </Pressable>

          <Pressable style={styles.menu} onPress={onScrapPress}>
            <Feather
              name="bookmark"
              size={20}
              color={post.is_scrapped ? colors.PURPLE_300 : colors.GRAY_700}
            />
            <Text
              style={[
                styles.menuText,
                post.is_scrapped && {
                  color: colors.PURPLE_300,
                  fontWeight: "600",
                },
              ]}
            >
              {post.scrap_count ?? 0}
            </Text>
          </Pressable>
        </View>
      </ContainerComponent>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.modalBackground} onPress={closeMenu}>
          <Pressable
            style={[
              styles.dropdownMenu,
              { top: menuPos.top, left: menuPos.left },
            ]}
          >
            {isMyPost ? (
              <>
                <Pressable onPress={handleEdit}>
                  <Text style={styles.menuOption}>Edit</Text>
                </Pressable>
                <Pressable onPress={handleDelete}>
                  <Text style={[styles.menuOption, { color: colors.RED_500 }]}>
                    Delete
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable onPress={handleReport}>
                  <Text style={styles.menuOption}>Report</Text>
                </Pressable>
                <Pressable onPress={handleBlock}>
                  <Text style={[styles.menuOption, { color: colors.RED_500 }]}>
                    Block Author
                  </Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <ReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        postId={post.id}
        targetType="post"
        onSubmit={(reason) => {
          Alert.alert("Report Submitted", "Thank you for your report.");
          setReportVisible(false);
          setShowMenu(false);
        }}
      />
    </View>
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
  menuButton: {
    padding: 8,
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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  dropdownMenu: {
    position: "absolute",
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    minWidth: MENU_WIDTH,
    zIndex: 9999,
  },
  menuOption: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
});

export default FeedItem;
