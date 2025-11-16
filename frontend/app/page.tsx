'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowRight, Target, Users, Award, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { campaignsApi } from '@/lib/api/campaigns';
import { formatCurrency, calculateProgress } from '@/lib/utils/format';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function HomePage() {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCampaigns();
  }, []);

  const loadFeaturedCampaigns = async () => {
    try {
      const response: any = await campaignsApi.getAll({ status: 'ACTIVE' });
      setFeaturedCampaigns(response.data?.slice(0, 3) || []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Empowering African Innovation
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-primary-100">
              Connect with investors and mentors to turn your groundbreaking ideas into reality.
              Join a community dedicated to African entrepreneurship.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/campaigns">
                <Button size="lg" variant="secondary">
                  Browse Campaigns
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                  Start Your Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose AfriFund?</h2>
            <p className="mt-4 text-lg text-gray-600">
              The complete platform for African entrepreneurs
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Campaign Funding
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Raise funds from a global community of supporters
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-100 text-secondary-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Expert Mentorship
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Connect with experienced mentors who earn equity
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Free Certificates
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                All donors receive free contribution certificates
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-100 text-secondary-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Transparent Process
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Full transparency with verified KYC and tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Featured Campaigns</h2>
            <Link href="/campaigns">
              <Button variant="ghost">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded mt-2"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredCampaigns.map((campaign) => {
                const progress = calculateProgress(
                  Number(campaign.amountRaised),
                  Number(campaign.targetAmount),
                );
                return (
                  <Link key={campaign.id} href={`/campaigns/${campaign.slug}`}>
                    <Card className="h-full transition-shadow hover:shadow-lg">
                      {campaign.featuredImage && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={campaign.featuredImage}
                            alt={campaign.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {campaign.shortDescription}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <ProgressBar progress={progress} />
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(Number(campaign.amountRaised), campaign.currency)}
                            </span>
                            <span className="text-gray-500">
                              of {formatCurrency(Number(campaign.targetAmount), campaign.currency)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {campaign._count?.pledges || 0} backers
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
          <p className="mt-4 text-xl text-primary-100">
            Join thousands of African entrepreneurs making their dreams reality
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary">
                Create Campaign
              </Button>
            </Link>
            <Link href="/mentors">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                Become a Mentor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
