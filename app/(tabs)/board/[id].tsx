import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { fetchBoardDetail, fetchComments, postComment } from "@/app/api/board";
import CommentItem from "@/components/CommentItem";
import FeedItem from "@/components/FeedItem";
import { colors } from "@/constants/color";

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
    null
  );
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [confirmReplyVisible, setConfirmReplyVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const postData = await fetchBoardDetail(Number(id));
        const commentData = await fetchComments(Number(id));

        const structured = commentData
          .filter((c: any) => !c.parent_id)
          .map((parent: any) => ({
            ...parent,
            replies: commentData.filter((c: any) => c.parent_id === parent.id),
          }));

        setPost(postData);
        setComments(structured);
      } catch (err) {
        console.error("❌ 상세 정보 가져오기 실패", err);
        Alert.alert("Error", "Failed to load post.");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const result = await postComment(Number(id), newComment, replyTo);
      setComments((prev) => {
        if (replyTo) {
          return prev.map((parent) =>
            parent.id === replyTo
              ? { ...parent, replies: [...parent.replies, result] }
              : parent
          );
        } else {
          return [...prev, { ...result, replies: [] }];
        }
      });
      setNewComment("");
      setReplyTo(null);
    } catch (error) {
      console.error("댓글 등록 실패:", error);
      Alert.alert("Error", "Failed to post comment.");
    }
  };

  const handleDeleteComment = () => {
    if (selectedCommentId !== null) {
      setComments((prev) =>
        prev
          .filter((c) => c.id !== selectedCommentId)
          .map((c) => ({
            ...c,
            replies: c.replies.filter((r: any) => r.id !== selectedCommentId),
          }))
      );
      setConfirmVisible(false);
      setMenuVisible(false);
    }
  };

  const handleReplyRequest = (parentId: number) => {
    setReplyTo(parentId);
    setConfirmReplyVisible(true);
  };

  if (loading)
    return <ActivityIndicator size="large" color={colors.GRAY_500} />;
  if (!post) return <Text>Post not found.</Text>;

  return (
    <>
      <Stack.Screen
        options={{ title: "Board", headerTintColor: colors.BLACK }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container}>
            <FeedItem
              post={post}
              isDetail
              onCommentPress={() => inputRef.current?.focus()}
            />

            <Text style={styles.commentTitle}>{comments.length} Comments</Text>

            {comments.map((item) => (
              <View key={item.id} style={styles.commentWrapper}>
                <CommentItem
                  nickname={item.writer.nickname}
                  content={item.comment}
                  createdAt={item.created_at}
                  profileUri={item.writer.profilePic}
                  likes={item.like ?? 0}
                  onPressMenu={() => {
                    setSelectedCommentId(item.id);
                    setMenuVisible(true);
                  }}
                  onPressReply={() => handleReplyRequest(item.id)}
                />
                {item.replies.map((reply: any) => (
                  <CommentItem
                    key={reply.id}
                    nickname={reply.writer.nickname}
                    content={reply.comment}
                    createdAt={reply.created_at}
                    profileUri={reply.writer.profilePic}
                    likes={reply.like ?? 0}
                    isReply
                    onPressMenu={() => {
                      setSelectedCommentId(reply.id);
                      setMenuVisible(true);
                    }}
                    onPressReply={() => handleReplyRequest(reply.id)}
                  />
                ))}
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Enter your comment..."
              placeholderTextColor={colors.GRAY_400}
              style={styles.input}
              multiline
            />
            <Feather
              name="arrow-up-circle"
              size={24}
              color={colors.PURPLE_300}
              onPress={handleAddComment}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.WHITE,
  },
  commentTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    color: colors.BLACK,
  },
  commentWrapper: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.WHITE,
  },
  input: {
    flex: 1,
    backgroundColor: colors.GRAY_100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.BLACK,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    backgroundColor: colors.WHITE,
    padding: 16,
    borderRadius: 12,
    width: 200,
  },
  menuText: {
    fontSize: 16,
    paddingVertical: 12,
    color: colors.BLACK,
  },
  confirmBox: {
    backgroundColor: colors.WHITE,
    padding: 20,
    borderRadius: 12,
    width: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: 16,
    color: colors.BLACK,
    marginBottom: 12,
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
});
