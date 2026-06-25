'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { campaignsApi } from '@/lib/api/campaigns';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Info,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import slugify from 'slugify';

// Step schemas
const step1Schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  shortDescription: z.string().min(20, 'Short description must be at least 20 characters').max(200, 'Max 200 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  category: z.string().min(1, 'Please select a category'),
  location: z.string().min(3, 'Location is required'),
  country: z.string().min(2, 'Country is required'),
});

const step2Schema = z.object({
  targetAmount: z.number().min(100, 'Minimum target amount is $100'),
  currency: z.string().default('USD'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

const step3Schema = z.object({
  featuredImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  videoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type AllFormData = Step1Data & Step2Data & Step3Data;

const CATEGORIES = [
  'Technology',
  'Agriculture',
  'Healthcare',
  'Education',
  'Environment',
  'Arts & Culture',
  'Social Impact',
  'Finance',
  'Manufacturing',
  'Other',
];

const COUNTRIES = [
  'Nigeria',
  'Kenya',
  'South Africa',
  'Ghana',
  'Rwanda',
  'Uganda',
  'Tanzania',
  'Ethiopia',
  'Egypt',
  'Morocco',
  'Senegal',
  'Ivory Coast',
  'Cameroon',
  'Zimbabwe',
  'Botswana',
];

const steps = [
  { id: 1, name: 'Basic Info', description: 'Campaign details' },
  { id: 2, name: 'Funding', description: 'Goals & timeline' },
  { id: 3, name: 'Media', description: 'Images & videos' },
  { id: 4, name: 'Review', description: 'Final check' },
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<AllFormData>>({
    currency: 'USD',
  });

  // Check if user is verified
  if (!user?.isVerified) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-600" />
            <h3 className="mt-4 text-lg font-semibold text-yellow-900">
              KYC Verification Required
            </h3>
            <p className="mt-2 text-yellow-700">
              You must complete KYC verification before creating a campaign
            </p>
            <Link href="/dashboard/kyc">
              <Button className="mt-6">Complete KYC</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStepSchema = () => {
    switch (currentStep) {
      case 1:
        return step1Schema;
      case 2:
        return step2Schema;
      case 3:
        return step3Schema;
      default:
        return z.object({});
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm({
    resolver: zodResolver(getStepSchema()),
    defaultValues: formData,
  });

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      const currentData = getValues();
      setFormData({ ...formData, ...currentData });
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    const currentData = getValues();
    setFormData({ ...formData, ...currentData });
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const currentData = getValues();
      const allData = { ...formData, ...currentData };

      await campaignsApi.create({
        ...allData as any,
        status: 'DRAFT',
      });

      toast.success('Draft saved successfully!');
      router.push('/dashboard/campaigns');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const currentData = getValues();
      const allData = { ...formData, ...currentData };

      await campaignsApi.create(allData as any);

      toast.success('Campaign submitted for approval!');
      router.push('/dashboard/campaigns');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
        <p className="mt-1 text-gray-600">Launch your fundraising campaign in 4 easy steps</p>
      </div>

      {/* Progress Steps */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center justify-between min-w-[500px] sm:min-w-0">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors ${
                    currentStep > step.id
                      ? 'border-green-600 bg-green-600 text-white'
                      : currentStep === step.id
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 transition-colors ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  style={{ marginTop: '-60px' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].name}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <Input
                  label="Campaign Title"
                  placeholder="e.g., AI-Powered Agricultural Solution for Small Farms"
                  error={errors.title?.message}
                  {...register('title')}
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Short Description
                  </label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="A brief summary of your campaign (max 200 characters)"
                    {...register('shortDescription')}
                  />
                  {errors.shortDescription && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.shortDescription.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Description
                  </label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={8}
                    placeholder="Describe your project in detail. What problem are you solving? How will the funds be used? What impact will it have?"
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    {...register('category')}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="City/Location"
                    placeholder="e.g., Lagos"
                    error={errors.location?.message}
                    {...register('location')}
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      {...register('country')}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Tips for a great campaign:</p>
                      <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>Be specific about your project goals</li>
                        <li>Explain the problem you're solving</li>
                        <li>Show how funds will be used</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Funding Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Target Amount"
                    type="number"
                    placeholder="10000"
                    error={errors.targetAmount?.message}
                    {...register('targetAmount', { valueAsNumber: true })}
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Currency
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      {...register('currency')}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="NGN">NGN - Nigerian Naira</option>
                      <option value="KES">KES - Kenyan Shilling</option>
                      <option value="ZAR">ZAR - South African Rand</option>
                    </select>
                  </div>
                </div>

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

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-900">Platform Fee</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    AfriFund charges a 3% platform fee on successful pledges. This helps us
                    maintain the platform and support more innovators.
                  </p>
                  {formData.targetAmount && (
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Amount:</span>
                        <span className="font-semibold text-gray-900">
                          ${formData.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Fee (3%):</span>
                        <span className="font-semibold text-gray-900">
                          ${(formData.targetAmount * 0.03).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="font-semibold text-gray-900">You'll receive:</span>
                        <span className="font-bold text-primary-600">
                          ${(formData.targetAmount * 0.97).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Funding Tips:</p>
                      <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>Set a realistic target based on your budget</li>
                        <li>Give yourself enough time (30-60 days typical)</li>
                        <li>Consider 3% platform fee in your calculations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Media */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <Input
                  label="Featured Image URL"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  error={errors.featuredImage?.message}
                  {...register('featuredImage')}
                />

                <Input
                  label="Video URL (Optional)"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  error={errors.videoUrl?.message}
                  {...register('videoUrl')}
                />

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                  <h4 className="font-semibold text-gray-900">Image Preview</h4>
                  <p className="mt-1 text-sm text-gray-600 mb-4">
                    Your featured image will appear on campaign cards
                  </p>
                  {formData.featuredImage ? (
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <img
                        src={formData.featuredImage}
                        alt="Campaign preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/800x450?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-200">
                      <p className="text-gray-500">No image yet</p>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Media Tips:</p>
                      <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>Use high-quality images (minimum 800x600px)</li>
                        <li>Video increases campaign success by 40%</li>
                        <li>Show your product/project in action</li>
                        <li>File upload coming soon - use image URLs for now</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary-600" />
                    <div className="text-sm text-primary-800">
                      <p className="font-medium">Review your campaign carefully</p>
                      <p className="mt-1">
                        Once submitted, your campaign will be reviewed by our team. You can edit
                        the campaign while it's in draft status.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Campaign Preview</h3>
                    <p className="text-sm text-gray-600">
                      This is how your campaign will appear to backers
                    </p>
                  </div>

                  {formData.featuredImage && (
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <img
                        src={formData.featuredImage}
                        alt="Campaign"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{formData.title}</h2>
                    <p className="mt-2 text-gray-600">{formData.shortDescription}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-600">Category</p>
                      <p className="font-semibold text-gray-900">{formData.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">
                        {formData.location}, {formData.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Target</p>
                      <p className="font-semibold text-gray-900">
                        {formData.currency} {formData.targetAmount?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Duration</p>
                      <p className="font-semibold text-gray-900">
                        {formData.startDate && formData.endDate
                          ? Math.ceil(
                              (new Date(formData.endDate).getTime() -
                                new Date(formData.startDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : 0}{' '}
                        days
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">Description</h4>
                    <p className="whitespace-pre-wrap text-gray-600">{formData.description}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {currentStep < 4 && (
            <Button variant="outline" onClick={handleSaveDraft} loading={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
          )}

          {currentStep < 4 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinalSubmit} loading={loading}>
              <Send className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
