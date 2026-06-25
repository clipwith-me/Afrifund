'use client';

import { useEffect, useState } from 'react';
import { activityApi, ActivityStats as Stats } from '@/lib/api/activity';
import { Rocket, Heart, Users, TrendingUp } from 'lucide-react';

export function ActivityStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await activityApi.getStats();
      setStats(response.data);
    } catch (error) {
      // Silent failure
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
            <div className="h-8 w-8 bg-gray-200 rounded-full mb-2" />
            <div className="h-6 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: Rocket,
      value: stats.recentCampaigns,
      label: 'Active Campaigns',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: Heart,
      value: stats.recentPledges,
      label: 'Recent Pledges',
      color: 'text-red-600 bg-red-50',
    },
    {
      icon: Users,
      value: stats.recentUsers,
      label: 'New Members',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      icon: TrendingUp,
      value: stats.totalActivities,
      label: 'Total Activities',
      color: 'text-green-600 bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-full mb-3 ${item.color}`}>
            <item.icon className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{item.value}</p>
          <p className="text-xs text-gray-600">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
