import apiClient from './client';

export interface SubmitKycData {
  fullName: string;
  dateOfBirth: string;
  idType: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'VOTERS_CARD';
  idNumber: string;
  idDocument?: string;
  address?: string;
  city?: string;
  country: string;
  postalCode?: string;
}

export const kycApi = {
  submit: (data: SubmitKycData) => apiClient.post('/kyc/submit', data),

  getStatus: () => apiClient.get('/kyc/status'),
};
