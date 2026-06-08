'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle, XCircle, Loader2, Home, FileText } from 'lucide-react';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const paymentStatus = searchParams.get('status');
    const reference = searchParams.get('reference');

    // Simulate payment verification
    setTimeout(() => {
      if (paymentStatus === 'success' || reference) {
        setStatus('success');
        setMessage('Payment successful! Your contribution has been recorded.');
      } else {
        setStatus('failed');
        setMessage('Payment failed. Please try again.');
      }
    }, 2000);
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary-600" />
              </div>
              <CardTitle>Processing Payment</CardTitle>
              <CardDescription>Please wait while we verify your payment...</CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-green-900">Payment Successful!</CardTitle>
              <CardDescription className="text-green-700">{message}</CardDescription>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-red-900">Payment Failed</CardTitle>
              <CardDescription className="text-red-700">{message}</CardDescription>
            </>
          )}
        </CardHeader>

        {status !== 'loading' && (
          <CardContent className="space-y-3">
            {status === 'success' && (
              <div className="rounded-lg bg-primary-50 p-4">
                <p className="text-sm font-medium text-primary-900">
                  🎓 Certificate Coming Soon
                </p>
                <p className="mt-1 text-sm text-primary-700">
                  Your free digital certificate will be available in your dashboard shortly!
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="w-full">
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>

              {status === 'success' && (
                <Link href="/certificates/my-certificates" className="w-full">
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    View Certificates
                  </Button>
                </Link>
              )}

              {status === 'failed' && (
                <Button variant="outline" className="w-full" onClick={() => router.back()}>
                  Try Again
                </Button>
              )}

              <Link href="/campaigns" className="w-full">
                <Button variant="ghost" className="w-full">
                  Browse More Campaigns
                </Button>
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
