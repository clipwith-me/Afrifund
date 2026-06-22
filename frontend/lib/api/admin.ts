import apiClient from './client';

export const adminApi = {
  // Dashboard Stats
  getDashboard: () => apiClient.get('/admin/dashboard'),

  getActivity: () => apiClient.get('/admin/activity'),

  getRevenue: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get('/admin/revenue', { params }),

  getStats: () => apiClient.get('/admin/stats'),

  // Users
  getAllUsers: (params?: { role?: string; isVerified?: boolean }) =>
    apiClient.get('/admin/users', { params }),

  // Payouts
  processPayout: (campaignId: string) =>
    apiClient.post(`/admin/payout/${campaignId}`),

  // KYC Management
  getPendingKyc: () => apiClient.get('/kyc/pending'),

  approveKyc: (id: string) => apiClient.patch(`/kyc/${id}/approve`),

  rejectKyc: (id: string, reason: string) =>
    apiClient.patch(`/kyc/${id}/reject`, { reason }),

  // Campaign Management
  getPendingCampaigns: () =>
    apiClient.get('/campaigns', { params: { status: 'PENDING_APPROVAL' } }),

  approveCampaign: (id: string) => apiClient.post(`/campaigns/${id}/approve`),

  rejectCampaign: (id: string, reason: string) =>
    apiClient.post(`/campaigns/${id}/reject`, { reason }),
};
