'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { campaignsApi } from '@/lib/api/campaigns';
import { pledgesApi } from '@/lib/api/pledges';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DonateModal } from '@/components/campaigns/DonateModal';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  calculateProgress
} from '@/lib/utils/format';
import {
  Calendar,
  MapPin,
  Target,
  Users,
  Award,
  Heart,
  Share2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  useEffect(() => {
    if (params.slug) {
      loadCampaign();
    }
  }, [params.slug]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const response: any = await campaignsApi.getBySlug(params.slug as string);
      setCampaign(response.data);
    } catch (error: any) {
      console.error('Failed to load campaign:', error);
      toast.error('Campaign not found');
      router.push('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleDonateClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to donate');
      router.push('/auth/login');
      return;
    }
    setDonateModalOpen(true);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: campaign.shortDescription,
          url,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const progress = calculateProgress(
    Number(campaign.amountRaised),
    Number(campaign.targetAmount)
  );

  const daysLeft = Math.ceil(
    (new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const isActive = campaign.status === 'ACTIVE' && daysLeft > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      {campaign.featuredImage && (
        <div className="relative h-96 w-full overflow-hidden bg-gray-900">
          <Image
            src={campaign.featuredImage}
            alt={campaign.title}
            fill
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Campaign Header */}
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                  {campaign.category}
                </span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                  isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {campaign.status.replace('_', ' ')}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900">{campaign.title}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{campaign.location}, {campaign.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatRelativeTime(campaign.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Campaign Creator */}
            <Card className="mb-6">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-600">
                  {campaign.creator.firstName[0]}{campaign.creator.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {campaign.creator.firstName} {campaign.creator.lastName}
                  </p>
                  <p className="text-sm text-gray-600">Campaign Creator</p>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Description */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>About This Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{campaign.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Video */}
            {campaign.videoUrl && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Campaign Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full overflow-hidden rounded-lg">
                    <iframe
                      src={campaign.videoUrl}
                      className="h-full w-full"
                      allowFullScreen
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Campaign Media Gallery */}
            {campaign.media && campaign.media.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Campaign Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {campaign.media.map((item: any) => (
                      <div
                        key={item.id}
                        className="relative aspect-square overflow-hidden rounded-lg"
                      >
                        <Image
                          src={item.url}
                          alt={item.caption || 'Campaign image'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mentors */}
            {campaign.mentorSessions && campaign.mentorSessions.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Supporting Mentors</CardTitle>
                  <CardDescription>
                    Experienced professionals helping this campaign succeed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaign.mentorSessions.map((session: any) => (
                      <div key={session.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-100 text-lg font-bold text-secondary-600">
                          {session.mentor.user.firstName[0]}{session.mentor.user.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {session.mentor.user.firstName} {session.mentor.user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {Number(session.hoursSpent)} hours • {session.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Backers */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Backers</CardTitle>
                <CardDescription>
                  {campaign.pledges?.length || 0} people have backed this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                {campaign.pledges && campaign.pledges.length > 0 ? (
                  <div className="space-y-4">
                    {campaign.pledges.map((pledge: any) => (
                      <div key={pledge.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                            {pledge.backer.firstName[0]}{pledge.backer.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {pledge.backer.firstName} {pledge.backer.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatRelativeTime(pledge.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary-600">
                            {formatCurrency(Number(pledge.amount), pledge.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No backers yet. Be the first!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardContent className="p-6">
                  {/* Funding Progress */}
                  <div className="mb-6">
                    <div className="mb-2 text-3xl font-bold text-gray-900">
                      {formatCurrency(Number(campaign.amountRaised), campaign.currency)}
                    </div>
                    <p className="mb-4 text-sm text-gray-600">
                      of {formatCurrency(Number(campaign.targetAmount), campaign.currency)} goal
                    </p>
                    <ProgressBar progress={progress} />
                  </div>

                  {/* Campaign Stats */}
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <Users className="h-5 w-5 text-primary-600" />
                        {campaign.pledges?.length || 0}
                      </div>
                      <p className="text-sm text-gray-600">Backers</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <Clock className="h-5 w-5 text-primary-600" />
                        {daysLeft > 0 ? daysLeft : 0}
                      </div>
                      <p className="text-sm text-gray-600">Days Left</p>
                    </div>
                  </div>

                  {/* Donate Button */}
                  {isActive ? (
                    <Button
                      onClick={handleDonateClick}
                      className="mb-4 w-full"
                      size="lg"
                    >
                      <Heart className="mr-2 h-5 w-5" />
                      Back This Campaign
                    </Button>
                  ) : (
                    <div className="mb-4 rounded-lg bg-gray-100 p-4 text-center">
                      <p className="text-sm font-medium text-gray-700">
                        {campaign.status === 'FUNDED'
                          ? '🎉 Campaign Fully Funded!'
                          : 'Campaign Ended'}
                      </p>
                    </div>
                  )}

                  {/* Share Button */}
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Campaign
                  </Button>

                  {/* Campaign Timeline */}
                  <div className="mt-6 space-y-3 border-t pt-6">
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Started</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(campaign.startDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="mt-0.5 h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Ends</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(campaign.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="mt-0.5 h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Platform Fee</p>
                        <p className="text-sm text-gray-600">3% on successful pledges</p>
                      </div>
                    </div>
                  </div>

                  {/* Free Certificate Notice */}
                  <div className="mt-6 rounded-lg bg-primary-50 p-4">
                    <p className="text-sm font-medium text-primary-900">
                      🎓 Free Certificate
                    </p>
                    <p className="mt-1 text-sm text-primary-700">
                      All backers receive a free digital certificate automatically!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Creator is viewing their own campaign */}
              {user?.id === campaign.creatorId && (
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <p className="mb-3 text-sm font-medium text-gray-900">
                      Campaign Management
                    </p>
                    <div className="space-y-2">
                      <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Edit Campaign
                        </Button>
                      </Link>
                      <Link href={`/dashboard/campaigns/${campaign.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Analytics
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donate Modal */}
      <DonateModal
        open={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        campaign={campaign}
        onSuccess={() => {
          setDonateModalOpen(false);
          loadCampaign(); // Reload to show updated stats
        }}
      />
    </div>
  );
}
