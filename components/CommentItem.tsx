import { blockPostAuthor, toggleCommentLike } from "@/app/api/board";
import { colors } from "@/constants/color";
import { AntDesign, Entypo, Feather, FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Profile from "./Profile";

interface CommentItemProps {
  nickname: string;
  content: string;
  createdAt: string;
  likes?: number;
  isLiked: boolean;
  profileUri?: string;
  nationality?: string;
  onPressReply?: () => void;
  userId: number;
  commentId: number;
  postId: number;
  isReply?: boolean;
  mostLiked?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPressLike: () => void;
  onPressMenu: () => void;
}

export default function CommentItem({
  nickname,
  content,
  createdAt,
  likes = 0,
  profileUri,
  nationality,
  onPressReply,
  userId,
  commentId,
  postId,
  isReply = false,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isMyComment, setIsMyComment] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const myId = await AsyncStorage.getItem("@userId");
      setIsMyComment(myId === String(userId));
    };
    checkUser();
  }, [userId]);

  const toggleLike = async () => {
    try {
      const updated = await toggleCommentLike(commentId);
      setIsLiked(updated.isLiked);
      setLikeCount(updated.like);
    } catch (err) {
      console.error("댓글 좋아요 실패:", err);
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit?.();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete?.();
            setMenuVisible(false);
          },
        },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert("Reported", "Thank you. We'll review this comment.");
    setMenuVisible(false);
  };

  const handleBlock = async () => {
    try {
      await blockPostAuthor(postId);
      Alert.alert(
        "User Blocked",
        "You will no longer see comments from this user."
      );
    } catch (err) {
      console.error("댓글 작성자 차단 실패:", err);
      Alert.alert("Error", "Failed to block the comment author.");
    } finally {
      setMenuVisible(false);
    }
  };

  const formattedDate = new Date(createdAt).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.leftColumn}>
          {isReply && (
            <Feather
              name="corner-down-right"
              size={24}
              color="black"
              style={styles.arrowIcon}
            />
          )}
          <Profile
            imageUri={profileUri}
            nickname={nickname}
            createdAt={createdAt}
            nationality={nationality}
          />
        </View>

        <View style={styles.rightContent}>
          <View style={styles.topRow}>
            <View style={styles.iconGroup}>
              <Pressable onPress={toggleLike} style={styles.iconButton}>
                <AntDesign
                  name={isLiked ? "heart" : "hearto"}
                  size={14}
                  color={isLiked ? colors.RED_500 : colors.GRAY_300}
                />
              </Pressable>
              <Text style={styles.separator}>|</Text>
              {!isReply && (
                <>
                  <Pressable style={styles.iconButton} onPress={onPressReply}>
                    <FontAwesome6
                      name="comment"
                      size={14}
                      color={colors.BLACK}
                    />
                  </Pressable>
                  <Text style={styles.separator}>|</Text>
                </>
              )}
              <Pressable onPress={() => setMenuVisible(true)}>
                <Entypo
                  name="dots-three-vertical"
                  size={14}
                  color={colors.BLACK}
                />
              </Pressable>
            </View>
          </View>

          <Text style={styles.commentContent}>{content}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {likeCount > 0 ? `${likeCount} | ` : ""}
              {formattedDate}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable
          style={styles.modalBackground}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.modalBox}>
            {isMyComment ? (
              <>
                <Pressable style={styles.menuItem} onPress={handleEdit}>
                  <Text style={styles.menuText}>Edit Comment</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={handleDelete}>
                  <Text style={[styles.menuText, { color: "red" }]}>
                    Delete Comment
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable style={styles.menuItem} onPress={handleReport}>
                  <Text style={styles.menuText}>Report Comment</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={handleBlock}>
                  <Text style={[styles.menuText, { color: "red" }]}>
                    Block Comment Author
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: colors.WHITE,
    borderRadius: 10,
  },
  leftColumn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  arrowIcon: {
    marginRight: 6,
    color: colors.BLACK,
  },
  rightContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 4,
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    paddingHorizontal: 4,
  },
  separator: {
    color: colors.BLACK,
    marginHorizontal: 6,
    lineHeight: 16,
  },
  commentContent: {
    fontSize: 14,
    color: colors.GRAY_700,
    lineHeight: 20,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    marginRight: 6,
    color: colors.BLACK,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.GRAY_200,
    marginTop: 8,
    marginLeft: 46,
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
  menuText: {
    fontSize: 16,
    color: colors.BLACK,
  },
});
