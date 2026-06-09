'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { kycApi } from '@/lib/api/kyc';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

const kycSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  idType: z.enum(['NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'VOTERS_CARD']),
  idNumber: z.string().min(5, 'ID number is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().optional(),
});

type KycFormData = z.infer<typeof kycSchema>;

const statusConfig = {
  PENDING: {
    icon: Clock,
    color: 'yellow',
    title: 'Pending Review',
    description: 'Your KYC is being reviewed by our team',
  },
  APPROVED: {
    icon: CheckCircle,
    color: 'green',
    title: 'Verified',
    description: 'Your account has been verified',
  },
  REJECTED: {
    icon: XCircle,
    color: 'red',
    title: 'Rejected',
    description: 'Your KYC was rejected',
  },
};

export default function KYCPage() {
  const { user } = useAuthStore();
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KycFormData>({
    resolver: zodResolver(kycSchema),
  });

  useEffect(() => {
    loadKycStatus();
  }, []);

  const loadKycStatus = async () => {
    try {
      setLoading(true);
      const response: any = await kycApi.getStatus();
      setKycStatus(response.data);
    } catch (error) {
      console.error('Failed to load KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: KycFormData) => {
    setSubmitting(true);
    try {
      await kycApi.submit(data);
      toast.success('KYC submitted successfully!');
      loadKycStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading KYC status...</p>
        </div>
      </div>
    );
  }

  // If KYC already submitted
  if (kycStatus && kycStatus.status !== 'NOT_SUBMITTED') {
    const config = statusConfig[kycStatus.status as keyof typeof statusConfig];
    const StatusIcon = config.icon;

    return (
      <div className="mx-auto max-w-2xl">
        <Card className={`border-${config.color}-200`}>
          <CardContent className="py-12 text-center">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-${config.color}-100`}
            >
              <StatusIcon className={`h-8 w-8 text-${config.color}-600`} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">{config.title}</h2>
            <p className="mt-2 text-gray-600">{config.description}</p>

            {kycStatus.status === 'REJECTED' && kycStatus.rejectionReason && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
                <p className="font-medium text-red-900">Rejection Reason:</p>
                <p className="mt-1 text-sm text-red-700">{kycStatus.rejectionReason}</p>
              </div>
            )}

            <div className="mt-8 space-y-2">
              {kycStatus.status === 'APPROVED' && (
                <Button asChild>
                  <a href="/dashboard/campaigns/create">Create Campaign</a>
                </Button>
              )}
              <Button variant="outline" asChild>
                <a href="/dashboard">Back to Dashboard</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // KYC Submission Form
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
        <p className="mt-1 text-gray-600">
          Complete your verification to create campaigns and unlock all features
        </p>
      </div>

      {/* Info Banner */}
      <Card className="border-primary-200 bg-primary-50">
        <CardContent className="flex items-start gap-4 p-6">
          <Shield className="h-6 w-6 text-primary-600" />
          <div>
            <h3 className="font-semibold text-primary-900">Why Verify?</h3>
            <ul className="mt-2 space-y-1 text-sm text-primary-700">
              <li>✓ Create and manage fundraising campaigns</li>
              <li>✓ Build trust with potential backers</li>
              <li>✓ Access all platform features</li>
              <li>✓ Secure and compliant</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* KYC Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Please provide accurate information for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <Input
              label="Full Name (as per ID)"
              placeholder="John Doe"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            {/* Date of Birth */}
            <Input
              label="Date of Birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />

            {/* ID Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ID Type
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                {...register('idType')}
              >
                <option value="NATIONAL_ID">National ID</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVERS_LICENSE">Driver's License</option>
                <option value="VOTERS_CARD">Voter's Card</option>
              </select>
              {errors.idType && (
                <p className="mt-1 text-sm text-red-600">{errors.idType.message}</p>
              )}
            </div>

            {/* ID Number */}
            <Input
              label="ID Number"
              placeholder="12345678"
              error={errors.idNumber?.message}
              {...register('idNumber')}
            />

            {/* Address */}
            <Input
              label="Address (Optional)"
              placeholder="123 Main Street"
              error={errors.address?.message}
              {...register('address')}
            />

            {/* City & Country */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="City (Optional)"
                placeholder="Lagos"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="Country"
                placeholder="Nigeria"
                error={errors.country?.message}
                {...register('country')}
              />
            </div>

            {/* Postal Code */}
            <Input
              label="Postal Code (Optional)"
              placeholder="100001"
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />

            {/* Notice */}
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Mock KYC for MVP</p>
                  <p className="mt-1">
                    This is a mock verification system. In production, you would upload ID
                    documents for verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" asChild>
                <a href="/dashboard">Cancel</a>
              </Button>
              <Button type="submit" loading={submitting}>
                <FileText className="mr-2 h-4 w-4" />
                Submit for Verification
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
