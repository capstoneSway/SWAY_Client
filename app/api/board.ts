import AsyncStorage from "@react-native-async-storage/async-storage";
import { Comment, Post } from "../type/types";
import { api } from "./axios";

// 게시글 목록 불러오기
export async function fetchBoardList(): Promise<Post[]> {
  const res = await api.get("/board/");
  return res.data.map((post: any) => ({
    id: post.id,
    title: post.title,
    description: post.content,
    createdAt:
      typeof post.date === "string" && !isNaN(Date.parse(post.date))
        ? new Date(post.date.replace(/\.\d+Z$/, "Z")).toISOString()
        : new Date().toISOString(),
    author: {
      id: post.user_id ?? 0,
      nickname: post.nickname,
      imageUri: post.profile_image ?? null,
    },
    imageUri: post.images?.[0] ?? null,
    likes: post.like_count,
    bookmarks: post.scrap_count,
    isLiked: post.is_liked ?? false,
    isBookmarked: post.is_scrapped ?? false,
    commentCount: post.comment_count ?? 0,
    userId: post.user_id,
  }));
}

// 게시글 상세 불러오기
export async function fetchBoardDetail(postId: number): Promise<Post> {
  const res = await api.get(`/board/${postId}/`);

  return {
    id: res.data.id,
    title: res.data.title,
    description: res.data.content,
    createdAt: res.data.date,
    author: {
      id: res.data.user_id ?? 0,
      nickname: res.data.nickname,
      imageUri: res.data.profile_image ?? null,
      username: res.data.username, 
    },
    imageUri: res.data.images?.[0] ?? null,
    likes: res.data.like_count,
    bookmarks: res.data.scrap_count,
    userId: res.data.user_id,
  };
}

// 게시글 작성
export async function createPost(title: string, content: string) {
  const res = await api.post("/board/create/", {
    title,
    content,
  });
  return res.data;
}

// 댓글 삭제
export async function deleteComment(postId: number, commentId: number) {
  const token = await AsyncStorage.getItem("@jwt");
  if (!token) throw new Error("No access token");

  const res = await api.delete(`/board/${postId}/comments/${commentId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
// 게시글 삭제
export async function deletePost(postId: number) {
  const res = await api.delete(`/board/${postId}/`);
  return res.data;
}

// 좋아요 토글
export async function toggleLike(postId: number) {
  const res = await api.post(`/board/${postId}/like/`);
  return {
    isLiked: res.data.is_liked,
    like: res.data.like_count,
  };
}

// 스크랩 토글
export async function toggleScrap(postId: number) {
  const res = await api.post(`/board/${postId}/scrap/`);
  return {
    isBookmarked: res.data.is_scrapped,
    bookmarkCount: res.data.scrap_count,
  };
}

// 댓글 목록 불러오기
export async function fetchComments(postId: number): Promise<Comment[]> {
  const res = await api.get(`/board/${postId}/comments/`);

  return res.data.map((c: any) => ({
    id: c.id,
    content: c.content,
    createdAt:
      typeof c.date === "string" && !isNaN(Date.parse(c.date))
        ? new Date(c.date).toISOString()
        : new Date().toISOString(),
    like: c.like_count ?? 0,
    isLiked: c.is_liked ?? false,
    parent_id: c.parent_id ?? null,
    user: {
      id: c.user_id ?? 0,
      nickname: c.nickname,
      username: c.username,
      imageUri: c.profile_image ?? null,
      nationality: c.nationality ?? "",
    },
    replies: (c.replies ?? []).map((r: any) => ({
      id: r.id,
      content: r.content,
      createdAt:
        typeof r.date === "string" && !isNaN(Date.parse(r.date))
          ? new Date(r.date).toISOString()
          : new Date().toISOString(),
      like: r.like_count ?? 0,
      isLiked: r.is_liked ?? false,
      parent_id: r.parent_id ?? c.id,
      user: {
        id: r.user_id ?? 0,
        nickname: r.nickname,
        username: r.username,
        imageUri: r.profile_image ?? null,
        nationality: r.nationality ?? "",
      },
      replies: [],
    })),
  }));
}

// 댓글 작성 (대댓글 포함)
export async function postComment(
  postId: number,
  content: string,
  parentId?: number
) {
  const token = await AsyncStorage.getItem("@jwt");
  if (!token) throw new Error("No access token");

  const payload = parentId ? { content, parent_id: parentId } : { content };

  console.log("📤 댓글 작성 요청:", postId, payload);

  const res = await api.post(`/board/${postId}/comments/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

// 댓글 수정
export async function updateComment(
  commentId: number,
  editingCommentId: number,
  content: string
) {
  const token = await AsyncStorage.getItem("@jwt");
  if (!token) throw new Error("No access token");

  const res = await api.put(
    `/board/comments/${commentId}/`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

// 댓글 좋아요 토글
export async function toggleCommentLike(commentId: number) {
  const token = await AsyncStorage.getItem("@jwt");
  if (!token) throw new Error("No access token");

  const res = await api.post(
    `/board/comment/${commentId}/like/`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

// 게시글 검색
export async function searchBoardList(keyword: string): Promise<Post[]> {
  const res = await api.get("/board/", {
    params: { search: keyword },
  });

  return res.data.map((post: any) => ({
    id: post.id,
    title: post.title,
    description: post.content,
    createdAt:
      typeof post.date === "string" && !isNaN(Date.parse(post.date))
        ? new Date(post.date.replace(/\.\d+Z$/, "Z")).toISOString()
        : new Date().toISOString(),
    author: {
      username: post.username,
      nickname: post.nickname,
    },
    imageUri: post.image,
    likes: post.like_count,
    bookmarks: post.scrap_count,
    isLiked: post.is_liked ?? false,
    isBookmarked: post.is_scrapped ?? false,
    commentCount: post.comment_count ?? 0,
    userId: post.user_id ?? 0,
  }));
}

// 게시글 수정
export async function updatePost(
  postId: number,
  title: string,
  content: string
) {
  const res = await api.put(`/board/${postId}/update/`, {
    title,
    content,
  });
  return res.data;
}

// 게시글 작성자 차단
export async function blockPostAuthor(postId: number) {
  const token = await AsyncStorage.getItem("@jwt");
  if (!token) throw new Error("No access token");

  const response = await api.post(
    `/board/${postId}/block-user/`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}
