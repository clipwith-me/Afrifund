'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { adminApi } from '@/lib/api/admin';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format';
import {
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getActivity(),
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalUsers || 0}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {stats?.verifiedUsers || 0} verified
            </p>
          </CardContent>
        </Card>

        {/* Total Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Campaigns
            </CardTitle>
            <Briefcase className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalCampaigns || 0}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {stats?.activeCampaigns || 0} active
            </p>
          </CardContent>
        </Card>

        {/* Total Pledges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Pledges
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalPledges || 0}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {formatCurrency(stats?.totalPledgeAmount || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Platform Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Platform Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats?.platformRevenue || 0)}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              3% of {formatCurrency(stats?.totalPledgeAmount || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending KYC */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending KYC Approvals
            </CardTitle>
            <CardDescription>Users waiting for verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {stats?.pendingKyc || 0}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {stats?.approvedKyc || 0} approved, {stats?.rejectedKyc || 0} rejected
            </p>
          </CardContent>
        </Card>

        {/* Pending Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Pending Campaigns
            </CardTitle>
            <CardDescription>Campaigns awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats?.pendingCampaigns || 0}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {stats?.approvedCampaigns || 0} approved, {stats?.rejectedCampaigns || 0} rejected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest platform events</CardDescription>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {activity.slice(0, 10).map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-3 border-b pb-3 last:border-b-0">
                  <div className="flex-shrink-0 mt-1">
                    {item.type === 'USER_REGISTERED' && (
                      <Users className="h-4 w-4 text-blue-600" />
                    )}
                    {item.type === 'CAMPAIGN_CREATED' && (
                      <Briefcase className="h-4 w-4 text-green-600" />
                    )}
                    {item.type === 'PLEDGE_CREATED' && (
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                    )}
                    {item.type === 'KYC_APPROVED' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {item.type === 'KYC_REJECTED' && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRelativeTime(new Date(item.createdAt))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.campaignSuccessRate || 0}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Campaigns that reached their goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Campaign Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats?.avgCampaignAmount || 0)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Average funding goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Pledge Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats?.avgPledgeAmount || 0)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Average donation per backer
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
