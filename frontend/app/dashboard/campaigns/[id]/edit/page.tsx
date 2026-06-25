'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { campaignsApi } from '@/lib/api/campaigns';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const campaignSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  shortDescription: z.string().min(20, 'Short description must be at least 20 characters').max(200, 'Max 200 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  category: z.string().min(1, 'Please select a category'),
  location: z.string().min(3, 'Location is required'),
  country: z.string().min(2, 'Country is required'),
  targetAmount: z.number().min(100, 'Target amount must be at least $100'),
  startDate: z.string(),
  endDate: z.string(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignEditPageProps {
  params: {
    id: string;
  };
}

export default function CampaignEditPage({ params }: CampaignEditPageProps) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
  });

  useEffect(() => {
    loadCampaign();
  }, [params.id]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const response: any = await campaignsApi.getById(params.id);
      const campaignData = response.data;
      setCampaign(campaignData);

      // Populate form with existing data
      reset({
        title: campaignData.title,
        shortDescription: campaignData.shortDescription,
        description: campaignData.description,
        category: campaignData.category,
        location: campaignData.location,
        country: campaignData.country,
        targetAmount: Number(campaignData.targetAmount),
        startDate: campaignData.startDate?.split('T')[0],
        endDate: campaignData.endDate?.split('T')[0],
        featuredImage: campaignData.featuredImage || '',
        videoUrl: campaignData.videoUrl || '',
      });
    } catch (error: any) {
      console.error('Failed to load campaign:', error);
      toast.error('Failed to load campaign');
      router.push('/dashboard/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CampaignFormData) => {
    setSubmitting(true);
    try {
      await campaignsApi.update(params.id, data);
      toast.success('Campaign updated successfully!');
      router.push(`/dashboard/campaigns/${params.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update campaign');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Campaign not found</p>
        </div>
      </div>
    );
  }

  // Prevent editing if campaign is already approved or active
  const canEdit = ['DRAFT', 'PENDING_APPROVAL', 'REJECTED'].includes(campaign.status);

  if (!canEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/campaigns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
          </div>
        </div>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Campaign Cannot Be Edited
                </h3>
                <p className="text-sm text-yellow-700">
                  This campaign has status "{campaign.status.replace('_', ' ')}" and cannot be edited.
                  Active and completed campaigns are locked to maintain integrity.
                </p>
                <div className="mt-4">
                  <Link href={`/dashboard/campaigns/${params.id}`}>
                    <Button variant="outline" size="sm">
                      View Campaign Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/campaigns/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
          <p className="text-sm text-gray-600 mt-1">Update your campaign details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your campaign's core details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Campaign Title"
              placeholder="Give your campaign a catchy title"
              error={errors.title?.message}
              {...register('title')}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Short Description
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="A brief overview (max 200 characters)"
                {...register('shortDescription')}
              />
              {errors.shortDescription && (
                <p className="mt-1 text-xs text-red-600">{errors.shortDescription.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Description
              </label>
              <textarea
                className="flex min-h-[200px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Tell your story in detail..."
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  {...register('category')}
                >
                  <option value="">Select category</option>
                  <option value="TECHNOLOGY">Technology</option>
                  <option value="AGRICULTURE">Agriculture</option>
                  <option value="EDUCATION">Education</option>
                  <option value="HEALTH">Health</option>
                  <option value="ENERGY">Energy</option>
                  <option value="ARTS">Arts & Culture</option>
                  <option value="MANUFACTURING">Manufacturing</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
                )}
              </div>

              <Input
                label="Target Amount ($)"
                type="number"
                placeholder="10000"
                error={errors.targetAmount?.message}
                {...register('targetAmount', { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Where is your project based?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="City/Location"
                placeholder="Lagos"
                error={errors.location?.message}
                {...register('location')}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  {...register('country')}
                >
                  <option value="">Select country</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Kenya">Kenya</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Egypt">Egypt</option>
                  <option value="Ethiopia">Ethiopia</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="Other">Other</option>
                </select>
                {errors.country && (
                  <p className="mt-1 text-xs text-red-600">{errors.country.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Timeline</CardTitle>
            <CardDescription>Set your campaign duration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Start Date"
                type="date"
                error={errors.startDate?.message}
                {...register('startDate')}
              />

              <Input
                label="End Date"
                type="date"
                error={errors.endDate?.message}
                {...register('endDate')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle>Media (Optional)</CardTitle>
            <CardDescription>Add images and videos to showcase your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Featured Image URL"
              type="url"
              placeholder="https://example.com/image.jpg"
              error={errors.featuredImage?.message}
              {...register('featuredImage')}
            />

            <Input
              label="Video URL (YouTube/Vimeo)"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              error={errors.videoUrl?.message}
              {...register('videoUrl')}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href={`/dashboard/campaigns/${params.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={submitting}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
