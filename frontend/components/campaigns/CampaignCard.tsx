import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency, calculateProgress } from '@/lib/utils/format';
import { MapPin, Calendar, TrendingUp } from 'lucide-react';

interface CampaignCardProps {
  campaign: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    category: string;
    location: string;
    country: string;
    targetAmount: number | string;
    amountRaised: number | string;
    currency: string;
    featuredImage?: string;
    endDate: string;
    _count?: {
      pledges: number;
    };
  };
  showStats?: boolean;
}

export function CampaignCard({ campaign, showStats = true }: CampaignCardProps) {
  const progress = calculateProgress(
    Number(campaign.amountRaised),
    Number(campaign.targetAmount)
  );

  const daysLeft = Math.ceil(
    (new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Link href={`/campaigns/${campaign.slug}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
        {/* Campaign Image */}
        {campaign.featuredImage ? (
          <div className="relative h-48 overflow-hidden rounded-t-lg">
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
          <div className="flex h-48 items-center justify-center rounded-t-lg bg-gradient-to-br from-primary-100 to-primary-200">
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
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{campaign.location}, {campaign.country}</span>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <ProgressBar progress={progress} />
          </div>

          {/* Funding Stats */}
          {showStats && (
            <>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(Number(campaign.amountRaised), campaign.currency)}
                  </p>
                  <p className="text-xs text-gray-500">
                    of {formatCurrency(Number(campaign.targetAmount), campaign.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {daysLeft > 0 ? daysLeft : 0}
                  </p>
                  <p className="text-xs text-gray-500">days left</p>
                </div>
              </div>

              {/* Backers */}
              <div className="mt-3 border-t pt-3">
                <p className="flex items-center gap-1 text-xs text-gray-600">
                  <TrendingUp className="h-3 w-3" />
                  {campaign._count?.pledges || 0} backers
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
