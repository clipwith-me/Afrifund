'use client';

import { useEffect, useState } from 'react';
import { activityApi, Activity } from '@/lib/api/activity';
import { formatRelativeTime, formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';
import {
  Rocket,
  Heart,
  TrendingUp,
  UserPlus,
  CheckCircle,
  Award,
  Users,
  MessageSquare,
} from 'lucide-react';

interface ActivityFeedProps {
  limit?: number;
  campaignId?: string;
  userId?: string;
  showHeader?: boolean;
  className?: string;
}

export function ActivityFeed({
  limit = 10,
  campaignId,
  userId,
  showHeader = true,
  className = '',
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [campaignId, userId, limit]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      let response;

      if (campaignId) {
        response = await activityApi.getCampaignActivities(campaignId, limit);
      } else if (userId) {
        response = await activityApi.getUserActivities(userId, limit);
      } else {
        response = await activityApi.getAll(limit);
      }

      setActivities(response.data || []);
    } catch (error) {
      // Silent failure with graceful fallback
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CAMPAIGN_LAUNCHED':
        return <Rocket className="h-5 w-5 text-blue-600" />;
      case 'PLEDGE_MADE':
        return <Heart className="h-5 w-5 text-red-600" />;
      case 'CAMPAIGN_FUNDED':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'USER_JOINED':
        return <UserPlus className="h-5 w-5 text-purple-600" />;
      case 'KYC_VERIFIED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'CERTIFICATE_EARNED':
        return <Award className="h-5 w-5 text-yellow-600" />;
      case 'MENTOR_JOINED_PLATFORM':
      case 'MENTOR_SESSION_STARTED':
        return <Users className="h-5 w-5 text-indigo-600" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'CAMPAIGN_LAUNCHED':
        return 'bg-blue-50 border-blue-200';
      case 'PLEDGE_MADE':
        return 'bg-red-50 border-red-200';
      case 'CAMPAIGN_FUNDED':
        return 'bg-green-50 border-green-200';
      case 'USER_JOINED':
        return 'bg-purple-50 border-purple-200';
      case 'KYC_VERIFIED':
        return 'bg-green-50 border-green-200';
      case 'CERTIFICATE_EARNED':
        return 'bg-yellow-50 border-yellow-200';
      case 'MENTOR_JOINED_PLATFORM':
      case 'MENTOR_SESSION_STARTED':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-8 text-center ${className}`}>
        <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p className="text-sm text-gray-600">No recent activity to display</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <span className="text-sm text-gray-500">{activities.length} activities</span>
        </div>
      )}

      {activities.map((activity) => (
        <div
          key={activity.id}
          className={`rounded-lg border p-4 transition-all hover:shadow-md ${getActivityColor(activity.type)}`}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border-2">
                {getActivityIcon(activity.type)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* User info */}
              {activity.user && (
                <div className="flex items-center gap-2 mb-1">
                  {activity.user.avatar ? (
                    <img
                      src={activity.user.avatar}
                      alt={`${activity.user.firstName} ${activity.user.lastName}`}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                      {activity.user.firstName[0]}
                      {activity.user.lastName[0]}
                    </div>
                  )}
                  <span className="font-semibold text-gray-900 text-sm">
                    {activity.user.firstName} {activity.user.lastName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {activity.user.role.toLowerCase()}
                  </span>
                </div>
              )}

              {/* Activity message */}
              <p className="text-sm text-gray-800 mb-2">{activity.message}</p>

              {/* Campaign link if available */}
              {activity.campaign && (
                <Link
                  href={`/campaigns/${activity.campaign.slug}`}
                  className="inline-flex items-center text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Campaign →
                </Link>
              )}

              {/* Amount if available */}
              {activity.amount && activity.currency && (
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-900 border">
                    {formatCurrency(activity.amount, activity.currency)}
                  </span>
                </div>
              )}

              {/* Timestamp */}
              <p className="text-xs text-gray-500 mt-2">
                {formatRelativeTime(new Date(activity.createdAt))}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
