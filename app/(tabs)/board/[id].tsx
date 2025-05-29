// BoardDetailScreen.tsx
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

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
import React from "react";
import { TextInput as RNTextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BoardDetailScreen() {
  const params = useLocalSearchParams();
  const id = params.id;
  const numericId = Number(id);

  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState<{ username: string } | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [postLoading, setPostLoading] = useState<boolean>(true);
  const [commentLoading, setCommentLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const inputRef = useRef<RNTextInput | null>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useEffect(() => {
    const loadUserInfo = async () => {
      const username = await AsyncStorage.getItem("myUsername");
      if (username) {
        setUserInfo({ username });
      }
    };

    const loadPost = async () => {
      try {
        const postData = await fetchBoardDetail(numericId);
        setPost(postData);
      } catch (err) {
        console.error("❌ Failed to load post details", err);
        Alert.alert("Error", "Failed to load post.");
      } finally {
        setPostLoading(false);
      }
    };

    const loadComments = async () => {
      try {
        const commentData = await fetchComments(numericId);
        setComments(commentData);
      } catch (err) {
        console.error("❌ Failed to load comments", err);
        Alert.alert("Error", "Failed to load comments.");
      } finally {
        setCommentLoading(false);
      }
    };

    if (!id || isNaN(numericId)) {
      Alert.alert("Error", "Invalid post ID.");
      setPostLoading(false);
      setCommentLoading(false);
      return;
    }

    loadUserInfo();
    loadPost();
    loadComments();
  }, [id]);

  const handlePostLikeToggle = async () => {
    try {
      const updated = await toggleLike(numericId);
      setPost((prev) =>
        prev ? { ...prev, likes: updated.like, isLiked: updated.isLiked } : prev
      );
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handlePostScrapToggle = async () => {
    try {
      const updated = await toggleScrap(numericId);
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
      console.error("Failed to scrap:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingCommentId) {
        const updated = await updateComment(numericId, editingCommentId, newComment);
        setComments((prev) =>
          prev.map((parent) => {
            if (parent.id === editingCommentId) {
              return { ...parent, content: updated.comment };
            }
            if (parent.replies) {
              return {
                ...parent,
                replies: parent.replies.map((reply) =>
                  reply.id === editingCommentId
                    ? { ...reply, content: updated.comment }
                    : reply
                ),
              };
            }
            return parent;
          })
        );
        setEditingCommentId(null);
      } else {
        await postComment(numericId, newComment, replyTo);
        const updatedComments = await fetchComments(numericId);
        setComments(updatedComments);
      }
      setNewComment("");
      setReplyTo(null);
    } catch (error) {
      console.error("Failed to post/edit comment:", error);
      Alert.alert("Error", "Failed to process comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(numericId, commentId);
      const updatedComments = await fetchComments(numericId);
      setComments(updatedComments);
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
      Alert.alert("Error", "Failed to delete comment.");
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(numericId);
      Alert.alert("Deleted", "The post has been deleted.");
      router.back();
    } catch (err) {
      console.error("Post deletion failed:", err);
      Alert.alert("Deletion Failed", "Please try again.");
    }
  };

  const handleEdit = () => {
    if (!post) return;
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

  const handlePostMenu = () => {
    const isMyPost = userInfo?.username === post?.author?.username;

    const options = isMyPost
      ? [
          { text: "Edit", onPress: handleEdit, style: "default" as const },
          {
            text: "Delete",
            style: "destructive" as const,
            onPress: () => {
              Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: handleDeletePost,
                },
              ]);
            },
          },
          { text: "Cancel", style: "cancel" as const },
        ]
      : [
          { text: "Report", onPress: () => Alert.alert("Reported."), style: "default" as const },
          { text: "Block", onPress: () => Alert.alert("Blocked."), style: "default" as const },
          { text: "Cancel", style: "cancel" as const },
        ];

    Alert.alert("Post Options", "", options);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.WHITE }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 0}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={100}
        >
          <CommonHeader title="Board" showBackButton />

          {postLoading ? (
            <ActivityIndicator size="large" color={colors.GRAY_500} />
          ) : post ? (
            <>
              <FeedItem
                post={post}
                isDetail
                hideMenu
                onCommentPress={() => inputRef.current?.focus()}
                onLikePress={handlePostLikeToggle}
                onScrapPress={handlePostScrapToggle}
              />
              <TouchableOpacity
                onPress={handlePostMenu}
                style={{ position: "absolute", top: 64, right: 16 }}
              >
                <Feather name="more-vertical" size={20} color="gray" />
              </TouchableOpacity>

              <Text style={styles.commentTitle}>{comments.length} Comments</Text>

              {commentLoading ? (
                <ActivityIndicator size="small" color={colors.GRAY_300} />
              ) : (
                <CommentList
                  postId={post.id}
                  comments={comments}
                  onPressLike={handlePostLikeToggle}
                  onPressMenu={(id) => console.log("Menu pressed for", id)}
                  onPressReply={(id) => setReplyTo(id)}
                  onPressEdit={(id, content) => {
                    setEditingCommentId(id);
                    setNewComment(content);
                    inputRef.current?.focus();
                  }}
                  onPressDelete={(id) =>
                    Alert.alert("Delete Comment", "Are you sure you want to delete this comment?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => handleDeleteComment(id),
                      },
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
            placeholderTextColor={colors.GRAY_500}
            style={styles.input}
            multiline
          />
          {isSubmitting ? (
            <ActivityIndicator size={20} color={colors.PURPLE_300} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: colors.WHITE,
    flexGrow: 1,
  },
  commentTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    color: colors.BLACK,
  },
  inputBarFixed: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
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
    marginRight: 8,
  },
});