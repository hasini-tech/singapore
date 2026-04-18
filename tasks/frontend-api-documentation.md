# Frontend API Documentation Guide

This guide provides documentation for the core APIs (GET, POST, PUT, DELETE) of the Growthlab Platform.

**Base URL:** `https://api.growthlab.sg/api/v1`

**Authentication:** 
All requests (except where noted) require an `Authorization` header with a Bearer token:
`Authorization: Bearer <your_access_token>`

---

## Table of Contents
1. [Get Current User Profile (`/auth/me`)](#1-get-current-user-profile-authme)
2. [Get User Statistics (`/users/me/stats`)](#2-get-user-statistics-usersmestats)
3. [Get Connection Recommendations (`/connections/recommendations`)](#3-get-connection-recommendations-connectionsrecommendations)
4. [Get Personalized Feed (`/feed/`)](#4-get-personalized-feed-feed)
5. [Get Trending Topics (`/feed/trending/topics`)](#5-get-trending-topics-feedtrendingtopics)
6. [Get Notifications (`/notifications`)](#6-get-notifications-notifications)
7. [Get Unread Count by Feature (`/notifications/unread-count-by-feature`)](#7-get-unread-count-by-feature-notificationsunread-count-by-feature)
8. [Get My Pages (`/pages/my-pages`)](#8-get-my-pages-pagesmy-pages)
9. [Create a Post (`/feed/posts`)](#9-create-a-post-feedposts)
10. [Update a Post (`/feed/posts/{post_id}`)](#10-update-a-post-feedpostsid)
11. [Delete a Post (`/feed/posts/{post_id}`)](#11-delete-a-post-feedpostsid)
12. [Like/Unlike a Post (`/feed/posts/{post_id}/like`)](#12-likeunlike-a-post-feedpostsidlike)
13. [Add a Comment (`/feed/posts/{post_id}/comments`)](#13-add-a-comment-feedpostsidcomments)
14. [Get Comments for a Post (`/feed/posts/{post_id}/comments`)](#14-get-comments-for-a-post-feedpostsidcomments)
15. [Share/Repost a Post (`/feed/posts/{post_id}/share`)](#15-sharerepost-a-post-feedpostsidshare)
16. [Send Connection Request (`/connections/request`)](#16-send-connection-request-connectionsrequest)

---

## 1. Get Current User Profile
Returns the profile information of the currently authenticated user.

**Endpoint:** `GET /auth/me`

### Response Structure
```typescript
interface UserProfile {
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
```

---

## 2. Get User Statistics
Returns summarized statistics for the current user's profile, including connections, views, and unread notifications. Useful for sidebar dashboards.

**Endpoint:** `GET /users/me/stats`

### Response Structure
```typescript
interface UserStatsResponse {
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
```

---

## 3. Get Connection Recommendations
Returns a list of suggested users to connect with based on role compatibility, mutual connections, and activity.

**Endpoint:** `GET /connections/recommendations`

### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `recommendation_type` | string | `all` | Filter by role: `all`, `investors`, `founders`, `mentors`, `similar` |
| `limit` | number | `10` | Number of recommendations to return (max 50) |

### Response Structure
```typescript
interface UserRecommendation {
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

type RecommendationsResponse = UserRecommendation[];
```

---

## 4. Get Personalized Feed
Returns a paginated list of posts for the user's feed. Supports context switching to "Operating as a Page".

**Endpoint:** `GET /feed/`

### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Posts per page |
| `feed_type` | string | `recommended` | Type: `recommended`, `following`, `trending`, `recent` |
| `sort_by` | string | `relevance` | Sort: `recent`, `trending`, `engagement`, `relevance` |
| `time_range` | string | `all_time` | Range: `all_time`, `today`, `this_week`, `this_month` |

### Headers (Optional)
| Header | Description |
| :--- | :--- |
| `x-page-id` | Page ID to fetch feed context for a specific Business Page. |

### Response Structure
```typescript
interface PostResponse {
  id: number;
  authorID: number;
  author: UserProfile; // See Section 1
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

interface FeedResponse {
  posts: PostResponse[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
```

---

## 5. Get Trending Topics
Returns popular hashtags based on engagement (likes and reposts) over a specified period.

**Endpoint:** `GET /feed/trending/topics`

### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `days` | number | `7` | Lookback period in days (1-30) |
| `limit` | number | `10` | Number of topics to return (1-20) |

### Response Structure
```typescript
interface TrendingTopic {
  hashtag: string; // without #
  postsCount: number;
  likesCount: number;
  repostsCount: number;
  engagementScore: number;
}

type TrendingTopicsResponse = TrendingTopic[];
```

---

## 6. Get Notifications
Returns a paginated list of notifications for the current user.

**Endpoint:** `GET /notifications`

### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `feature` | string | `null` | Filter: `feed`, `connections`, `pages`, `profile`, `system` |
| `unread_only` | boolean | `false` | Return only unread notifications |
| `skip` | number | `0` | Offset |
| `limit` | number | `20` | Count (max 100) |

### Response Structure
```typescript
interface NotificationItem {
  id: number;
  type: string; // e.g., "post_like", "connection_accepted"
  feature: "feed" | "connections" | "pages" | "profile" | "system";
  priority: "low" | "normal" | "high" | "urgent";
  title: string;
  message: string;
  actorID: number | null;
  actorName: string | null;
  actorAvatar: string | null;
  targetType: string | null; // e.g., "post", "connection_request"
  targetID: number | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationListResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  skip: number;
  limit: number;
}
```

---

## 7. Get Unread Count by Feature
Returns unread notification counts grouped by feature categories.

**Endpoint:** `GET /notifications/unread-count-by-feature`

### Response Structure
```typescript
interface UnreadCountByFeatureResponse {
  feed: number;
  connections: number;
  pages: number;
  profile: number;
  system: number;
  total: number;
}
```

---

## 8. Get My Pages
Returns a list of business pages where the current user is a member (Owner or Admin).

**Endpoint:** `GET /pages/my-pages`

### Response Structure
```typescript
interface BusinessPageListItem {
  id: number;
  businessTitle: string;
  email: string;
  avatarURL: string | null;
  verificationStatus: "verified" | "pending" | "rejected";
  totalFollowers: number;
  userRole: "owner" | "admin" | "employee";
  canSwitchContext: boolean; // True if OWNER/ADMIN and VERIFIED
}

type MyPagesResponse = BusinessPageListItem[];
```

---

## 9. Create a Post
Creates a new post on the feed.

**Endpoint:** `POST /feed/posts`

### Request Body
```typescript
interface PostCreate {
  postContent: string; // Length: 1-5000 characters
  postVisibility: "public" | "connections" | "private"; // Default: "public"
  postHashTags?: string[]; // Max 10 items
  attachments?: Array<{
    postAttachmentType: "IMAGE" | "VIDEO" | "DOCUMENT";
    postAttachmentUrl: string; // Max length: 500
    postAttachmentTitle?: string; // Max length: 200
    postAttachmentDescription?: string; // Max length: 500
  }>; // Max 10 items
  authorPageID?: number; // Page ID if posting as a business page
}
```

### Response Structure
Returns a `PostResponse` object (See Section 4).

---

## 10. Update a Post
Updates an existing post. Only the author of the post can update it.

**Endpoint:** `PUT /feed/posts/{post_id}`

### Request Body
```typescript
interface PostUpdate {
  postContent?: string; // Length: 1-5000 characters
  postVisibility?: "public" | "connections" | "private";
  postHashTags?: string[]; // Max 10 items
  attachments?: Array<{
    postAttachmentType: "IMAGE" | "VIDEO" | "DOCUMENT";
    postAttachmentUrl: string;
    postAttachmentTitle?: string;
    postAttachmentDescription?: string;
  }>; // Max 10 items. Replaces existing attachments.
}
```

### Response Structure
Returns the updated `PostResponse` object (See Section 4).

---

## 11. Delete a Post
Deletes a post. Only the author can delete their post.

**Endpoint:** `DELETE /feed/posts/{post_id}`

### Response Structure
```typescript
interface MessageResponse {
  message: string;
  success: boolean;
}
```

---

## 12. Like/Unlike a Post
Toggles the like status of a post for the authenticated user (or page).

**Endpoint:** `POST /feed/posts/{post_id}/like`

### Request Body (Optional)
```typescript
interface LikeRequest {
  pageID?: number; // Page ID if liking as a business page
}
```

### Response Structure
```typescript
interface MessageResponse {
  message: string;
  success: boolean;
}
```

---

## 13. Add a Comment
Adds a new comment or replies to an existing comment on a post.

**Endpoint:** `POST /feed/posts/{post_id}/comments`

### Request Body
```typescript
interface CommentCreate {
  commentContent: string; // Length: 1-1000 characters
  parentCommentID?: number; // Provide this if replying to a comment
  authorPageID?: number; // Page ID if commenting as a business page
}
```

### Response Structure
```typescript
interface CommentResponse {
  id: number;
  postID: number;
  commentAuthorID: number;
  author: UserProfile; // See Section 1
  authorPageID: number | null;
  authorPage?: any; // Page info if commented by a page
  commentContent: string;
  commentLikeCount: number;
  parentCommentID: number | null;
  createdAt: string; // ISO DateTime
  updatedAt: string | null;
  isLiked: boolean;
  replies?: CommentResponse[];
}
```

---

## 14. Get Comments for a Post
Fetches comments for a specific post. Supports pagination for top-level comments and returns nested replies.

**Endpoint:** `GET /feed/posts/{post_id}/comments`

### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | number | `1` | Page number for top-level comments |
| `limit` | number | `20` | Comments per page |

### Headers (Optional)
| Header | Description |
| :--- | :--- |
| `x-page-id` | Page ID to fetch comment context for a specific Business Page. |

### Response Structure
```typescript
interface CommentsResponse {
  comments: CommentResponse[]; // See Section 13
  total: number; // Total top-level comments
  totalAll: number; // Total all comments including replies
  page: number;
  limit: number;
  hasNext: boolean;
}
```

---

## 15. Share/Repost a Post
Shares or reposts an existing post to the user's feed.

**Endpoint:** `POST /feed/posts/{post_id}/repost`  
**Endpoint:** `POST /feed/posts/{post_id}/share`

*(Note: `/repost` creates a new post referencing the original, returning a `PostResponse`. `/share` tracks a share interaction returning a `MessageResponse`)*

---

## 16. Send Connection Request
Sends a connection request to another user.

**Endpoint:** `POST /connections/request`

### Request Body
```typescript
interface ConnectionRequestCreate {
  connectionRequestReceiverID: number; // User ID to connect with
  message?: string; // Optional custom message (Max length: 500)
}
```

### Response Structure
```typescript
interface ConnectionRequestResponse {
  id: number;
  connectionRequestSenderID: number;
  connectionRequestReceiverID: number;
  sender: UserProfile; // See Section 1
  receiver: UserProfile; // See Section 1
  message: string | null;
  status: "pending" | "accepted" | "rejected" | "canceled";
  respondedAt: string | null; // ISO DateTime
  createdAt: string; // ISO DateTime
}
```
