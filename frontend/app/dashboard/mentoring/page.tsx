'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mentorsApi } from '@/lib/api/mentors';
import { useAuthStore } from '@/lib/stores/authStore';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  Edit,
  Award,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MentoringDashboardPage() {
  const { user } = useAuthStore();
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    loadMentoringData();
  }, []);

  const loadMentoringData = async () => {
    try {
      setLoading(true);

      // Try to get mentor profile
      const mentors: any = await mentorsApi.getAll();
      const myProfile = mentors.data?.find((m: any) => m.userId === user?.id);

      if (myProfile) {
        setHasProfile(true);
        setMentorProfile(myProfile);

        // Load stats and ledger
        const [statsRes, ledgerRes] = await Promise.all([
          mentorsApi.getStats(myProfile.id).catch(() => ({ data: null })),
          mentorsApi.getLedger(myProfile.id).catch(() => ({ data: [] })),
        ]);

        setStats(statsRes.data);
        setLedger(ledgerRes.data || []);
      }
    } catch (error) {
      console.error('Failed to load mentoring data:', error);
      toast.error('Failed to load mentoring data. Please refresh the page.');
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

  // Show create profile prompt if no profile exists
  if (!hasProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentoring Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your mentorship activities</p>
        </div>

        <Card className="border-primary-200 bg-primary-50">
          <CardContent className="p-8 text-center">
            <Award className="mx-auto h-16 w-16 text-primary-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Become a Mentor
            </h2>
            <p className="text-gray-700 mb-6 max-w-md mx-auto">
              Share your expertise with African innovators and earn equity in their success.
              Create your mentor profile to get started.
            </p>
            <Link href="/mentors">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Mentor Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Share Expertise</h3>
              <p className="text-sm text-gray-600">
                Guide entrepreneurs with your knowledge and experience
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Earn Equity</h3>
              <p className="text-sm text-gray-600">
                Receive equity stakes in campaigns you support
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Build Network</h3>
              <p className="text-sm text-gray-600">
                Connect with innovative projects across Africa
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentoring Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your mentorship activities and track your impact
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/mentors/${mentorProfile.id}`}>
            <Button variant="outline" size="sm">
              View Public Profile
            </Button>
          </Link>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Sessions
            </CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalSessions || 0}
            </div>
            <p className="mt-1 text-xs text-gray-600">Mentoring sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Hours Mentored
            </CardTitle>
            <Clock className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalHours || 0}
            </div>
            <p className="mt-1 text-xs text-gray-600">Total hours invested</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Campaigns
            </CardTitle>
            <Briefcase className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.campaignsMentored || 0}
            </div>
            <p className="mt-1 text-xs text-gray-600">Projects supported</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Equity
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalEquity || 0}%
            </div>
            <p className="mt-1 text-xs text-gray-600">Across all campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Mentor Profile</CardTitle>
          <CardDescription>Public profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">Title</p>
              <p className="text-sm font-medium text-gray-900">{mentorProfile.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Experience</p>
              <p className="text-sm font-medium text-gray-900">
                {mentorProfile.yearsExperience} years
              </p>
            </div>
            {mentorProfile.company && (
              <div>
                <p className="text-xs text-gray-500">Company</p>
                <p className="text-sm font-medium text-gray-900">{mentorProfile.company}</p>
              </div>
            )}
            {mentorProfile.hourlyRate && (
              <div>
                <p className="text-xs text-gray-500">Hourly Rate</p>
                <p className="text-sm font-medium text-gray-900">
                  ${mentorProfile.hourlyRate}/hour
                </p>
              </div>
            )}
          </div>

          {mentorProfile.expertise && Array.isArray(mentorProfile.expertise) && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Areas of Expertise</p>
              <div className="flex flex-wrap gap-2">
                {mentorProfile.expertise.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equity Ledger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Equity Ledger
          </CardTitle>
          <CardDescription>Track your equity holdings across campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {ledger.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">
              No equity recorded yet. Start mentoring campaigns to earn equity!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Campaign
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sessions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hours
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Equity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {entry.campaign?.title || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.campaign?.category || 'N/A'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{entry.sessionsCount || 0}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{entry.totalHours || 0}h</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-primary-600">
                          {entry.equityPercentage || 0}%
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="border-primary-200 bg-primary-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary-900 mb-1">
                Ready to mentor more campaigns?
              </h3>
              <p className="text-sm text-primary-700">
                Browse active campaigns and offer your expertise
              </p>
            </div>
            <Link href="/campaigns">
              <Button>Browse Campaigns</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
