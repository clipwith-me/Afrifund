'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { pledgesApi } from '@/lib/api/pledges';
import { formatCurrency } from '@/lib/utils/format';
import { toast } from 'sonner';
import { X, CreditCard, Heart, Info } from 'lucide-react';

const donateSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least $1'),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  paymentProvider: z.enum(['FLUTTERWAVE', 'PAYSTACK', 'MPESA', 'MOCK']),
});

type DonateFormData = z.infer<typeof donateSchema>;

interface DonateModalProps {
  open: boolean;
  onClose: () => void;
  campaign: any;
  onSuccess?: () => void;
}

export function DonateModal({ open, onClose, campaign, onSuccess }: DonateModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DonateFormData>({
    resolver: zodResolver(donateSchema),
    defaultValues: {
      paymentProvider: 'MOCK',
      isAnonymous: false,
    },
  });

  const amount = watch('amount');
  const platformFee = amount ? (amount * 3) / 100 : 0;
  const totalAmount = amount ? amount : 0;

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  const handleQuickAmount = (value: number) => {
    setSelectedAmount(value);
    setValue('amount', value);
  };

  const getContributionLevel = (amt: number) => {
    if (amt >= 10000) return '💎 Platinum';
    if (amt >= 5000) return '🥇 Gold';
    if (amt >= 1000) return '🥈 Silver';
    return '🥉 Bronze';
  };

  const onSubmit = async (data: DonateFormData) => {
    setLoading(true);
    try {
      const response: any = await pledgesApi.create({
        campaignId: campaign.id,
        amount: data.amount,
        currency: campaign.currency || 'USD',
        message: data.message,
        isAnonymous: data.isAnonymous,
        paymentProvider: data.paymentProvider,
      });

      toast.success('Redirecting to payment...');

      // Redirect to payment URL
      if (response.data.payment?.paymentUrl) {
        window.location.href = response.data.payment.paymentUrl;
      } else {
        toast.success('Donation created successfully!');
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6" />
              <h2 className="text-xl font-bold">Back This Campaign</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="mt-2 text-sm text-primary-100">
            Support: {campaign.title}
          </p>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Quick Amount Selection */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Select Amount
              </label>
              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAmount(amt)}
                    className={`rounded-lg border-2 px-4 py-3 text-center font-semibold transition-all ${
                      selectedAmount === amt
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {formatCurrency(amt, campaign.currency || 'USD')}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <Input
                label="Or Enter Custom Amount"
                type="number"
                placeholder="Enter amount"
                error={errors.amount?.message}
                {...register('amount', { valueAsNumber: true })}
              />
            </div>

            {/* Message */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Message to Creator (Optional)
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Share your thoughts or encouragement..."
                {...register('message')}
              />
            </div>

            {/* Payment Provider */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-300 p-4 transition-all hover:border-primary-300">
                  <input
                    type="radio"
                    value="FLUTTERWAVE"
                    {...register('paymentProvider')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Flutterwave</p>
                    <p className="text-xs text-gray-500">Cards, Mobile Money</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-300 p-4 transition-all hover:border-primary-300">
                  <input
                    type="radio"
                    value="PAYSTACK"
                    {...register('paymentProvider')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Paystack</p>
                    <p className="text-xs text-gray-500">Bank Transfer, USSD</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-300 p-4 transition-all hover:border-primary-300">
                  <input
                    type="radio"
                    value="MPESA"
                    {...register('paymentProvider')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">M-Pesa</p>
                    <p className="text-xs text-gray-500">Kenya Mobile Money</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-300 p-4 transition-all hover:border-primary-300">
                  <input
                    type="radio"
                    value="MOCK"
                    {...register('paymentProvider')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Mock Payment</p>
                    <p className="text-xs text-gray-500">Testing Only</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Anonymous Donation */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isAnonymous"
                {...register('isAnonymous')}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isAnonymous" className="text-sm text-gray-700">
                Make my donation anonymous
              </label>
            </div>

            {/* Fee Breakdown */}
            {amount > 0 && (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div className="flex-1 text-sm text-gray-700">
                    <p className="font-medium">Fee Breakdown</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your contribution</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(amount, campaign.currency || 'USD')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform fee (3%)</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(platformFee, campaign.currency || 'USD')}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Amount to creator</span>
                      <span className="font-semibold text-primary-600">
                        {formatCurrency(amount - platformFee, campaign.currency || 'USD')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Certificate Level */}
            {amount > 0 && (
              <div className="rounded-lg bg-primary-50 p-4">
                <p className="mb-1 text-sm font-medium text-primary-900">
                  🎓 Free Certificate Level
                </p>
                <p className="text-lg font-bold text-primary-700">
                  {getContributionLevel(amount)}
                </p>
                <p className="mt-1 text-sm text-primary-600">
                  You'll receive an automatic digital certificate!
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={loading}
                disabled={!amount || amount < 1}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Payment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
