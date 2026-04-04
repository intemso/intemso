'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CameraIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/auth';
import { usersApi, uploadsApi } from '@/lib/api';

export default function EditProfilePage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const isStudent = user?.role === 'STUDENT';

  // Student fields
  const sp = user?.studentProfile as Record<string, unknown> | null;
  const ep = user?.employerProfile as Record<string, unknown> | null;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [bio, setBio] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // Employer fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Populate form from existing profile data
  useEffect(() => {
    if (isStudent && sp) {
      setFirstName((sp.firstName as string) || '');
      setLastName((sp.lastName as string) || '');
      setProfessionalTitle((sp.professionalTitle as string) || '');
      setBio((sp.bio as string) || '');
      setUniversity((sp.university as string) || '');
      setMajor((sp.major as string) || '');
      setHourlyRate(sp.hourlyRate ? String(sp.hourlyRate) : '');
      setPhone((sp.phone as string) || '');
      setSkills((sp.skills as string[]) || []);
    } else if (!isStudent && ep) {
      setBusinessName((ep.businessName as string) || '');
      setBusinessType((ep.businessType as string) || '');
      setDescription((ep.description as string) || '');
      setWebsite((ep.website as string) || '');
      setContactPerson((ep.contactPerson as string) || '');
      setPhone((ep.phone as string) || '');
    }
  }, [isStudent, sp, ep]);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError('');
    try {
      const result = await uploadsApi.uploadAvatar(file);
      setAvatarUrl(result.url);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Failed to upload avatar';
      setError(msg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (isStudent) {
        await usersApi.updateStudentProfile({
          firstName,
          lastName,
          professionalTitle,
          bio,
          university,
          major,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
          phone,
          skills,
        });
      } else {
        await usersApi.updateEmployerProfile({
          businessName,
          businessType,
          description,
          website,
          contactPerson,
          phone,
        });
      }
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const initials = isStudent
    ? `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?'
    : (businessName?.[0] || contactPerson?.[0] || '?').toUpperCase();

  if (!user) return null;

  return (
    <div className="max-w-3xl">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 sm:mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Profile
      </Link>

      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Edit Profile</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6">
          {error}
        </div>
      )}

      {/* Avatar */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Profile Photo</h2>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl.includes('cloudinary.com') ? avatarUrl.replace('/upload/', '/upload/w_160,h_160,c_fill,g_face,f_auto,q_auto/') : avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">{initials}</span>
            </div>
          )}
          <div>
            <label className="btn-secondary flex items-center gap-2 text-sm cursor-pointer">
              <CameraIcon className="w-4 h-4" />
              {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP. Max 2MB.</p>
          </div>
        </div>
      </div>

      {/* Student form */}
      {isStudent ? (
      <>
      {/* Name */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Personal Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+233 XX XXX XXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
            <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
            <input type="text" value={major} onChange={(e) => setMajor(e.target.value)} className="input-field" placeholder="e.g. Business Administration" />
          </div>
        </div>
      </div>

      {/* Title & Bio */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Professional Info</h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
            <input type="text" value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} className="input-field" placeholder="e.g. Typist & Data Entry, Event Usher" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              rows={5}
              className="input-field"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell employers about yourself..."
            />
            <p className="text-xs text-gray-400 mt-1">Max 500 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (GH₵)</label>
            <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="input-field max-w-50" />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full"
            >
              {skill}
              <button onClick={() => removeSkill(skill)} className="hover:text-red-500">
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="input-field flex-1"
          />
          <button onClick={addSkill} className="btn-secondary flex items-center gap-1">
            <PlusIcon className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
      </>
      ) : (
      /* ── Employer form ── */
      <>
      <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Business Info</h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
            <input type="text" value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="input-field" placeholder="e.g. Startup, Agency, University" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
            <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+233 XX XXX XXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="input-field" placeholder="https://example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell students about your business..."
            />
          </div>
        </div>
      </div>
      </>
      )}

      <button onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
      </button>
    </div>
  );
}
