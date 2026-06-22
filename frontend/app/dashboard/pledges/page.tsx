'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { pledgesApi } from '@/lib/api/pledges';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils/format';
import {
  Heart,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
  PENDING: {
    icon: Clock,
    color: 'yellow',
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
  },
  COMPLETED: {
    icon: CheckCircle,
    color: 'green',
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
  FAILED: {
    icon: XCircle,
    color: 'red',
    bg: 'bg-red-100',
    text: 'text-red-700',
  },
  REFUNDED: {
    icon: XCircle,
    color: 'gray',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
  },
};

export default function MyPledgesPage() {
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadPledges();
  }, []);

  const loadPledges = async () => {
    try {
      setLoading(true);
      const response: any = await pledgesApi.getUserPledges();
      const pledgesData = response.data || [];
      setPledges(pledgesData);

      // Calculate stats
      const totalAmount = pledgesData.reduce(
        (sum: number, p: any) => sum + Number(p.amount),
        0
      );
      const completedPledges = pledgesData.filter(
        (p: any) => p.status === 'COMPLETED'
      ).length;
      setStats({
        total: pledgesData.length,
        completed: completedPledges,
        totalAmount,
      });
    } catch (error) {
      console.error('Failed to load pledges:', error);
      toast.error('Failed to load pledges');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Pledges</h1>
        <p className="mt-1 text-gray-600">Track all your campaign contributions</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Pledges
              </CardTitle>
              <Heart className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="mt-1 text-xs text-gray-600">
                {stats.completed} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Donated
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalAmount)}
              </div>
              <p className="mt-1 text-xs text-gray-600">
                across all campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Campaigns Backed
              </CardTitle>
              <FileText className="h-5 w-5 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(pledges.map((p) => p.campaignId)).size}
              </div>
              <p className="mt-1 text-xs text-gray-600">
                unique campaigns
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pledges List */}
      {!loading && pledges.length > 0 && (
        <div className="space-y-4">
          {pledges.map((pledge) => {
            const StatusIcon = statusConfig[pledge.status as keyof typeof statusConfig]?.icon || Clock;
            const statusStyle = statusConfig[pledge.status as keyof typeof statusConfig];

            return (
              <Card key={pledge.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Campaign Info */}
                    <div className="flex flex-1 items-start gap-4">
                      {/* Campaign Image */}
                      {pledge.campaign.featuredImage ? (
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={pledge.campaign.featuredImage}
                            alt={pledge.campaign.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-200">
                          <span className="text-2xl">💡</span>
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {pledge.campaign.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {formatRelativeTime(pledge.createdAt)}
                        </p>
                        {pledge.message && (
                          <p className="mt-2 text-sm italic text-gray-600">
                            "{pledge.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount & Status */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">
                          {formatCurrency(Number(pledge.amount), pledge.currency)}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          Platform fee: {formatCurrency(Number(pledge.platformFee), pledge.currency)}
                        </p>
                      </div>

                      <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle?.bg} ${statusStyle?.text}`}>
                        <StatusIcon className="h-3 w-3" />
                        {pledge.status.toLowerCase()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2 border-t pt-4">
                    <Link href={`/campaigns/${pledge.campaign.slug}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Campaign
                      </Button>
                    </Link>

                    {pledge.certificate && (
                      <Link href={`/dashboard/certificates`}>
                        <Button size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          View Certificate
                        </Button>
                      </Link>
                    )}

                    {pledge.status === 'COMPLETED' && !pledge.certificate && (
                      <div className="flex items-center gap-2 text-sm text-yellow-700">
                        <Clock className="h-4 w-4" />
                        Certificate generating...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && pledges.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No pledges yet
            </h3>
            <p className="mt-2 text-gray-600">
              Start supporting amazing campaigns from African innovators
            </p>
            <Link href="/campaigns">
              <Button className="mt-6">
                <Heart className="mr-2 h-4 w-4" />
                Browse Campaigns
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
