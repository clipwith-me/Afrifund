'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/format';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MockPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(false);

  const reference = searchParams.get('reference');
  const amount = parseFloat(searchParams.get('amount') || '0');
  const currency = searchParams.get('currency') || 'USD';

  const handlePayment = async (success: boolean) => {
    setProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (success) {
      // Simulate webhook call to backend
      try {
        const response = await fetch('http://localhost:3001/api/v1/payments/webhook/mock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference,
            status: 'success',
            amount,
            currency,
          }),
        });

        if (response.ok) {
          toast.success('Payment successful!');
          router.push(`/payment/callback?status=success&reference=${reference}`);
        } else {
          toast.error('Payment verification failed');
        }
      } catch (error) {
        console.error('Webhook error:', error);
        // Even if webhook fails, redirect to success (for demo)
        router.push(`/payment/callback?status=success&reference=${reference}`);
      }
    } else {
      toast.error('Payment cancelled');
      router.push(`/payment/callback?status=failed&reference=${reference}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <CreditCard className="h-8 w-8 text-primary-600" />
          </div>
          <CardTitle>Mock Payment Gateway</CardTitle>
          <CardDescription>
            This is a simulated payment page for testing purposes
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Payment Details */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3">
              <span className="text-sm text-gray-600">Reference</span>
              <span className="font-mono text-sm font-medium text-gray-900">
                {reference}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(amount, currency)}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <strong>Testing Instructions:</strong>
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
              <li>Click "Simulate Success" to test successful payment</li>
              <li>Click "Simulate Failure" to test failed payment</li>
              <li>This will trigger the webhook and update the pledge</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handlePayment(true)}
              className="w-full bg-green-600 hover:bg-green-700"
              loading={processing}
              disabled={processing}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Simulate Success
            </Button>

            <Button
              onClick={() => handlePayment(false)}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              disabled={processing}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Simulate Failure
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.back()}
              disabled={processing}
            >
              Cancel
            </Button>
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ This is a mock payment page for development and testing only.
              Real payment integrations will be used in production.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
