import { apiRequest } from './api-client';
import { 
  FeedResponse, 
  TrendingTopic, 
  UserRecommendation, 
  UserStatsResponse 
} from '@/types/feed';

export const feedService = {
  /**
   * 4. Get Personalized Feed
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
   * 5. Get Trending Topics
   */
  getTrendingTopics: async (days: number = 7, limit: number = 10) => {
    return apiRequest<TrendingTopic[]>(`/feed/trending/topics?days=${days}&limit=${limit}`);
  },

  /**
   * 3. Get Connection Recommendations
   */
  getConnectionRecommendations: async (limit: number = 10, type: string = 'all') => {
    return apiRequest<UserRecommendation[]>(`/connections/recommendations?limit=${limit}&recommendation_type=${type}`);
  },

  /**
   * 2. Get User Statistics
   */
  getUserStats: async () => {
    return apiRequest<UserStatsResponse>(`/users/me/stats`);
  },

  /**
   * Create a new post (POST /feed/ - Assuming it exists based on common patterns)
   */
  createPost: async (data: { postContent: string; postVisibility: string; postHashTags: string[]; authorPageID?: number | null }) => {
    return apiRequest<any>(`/feed/`, {
      method: 'POST',
      body: JSON.stringify(data),
      ...(data.authorPageID && { headers: { 'x-page-id': data.authorPageID.toString() } })
    });
  }
};
