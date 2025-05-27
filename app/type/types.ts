// types.ts

export interface Author {
  id: number; 
  nickname: string;
  imageUri?: string; 
  nationality?: string;
}



export interface Post {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  author: Author; 
  imageUri?: string | null;
  likes: number;
  bookmarks: number;
  commentCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  userId: number;

}


export interface Comment {
  id: number;
  content: string; 
  createdAt: string;
  user: Author;
  likes?: number; 
  isLiked?: boolean; 
  replies?: Comment[]; 
}
