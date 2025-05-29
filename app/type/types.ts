// types.ts

// 작성자 정보
export interface Author {
  username: string;
  id: number;
  nickname: string;
  imageUri?: string;
  nationality?: string;
  
}

// 게시글(Post) 타입
export interface Post {
  id: number;
  title: string;
  description: string;      // 실제 API에선 'content'
  createdAt: string;        // ISO 문자열로 변환된 날짜
  author: Author;
  imageUri?: string | null; // 첫 번째 이미지 또는 null
  likes: number;
  bookmarks: number;
  commentCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  userId: number;           // 작성자 id
}

// 댓글(Comment) 타입
export interface Comment {
  id: number;
  content: string;            // 실제 API 필드
  createdAt: string;
  like: number;
  isLiked: boolean;
  parent_id: number | null;
  user: {
    id: number;               // 서버 응답에 없으면 0으로 처리
    nickname: string;
    username: string;
    imageUri: string | null;
    nationality: string;
  };
  replies: Comment[];         // 대댓글 배열
}
