
export type CampusRole = 'Student' | 'Faculty' | 'Alumni' | 'Admin';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  profilePic: string;
  bio?: string;
  role: CampusRole;
  followers: string[];
  following: string[];
  isPrivate: boolean;
  isVerified: boolean;
  streakCount: number;
  oAuthProviders?: {
    google?: { id: string; email: string };
    facebook?: { id: string; email: string };
  };
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userImage: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'reel';
  caption: string;
  location?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
  reelAudio?: string; // For Reels
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userImage: string;
  mediaUrl: string;
  expiresAt: string;
  seen: boolean;
  reactions?: string[];
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  fromUser: {
    username: string;
    profilePic: string;
  };
  content?: string;
  postId?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participants: Partial<User>[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}
