const BASE_URL =
  "https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app";

// 게시글 목록 불러오기 (더미 데이터)
export async function fetchBoardList() {
  return [
    {
      id: 1,
      userId: 1,
      title: "RESTAURNT",
      description: "예시글입니다.",
      createdAt: new Date().toISOString(),
      likes: 3,
      commentCount: 2,
      bookmarks: 1,
      author: {
        nickname: "RICK",
        profilePic: "https://picsum.photos/40?random=1",
      },
    },
    {
      id: 2,
      userId: 2,
      title: "HUFS",
      description: "예시글입니다",
      createdAt: new Date().toISOString(),
      likes: 0,
      commentCount: 4,
      bookmarks: 2,
      author: {
        nickname: "JJ",
        profilePic: "https://picsum.photos/40?random=2",
      },
    },
    {
      id: 3,
      userId: 3,
      title: "MERTO TICKET",
      description: "예시글입니다다",
      createdAt: new Date().toISOString(),
      likes: 1,
      commentCount: 0,
      bookmarks: 0,
      author: {
        nickname: "SALLY",
        profilePic: "https://picsum.photos/40?random=3",
      },
    },
  ];
}

// 게시글 상세 불러오기 (더미 데이터)
export async function fetchBoardDetail(postId: number) {
  const posts = await fetchBoardList();
  return posts.find((post) => post.id === postId)!;
}

// 좋아요 토글 (더미 응답)
export async function toggleLike(postId: number) {
  return { success: true };
}

// 스크랩 토글 (더미 응답)
export async function toggleScrap(postId: number) {
  return { success: true };
}

// 댓글 작성 (더미)
export async function postComment(
  postId: number,
  comment: string,
  parentId: number | null = null
) {
  return {
    id: Date.now(),
    comment,
    parent_id: parentId,
    created_at: new Date().toISOString(),
    writer: {
      nickname: "RICK",
      profilePic: "https://picsum.photos/40?random=3",
    },
    like: 0,
  };
}

// 댓글 목록 불러오기 (더미 데이터)
export async function fetchComments(postId: number) {
  return [
    //
    {
      id: 1,
      comment: "이건 첫 번째 댓글입니다.",
      created_at: new Date().toISOString(),
      parent_id: null,
      like: 2,
      writer: {
        nickname: "익명1",
        profilePic: "https://picsum.photos/40?random=10",
      },
    },
    //
    {
      id: 2,
      comment: "첫 번째 댓글에 대한 대댓글입니다.",
      created_at: new Date().toISOString(),
      parent_id: 1,
      like: 1,
      writer: {
        nickname: "대댓글러",
        profilePic: "https://picsum.photos/40?random=11",
      },
    },
    //
    {
      id: 3,
      comment: "이건 두 번째 댓글입니다.",
      created_at: new Date().toISOString(),
      parent_id: null,
      like: 0,
      writer: {
        nickname: "익명2",
        profilePic: "https://picsum.photos/40?random=12",
      },
    },
    //
    {
      id: 4,
      comment: "두 번째 댓글에 대한 첫 대댓글입니다.",
      created_at: new Date().toISOString(),
      parent_id: 3,
      like: 3,
      writer: {
        nickname: "대댓글러2",
        profilePic: "https://picsum.photos/40?random=13",
      },
    },
    {
      id: 5,
      comment: "두 번째 댓글에 대한 두 번째 대댓글입니다.",
      created_at: new Date().toISOString(),
      parent_id: 3,
      like: 1,
      writer: {
        nickname: "대댓글러3",
        profilePic: "https://picsum.photos/40?random=14",
      },
    },
    //
    {
      id: 6,
      comment: "이건 세 번째 댓글입니다.",
      created_at: new Date().toISOString(),
      parent_id: null,
      like: 1,
      writer: {
        nickname: "익명3",
        profilePic: "https://picsum.photos/40?random=15",
      },
    },
  ];
}
