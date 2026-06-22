'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminApi } from '@/lib/api/admin';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPendingCampaigns();
  }, []);

  const loadPendingCampaigns = async () => {
    try {
      setLoading(true);
      const response: any = await adminApi.getPendingCampaigns();
      setCampaigns(response.data || []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast.error('Failed to load pending campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (campaignId: string) => {
    if (!confirm('Are you sure you want to approve this campaign?')) return;

    try {
      setActionLoading(true);
      await adminApi.approveCampaign(campaignId);
      toast.success('Campaign approved successfully');
      loadPendingCampaigns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve campaign');
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
      await adminApi.rejectCampaign(selectedCampaign.id, rejectReason);
      toast.success('Campaign rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedCampaign(null);
      loadPendingCampaigns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.creator?.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h2 className="text-2xl font-bold text-gray-900">Campaign Approvals</h2>
          <p className="text-sm text-gray-600 mt-1">
            Review and approve pending campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800">
            {filteredCampaigns.length} Pending
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search campaigns by title or creator email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All caught up!
            </h3>
            <p className="text-sm text-gray-600">
              No pending campaigns to review at the moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Campaign Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <Clock className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {campaign.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {campaign.shortDescription}
                        </p>
                      </div>
                    </div>

                    {/* Campaign Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Creator</p>
                        <p className="text-sm font-medium text-gray-900">
                          {campaign.creator?.firstName} {campaign.creator?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{campaign.creator?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Goal Amount</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(Number(campaign.targetAmount))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="text-sm font-medium text-gray-900">{campaign.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Submitted</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatRelativeTime(new Date(campaign.createdAt))}
                        </p>
                      </div>
                    </div>

                    {/* Creator Verification */}
                    <div className="flex items-center gap-2 mb-4">
                      {campaign.creator?.isVerified ? (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Creator Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          Creator Not Verified
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/campaigns/${campaign.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(campaign.id)}
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
                          setSelectedCampaign(campaign);
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
              <CardTitle>Reject Campaign</CardTitle>
              <CardDescription>
                Please provide a reason for rejecting this campaign
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
                    placeholder="Please explain why this campaign is being rejected..."
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
                      setSelectedCampaign(null);
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
