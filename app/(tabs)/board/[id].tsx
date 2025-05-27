import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
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

import {
  deleteComment,
  deletePost,
  fetchBoardDetail,
  fetchComments,
  postComment,
  toggleCommentLike,
  toggleLike,
  toggleScrap,
  updateComment,
} from "@/app/api/board";
import CommentList from "@/components/CommentList";
import CommonHeader from "@/components/CommonHeader";
import FeedItem from "@/components/FeedItem";
import { colors } from "@/constants/color";
import { Post, Comment } from "@/app/type/types";
import React from "react";
import { TextInput as RNTextInput } from "react-native";

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
    null
  );
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [confirmReplyVisible, setConfirmReplyVisible] =
    useState<boolean>(false);
  const inputRef = useRef<RNTextInput | null>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useEffect(() => {
  const loadPost = async () => {
    if (!id || isNaN(Number(id))) {
      console.warn("⚠️ 잘못된 게시글 ID:", id);
      Alert.alert("Error", "Invalid post ID.");
      setLoading(false);
      return;
    }

    try {
      const numericId = Number(id);
      const postData = await fetchBoardDetail(numericId);
      const commentData: any[] = await fetchComments(numericId);

      const structured: Comment[] = commentData
        .filter((c) => !c.parent_id)
        .map((parent) => ({
          id: parent.id,
          content: parent.comment,
          createdAt: new Date(parent.created_at).toISOString(),
          user: parent.user,
          likes: parent.like,
          isLiked: parent.isLiked,
          replies: commentData
            .filter((c) => c.parent_id === parent.id)
            .map((reply) => ({
              id: reply.id,
              content: reply.comment,
              createdAt: new Date(reply.created_at).toISOString(),
              user: reply.user,
              likes: reply.like,
              isLiked: reply.isLiked,
            })),
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
      if (editingCommentId) {
        const updated = await updateComment(
          Number(id),
          editingCommentId,
          newComment
        );
        setComments((prev) =>
          prev.map((parent) => {
            if (parent.id === editingCommentId) {
              return { ...parent, content: updated.comment };
            }
            return {
              ...parent,
              replies:
                parent.replies?.map((r) =>
                  r.id === editingCommentId
                    ? { ...r, content: updated.comment }
                    : r
                ) ?? [],
            };
          })
        );
        setEditingCommentId(null);
      } else {
        const result = await postComment(Number(id), newComment, replyTo);
        const commentWithDate: Comment = {
          id: result.id,
          content: result.comment,
          createdAt: new Date(result.created_at).toISOString(),
          user: result.user,
          likes: result.like,
          isLiked: result.isLiked,
        };

        setComments((prev) => {
          if (replyTo) {
            return prev.map((parent) =>
              parent.id === replyTo
                ? {
                    ...parent,
                    replies: [...(parent.replies ?? []), commentWithDate],
                  }
                : parent
            );
          } else {
            return [...prev, { ...commentWithDate, replies: [] }];
          }
        });
      }
      setNewComment("");
      setReplyTo(null);
    } catch (error) {
      console.error("댓글 등록/수정 실패:", error);
      Alert.alert("Error", "Failed to process comment.");
    }
  };

  const handleEditComment = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setNewComment(content);
    inputRef.current?.focus();
  };

  const handleDeleteComment = async () => {
    if (selectedCommentId !== null) {
      try {
        await deleteComment(Number(id), selectedCommentId);
        setComments(
          (prev) =>
            prev
              .map((c) => {
                if (c.id === selectedCommentId) return null;
                const updatedReplies = c.replies?.filter(
                  (r) => r.id !== selectedCommentId
                );
                return { ...c, replies: updatedReplies };
              })
              .filter(Boolean) as Comment[]
        );
      } catch (err) {
        console.error("❌ 댓글 삭제 실패", err);
        Alert.alert("Error", "Failed to delete comment.");
      } finally {
        setConfirmVisible(false);
        setMenuVisible(false);
      }
    }
  };

  const handlePostLikeToggle = async () => {
    try {
      const updated = await toggleLike(Number(id));
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: updated.like,
              isLiked: updated.isLiked,
            }
          : prev
      );
    } catch (err) {
      console.error("게시글 좋아요 실패:", err);
    }
  };

  const handlePostScrapToggle = async () => {
    try {
      const updated = await toggleScrap(Number(id));
      setPost((prev) =>
        prev
          ? {
              ...prev,
              bookmarks: updated.bookmarkCount,
              isBookmarked: updated.isBookmarked,
            }
          : prev
      );
    } catch (err) {
      console.error("스크랩 실패:", err);
    }
  };

  const handleReplyRequest = (parentId: number) => {
    setReplyTo(parentId);
    setConfirmReplyVisible(true);
  };

  const handleLikeToggle = async (commentId: number, isReply = false) => {
    try {
      const updated = await toggleCommentLike(commentId);
      setComments((prev) =>
        prev.map((parent) => {
          if (parent.id === commentId) {
            return { ...parent, likes: updated.like, isLiked: updated.isLiked };
          } else if (isReply) {
            return {
              ...parent,
              replies:
                parent.replies?.map((r) =>
                  r.id === commentId
                    ? { ...r, likes: updated.like, isLiked: updated.isLiked }
                    : r
                ) ?? [],
            };
          }
          return parent;
        })
      );
    } catch (error) {
      console.error("좋아요 실패:", error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(Number(id));
      Alert.alert("Delete Complete", "The post has been deleted.");
      router.back();
    } catch (err) {
      console.error("Post deletion failed:", err);
      Alert.alert("Deletion Failed", "Please try again.");
    }
  };

  const handleOpenMenu = (id: number) => {
    setSelectedCommentId(id);
    setMenuVisible(true);
  };

  if (loading)
    return <ActivityIndicator size="large" color={colors.GRAY_500} />;
  if (!post) return <Text>Post not found.</Text>;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.WHITE }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={{ flex: 1 }}>
        <CommonHeader title="Board" showBackButton />

        <ScrollView contentContainerStyle={styles.container}>
          <FeedItem
            post={post}
            isDetail
            onCommentPress={() => inputRef.current?.focus()}
            onDelete={() => {
              Alert.alert("Delete Post", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: handleDeletePost,
                },
              ]);
            }}
            onLikePress={handlePostLikeToggle}
            onScrapPress={handlePostScrapToggle}
            onEdit={() => {
              router.push({
                pathname: "/post/newpost",
                params: {
                  edit: "true",
                  id: post.id.toString(),
                  title: post.title,
                  description: post.description,
                },
              });
            }}
          />
          <Text style={styles.commentTitle}>{comments.length} Comments</Text>
          <CommentList
            postId={post.id}
            comments={comments}
            onPressLike={handleLikeToggle}
            onPressMenu={handleOpenMenu}
            onPressReply={handleReplyRequest}
            onPressEdit={handleEditComment}
          />
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Enter your comment..."
            placeholderTextColor={colors.GRAY_500}
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: colors.WHITE,
  },
  commentTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    color: colors.BLACK,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
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
});
