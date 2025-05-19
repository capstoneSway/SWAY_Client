// api/board.ts
import { api } from "./axios";

// 게시글 목록 불러오기
export async function fetchBoardList() {
  const res = await api.get("/board/");
  return res.data.map((post: any) => ({
    id: post.id,
    userId: post.writer?.id,
    title: post.title,
    description: post.content,
    createdAt: post.createdAt,
    likes: post.like,
    commentCount: post.commentCount ?? 0,
    bookmarks: post.bookmarkCount ?? 0,
    author: {
      nickname: post.writer?.nickname,
      profilePic: post.writer?.profilePic ?? "",
    },
  }));
}

// 게시글 상세 불러오기
export async function fetchBoardDetail(postId: number) {
  const res = await api.get(`/board/${postId}/`);
  return {
    id: res.data.id,
    title: res.data.title,
    description: res.data.content,
    createdAt: res.data.createdAt,
    author: {
      nickname: res.data.writer?.nickname,
      profilePic: res.data.writer?.profilePic ?? "",
    },
  };
}

// 게시글 작성
export async function createPost(title: string, content: string) {
  const res = await api.post("/board/", {
    title,
    content,
  });
  return res.data;
}

// 게시글 삭제
export async function deletePost(postId: number) {
  return await api.delete(`/board/${postId}/`);
}

// 좋아요 토글
export async function toggleLike(postId: number) {
  const res = await api.post(`/board/${postId}/like/`);
  return res.data;
}

// 스크랩 토글
export async function toggleScrap(postId: number) {
  const res = await api.post(`/board/${postId}/scrap/`);
  return res.data;
}

// 댓글 목록 불러오기
export async function fetchComments(postId: number) {
  const res = await api.get(`/board/${postId}/comment/`);
  return res.data.map((c: any) => ({
    id: c.id,
    comment: c.comment,
    parent_id: c.parent_id,
    createdAt: c.createdAt,
    like: c.like ?? 0,
    writer: {
      nickname: c.writer?.nickname,
      profilePic: c.writer?.profilePic ?? "",
    },
  }));
}

// 댓글 작성
export async function postComment(
  postId: number,
  comment: string,
  parentId: number | null = null
) {
  const res = await api.post(`/board/${postId}/comment/`, {
    comment,
    parent_id: parentId,
  });
  return res.data;
}

// 대댓글 포함 댓글 좋아요 토글 API
export async function toggleCommentLike(commentId: number) {
  const res = await api.post(`/board/comment/${commentId}/like/`);
  return res.data; // { like: number, isLiked: boolean } 형태 예상
}

// 댓글/대댓글 삭제
export async function deleteComment(postId: number, commentId: number) {
  return await api.delete(`/board/${postId}/comments/${commentId}/`);
}

// 게시글 검색 (제목/내용)
export async function searchBoardList(keyword: string) {
  const res = await api.get("/board/", {
    params: { search: keyword },
  });

  return res.data.map((post: any) => ({
    id: post.id,
    userId: post.writer?.id,
    title: post.title,
    description: post.content,
    createdAt: post.createdAt,
    likes: post.like,
    commentCount: post.commentCount ?? 0,
    bookmarks: post.bookmarkCount ?? 0,
    author: {
      nickname: post.writer?.nickname,
      profilePic: post.writer?.profilePic ?? "",
    },
  }));
}

// 게시글 수정
export async function updatePost(postId: number, title: string, content: string) {
  const config = await getAuthHeader();
  const response = await axios.put(
    `${BASE_URL}/board/${postId}/update/`,
    {
      title,
      content,
    },
    config
  );
  return response.data;
}

// 댓글 수정
export async function updateComment(postId: number, commentId: number, content: string) {
  const config = await getAuthHeader();
  const response = await axios.put(
    `${BASE_URL}/board/${postId}/comments/${commentId}/`,
    {
      comment: content,
    },
    config
  );
  return response.data;
}
