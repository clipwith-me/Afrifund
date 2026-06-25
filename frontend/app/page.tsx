'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
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
      // Silent failure on homepage - graceful fallback to empty state
      setFeaturedCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section - Kickstarter Style */}
      <section className="relative overflow-hidden bg-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2400&q=80"
            alt="African entrepreneurs collaborating"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            {/* Featured Logo */}
            <div className="mb-8 flex justify-center">
              <div className="inline-block rounded-2xl bg-white/10 backdrop-blur-sm px-8 py-6 shadow-2xl">
                <Logo
                  variant="full"
                  iconClassName="h-16 w-16 sm:h-20 sm:w-20"
                  textClassName="text-3xl sm:text-4xl text-white"
                />
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Bring creative projects to life
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-100 sm:text-2xl">
              Empowering African innovators to turn groundbreaking ideas into reality.
              Join a community of creators, backers, and mentors building the future.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/campaigns">
                <Button size="lg" className="w-full bg-primary-600 px-8 py-6 text-lg hover:bg-primary-700 sm:w-auto">
                  Explore projects
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-2 border-white bg-transparent px-8 py-6 text-lg text-white hover:bg-white hover:text-gray-900 sm:w-auto"
                >
                  Start a campaign
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Section - Kickstarter Style */}
      <section className="border-b border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Explore by category</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              { name: 'Technology', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80' },
              { name: 'Agriculture', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=400&q=80' },
              { name: 'Education', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80' },
              { name: 'Healthcare', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80' },
              { name: 'Clean Energy', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=400&q=80' },
              { name: 'Creative', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80' },
            ].map((category) => (
              <Link key={category.name} href={`/campaigns?category=${category.name.toLowerCase()}`}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-square overflow-hidden rounded-lg">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <h3 className="text-sm font-semibold">{category.name}</h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How AfriFund works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to bring your project to life
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="relative">
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=800&q=80"
                  alt="Share your idea"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-6">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                    1
                  </div>
                  <h3 className="ml-3 text-xl font-bold text-gray-900">Share your idea</h3>
                </div>
                <p className="mt-3 text-gray-600">
                  Create a compelling campaign with your story, goals, and vision. Add images and videos to bring it to life.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80"
                  alt="Get funded"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-6">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                    2
                  </div>
                  <h3 className="ml-3 text-xl font-bold text-gray-900">Get funded</h3>
                </div>
                <p className="mt-3 text-gray-600">
                  Reach backers across Africa and beyond. Connect with mentors who provide expertise and earn equity.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
                  alt="Bring it to life"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-6">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                    3
                  </div>
                  <h3 className="ml-3 text-xl font-bold text-gray-900">Bring it to life</h3>
                </div>
                <p className="mt-3 text-gray-600">
                  Use the funds and mentorship to execute your vision. Update your backers and celebrate success together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured projects</h2>
              <p className="mt-2 text-gray-600">Discover innovative ideas from African creators</p>
            </div>
            <Link href="/campaigns">
              <Button variant="ghost" className="group">
                See more
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-lg"></div>
                  <div className="mt-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredCampaigns.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredCampaigns.map((campaign) => {
                const progress = calculateProgress(
                  Number(campaign.amountRaised),
                  Number(campaign.targetAmount),
                );
                return (
                  <Link key={campaign.id} href={`/campaigns/${campaign.slug}`}>
                    <div className="group cursor-pointer">
                      <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={campaign.featuredImage || 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80'}
                          alt={campaign.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-4">
                        <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                          {campaign.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {campaign.shortDescription}
                        </p>
                        <div className="mt-4 space-y-2">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full bg-primary-600 transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="text-lg font-bold text-gray-900">
                                {formatCurrency(Number(campaign.amountRaised), campaign.currency)}
                              </span>
                              <span className="ml-1 text-sm text-gray-500">
                                pledged
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              {progress}%
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="font-semibold">{campaign._count?.pledges || 0} backers</span>
                            <span>•</span>
                            <span>{Math.ceil(Math.random() * 30)} days left</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-12 text-center">
              <p className="text-gray-500">No featured campaigns yet. Be the first to create one!</p>
              <Link href="/auth/register">
                <Button className="mt-4">Start a campaign</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Success Stories */}
      <section className="border-t border-gray-200 bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Success stories from Africa</h2>
            <p className="mt-4 text-lg text-gray-600">
              Real entrepreneurs building real solutions
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-lg bg-white shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=800&q=80"
                alt="Success story"
                className="h-64 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">
                  "AfriFund helped us raise $50K in 30 days"
                </h3>
                <p className="mt-3 text-gray-600">
                  With the support of our backers and mentors, we were able to launch our AgriTech solution across 5 countries.
                </p>
                <p className="mt-4 text-sm font-semibold text-primary-600">
                  — Amara Chen, FarmConnect Kenya
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
                alt="Success story"
                className="h-64 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">
                  "The mentorship was invaluable"
                </h3>
                <p className="mt-3 text-gray-600">
                  Beyond funding, connecting with experienced mentors transformed how we approach our EdTech startup.
                </p>
                <p className="mt-4 text-sm font-semibold text-primary-600">
                  — David Okonkwo, LearnHub Nigeria
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-primary-600 py-20">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=2400&q=80"
            alt="Background"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Together, we create the future
          </h2>
          <p className="mt-6 text-xl text-primary-100">
            Join thousands of African entrepreneurs and backers making dreams reality.
            Start your campaign today or support an innovative project.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="w-full bg-white px-8 py-6 text-lg text-primary-600 hover:bg-gray-100 sm:w-auto"
              >
                Start your campaign
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-white bg-transparent px-8 py-6 text-lg text-white hover:bg-white/10 sm:w-auto"
              >
                Explore projects
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
