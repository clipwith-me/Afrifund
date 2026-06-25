'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Award, Download, ExternalLink, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const certificateLevelColors = {
  Bronze: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
    icon: '🥉',
  },
  Silver: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    icon: '🥈',
  },
  Gold: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
    icon: '🥇',
  },
  Platinum: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
    icon: '💎',
  },
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response: any = await apiClient.get('/certificates/my-certificates');
      setCertificates(response.data || []);
    } catch (error) {
      console.error('Failed to load certificates:', error);
      toast.error('Failed to load certificates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificateId: string, certificateNumber: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/certificates/${certificateId}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificateNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Certificate downloaded!');
      } else {
        toast.error('Failed to download certificate');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate');
    }
  };

  const handleShare = (certificate: any) => {
    const text = `I received a ${certificate.contributionLevel} certificate for supporting "${certificate.campaignTitle}" on AfriFund!`;
    const url = window.location.origin;

    if (navigator.share) {
      navigator.share({ title: 'AfriFund Certificate', text, url });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success('Certificate details copied to clipboard!');
    }
  };

  // Calculate stats
  const totalCertificates = certificates.length;
  const totalDonated = certificates.reduce((sum, cert) => sum + Number(cert.amount), 0);
  const levelCounts = certificates.reduce((acc, cert) => {
    acc[cert.contributionLevel] = (acc[cert.contributionLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <p className="mt-1 text-gray-600">
          All your contribution certificates are automatically generated and free!
        </p>
      </div>

      {/* Stats */}
      {certificates.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalCertificates}</div>
              <p className="mt-1 text-xs text-gray-600">earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalDonated)}
              </div>
              <p className="mt-1 text-xs text-gray-600">donated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Highest Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {['Platinum', 'Gold', 'Silver', 'Bronze'].find((level) => levelCounts[level]) ||
                  'Bronze'}
              </div>
              <p className="mt-1 text-xs text-gray-600">achieved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Campaigns Supported
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(certificates.map((c) => c.campaignTitle)).size}
              </div>
              <p className="mt-1 text-xs text-gray-600">unique campaigns</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Banner */}
      <Card className="border-primary-200 bg-primary-50">
        <CardContent className="flex items-start gap-4 p-6">
          <Award className="h-6 w-6 text-primary-600" />
          <div>
            <h3 className="font-semibold text-primary-900">100% Free Certificates</h3>
            <p className="mt-1 text-sm text-primary-700">
              All certificates are automatically generated and completely free. No hidden fees,
              no upgrades required. Share your impact with the world!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200"></div>
            </Card>
          ))}
        </div>
      )}

      {/* Certificates Grid */}
      {!loading && certificates.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => {
            const levelStyle =
              certificateLevelColors[
                certificate.contributionLevel as keyof typeof certificateLevelColors
              ];

            return (
              <Card
                key={certificate.id}
                className={`border-2 ${levelStyle.border} hover:shadow-xl transition-all`}
              >
                <CardContent className="p-6">
                  {/* Certificate Header */}
                  <div className="mb-4 text-center">
                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200">
                      <Award className="h-10 w-10 text-primary-600" />
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-bold ${levelStyle.bg} ${levelStyle.text}`}
                    >
                      <span>{levelStyle.icon}</span>
                      {certificate.contributionLevel}
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="space-y-3 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Certificate #</p>
                      <p className="font-mono text-sm font-semibold text-gray-900">
                        {certificate.certificateNumber}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Campaign</p>
                      <p className="font-semibold text-gray-900 line-clamp-2">
                        {certificate.campaignTitle}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Contribution</p>
                      <p className="text-lg font-bold text-primary-600">
                        {formatCurrency(Number(certificate.amount), certificate.currency)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Issued</p>
                      <p className="text-sm text-gray-700">{formatDate(certificate.issuedAt)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 space-y-2">
                    <Button
                      onClick={() =>
                        handleDownload(certificate.id, certificate.certificateNumber)
                      }
                      className="w-full"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleShare(certificate)}
                        variant="outline"
                        size="sm"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>

                      <Link href={`/campaigns/${certificate.pledge?.campaign?.slug || ''}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && certificates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Award className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No certificates yet
            </h3>
            <p className="mt-2 text-gray-600">
              Start backing campaigns to earn free contribution certificates!
            </p>
            <Link href="/campaigns">
              <Button className="mt-6">
                <ExternalLink className="mr-2 h-4 w-4" />
                Browse Campaigns
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
