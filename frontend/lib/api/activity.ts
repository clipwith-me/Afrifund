import apiClient from './client';

export interface Activity {
  id: string;
  type: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  campaignId?: string;
  campaignTitle?: string;
  pledgeId?: string;
  amount?: number;
  currency?: string;
  message: string;
  metadata?: any;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  campaign?: {
    id: string;
    title: string;
    slug: string;
    category?: string;
    featuredImage?: string;
  };
}

export interface ActivityStats {
  totalActivities: number;
  recentCampaigns: number;
  recentPledges: number;
  recentUsers: number;
}

export const activityApi = {
  // Get recent activities
  getAll: (limit = 50, skip = 0) =>
    apiClient.get<Activity[]>('/activity', { params: { limit, skip } }),

  // Get activity stats
  getStats: () =>
    apiClient.get<ActivityStats>('/activity/stats'),

  // Get activities by type
  getByType: (type: string, limit = 20) =>
    apiClient.get<Activity[]>(`/activity/type/${type}`, { params: { limit } }),

  // Get user activities
  getUserActivities: (userId: string, limit = 20) =>
    apiClient.get<Activity[]>(`/activity/user/${userId}`, { params: { limit } }),

  // Get campaign activities
  getCampaignActivities: (campaignId: string, limit = 20) =>
    apiClient.get<Activity[]>(`/activity/campaign/${campaignId}`, { params: { limit } }),
};
