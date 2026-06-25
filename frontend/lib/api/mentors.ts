import apiClient from './client';

export interface CreateMentorProfileData {
  title: string;
  expertise: string[];
  bio: string;
  company?: string;
  linkedinUrl?: string;
  yearsExperience: number;
  hourlyRate?: number;
  availableHours?: number;
}

export interface CreateSessionData {
  campaignId: string;
  title: string;
  description?: string;
  hoursSpent: number;
  sessionDate: string;
  notes?: string;
}

export const mentorsApi = {
  // Get all mentors
  getAll: (params?: { expertise?: string; isActive?: boolean }) =>
    apiClient.get('/mentors', { params }),

  // Get mentor by ID
  getById: (id: string) => apiClient.get(`/mentors/${id}`),

  // Create mentor profile
  createProfile: (data: CreateMentorProfileData) =>
    apiClient.post('/mentors/profile', data),

  // Update mentor profile
  updateProfile: (id: string, data: Partial<CreateMentorProfileData>) =>
    apiClient.patch(`/mentors/${id}`, data),

  // Create mentor session
  createSession: (mentorId: string, data: CreateSessionData) =>
    apiClient.post(`/mentors/${mentorId}/sessions`, data),

  // Get mentor equity ledger
  getLedger: (id: string) => apiClient.get(`/mentors/${id}/ledger`),

  // Get mentor statistics
  getStats: (id: string) => apiClient.get(`/mentors/${id}/stats`),

  // Get mentors for a campaign
  getCampaignMentors: (campaignId: string) =>
    apiClient.get(`/mentors/campaign/${campaignId}`),
};
