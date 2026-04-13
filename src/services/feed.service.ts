import { apiFetch, apiRequest } from './api-client';
import { 
  FeedResponse,
  TrendingTopic, 
  UserRecommendation, 
  UserStatsResponse,
  CommentsListResponse,
  CommentResponse,
  CreateCommentRequest,
  PostResponse,
  CreatePostRequest,
  UploadResponse,
  SavedPostsResponse,
  RepostRequest,
} from '@/types/feed';

export const feedService = {
  /**
   * Get Personalized Feed
   */
  getFeed: async (params: { 
    page?: number; 
    limit?: number; 
    feed_type?: 'recommended' | 'following' | 'trending' | 'recent';
    sort_by?: 'recent' | 'trending' | 'engagement' | 'relevance';
    time_range?: 'all_time' | 'today' | 'this_week' | 'this_month';
    pageId?: number;
  }) => {
    const { page = 1, limit = 10, feed_type = 'recommended', sort_by = 'relevance', time_range = 'all_time', pageId } = params;
    let url = `/feed/?page=${page}&limit=${limit}&feed_type=${feed_type}&sort_by=${sort_by}&time_range=${time_range}`;
    
    return apiRequest<FeedResponse>(url, {
      ...(pageId && { headers: { 'x-page-id': pageId.toString() } })
    });
  },

  /**
   * Get Trending Topics
   */
  getTrendingTopics: async (days: number = 7, limit: number = 10) => {
    return apiRequest<TrendingTopic[]>(`/feed/trending/topics?days=${days}&limit=${limit}`);
  },

  /**
   * Get Connection Recommendations
   */
  getConnectionRecommendations: async (limit: number = 10, type: string = 'all') => {
    return apiRequest<UserRecommendation[]>(`/connections/recommendations?limit=${limit}&recommendation_type=${type}`);
  },

  /**
   * Get User Statistics
   */
  getUserStats: async () => {
    return apiRequest<UserStatsResponse>(`/users/me/stats`);
  },

  // ── Post CRUD ──────────────────────────────

  createPost: async (data: CreatePostRequest) => {
    return apiRequest<PostResponse>(`/feed/posts`, {
      method: 'POST',
      body: JSON.stringify(data),
      ...(data.authorPageID && { headers: { 'x-page-id': data.authorPageID.toString() } })
    });
  },

  deletePost: async (postId: number) => {
    return apiRequest<{ message: string }>(`/feed/posts/${postId}`, {
      method: 'DELETE',
    });
  },

  updatePost: async (postId: number, data: { postContent?: string; postVisibility?: string; postHashTags?: string[] }) => {
    return apiRequest<PostResponse>(`/feed/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // ── Like / Save / Share ────────────────────

  likePost: async (postId: number) => {
    return apiRequest<{ message: string }>(`/feed/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  savePost: async (postId: number) => {
    return apiRequest<{ message: string }>(`/feed/posts/${postId}/save`, {
      method: 'POST',
    });
  },

  sharePost: async (postId: number) => {
    return apiRequest<{ message: string }>(`/feed/posts/${postId}/share`, {
      method: 'POST',
    });
  },

  repostPost: async (postId: number, data: RepostRequest) => {
    return apiRequest<PostResponse>(`/feed/posts/${postId}/repost`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getSavedPosts: async (params: { page?: number; limit?: number } = {}) => {
    const { page = 1, limit = 20 } = params;
    return apiRequest<SavedPostsResponse>(`/feed/saved?page=${page}&limit=${limit}`);
  },

  // ── Comments ───────────────────────────────

  getComments: async (postId: number, params: { page?: number; limit?: number } = {}) => {
    const { page = 1, limit = 20 } = params;
    return apiRequest<CommentsListResponse>(`/feed/posts/${postId}/comments?page=${page}&limit=${limit}`);
  },

  createComment: async (postId: number, data: CreateCommentRequest) => {
    return apiRequest<CommentResponse>(`/feed/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteComment: async (commentId: number) => {
    return apiRequest<{ message: string }>(`/feed/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  likeComment: async (commentId: number) => {
    return apiRequest<{ message: string }>(`/feed/comments/${commentId}/like`, {
      method: 'POST',
    });
  },

  // ── File Upload ────────────────────────────

  uploadAttachment: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiFetch(`/feed/upload`, {
      method: 'POST',
      body: formData,
      headers: {}, // let browser set Content-Type with boundary
    });

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Upload failed: ${response.status}`);
    }

    return response.json() as Promise<UploadResponse>;
  },

  // ── Connections ────────────────────────────

  sendConnectionRequest: async (receiverId: number, message?: string) => {
    return apiRequest<any>(`/connections/request`, {
      method: 'POST',
      body: JSON.stringify({ connectionRequestReceiverID: receiverId, ...(message && { message }) }),
    });
  },
};
