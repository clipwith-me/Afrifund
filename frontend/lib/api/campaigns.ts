import apiClient from './client';

export interface CreateCampaignData {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  location: string;
  country: string;
  targetAmount: number;
  currency?: string;
  startDate: string;
  endDate: string;
  featuredImage?: string;
  videoUrl?: string;
}

export const campaignsApi = {
  getAll: (params?: {
    status?: string;
    category?: string;
    country?: string;
    search?: string;
  }) => apiClient.get('/campaigns', { params }),

  getById: (id: string) => apiClient.get(`/campaigns/${id}`),

  getBySlug: (slug: string) => apiClient.get(`/campaigns/slug/${slug}`),

  getUserCampaigns: () => apiClient.get('/campaigns/my-campaigns'),

  create: (data: CreateCampaignData) => apiClient.post('/campaigns', data),

  update: (id: string, data: Partial<CreateCampaignData>) =>
    apiClient.patch(`/campaigns/${id}`, data),

  addMedia: (id: string, media: Array<{
    type: string;
    url: string;
    caption?: string;
    order?: number;
  }>) => apiClient.post(`/campaigns/${id}/media`, { media }),
};
