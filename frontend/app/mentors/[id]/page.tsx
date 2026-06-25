'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mentorsApi } from '@/lib/api/mentors';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Award,
  DollarSign,
  Clock,
  MapPin,
  Linkedin,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

interface MentorProfilePageProps {
  params: {
    id: string;
  };
}

export default function MentorProfilePage({ params }: MentorProfilePageProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mentor, setMentor] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    loadMentorData();
  }, [params.id]);

  const loadMentorData = async () => {
    try {
      setLoading(true);
      const [mentorRes, statsRes] = await Promise.all([
        mentorsApi.getById(params.id),
        mentorsApi.getStats(params.id).catch(() => ({ data: null })),
      ]);
      setMentor(mentorRes.data);
      setStats(statsRes.data);
    } catch (error: any) {
      console.error('Failed to load mentor:', error);
      toast.error('Failed to load mentor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a session');
      router.push('/auth/login');
      return;
    }
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Mentor not found</p>
          <Link href="/mentors">
            <Button className="mt-4">Browse All Mentors</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/mentors">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mentors
          </Button>
        </Link>
      </div>

      {/* Mentor Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-600 text-3xl font-bold text-white">
                {mentor.user?.firstName?.[0]}{mentor.user?.lastName?.[0]}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">
                {mentor.user?.firstName} {mentor.user?.lastName}
              </h1>
              <p className="text-xl text-primary-600 mt-1">{mentor.title}</p>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                {mentor.company && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {mentor.company}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  {mentor.yearsExperience} years experience
                </div>
                {mentor.hourlyRate && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${mentor.hourlyRate}/hour
                  </div>
                )}
              </div>

              {mentor.linkedinUrl && (
                <div className="mt-3">
                  <a
                    href={mentor.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    View LinkedIn Profile
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button onClick={handleBookSession} size="lg">
                <Calendar className="mr-2 h-4 w-4" />
                Book Session
              </Button>
              {mentor.isActive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                  Not Available
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expertise */}
      <Card>
        <CardHeader>
          <CardTitle>Areas of Expertise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(mentor.expertise) && mentor.expertise.length > 0 ? (
              mentor.expertise.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No expertise listed</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-gray-700">{mentor.bio}</p>
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalSessions || 0}
                  </p>
                  <p className="text-sm text-gray-600">Sessions Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalHours || 0}
                  </p>
                  <p className="text-sm text-gray-600">Hours Mentored</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.campaignsMentored || 0}
                  </p>
                  <p className="text-sm text-gray-600">Campaigns Supported</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Equity Terms */}
      <Card className="border-primary-200 bg-primary-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-900">
            <Star className="h-5 w-5" />
            Equity-Based Mentorship
          </CardTitle>
          <CardDescription className="text-primary-700">
            How the equity model works
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-primary-900">
            <p>
              <strong>💡 Win-Win Partnership:</strong> Mentors receive equity in your
              campaign based on hours invested, aligning their success with yours.
            </p>
            <p>
              <strong>📊 Transparent Tracking:</strong> All mentoring sessions are logged
              and tracked, with equity automatically calculated based on agreed terms.
            </p>
            <p>
              <strong>🤝 Long-Term Support:</strong> This model ensures mentors are invested
              in your long-term success, not just one-off consultations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Book a Session</CardTitle>
              <CardDescription>
                Connect with {mentor.user?.firstName} for mentorship
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
                  <p className="font-medium mb-2">📧 Contact Information</p>
                  <p>
                    To book a session, please reach out to the mentor directly at:
                  </p>
                  <p className="mt-2 font-medium">{mentor.user?.email}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 text-xs text-gray-700">
                  <p className="font-medium mb-1">Note:</p>
                  <p>
                    Direct booking functionality is coming soon. For now, please contact
                    mentors directly to schedule sessions.
                  </p>
                </div>

                <Button
                  onClick={() => setShowBookingModal(false)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
