'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { campaignsApi } from '@/lib/api/campaigns';
import apiClient from '@/lib/api/client';
import { formatCurrency, formatRelativeTime, calculateProgress } from '@/lib/utils/format';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Edit,
  ArrowLeft,
  Eye,
  Target,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface CampaignAnalyticsPageProps {
  params: {
    id: string;
  };
}

export default function CampaignAnalyticsPage({ params }: CampaignAnalyticsPageProps) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaignData();
  }, [params.id]);

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      const [campaignRes, pledgesRes] = await Promise.all([
        campaignsApi.getById(params.id),
        apiClient.get(`/pledges/campaign/${params.id}`),
      ]);
      setCampaign(campaignRes.data);
      setPledges(pledgesRes.data || []);
    } catch (error: any) {
      console.error('Failed to load campaign data:', error);
      toast.error('Failed to load campaign analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-4">The campaign you're looking for doesn't exist.</p>
          <Link href="/dashboard/campaigns">
            <Button>Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(
    Number(campaign.amountRaised),
    Number(campaign.targetAmount)
  );

  const stats = {
    totalPledges: pledges.length,
    totalRaised: Number(campaign.amountRaised),
    targetAmount: Number(campaign.targetAmount),
    progress: progress,
    daysLeft: campaign.endDate
      ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0,
    avgPledge: pledges.length > 0 ? Number(campaign.amountRaised) / pledges.length : 0,
  };

  const statusColor = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REJECTED: 'bg-red-100 text-red-800',
  }[campaign.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/campaigns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
            <p className="text-sm text-gray-600 mt-1">Campaign Analytics & Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
            {campaign.status.replace('_', ' ')}
          </span>
          <Link href={`/campaigns/${campaign.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View Public Page
            </Button>
          </Link>
          <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
            <Button size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Raised
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalRaised)}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              of {formatCurrency(stats.targetAmount)} goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Backers
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalPledges}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Avg {formatCurrency(stats.avgPledge)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Progress
            </CardTitle>
            <Target className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.progress}%
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {stats.progress >= 100 ? 'Goal reached!' : 'of funding goal'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Days Left
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.daysLeft}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {stats.daysLeft === 0 ? 'Campaign ended' : 'until campaign ends'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">Funding Progress</span>
              <span className="text-gray-600">{stats.progress}%</span>
            </div>
            <ProgressBar progress={stats.progress} />
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{formatCurrency(stats.totalRaised)} raised</span>
              <span>{formatCurrency(stats.targetAmount)} goal</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="text-sm font-medium text-gray-900">{campaign.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-sm font-medium text-gray-900">
                {campaign.location}, {campaign.country}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Campaign Period</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(campaign.startDate).toLocaleDateString()} -{' '}
                {new Date(campaign.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm font-medium text-gray-900">
                {formatRelativeTime(new Date(campaign.createdAt))}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & Visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Current Status</p>
              <p className="text-sm font-medium text-gray-900">
                {campaign.status.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Featured</p>
              <p className="text-sm font-medium text-gray-900">
                {campaign.isFeatured ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Views</p>
              <p className="text-sm font-medium text-gray-900">
                {campaign.views || 0} views
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-sm font-medium text-gray-900">
                {formatRelativeTime(new Date(campaign.updatedAt))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Backers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Backers</CardTitle>
          <CardDescription>Latest pledges to your campaign</CardDescription>
        </CardHeader>
        <CardContent>
          {pledges.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">
              No pledges yet. Share your campaign to get backers!
            </p>
          ) : (
            <div className="space-y-4">
              {pledges.slice(0, 10).map((pledge) => (
                <div key={pledge.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                      {pledge.user?.firstName?.[0]}{pledge.user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {pledge.user?.firstName} {pledge.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(new Date(pledge.createdAt))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(Number(pledge.amount))}
                    </p>
                    <p className="text-xs text-gray-500">{pledge.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
