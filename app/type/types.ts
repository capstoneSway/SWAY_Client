// types.ts

// 작성자 정보
export interface Author {
  username?: string;
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
  imageUris: string[] // 첫 번째 이미지 또는 null
   // 상태 관련 필드 (좋아요/스크랩/댓글 수)
  like_count: number;          // 백엔드: like_count
  scrap_count: number;         // 백엔드: scrap_count
  scarp_count?: number; // 오타 대응용 임시 필드
  comment_count: number;       // 백엔드: comment_count

  is_liked: boolean;           // 백엔드: is_liked
  is_scraped: boolean;        // 백엔드: is_scraped

  userId: number;              // 작성자 id
}

// 댓글(Comment) 타입
export interface Comment {
  id: number;
  content: string;            // 실제 API 필드
  createdAt: string;
  like_count: number;
  comment_is_liked: boolean;
  isDeleted?: boolean;
  is_blocked?: boolean; 
  parent_id: number | null;
  user: {
    id: number;               // 서버 응답에 없으면 0으로 처리
    nickname: string;
    username: string;
    imageUri: string | null;
    nationality: string;
  };
  replies: Comment[]; 
  mostLiked?: boolean;
}
