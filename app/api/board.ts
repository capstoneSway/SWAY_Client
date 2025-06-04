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
      nationality: post.nationality ?? "",
    },
    imageUris: post.images?.map((img: any) => img.image_url) ?? [],
    like_count: post.like_count,
    scarp_count: post.scrap_count,
    is_liked: post.is_liked ?? false,
    is_scrapped: post.is_scrapped ?? false,
    comment_Count: post.comment_count ?? 0,
    userId: post.user_id,
  }));
}

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
      nationality: res.data.nationality ?? "",
      username: res.data.username,
    },
    imageUris: res.data.images?.map((img: any) => img.image_url) ?? [],
    like_count: res.data.like_count,
    scrap_count: res.data.scrap_count,
    is_liked: res.data.is_liked ?? false,
    is_scraped: res.data.is_scraped ?? false,
    comment_count: res.data.comment_count ?? 0,
    userId: res.data.user_id,
  };
}

// 게시글 작성
export async function createPost(
  title: string,
  content: string,
  images: string[]
) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);

  images.forEach((uri, index) => {
    const fileName = uri.split("/").pop();
    const file = {
      uri,
      name: fileName || `image${index}.jpg`,
      type: "image/jpeg", // 또는 실제 타입: image/png 등
    };
    formData.append("image", file as any); // 여러 장이라도 key는 항상 "image"
  });

  const res = await api.post("/board/create/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
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
  console.log(`❤️ 좋아요 요청 완료: postId=${postId}, 결과=${res.data.liked}`);
  return {
    isLiked: res.data.is_liked,
  };
}

// 스크랩 토글
export async function toggleScrap(postId: number) {
  const res = await api.post(`/board/${postId}/scrap/`);
  console.log("🔖 스크랩 응답:", res.data); // 디버깅용

  return {
    isBookmarked: res.data.scrapped,
  };
}

// 댓글 목록 불러오기
export async function fetchComments(postId: number): Promise<Comment[]> {
  const token = await AsyncStorage.getItem("@jwt");
  console.log("🔑 fetchComments 호출, 토큰:", token);
  //const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await api.get(`/board/${postId}/comments/`, {
    /*headers*/
  });
  console.log("📥 댓글 응답 데이터:", JSON.stringify(res.data, null, 2));

  return res.data.map((c: any) => ({
    id: c.id,
    content: c.content,
    createdAt:
      typeof c.date === "string" && !isNaN(Date.parse(c.date))
        ? new Date(c.date).toISOString()
        : new Date().toISOString(),
    like_count: c.like_count ?? 0,
    isLiked: c.comment_is_liked ?? false,
    parent_id: c.parent_id ?? null,
    isDeleted: c.is_deleted,
    user: {
      id: c.user_id ?? 0,
      nickname: c.nickname,
      username: c.username,
      imageUri: c.profile_image ?? null,
      nationality: c.nationality ?? "",
    },
    replies: (c.reply ?? [])
      .filter((r: any) => !r.is_deleted) // 삭제된 대댓글은 제외
      .map((r: any) => ({
        id: r.id,
        content: r.content,
        createdAt:
          typeof r.date === "string" && !isNaN(Date.parse(r.date))
            ? new Date(r.date).toISOString()
            : new Date().toISOString(),
        like_count: r.like_count ?? 0,
        isLiked: r.comment_is_liked ?? false,
        isDeleted: r.is_deleted,
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

  try {
    const res = await api.post(`/board/${postId}/comments/`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅서버 응답:", res.data);

    return res.data;
  } catch (err) {
    console.error("❌ 댓글 작성 중 오류 발생:", err);
    throw err;
  }
}

// 댓글 수정
export async function updateComment(
  postId: number,
  commentId: number,
  content: string
) {
  try {
    const token = await AsyncStorage.getItem("@jwt");
    if (!token) throw new Error("No access token");

    const res = await api.put(
      `/board/${postId}/comments/${commentId}/`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("댓글 수정 실패:", error);
    throw error;
  }
}

// 댓글 좋아요 토글
export async function toggleCommentLike(postId: number, commentId: number) {
  const token = await AsyncStorage.getItem("@jwt");
  if (!token) throw new Error("No access token");

  const res = await api.post(
    `/board/${postId}/comments/${commentId}/like/`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return {
    is_liked: res.data.liked,
    delta: res.data.liked ? 1 : -1,
  };
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
      id: post.user_id ?? 0,
      nickname: post.nickname,
      username: post.username,
      imageUri: post.profile_image ?? null,
      nationality: post.nationality ?? "",
    },
    imageUris: post.images?.map((img: any) => img.image_url) ?? [],
    like_count: post.like_count,
    scrap_count: post.scrap_count,
    is_liked: post.is_liked ?? false,
    is_scrapped: post.is_scrapped ?? false,
    comment_count: post.comment_count ?? 0,
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

  const res = await api.post(
    `/board/${postId}/block-user/`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

//댓글 작성자 차단
export async function blockCommentAuthor(postId: number, commentId: number) {
  const token = await AsyncStorage.getItem("@jwt");
  if (!token) throw new Error("No access token");

  const res = await api.post(
    `/board/${postId}/comments/${commentId}/block-user/`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}
