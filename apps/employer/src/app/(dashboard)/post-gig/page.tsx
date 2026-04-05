'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

import { STUDENT_SKILLS } from '@intemso/shared';
import { categoriesApi, gigsApi, communityApi, type Category } from '@/lib/api';
import { useAuth } from '@/context/auth';

const SKILLS_OPTIONS = [...STUDENT_SKILLS];

interface Milestone {
  title: string;
  description: string;
  amount: string;
  deadline: string;
}

interface GigForm {
  title: string;
  description: string;
  categoryId: string;
  experienceLevel: string;
  durationHours: string;
  budgetType: string;
  budgetMin: string;
  budgetMax: string;
  locationType: string;
  locationAddress: string;
  urgency: string;
  projectScope: string;
}

export default function PostGigPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: '', description: '', amount: '', deadline: '' },
  ]);
  const [skillSearch, setSkillSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [shareToCommunity, setShareToCommunity] = useState(true);

  const [form, setForm] = useState<GigForm>({
    title: '',
    description: '',
    categoryId: '',
    experienceLevel: '',
    durationHours: '',
    budgetType: 'fixed',
    budgetMin: '',
    budgetMax: '',
    locationType: 'remote',
    locationAddress: '',
    urgency: 'flexible',
    projectScope: 'small',
  });

  const totalSteps = 4;

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'employer')) {
      router.replace('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const updateField = (field: keyof GigForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 10
        ? [...prev, skill]
        : prev
    );
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { title: '', description: '', amount: '', deadline: '' },
    ]);
  };

  const removeMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const updateMilestone = (
    idx: number,
    field: keyof Milestone,
    value: string
  ) => {
    const updated = [...milestones];
    updated[idx] = { ...updated[idx], [field]: value };
    setMilestones(updated);
  };

  const filteredSkills = SKILLS_OPTIONS.filter(
    (s) =>
      s.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !selectedSkills.includes(s)
  );

  const handleSubmit = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const payload: Parameters<typeof gigsApi.create>[0] = {
        title: form.title,
        description: form.description,
        budgetType: form.budgetType,
        locationType: form.locationType,
      };
      if (form.categoryId) payload.categoryId = form.categoryId;
      if (selectedSkills.length > 0) payload.requiredSkills = selectedSkills;
      if (form.budgetMin) payload.budgetMin = parseFloat(form.budgetMin);
      if (form.budgetMax) payload.budgetMax = parseFloat(form.budgetMax);
      if (form.locationAddress) payload.locationAddress = form.locationAddress;
      if (form.experienceLevel) payload.experienceLevel = form.experienceLevel;
      if (form.projectScope) payload.projectScope = form.projectScope;
      if (form.urgency) payload.urgency = form.urgency;
      if (form.durationHours) payload.durationHours = parseInt(form.durationHours, 10);

      const created = await gigsApi.create(payload);

      // Cross-post to community if opted in
      if (shareToCommunity) {
        communityApi.crossPostGig(created.id).catch(() => {});
      }

      router.push(`/gigs/${created.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to post gig';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-5 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Post a New Gig</h1>
          <p className="text-sm text-gray-500 mt-1">
            Describe your project and find the perfect student talent.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-5 sm:mb-8">
          {[
            { num: 1, label: 'Details' },
            { num: 2, label: 'Skills' },
            { num: 3, label: 'Budget' },
            { num: 4, label: 'Review' },
          ].map(({ num, label }, idx) => (
            <div key={num} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => num < step && setStep(num)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step > num
                    ? 'bg-green-500 text-white'
                    : step === num
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > num ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  num
                )}
              </button>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  step >= num ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
              {idx < 3 && (
                <div
                  className={`flex-1 h-0.5 ${
                    step > num ? 'bg-green-500' : 'bg-gray-100'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Gig Details
                </h2>
                <p className="text-sm text-gray-500">
                  Provide a clear title and description for your gig.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Gig Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Build a React Native Mobile App for Campus Delivery"
                  className="input-field"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  A clear title helps attract the right talent
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category
                </label>
                <select
                  className="input-field"
                  value={form.categoryId}
                  onChange={(e) => updateField('categoryId', e.target.value)}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={8}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your project in detail. Include goals, deliverables, any specific requirements, and what success looks like..."
                  className="input-field resize-none"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  The more detail you provide, the better applications you&apos;ll
                  receive
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Experience Level
                  </label>
                  <select
                    className="input-field"
                    value={form.experienceLevel}
                    onChange={(e) => updateField('experienceLevel', e.target.value)}
                  >
                    <option value="" disabled>
                      Select level
                    </option>
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Estimated Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={form.durationHours}
                    onChange={(e) => updateField('durationHours', e.target.value)}
                    placeholder="e.g., 40"
                    className="input-field"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location Type
                  </label>
                  <select
                    className="input-field"
                    value={form.locationType}
                    onChange={(e) => updateField('locationType', e.target.value)}
                  >
                    <option value="remote">Remote</option>
                    <option value="on_site">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Urgency
                  </label>
                  <select
                    className="input-field"
                    value={form.urgency}
                    onChange={(e) => updateField('urgency', e.target.value)}
                  >
                    <option value="flexible">Flexible</option>
                    <option value="this_week">This Week</option>
                    <option value="asap">ASAP</option>
                  </select>
                </div>
              </div>

              {form.locationType !== 'remote' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location Address
                  </label>
                  <input
                    type="text"
                    value={form.locationAddress}
                    onChange={(e) => updateField('locationAddress', e.target.value)}
                    placeholder="e.g., University of Ghana, Legon"
                    className="input-field"
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Required Skills
                </h2>
                <p className="text-sm text-gray-500">
                  Select up to 10 skills needed for this gig.
                </p>
              </div>

              {/* Selected skills */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full hover:bg-primary-100 transition-colors"
                    >
                      {skill}
                      <span className="text-primary-400">×</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Search */}
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Search skills..."
                className="input-field"
              />

              {/* Available skills grid */}
              <div className="flex flex-wrap gap-2">
                {filteredSkills.slice(0, 20).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className="px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-full hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-400">
                {selectedSkills.length}/10 skills selected
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Budget & Milestones
                </h2>
                <p className="text-sm text-gray-500">
                  Set your budget and optionally break it into milestones.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Budget Type
                </label>
                <select
                  className="input-field"
                  value={form.budgetType}
                  onChange={(e) => updateField('budgetType', e.target.value)}
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Minimum Budget (GH₵)
                  </label>
                  <input
                    type="number"
                    value={form.budgetMin}
                    onChange={(e) => updateField('budgetMin', e.target.value)}
                    placeholder="e.g., 500"
                    className="input-field"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Maximum Budget (GH₵)
                  </label>
                  <input
                    type="number"
                    value={form.budgetMax}
                    onChange={(e) => updateField('budgetMax', e.target.value)}
                    placeholder="e.g., 2000"
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Milestone payments recommended</p>
                  <p className="text-blue-600 mt-0.5">
                    Breaking your project into milestones protects both you and
                    the freelancer. Payments are released as each milestone is
                    completed and approved.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">
                    Milestones
                  </h3>
                  <button
                    onClick={addMilestone}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Milestone
                  </button>
                </div>

                <div className="space-y-4">
                  {milestones.map((ms, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          Milestone {idx + 1}
                        </span>
                        {milestones.length > 1 && (
                          <button
                            onClick={() => removeMilestone(idx)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={ms.title}
                        onChange={(e) =>
                          updateMilestone(idx, 'title', e.target.value)
                        }
                        placeholder="Milestone title"
                        className="input-field bg-white"
                      />
                      <textarea
                        value={ms.description}
                        onChange={(e) =>
                          updateMilestone(idx, 'description', e.target.value)
                        }
                        rows={2}
                        placeholder="What needs to be delivered"
                        className="input-field bg-white resize-none"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                            GH₵
                          </span>
                          <input
                            type="number"
                            value={ms.amount}
                            onChange={(e) =>
                              updateMilestone(idx, 'amount', e.target.value)
                            }
                            placeholder="Amount"
                            className="input-field pl-7 bg-white"
                          />
                        </div>
                        <input
                          type="date"
                          value={ms.deadline}
                          onChange={(e) =>
                            updateMilestone(idx, 'deadline', e.target.value)
                          }
                          className="input-field bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Review & Post
                </h2>
                <p className="text-sm text-gray-500">
                  Review your gig details before posting.
                </p>
              </div>

              {submitError && (
                <div className="bg-red-50 text-red-700 text-sm rounded-xl p-4">
                  {submitError}
                </div>
              )}

              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-green-800">
                  Your gig is ready to post!
                </h3>
                <p className="text-sm text-green-600 mt-2 max-w-md mx-auto">
                  Once posted, students will be able to view and apply.
                  You&apos;ll receive notifications as applications come
                  in.
                </p>
              </div>

              <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Title
                  </span>
                  <p className="text-sm text-gray-800 mt-1">
                    {form.title || <span className="text-gray-400 italic">Not set</span>}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Category
                  </span>
                  <p className="text-sm text-gray-800 mt-1">
                    {categories.find((c) => c.id === form.categoryId)?.name || <span className="text-gray-400 italic">Not selected</span>}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Budget
                  </span>
                  <p className="text-sm text-gray-800 mt-1">
                    {form.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly'} — GH₵{form.budgetMin || '0'} to GH₵{form.budgetMax || '0'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedSkills.length > 0 ? (
                      selectedSkills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        No skills selected
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Milestones
                  </span>
                  <p className="text-sm text-gray-700 mt-1">
                    {milestones.filter((m) => m.title).length} milestone(s)
                    planned
                  </p>
                </div>

                {/* Share to Community toggle */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareToCommunity}
                      onChange={(e) => setShareToCommunity(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Share to Community</span>
                      <p className="text-xs text-gray-500 mt-0.5">Post this gig to the Intemso community feed for extra visibility</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                className="btn-secondary"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {step < totalSteps ? (
              <button
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
                className="btn-primary flex items-center gap-2"
              >
                Continue
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary btn-lg flex items-center gap-2 disabled:opacity-50"
              >
                <DocumentTextIcon className="w-5 h-5" />
                {submitting ? 'Posting...' : 'Post Gig'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
