'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mentorsApi } from '@/lib/api/mentors';
import { Briefcase, Award, DollarSign, Search, Users, ArrowRight } from 'lucide-react';

export default function MentorsPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('');

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setLoading(true);
      const response: any = await mentorsApi.getAll({ isActive: true });
      setMentors(response.data || []);
    } catch (error) {
      // Silent failure on public page - graceful fallback to empty state
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesExpertise =
      !expertiseFilter ||
      (Array.isArray(mentor.expertise) &&
        mentor.expertise.some((e: string) =>
          e.toLowerCase().includes(expertiseFilter.toLowerCase())
        ));

    return matchesSearch && matchesExpertise;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Find a Mentor</h1>
        <p className="mt-4 text-lg text-gray-600">
          Connect with experienced professionals who provide guidance in exchange for equity
        </p>
      </div>

      {/* Info Section */}
      <div className="mt-12 rounded-lg bg-primary-50 p-8">
        <h2 className="text-2xl font-bold text-gray-900">Equity-Based Mentorship</h2>
        <div className="mt-6 space-y-4 text-gray-700">
          <p>
            Our unique mentorship program connects innovative African entrepreneurs with
            experienced business professionals and industry experts.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-gray-900">For Entrepreneurs:</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                <li>Expert guidance from industry professionals</li>
                <li>Access to valuable networks and resources</li>
                <li>Strategic advice tailored to your business</li>
                <li>Equity-based compensation aligns mentor success with yours</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">For Mentors:</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                <li>Earn equity in promising startups</li>
                <li>Support African innovation and entrepreneurship</li>
                <li>Flexible time commitment</li>
                <li>Build your portfolio of successful mentorships</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, title, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Input
          placeholder="Filter by expertise..."
          value={expertiseFilter}
          onChange={(e) => setExpertiseFilter(e.target.value)}
        />
      </div>

      {/* Mentors Grid */}
      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMentors.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No mentors found
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-md">
              {searchQuery || expertiseFilter
                ? 'Try adjusting your search criteria'
                : 'No mentors are currently available. Check back soon!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Avatar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white">
                    {mentor.user?.firstName?.[0]}{mentor.user?.lastName?.[0]}
                  </div>
                  {mentor.isActive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                      Available
                    </span>
                  )}
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-gray-900">
                  {mentor.user?.firstName} {mentor.user?.lastName}
                </h3>
                <p className="text-sm text-primary-600 mb-3">{mentor.title}</p>

                {/* Stats */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  {mentor.company && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3 w-3" />
                      <span className="truncate">{mentor.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Award className="h-3 w-3" />
                    <span>{mentor.yearsExperience} years experience</span>
                  </div>
                  {mentor.hourlyRate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3" />
                      <span>${mentor.hourlyRate}/hour</span>
                    </div>
                  )}
                </div>

                {/* Expertise */}
                {mentor.expertise && Array.isArray(mentor.expertise) && mentor.expertise.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.slice(0, 3).map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          +{mentor.expertise.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action */}
                <Link href={`/mentors/${mentor.id}`}>
                  <Button size="sm" className="w-full">
                    View Profile
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
