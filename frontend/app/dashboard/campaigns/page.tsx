'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { campaignsApi } from '@/lib/api/campaigns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency, formatDate, calculateProgress } from '@/lib/utils/format';
import {
  Plus,
  Eye,
  Edit,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
  DRAFT: {
    icon: Edit,
    color: 'gray',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
  },
  PENDING_APPROVAL: {
    icon: Clock,
    color: 'yellow',
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
  },
  ACTIVE: {
    icon: CheckCircle,
    color: 'green',
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
  FUNDED: {
    icon: TrendingUp,
    color: 'blue',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
  },
  CLOSED: {
    icon: XCircle,
    color: 'gray',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
  },
  REJECTED: {
    icon: AlertCircle,
    color: 'red',
    bg: 'bg-red-100',
    text: 'text-red-700',
  },
};

export default function MyCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response: any = await campaignsApi.getUserCampaigns();
      setCampaigns(response.data || []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filter === 'ALL') return true;
    return campaign.status === filter;
  });

  const statusCounts = {
    ALL: campaigns.length,
    DRAFT: campaigns.filter((c) => c.status === 'DRAFT').length,
    PENDING_APPROVAL: campaigns.filter((c) => c.status === 'PENDING_APPROVAL').length,
    ACTIVE: campaigns.filter((c) => c.status === 'ACTIVE').length,
    FUNDED: campaigns.filter((c) => c.status === 'FUNDED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
          <p className="mt-1 text-gray-600">Manage and track your fundraising campaigns</p>
        </div>
        <Link href="/dashboard/campaigns/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              filter === status
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-primary-300'
            }`}
          >
            <div className="text-2xl font-bold text-gray-900">{count}</div>
            <div className="mt-1 text-sm text-gray-600">
              {status.replace('_', ' ').toLowerCase()}
            </div>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Campaigns List */}
      {!loading && filteredCampaigns.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredCampaigns.map((campaign) => {
            const progress = calculateProgress(
              Number(campaign.amountRaised),
              Number(campaign.targetAmount)
            );
            const StatusIcon = statusConfig[campaign.status as keyof typeof statusConfig]?.icon || AlertCircle;
            const statusStyle = statusConfig[campaign.status as keyof typeof statusConfig];

            return (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {campaign.category}
                      </CardDescription>
                    </div>
                    <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle?.bg} ${statusStyle?.text}`}>
                      <StatusIcon className="h-3 w-3" />
                      {campaign.status.replace('_', ' ')}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <ProgressBar progress={progress} />
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(Number(campaign.amountRaised), campaign.currency)}
                      </span>
                      <span className="text-gray-600">
                        of {formatCurrency(Number(campaign.targetAmount), campaign.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600">Backers</p>
                        <p className="font-semibold text-gray-900">
                          {campaign._count?.pledges || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600">Ends</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(campaign.endDate).split(',')[0]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/campaigns/${campaign.slug}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    {campaign.status === 'DRAFT' && (
                      <Link href={`/dashboard/campaigns/${campaign.id}/edit`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Rejection Reason */}
                  {campaign.status === 'REJECTED' && campaign.rejectionReason && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-xs font-medium text-red-900">Rejection Reason:</p>
                      <p className="mt-1 text-sm text-red-700">{campaign.rejectionReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {filter === 'ALL' ? 'No campaigns yet' : `No ${filter.toLowerCase().replace('_', ' ')} campaigns`}
            </h3>
            <p className="mt-2 text-gray-600">
              {filter === 'ALL'
                ? 'Start your first fundraising campaign today'
                : 'Try adjusting your filter'}
            </p>
            <Link href="/dashboard/campaigns/create" className="mt-6 inline-block">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
