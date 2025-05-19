import { colors } from "@/constants/color";
import { AntDesign, Entypo, FontAwesome6 ,Feather} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";

interface CommentItemProps {
  nickname: string;
  content: string;
  createdAt: string;
  likes?: number;
  profileUri?: string;
  onPressReply?: () => void;
  userId: number;
  commentId: number;
  isReply?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CommentItem({
  nickname,
  content,
  createdAt,
  likes = 0,
  profileUri,
  onPressReply,
  userId,
  commentId,
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

  const toggleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((prev) => (next ? prev + 1 : prev - 1));
  };

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit?.();
  };

  const handleDelete = () => {
    Alert.alert("Delete Comment", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          onDelete?.();
          setMenuVisible(false);
        },
      },
    ]);
  };

  const handleReport = () => {
    Alert.alert("Reported", "Thank you. We'll review this comment.");
    setMenuVisible(false);
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
          {isReply && <Feather name="corner-down-right" size={24} color="black" style={styles.arrowIcon}/>}
          <Image
            source={
              profileUri
                ? { uri: profileUri }
                : require("@/assets/images/default_profile.png")
            }
            style={styles.profileImage}
          />
        </View>

        <View style={styles.rightContent}>
          <View style={styles.topRow}>
            <Text style={styles.nickname}>{nickname}</Text>
            <View style={styles.iconGroup}>
              <Pressable onPress={toggleLike} style={styles.iconButton}>
                <AntDesign
                  name="hearto"
                  size={14}
                  color={colors.GRAY_400}
                />
              </Pressable>
              <Text style={styles.separator}>|</Text>
              {!isReply && (
                <>
                  <Pressable style={styles.iconButton} onPress={onPressReply}>
                    <FontAwesome6 name="comment" size={14} color={colors.BLACK} />
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
            {likeCount > 0 ? (
              <>
                <AntDesign
                  name={isLiked ? "heart" : "hearto"}
                  size={12}
                  color={isLiked ? colors.RED_500 : colors.GRAY_400}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.metaText}>
                  {likeCount} | {formattedDate}
                </Text>
              </>
            ) : (
              <Text style={styles.metaText}>{formattedDate}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable style={styles.modalBackground} onPress={() => setMenuVisible(false)}>
          <View style={styles.modalBox}>
            {isMyComment ? (
              <>
                <Pressable style={styles.menuItem} onPress={handleEdit}>
                  <Text style={styles.menuText}>Edit Comment</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={handleDelete}>
                  <Text style={[styles.menuText, { color: "red" }]}>Delete Comment</Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.menuItem} onPress={handleReport}>
                <Text style={styles.menuText}>Report Comment</Text>
              </Pressable>
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
    marginRight: 4,
    marginRight: 6,
    color: colors.BLACK,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  rightContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nickname: {
    fontWeight: "bold",
    fontSize: 14,
    color: colors.BLACK,
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
    marginRight: 6,
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