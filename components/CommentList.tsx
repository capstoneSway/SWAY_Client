// ✅ CommentList.tsx
import React from "react";
import { View } from "react-native";
import CommentItem from "./CommentItem";
import type { Comment } from "../app/type/types";

interface CommentListProps {
  postId: number;
  comments: Comment[];
  onPressLike: (id: number, isReply?: boolean) => void;
  onPressMenu: (id: number) => void;
  onPressReply: (id: number, isReply?: boolean) => void;
  onPressEdit?: (commentId: number, content: string) => void;
}

export default function CommentList({
  postId,
  comments,
  onPressLike,
  onPressMenu,
  onPressReply,
  onPressEdit,
}: CommentListProps) {
  const mostLikedComment = [...comments].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))[0];

  return (
    <>
      {mostLikedComment && (
        <View key={`most-${mostLikedComment.id}`} style={{ marginBottom: 12 }}>
          <CommentItem
            postId={postId}
            nickname={mostLikedComment.user.nickname}
            content={mostLikedComment.content}
            createdAt={mostLikedComment.createdAt}
            profileUri={mostLikedComment.user.imageUri}
            nationality={mostLikedComment.user.nationality}
            likes={mostLikedComment.likes ?? 0}
            isLiked={mostLikedComment.isLiked ?? false}
            userId={mostLikedComment.user.id}
            commentId={mostLikedComment.id}
            onPressLike={() => onPressLike(mostLikedComment.id)}
            onPressMenu={() => onPressMenu(mostLikedComment.id)}
            onPressReply={() => onPressReply(mostLikedComment.id)}
            onEdit={() => onPressEdit?.(mostLikedComment.id, mostLikedComment.content)}
            mostLiked // 
          />
        </View>
      )}

      {comments
        .filter((c) => c.id !== mostLikedComment?.id)
        .map((item) => (
          <View key={item.id} style={{ marginBottom: 12 }}>
            <CommentItem
              postId={postId}
              nickname={item.user.nickname}
              content={item.content}
              createdAt={item.createdAt}
              profileUri={item.user.imageUri}
              nationality={item.user.nationality}
              likes={item.likes ?? 0}
              isLiked={item.isLiked ?? false}
              userId={item.user.id}
              commentId={item.id}
              onPressLike={() => onPressLike(item.id)}
              onPressMenu={() => onPressMenu(item.id)}
              onPressReply={() => onPressReply(item.id)}
              onEdit={() => onPressEdit?.(item.id, item.content)}
            />
          </View>
        ))}
    </>
  );
}
