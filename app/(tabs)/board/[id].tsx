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
import { Comment, Post } from "@/app/type/types";
import CommentList from "@/components/CommentList";
import CommonHeader from "@/components/CommonHeader";
import FeedItem from "@/components/FeedItem";
import { colors } from "@/constants/color";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInput as RNTextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BoardDetailScreenProps {
  post?: Post;
  updatePostInFeed?: (id: number, update: Partial<Post>) => void;
}

export default function BoardDetailScreen({ post: initialPost, updatePostInFeed }: BoardDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const id = params.id;
  const numericId = Number(id);

  const navigation = useNavigation();
  const [post, setPost] = useState<Post | null>(initialPost ?? null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [visibleComments, setVisibleComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [postLoading, setPostLoading] = useState(initialPost ? false : true);
  const [commentLoading, setCommentLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const inputRef = useRef<RNTextInput | null>(null);

  useEffect(() => {
    const fetchPostFromStorageOrParams = async () => {
      try {
        const storedPost = await AsyncStorage.getItem("@selectedPost");
        if (storedPost) {
          setPost(JSON.parse(storedPost));
          await AsyncStorage.removeItem("@selectedPost");
        } else if (params.post) {
          setPost(JSON.parse(params.post as string));
        }
      } catch (err) {
        console.error("초기 post 불러오기 실패:", err);
      }
    };
    fetchPostFromStorageOrParams();
  }, []);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useEffect(() => {
    if (!post && id && !isNaN(numericId)) {
      loadPost();
    }
  }, [post, id]);

  const loadPost = async () => {
    try {
      const postData = await fetchBoardDetail(numericId);
      const storedPost = await AsyncStorage.getItem("@selectedPost");
      if (storedPost) {
        const parsed = JSON.parse(storedPost);
        postData.is_scraped = parsed.is_scraped;
        postData.scrap_count = parsed.scrap_count;
        updatePostInFeed?.(postData.id, {
          is_scraped: parsed.is_scraped,
          scrap_count: parsed.scrap_count,
        });
      }
      setPost(postData);
    } catch (err) {
      Alert.alert("Error", "Failed to load post.");
    } finally {
      setPostLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const commentData = await fetchComments(numericId);
      let totalVisibleCount = 0;
      const filtered = commentData.reduce((acc: Comment[], comment) => {
        const visibleReplies = comment.replies.filter((r) => !r.isDeleted);
        const isCommentVisible = !comment.isDeleted || visibleReplies.length > 0;

        if (isCommentVisible) {
          acc.push({ ...comment, replies: visibleReplies });
          totalVisibleCount += 1 + visibleReplies.length;
        }
        return acc;
      }, []);

      setVisibleComments(filtered);
      setComments(commentData);
      setPost((prev) => prev ? { ...prev, comment_count: totalVisibleCount } : prev);
    } catch (err) {
      Alert.alert("Error", "Failed to load comments.");
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    if (!id || isNaN(numericId)) return;
    loadComments();
    const interval = setInterval(() => {
      loadComments();
    }, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handlePostLikeToggle = async () => {
    try {
      const updated = await toggleLike(numericId);
      const updatedPost = post
        ? {
            ...post,
            is_liked: updated.isLiked,
            like_count: updated.isLiked
              ? (post.like_count ?? 0) + 1
              : Math.max((post.like_count ?? 1) - 1, 0),
          }
        : null;
      setPost(updatedPost);
    } catch (err) {
      console.error("Like toggle error:", err);
    }
  };

  const handleScrapToggle = async () => {
    try {
      const { isBookmarked } = await toggleScrap(post!.id);
      const newCount = isBookmarked
        ? (post!.scrap_count ?? 0) + 1
        : Math.max((post!.scrap_count ?? post!.scarp_count ?? 1) - 1, 0);

      const updatedPost = {
        ...post!,
        is_scraped: isBookmarked,
        scrap_count: newCount,
      };

      setPost(updatedPost);
      await AsyncStorage.setItem("@selectedPost", JSON.stringify(updatedPost));
      updatePostInFeed?.(post!.id, {
        is_scraped: isBookmarked,
        scrap_count: newCount,
      });
    } catch (err) {
      console.error("스크랩 오류:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingCommentId) {
        const updated = await updateComment(numericId, editingCommentId, newComment);
        setComments((prev) =>
          prev.map((c) =>
            c.id === editingCommentId
              ? { ...c, content: updated.comment }
              : {
                  ...c,
                  replies: c.replies.map((r) =>
                    r.id === editingCommentId ? { ...r, content: updated.comment } : r
                  ),
                }
          )
        );
        setEditingCommentId(null);
      } else {
        await postComment(numericId, newComment, replyTo ?? undefined);
        await loadComments();
      }
      setNewComment("");
      setReplyTo(null);
    } catch (err) {
      Alert.alert("Error", "댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(numericId, commentId);
      await loadComments();
    } catch {
      Alert.alert("Error", "Failed to delete comment.");
    }
  };

  const handleCommentLikeToggle = async (commentId: number, isReply: boolean = false) => {
    setComments((prev) =>
      prev.map((c) => {
        if (!isReply && c.id === commentId) {
          const newLiked = !c.comment_is_liked;
          const newCount = newLiked ? c.like_count + 1 : Math.max(c.like_count - 1, 0);
          return { ...c, comment_is_liked: newLiked, like_count: newCount };
        }
        return {
          ...c,
          replies: c.replies.map((r) => {
            if (r.id === commentId) {
              const newLiked = !r.comment_is_liked;
              const newCount = newLiked ? r.like_count + 1 : Math.max(r.like_count - 1, 0);
              return { ...r, comment_is_liked: newLiked, like_count: newCount };
            }
            return r;
          }),
        };
      })
    );

    try {
      await toggleCommentLike(numericId, commentId);
      setTimeout(() => {
        loadComments();
      }, 1000);
    } catch (err) {
      console.error("댓글 좋아요 처리 실패:", err);
      Alert.alert("Error", "댓글 좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(numericId);
      Alert.alert("Deleted", "The post has been deleted.");
      router.replace("/(tabs)/board");
    } catch {
      Alert.alert("Deletion Failed", "Please try again.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.WHITE }}>
      <CommonHeader title="Board" showBackButton />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {postLoading ? (
            <ActivityIndicator />
          ) : post ? (
            <>
              <FeedItem
                key={`detail-${post.id}-${post.is_scraped}-${post.scrap_count}`}
                post={post}
                isDetail
                onCommentPress={() => inputRef.current?.focus()}
                onLikePress={handlePostLikeToggle}
                onScrapPress={handleScrapToggle}
                onDelete={handleDeletePost}
              />
              <Text style={styles.commentTitle}>
                {commentLoading ? "Loading..." : `${post?.comment_count ?? 0} Comments`}
              </Text>
              {commentLoading ? (
                <ActivityIndicator />
              ) : (
                <CommentList
                  postId={post.id}
                  comments={visibleComments}
                  onPressLike={handleCommentLikeToggle}
                  onPressReply={(id) => {
                    setReplyTo(id);
                    inputRef.current?.focus();
                  }}
                  onPressEdit={(id, content) => {
                    setEditingCommentId(id);
                    setNewComment(content);
                    inputRef.current?.focus();
                  }}
                  onPressDelete={(id) =>
                    Alert.alert("Delete Comment", "Are you sure?", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => handleDeleteComment(id) },
                    ])
                  }
                />
              )}
            </>
          ) : (
            <Text>Post not found.</Text>
          )}
        </KeyboardAwareScrollView>
        <View style={styles.inputBarFixed}>
          <TextInput
            ref={inputRef}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Enter your comment..."
            style={styles.input}
            multiline
          />
          {isSubmitting ? (
            <ActivityIndicator size={20} />
          ) : (
            <Feather
              name="arrow-up-circle"
              size={24}
              color={colors.PURPLE_300}
              onPress={handleAddComment}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 100,
    backgroundColor: colors.WHITE,
    flexGrow: 1,
  },
  commentTitle: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 12,
    paddingHorizontal: 16,
    color: colors.BLACK,
  },
  inputBarFixed: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 24 : 14,
    paddingHorizontal: 20,
    backgroundColor: colors.WHITE,
  },
  input: {
    flex: 1,
    backgroundColor: colors.GRAY_100,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.BLACK,
    marginRight: 12,
  },
});