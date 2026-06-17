'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { campaignsApi } from '@/lib/api/campaigns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency, calculateProgress } from '@/lib/utils/format';
import { Search, Filter, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  'All',
  'Technology',
  'Agriculture',
  'Healthcare',
  'Education',
  'Environment',
  'Arts & Culture',
  'Social Impact',
  'Finance',
  'Other',
];

const COUNTRIES = [
  'All Countries',
  'Nigeria',
  'Kenya',
  'South Africa',
  'Ghana',
  'Rwanda',
  'Uganda',
  'Tanzania',
  'Ethiopia',
  'Egypt',
  'Morocco',
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'ending'>('recent');

  useEffect(() => {
    loadCampaigns();
  }, [selectedCategory, selectedCountry, searchQuery]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const params: any = {
        status: 'ACTIVE',
      };

      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      if (selectedCountry !== 'All Countries') {
        params.country = selectedCountry;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response: any = await campaignsApi.getAll(params);
      setCampaigns(response.data || []);
    } catch (error: any) {
      console.error('Failed to load campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCampaigns = [...campaigns].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'popular') {
      return (b._count?.pledges || 0) - (a._count?.pledges || 0);
    } else {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Discover African Innovation
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Support groundbreaking projects from African entrepreneurs
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Sort By */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4" />
                    Sort By
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { value: 'recent', label: 'Most Recent' },
                      { value: 'popular', label: 'Most Popular' },
                      { value: 'ending', label: 'Ending Soon' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as any)}
                        className={`w-full rounded-lg px-4 py-2 text-left text-sm transition-colors ${
                          sortBy === option.value
                            ? 'bg-primary-100 font-medium text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Filter className="h-4 w-4" />
                    Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full rounded-lg px-4 py-2 text-left text-sm transition-colors ${
                          selectedCategory === category
                            ? 'bg-primary-100 font-medium text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Country Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    Country
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {COUNTRIES.map((country) => (
                      <button
                        key={country}
                        onClick={() => setSelectedCountry(country)}
                        className={`w-full rounded-lg px-4 py-2 text-left text-sm transition-colors ${
                          selectedCountry === country
                            ? 'bg-primary-100 font-medium text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Campaigns Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {loading ? 'Loading...' : `${filteredAndSortedCampaigns.length} campaigns found`}
              </p>
              <Button asChild size="sm">
                <Link href="/dashboard/campaigns/create">
                  Start Campaign
                </Link>
              </Button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded mt-2"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}

            {/* Campaigns Grid */}
            {!loading && filteredAndSortedCampaigns.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredAndSortedCampaigns.map((campaign) => {
                  const progress = calculateProgress(
                    Number(campaign.amountRaised),
                    Number(campaign.targetAmount)
                  );

                  const daysLeft = Math.ceil(
                    (new Date(campaign.endDate).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <Link key={campaign.id} href={`/campaigns/${campaign.slug}`}>
                      <Card className="h-full transition-all hover:shadow-lg">
                        {/* Campaign Image */}
                        {campaign.featuredImage ? (
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={campaign.featuredImage}
                              alt={campaign.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-md">
                              {campaign.category}
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                            <p className="text-6xl">💡</p>
                          </div>
                        )}

                        <CardHeader>
                          <CardTitle className="line-clamp-2 text-lg">
                            {campaign.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {campaign.shortDescription}
                          </CardDescription>
                        </CardHeader>

                        <CardContent>
                          {/* Location */}
                          <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{campaign.location}, {campaign.country}</span>
                          </div>

                          {/* Progress */}
                          <div className="mb-3">
                            <ProgressBar progress={progress} />
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(Number(campaign.amountRaised), campaign.currency)}
                              </p>
                              <p className="text-gray-500">
                                of {formatCurrency(Number(campaign.targetAmount), campaign.currency)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {daysLeft > 0 ? daysLeft : 0}
                              </p>
                              <p className="text-gray-500">days left</p>
                            </div>
                          </div>

                          {/* Backers */}
                          <div className="mt-3 border-t pt-3">
                            <p className="text-xs text-gray-600">
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

            {/* Empty State */}
            {!loading && filteredAndSortedCampaigns.length === 0 && (
              <div className="rounded-lg bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No campaigns found
                </h3>
                <p className="mb-6 text-gray-600">
                  Try adjusting your filters or search query
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedCountry('All Countries');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
