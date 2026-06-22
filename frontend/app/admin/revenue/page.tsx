'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/lib/api/admin';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Download,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRevenuePage() {
  const [revenueData, setRevenueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async (customRange?: { startDate?: string; endDate?: string }) => {
    try {
      setLoading(true);
      const response: any = await adminApi.getRevenue(customRange || {});
      setRevenueData(response.data);
    } catch (error) {
      console.error('Failed to load revenue data:', error);
      toast.error('Failed to load revenue analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDateRange = () => {
    if (dateRange.startDate && dateRange.endDate) {
      loadRevenueData(dateRange);
    } else {
      toast.error('Please select both start and end dates');
    }
  };

  const handleResetDateRange = () => {
    setDateRange({ startDate: '', endDate: '' });
    loadRevenueData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">
            Platform revenue and transaction analytics
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Date Range Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <Button onClick={handleApplyDateRange} size="sm">
              Apply Filter
            </Button>
            <Button onClick={handleResetDateRange} variant="outline" size="sm">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(revenueData?.totalRevenue || 0)}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Platform fee (3% of pledges)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Pledges
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(revenueData?.totalPledges || 0)}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {revenueData?.pledgeCount || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Platform Fee
            </CardTitle>
            <Percent className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">3.0%</div>
            <p className="mt-1 text-xs text-gray-600">
              Standard platform fee
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Transaction
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(revenueData?.avgTransaction || 0)}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Average pledge amount
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Category */}
      {revenueData?.byCategory && revenueData.byCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Platform revenue breakdown by campaign category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.byCategory.map((category: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{category.category}</p>
                    <p className="text-xs text-gray-500">
                      {category.pledgeCount} pledges
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(category.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">
                      from {formatCurrency(category.totalPledges)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Revenue Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Revenue Entries</CardTitle>
          <CardDescription>Latest platform fee collections</CardDescription>
        </CardHeader>
        <CardContent>
          {!revenueData?.recentTransactions || revenueData.recentTransactions.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Campaign
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pledge Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fee (3%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.recentTransactions.map((transaction: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600">
                          {formatRelativeTime(new Date(transaction.createdAt))}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.campaign?.title || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.campaign?.category || 'N/A'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(transaction.fee)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      {revenueData?.monthlyTrend && revenueData.monthlyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Revenue collection over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.monthlyTrend.map((month: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24">
                    <p className="text-sm font-medium text-gray-900">{month.month}</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-green-600"
                        style={{
                          width: `${(month.revenue / Math.max(...revenueData.monthlyTrend.map((m: any) => m.revenue))) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-32 text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(month.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
