export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  avatarURL: string | null;
  coverImageURL: string | null;
  role: "startup_founder" | "investor" | "mentor" | "corporate_professional" | "service_provider" | "student" | "other";
  status: "active" | "suspended" | "pending";
  isEmailVerified: boolean;
  phoneNumber: string | null;
  location: string | null;
  timezone: string | null;
  bio: string | null;
  headline: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  companyName: string | null;
  isVerified: boolean;
  subscriptionTier: "free" | "pro" | "enterprise";
  totalConnections: number;
  totalPosts: number;
  totalEngagement: number;
  createdAt: string; // ISO DateTime
  updatedAt: string | null;
}

export interface UserStatsResponse {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    avatarURL: string | null;
    headline: string | null;
    isVerified: boolean;
  };
  stats: {
    totalConnections: number;
    profileViews: number;
    totalPosts: number;
    totalPostViews: number;
    unreadNotifications: number;
    totalFollowers: number;
  };
}

export interface UserRecommendation {
  id: number;
  firstName: string;
  lastName: string;
  headline: string | null;
  bio: string | null;
  avatarURL: string | null;
  coverImageURL: string | null;
  location: string | null;
  companyName: string | null;
  role: string;
  isVerified: boolean;
  matchScore: number; // 0-100 percentage
  connectionReason: string; // e.g., "Potential investor • Based in Singapore"
  mutualConnectionsCount: number;
  isRequestSent: boolean;
  isRequestReceived: boolean;
  connectionStatus: "none" | "pending_sent" | "pending_received";
}

export interface PostResponse {
  id: number;
  authorID: number;
  author: UserProfile;
  authorPageID: number | null;
  postContent: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  repostsCount: number;
  postVisibility: "public" | "connections" | "private";
  postHashTags: string[];
  attachments: Array<{
    id: number;
    postAttachmentType: "image" | "video" | "document";
    postAttachmentUrl: string;
    postAttachmentTitle: string | null;
  }>;
  createdAt: string;
  isLiked: boolean;
  isSaved: boolean;
}

export interface FeedResponse {
  posts: PostResponse[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface TrendingTopic {
  hashtag: string; // without #
  postsCount: number;
  likesCount: number;
  repostsCount: number;
  engagementScore: number;
}
