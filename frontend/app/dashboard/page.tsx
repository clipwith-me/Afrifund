'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import apiClient from '@/lib/api/client';
import { formatCurrency, formatRelativeTime, calculateProgress } from '@/lib/utils/format';
import {
  TrendingUp,
  Heart,
  Award,
  Briefcase,
  ArrowRight,
  Plus,
  AlertCircle,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response: any = await apiClient.get('/users/dashboard');
      setDashboardData(response.data);
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
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { campaigns = [], pledges = [], certificates = [] } = dashboardData || {};

  // Calculate stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c: any) => c.status === 'ACTIVE').length;
  const totalPledges = pledges.length;
  const totalDonated = pledges.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const totalCertificates = certificates.length;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h2>
        <p className="mt-1 text-gray-600">
          Here's what's happening with your account today
        </p>
      </div>

      {/* KYC Alert */}
      {!user?.isVerified && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-start gap-4 p-6">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Account Verification Required</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Complete your KYC verification to create campaigns and unlock all features
              </p>
              <Link href="/dashboard/kyc">
                <Button size="sm" variant="outline" className="mt-3 border-yellow-600 text-yellow-700">
                  Verify Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              My Campaigns
            </CardTitle>
            <Briefcase className="h-5 w-5 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalCampaigns}</div>
            <p className="mt-1 text-xs text-gray-600">
              {activeCampaigns} active
            </p>
          </CardContent>
        </Card>

        {/* Pledges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              My Pledges
            </CardTitle>
            <Heart className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalPledges}</div>
            <p className="mt-1 text-xs text-gray-600">
              campaigns backed
            </p>
          </CardContent>
        </Card>

        {/* Total Donated */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Donated
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalDonated)}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              across all campaigns
            </p>
          </CardContent>
        </Card>

        {/* Certificates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Certificates
            </CardTitle>
            <Award className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalCertificates}</div>
            <p className="mt-1 text-xs text-gray-600">
              earned
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* My Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Campaigns</CardTitle>
              <CardDescription>Your recent fundraising campaigns</CardDescription>
            </div>
            <Link href="/dashboard/campaigns">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.slice(0, 3).map((campaign: any) => {
                  const progress = calculateProgress(
                    Number(campaign.amountRaised),
                    Number(campaign.targetAmount)
                  );
                  return (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.slug}`}
                      className="block"
                    >
                      <div className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {campaign.title}
                            </h4>
                            <p className="mt-1 text-sm text-gray-600">
                              {campaign.status.replace('_', ' ')}
                            </p>
                          </div>
                          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                            {campaign.category}
                          </span>
                        </div>
                        <div className="mt-3">
                          <ProgressBar progress={progress} />
                          <div className="mt-2 flex justify-between text-sm">
                            <span className="font-medium text-gray-900">
                              {formatCurrency(Number(campaign.amountRaised))}
                            </span>
                            <span className="text-gray-600">
                              {formatCurrency(Number(campaign.targetAmount))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-600">No campaigns yet</p>
                {user?.isVerified && (
                  <Link href="/dashboard/campaigns/create">
                    <Button size="sm" className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Campaign
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Pledges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Pledges</CardTitle>
              <CardDescription>Your recent contributions</CardDescription>
            </div>
            <Link href="/dashboard/pledges">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pledges.length > 0 ? (
              <div className="space-y-4">
                {pledges.slice(0, 3).map((pledge: any) => (
                  <Link
                    key={pledge.id}
                    href={`/campaigns/${pledge.campaign.slug}`}
                    className="block"
                  >
                    <div className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {pledge.campaign.title}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {formatRelativeTime(pledge.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary-600">
                            {formatCurrency(Number(pledge.amount), pledge.currency)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {pledge.status.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Heart className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-600">No pledges yet</p>
                <Link href="/campaigns">
                  <Button size="sm" variant="outline" className="mt-4">
                    Browse Campaigns
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Certificates */}
      {certificates.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Certificates</CardTitle>
              <CardDescription>Your contribution certificates</CardDescription>
            </div>
            <Link href="/dashboard/certificates">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {certificates.slice(0, 3).map((cert: any) => (
                <div
                  key={cert.id}
                  className="rounded-lg border p-4 text-center"
                >
                  <Award className="mx-auto h-12 w-12 text-yellow-500" />
                  <p className="mt-2 font-semibold text-gray-900">
                    {cert.contributionLevel}
                  </p>
                  <p className="text-sm text-gray-600">{cert.campaignTitle}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatCurrency(Number(cert.amount), cert.currency)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
