import { Comment } from "@/app/type/types";
import { colors } from "@/constants/color";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import CommentItem from "./CommentItem";

interface CommentListProps {
  postId: number;
  comments: Comment[];
  onPressLike: (id: number, isReply?: boolean) => void;
  onPressMenu?: (id: number) => void;
  onPressReply: (id: number, isReply?: boolean) => void;
  onPressEdit?: (id: number, content: string) => void;
  onPressDelete?: (id: number) => void;
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
  const [mostLikedId, setMostLikedId] = useState<number | null>(null);

  useEffect(() => {
    const likeCounts = comments.map((c) => c.like_count ?? 0);
    const maxLikes = Math.max(...likeCounts);
    const topLiked = comments.filter(
      (c) => (c.like_count ?? 0) === maxLikes && maxLikes > 0
    );
    if (topLiked.length === 1) {
      setMostLikedId(topLiked[0].id);
    } else {
      setMostLikedId(null);
    }
  }, [comments]);

  // 🔽 정렬 로직: mostLiked 1개 + 나머지는 작성일 순
  const mostLikedComment = comments.find((c) => c.id === mostLikedId);

  const otherComments = comments
    .filter(
      (c) =>
        c.id !== mostLikedId && !(c.isDeleted && (c.replies?.length ?? 0) === 0)
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const sortedComments = [
    ...(mostLikedComment ? [mostLikedComment] : []),
    ...otherComments,
  ];

  return (
    <>
      {sortedComments.map((comment, index) => (
        <View key={comment.id} style={styles.section}>
          {/* 부모 댓글 */}
          <CommentItem
            postId={postId}
            nickname={comment.user.nickname}
            username={comment.user.username}
            content={comment.content}
            createdAt={comment.createdAt}
            profileUri={comment.user.imageUri}
            nationality={comment.user.nationality}
            like_count={comment.like_count ?? 0}
            comment_is_liked={comment.comment_is_liked ?? false}
            commentId={comment.id}
            isDeleted={comment.isDeleted ?? false}
            isBlocked={comment.is_blocked ?? false}
            onPressLike={() => onPressLike(comment.id, false)}
            onPressMenu={() => onPressMenu?.(comment.id)}
            onPressReply={() => onPressReply(comment.id)}
            onEdit={() => onPressEdit?.(comment.id, comment.content)}
            onDelete={() => onPressDelete?.(comment.id)}
            mostLiked={comment.id === mostLikedId}
          />

          {/* 대댓글 */}
          {comment.replies
            ?.filter((reply) => !reply.isDeleted)
            .map((reply) => (
              <CommentItem
                key={reply.id}
                postId={postId}
                nickname={reply.user.nickname}
                username={reply.user.username}
                content={reply.content}
                createdAt={reply.createdAt}
                profileUri={reply.user.imageUri}
                nationality={reply.user.nationality}
                like_count={reply.like_count ?? 0}
                comment_is_liked={reply.comment_is_liked ?? false}
                commentId={reply.id}
                isReply
                isDeleted={false}
                isBlocked={reply.is_blocked ?? false}
                onPressLike={() => onPressLike(reply.id, true)}
                onPressMenu={() => onPressMenu?.(reply.id)}
                onPressReply={() => onPressReply(comment.id, true)}
                onEdit={() => onPressEdit?.(reply.id, reply.content)}
                onDelete={() => onPressDelete?.(reply.id)}
                mostLiked={false}
              />
            ))}

          {/* 부모 댓글 사이에만 divider */}
          {index < sortedComments.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.GRAY_200,
    marginTop: 0,
    marginHorizontal: 16,
  },
});
