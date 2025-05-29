import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Comment } from "../app/type/types";
import CommentItem from "./CommentItem";

interface CommentListProps {
  postId: number;
  comments: Comment[];
  onPressLike: (id: number, isReply?: boolean) => void;
  onPressMenu: (id: number) => void;
  onPressReply: (id: number, isReply?: boolean) => void;
  onPressEdit?: (commentId: number, content: string) => void;
  onPressDelete?: (commentId: number) => void;
}

export default function CommentList({
  postId,
  comments,
  onPressLike,
  onPressMenu,
  onPressReply,
  onPressEdit,
  onPressDelete,
}: CommentListProps) {
  const mostLikedComment = [...comments].sort(
    (a, b) => (b.like ?? 0) - (a.like ?? 0)
  )[0];

  return (
    <>
      {mostLikedComment && (
        <View
          key={`most-${mostLikedComment.id}`}
          style={styles.mostLikedWrapper}
        >
          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeText}>Most Liked</Text>
          </View>
          <CommentItem
            postId={postId}
            nickname={mostLikedComment.user.nickname}
            username={mostLikedComment.user.username}
            content={mostLikedComment.content}
            createdAt={mostLikedComment.createdAt}
            profileUri={mostLikedComment.user.imageUri}
            nationality={mostLikedComment.user.nationality}
            likes={mostLikedComment.like ?? 0}
            isLiked={mostLikedComment.isLiked ?? false}
            commentId={mostLikedComment.id}
            onPressLike={() => onPressLike(mostLikedComment.id)}
            onPressMenu={() => onPressMenu(mostLikedComment.id)}
            onPressReply={() => onPressReply(mostLikedComment.id)}
            onEdit={() =>
              onPressEdit?.(mostLikedComment.id, mostLikedComment.content)
            }
            onDelete={() => onPressDelete?.(mostLikedComment.id)} // ✅ 추가
            mostLiked
          />
        </View>
      )}

      {comments
        .filter((c) => c.id !== mostLikedComment?.id)
        .map((item) => (
          <View key={item.id} style={styles.section}>
            <CommentItem
              postId={postId}
              nickname={item.user.nickname}
              username={item.user.username}
              content={item.content}
              createdAt={item.createdAt}
              profileUri={item.user.imageUri}
              nationality={item.user.nationality}
              likes={item.like ?? 0}
              isLiked={item.isLiked ?? false}
              commentId={item.id}
              onPressLike={() => onPressLike(item.id)}
              onPressMenu={() => onPressMenu(item.id)}
              onPressReply={() => onPressReply(item.id)}
              onEdit={() => onPressEdit?.(item.id, item.content)}
              onDelete={() => onPressDelete?.(item.id)} // ✅ 추가
            />
          </View>
        ))}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  mostLikedWrapper: {
    marginBottom: 12,
    backgroundColor: "#F3ECFF",
    borderRadius: 10,
    padding: 6,
  },
  badgeWrapper: {
    alignSelf: "flex-start",
    backgroundColor: "#BFA5FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    marginLeft: 6,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
