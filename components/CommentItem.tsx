import { api } from "@/app/api/axios";
import { blockCommentAuthor, toggleCommentLike } from "@/app/api/board";
import { colors } from "@/constants/color";
import { getFlagImage } from "@/utils/getFlagImage";
import { Entypo, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ReportModal from "./ReportModal";

interface CommentItemProps {
  nickname: string;
  content: string;
  createdAt: string;
  like_count?: number;
  comment_is_liked: boolean;
  profileUri?: string;
  nationality?: string;
  onPressReply?: (commentId: number) => void;
  username: string;
  commentId: number;
  postId: number;
  isReply?: boolean;
  mostLiked?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPressLike?: (commentId: number, isReply: boolean, isLiked: boolean) => void;
  isDeleted?: boolean;
  isBlocked?: boolean;
  onPressMenu?: () => void;
}

export function CommentItem({
  nickname,
  content,
  createdAt,
  like_count = 0,
  comment_is_liked,
  profileUri,
  nationality,
  onPressReply,
  username,
  commentId,
  postId,
  isReply = false,
  mostLiked = false,
  onEdit,
  onDelete,
  onPressLike,
  isDeleted = false,
  isBlocked = false,
}: CommentItemProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isMyComment, setIsMyComment] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(comment_is_liked);
  const [localLikeCount, setLocalLikeCount] = useState(like_count);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkUsername = async () => {
      const myUsername = await AsyncStorage.getItem("myUsername");
      if (myUsername && myUsername === username) {
        setIsMyComment(true);
      }
    };
    checkUsername();
  }, [username]);

  useEffect(() => {
    setLocalIsLiked(comment_is_liked);
    setLocalLikeCount(like_count ?? 0);
  }, [comment_is_liked, like_count]);

  const toggleLike = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const previousLiked = localIsLiked;
    const newLiked = !previousLiked;

    setLocalIsLiked(newLiked);
    setLocalLikeCount((prev) => {
      const next = newLiked ? prev + 1 : prev - 1;
      return next >= 0 ? next : 0;
    });

    try {
      await toggleCommentLike(postId, commentId);
      onPressLike?.(commentId, isReply, newLiked);
    } catch (err) {
      console.error("❌ Failed to toggle like:", err);
      setLocalIsLiked(previousLiked);
      setLocalLikeCount((prev) =>
        previousLiked ? prev + 1 : Math.max(prev - 1, 0)
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit?.();
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDelete?.();
  };

  const handleReport = () => {
    setReportVisible(true);
    setMenuVisible(false);
  };

  const handleBlockCommentAuthor = async () => {
    try {
      await blockCommentAuthor(postId, commentId);
      Alert.alert("Blocked", "You will no longer see comments from this user.");
    } catch (err) {
      console.error("Failed to block comment author:", err);
      Alert.alert("Error", "Failed to block the comment author.");
    } finally {
      setMenuVisible(false);
    }
  };

  const formattedDate = new Date(createdAt).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const flag = nationality ? getFlagImage(nationality) : null;
  const showMostLikedTag = mostLiked && localLikeCount > 0;

  return (
    <View style={[styles.wrapper, showMostLikedTag && styles.highlight]}>
      <View style={styles.innerBox}>
        <View style={[styles.row, isReply && styles.replyRow]}>
          {isReply && (
            <Feather
              name="corner-down-right"
              size={20}
              color={"black"}
              style={{ marginRight: 6, marginTop: 2 }}
            />
          )}
          <View style={styles.profileWrapper}>
            <Image
              source={
                profileUri
                  ? { uri: profileUri }
                  : require("@/assets/images/default_profile.png")
              }
              style={styles.profileImage}
            />
            {flag && <Image source={flag} style={styles.flagOverlay} />}
          </View>

          <View style={styles.contentBox}>
            <View style={styles.headerRow}>
              <View style={styles.nameRow}>
                <Text style={styles.nickname}>{nickname}</Text>
                {showMostLikedTag && (
                  <Text style={styles.mostLikedTag}>Most Liked</Text>
                )}
              </View>
              <View style={styles.iconRowTop}>
                <Pressable onPress={toggleLike} style={styles.iconButtonTop}>
                  <Feather
                    name="heart"
                    size={14}
                    color={localIsLiked ? colors.RED_500 : colors.GRAY_700}
                  />
                </Pressable>
                {!isReply && (
                  <Pressable
                    onPress={() => onPressReply?.(commentId)}
                    style={styles.iconButtonTop}
                  >
                    <Feather
                      name="message-circle"
                      size={14}
                      color={colors.GRAY_700}
                    />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => setMenuVisible(true)}
                  style={styles.iconButtonTop}
                >
                  <Entypo
                    name="dots-three-vertical"
                    size={14}
                    color={colors.GRAY_700}
                  />
                </Pressable>
              </View>
            </View>

            {isDeleted ? (
              <Text style={styles.deletedText}>
                [This comment has been deleted.]
              </Text>
            ) : isBlocked ? (
              <Text style={styles.blockedText}>
                This comment is hidden because the user has been blocked.
              </Text>
            ) : (
              <Text style={styles.commentText}>{content}</Text>
            )}

            <View style={styles.footerRow}>
              <View style={styles.footerLikeRow}>
                <Feather
                  name="heart"
                  size={12}
                  color={localIsLiked ? colors.RED_500 : colors.GRAY_700}
                />
                <Text style={styles.footerLikeText}>{localLikeCount}</Text>
              </View>
              <Text style={styles.separator}>|</Text>
              <Text style={styles.footerText}>{formattedDate}</Text>
            </View>
          </View>
        </View>
      </View>

      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable
          style={styles.modalBackground}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.modalBox}>
            {isMyComment ? (
              <>
                <Pressable style={styles.menuItem} onPress={handleEdit}>
                  <Text style={styles.menuText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={handleDelete}>
                  <Text style={[styles.menuText, { color: colors.RED_500 }]}>
                    Delete
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable style={styles.menuItem} onPress={handleReport}>
                  <Text style={styles.menuText}>Report</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={handleBlockCommentAuthor}
                >
                  <Text style={[styles.menuText, { color: colors.RED_500 }]}>
                    Block
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      <ReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        onSubmit={async (reason) => {
          try {
            const token = await AsyncStorage.getItem("@jwt");
            await api.post(
              `/board/${postId}/comments/${commentId}/report/`,
              { reason },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            Alert.alert("Report submitted", "Thank you for your feedback.");
          } catch (err: any) {
            console.error("Failed to report comment:", err);
            Alert.alert("Report failed", "Please try again later.");
          } finally {
            setReportVisible(false);
          }
        }}
        targetType="comment"
        postId={postId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: colors.WHITE, paddingHorizontal: 16 },
  innerBox: { paddingVertical: 20, justifyContent: "center", minHeight: 120 },
  highlight: { backgroundColor: colors.PURPLE_100 },
  row: { flexDirection: "row", alignItems: "flex-start" },
  replyRow: { marginLeft: 15, flexDirection: "row", alignItems: "flex-start" },
  profileWrapper: { position: "relative", marginRight: 12 },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.GRAY_200,
  },
  flagOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.WHITE,
    backgroundColor: colors.WHITE,
  },
  nickname: { fontWeight: "bold", fontSize: 14, color: colors.BLACK },
  mostLikedTag: {
    backgroundColor: colors.PURPLE_200,
    color: colors.WHITE,
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconRowTop: { flexDirection: "row", alignItems: "center" },
  iconButtonTop: { marginLeft: 12 },
  commentText: { fontSize: 14, color: colors.GRAY_700 },
  deletedText: {
    fontSize: 14,
    fontStyle: "italic",
    color: colors.GRAY_300,
  },
  blockedText: {
    fontSize: 14,
    fontStyle: "italic",
    color: colors.GRAY_300,
  },
  footerRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  footerLikeRow: { flexDirection: "row", alignItems: "center" },
  footerLikeText: { fontSize: 12, color: colors.GRAY_700, marginLeft: 4 },
  footerText: { fontSize: 12, color: colors.GRAY_700 },
  separator: { marginHorizontal: 6, color: colors.GRAY_300 },
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
  menuItem: { paddingVertical: 12, paddingHorizontal: 20 },
  menuText: { fontSize: 16, color: colors.BLACK },
  contentBox: { flex: 1, flexDirection: "column" },
});

export default React.memo(CommentItem);
