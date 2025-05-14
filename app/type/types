interface User {
  id: number;
  nickname: string;
  imageUri?: string;
}

interface ImageUri {
  id?: number;
  uri: string;
}

interface Post {
  id: number;
  userId: number;
  title: string;
  description: string;
  createdAt: string;
  author: User;
  imageUris: ImageUri[];
  likes: { userId: number }[];
  bookmarks: number;
  commentCount: number;
  comments?: PostComment[];
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: User;
  isDeleted: boolean;
}

interface PostComment extends Comment {
  replies: Comment[];
}

export type { Comment, ImageUri, Post };
