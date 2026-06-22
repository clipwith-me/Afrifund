'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminApi } from '@/lib/api/admin';
import { formatRelativeTime } from '@/lib/utils/format';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  User,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminKycPage() {
  const [kycSubmissions, setKycSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKyc, setSelectedKyc] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPendingKyc();
  }, []);

  const loadPendingKyc = async () => {
    try {
      setLoading(true);
      const response: any = await adminApi.getPendingKyc();
      setKycSubmissions(response.data || []);
    } catch (error) {
      console.error('Failed to load KYC submissions:', error);
      toast.error('Failed to load pending KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (kycId: string) => {
    if (!confirm('Are you sure you want to approve this KYC submission?')) return;

    try {
      setActionLoading(true);
      await adminApi.approveKyc(kycId);
      toast.success('KYC approved successfully');
      loadPendingKyc();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      await adminApi.rejectKyc(selectedKyc.id, rejectReason);
      toast.success('KYC rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedKyc(null);
      loadPendingKyc();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSubmissions = kycSubmissions.filter((kyc) =>
    kyc.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kyc.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kyc.idNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">KYC Verification</h2>
          <p className="text-sm text-gray-600 mt-1">
            Review and verify user identity submissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800">
            {filteredSubmissions.length} Pending
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by name, email, or ID number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* KYC Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All verified!
            </h3>
            <p className="text-sm text-gray-600">
              No pending KYC submissions to review at the moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((kyc) => (
            <Card key={kyc.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* KYC Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <Clock className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {kyc.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {kyc.user?.email}
                        </p>
                      </div>
                    </div>

                    {/* KYC Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">ID Type</p>
                        <p className="text-sm font-medium text-gray-900">
                          {kyc.idType || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ID Number</p>
                        <p className="text-sm font-medium text-gray-900">
                          {kyc.idNumber || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date of Birth</p>
                        <p className="text-sm font-medium text-gray-900">
                          {kyc.dateOfBirth ? new Date(kyc.dateOfBirth).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Submitted</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatRelativeTime(new Date(kyc.createdAt))}
                        </p>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="text-sm text-gray-900">
                        {kyc.address || 'Not provided'}
                      </p>
                      {kyc.city && kyc.country && (
                        <p className="text-sm text-gray-600 mt-1">
                          {kyc.city}, {kyc.country} {kyc.postalCode && `- ${kyc.postalCode}`}
                        </p>
                      )}
                    </div>

                    {/* Document Links */}
                    {(kyc.documentFrontUrl || kyc.documentBackUrl || kyc.selfieUrl) && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700 mb-2 font-medium">
                          <FileText className="inline h-3 w-3 mr-1" />
                          Uploaded Documents
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {kyc.documentFrontUrl && (
                            <a
                              href={kyc.documentFrontUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-3 py-1 bg-white border border-blue-200 rounded-md hover:bg-blue-50"
                            >
                              ID Front
                            </a>
                          )}
                          {kyc.documentBackUrl && (
                            <a
                              href={kyc.documentBackUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-3 py-1 bg-white border border-blue-200 rounded-md hover:bg-blue-50"
                            >
                              ID Back
                            </a>
                          )}
                          {kyc.selfieUrl && (
                            <a
                              href={kyc.selfieUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-3 py-1 bg-white border border-blue-200 rounded-md hover:bg-blue-50"
                            >
                              Selfie
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* User Account Status */}
                    <div className="flex items-center gap-4 mb-4 text-xs">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="text-gray-600">
                          Role: <span className="font-medium text-gray-900">{kyc.user?.role}</span>
                        </span>
                      </div>
                      {kyc.user?.createdAt && (
                        <div className="text-gray-600">
                          Account created: {formatRelativeTime(new Date(kyc.user.createdAt))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(kyc.id)}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedKyc(kyc);
                          setShowRejectModal(true);
                        }}
                        disabled={actionLoading}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reject KYC Submission</CardTitle>
              <CardDescription>
                Please provide a reason for rejecting this verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Rejection Reason
                  </label>
                  <textarea
                    className="mt-1 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    rows={4}
                    placeholder="Please explain why this KYC is being rejected..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                      setSelectedKyc(null);
                    }}
                    disabled={actionLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
