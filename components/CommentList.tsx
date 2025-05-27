// components/CommentList.tsx
import React from "react";
import { View } from "react-native";
import CommentItem from "./CommentItem";

export default function CommentList({
  comments,
  onPressLike,
  onPressMenu,
  onPressReply,
}) {
  return (
    <>
      {comments.map((item) => (
        <View key={item.id} style={{ marginBottom: 12 }}>
          <CommentItem
            nickname={item.writer.nickname}
            content={item.comment}
            createdAt={item.created_at}
            profileUri={item.writer.profilePic}
            likes={item.like ?? 0}
            isLiked={item.isLiked ?? false}
            onPressLike={() => onPressLike(item.id)}
            onPressMenu={() => onPressMenu(item.id)}
            onPressReply={() => onPressReply(item.id)}
          />
          {item.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              nickname={reply.writer.nickname}
              content={reply.comment}
              createdAt={reply.created_at}
              profileUri={reply.writer.profilePic}
              likes={reply.like ?? 0}
              isLiked={reply.isLiked ?? false}
              isReply
              onPressLike={() => onPressLike(reply.id, true)}
              onPressMenu={() => onPressMenu(reply.id)}
              onPressReply={() => onPressReply(reply.id)}
            />
          ))}
        </View>
      ))}
    </>
  );
}
