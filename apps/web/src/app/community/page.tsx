'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  TrophyIcon,
  CalendarIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  PhotoIcon,
  FaceSmileIcon,
  HashtagIcon,
  GlobeAltIcon,
  BookmarkIcon,
  ShareIcon,
  FireIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  BellIcon,
  PlusIcon,
  HandThumbUpIcon,
  FlagIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  UserMinusIcon,
  PencilSquareIcon,
  EyeIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  HandThumbUpIcon as ThumbUpSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
} from '@heroicons/react/24/solid';
import {
  communityApi,
  usersApi,
  uploadsApi,
  type CommunityPost,
  type CommunityComment,
  type MentionUser,
} from '@/lib/api';
import { useAuth } from '@/context/auth';
import { useToast } from '@/components/ui/Toast';
import { useCommunitySocket } from '@/hooks/useCommunitySocket';

// ===================================================================
// CONFIG & HELPERS
// ===================================================================

const POST_TYPES = {
  discussion: { label: 'Discussion', Icon: ChatBubbleLeftRightIcon, bg: 'bg-blue-500', light: 'bg-blue-50 text-blue-600', emoji: '\uD83D\uDCAC' },
  question: { label: 'Question', Icon: QuestionMarkCircleIcon, bg: 'bg-purple-500', light: 'bg-purple-50 text-purple-600', emoji: '\u2753' },
  tip: { label: 'Tip', Icon: LightBulbIcon, bg: 'bg-amber-500', light: 'bg-amber-50 text-amber-600', emoji: '\uD83D\uDCA1' },
  achievement: { label: 'Achievement', Icon: TrophyIcon, bg: 'bg-green-500', light: 'bg-green-50 text-green-600', emoji: '\uD83C\uDFC6' },
  event: { label: 'Event', Icon: CalendarIcon, bg: 'bg-pink-500', light: 'bg-pink-50 text-pink-600', emoji: '\uD83D\uDCC5' },
  gig_posted: { label: 'New Gig', Icon: BriefcaseIcon, bg: 'bg-indigo-500', light: 'bg-indigo-50 text-indigo-600', emoji: '\uD83D\uDCE2' },
  gig_completed: { label: 'Gig Completed', Icon: TrophyIcon, bg: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-600', emoji: '\uD83C\uDFC6' },
  review_received: { label: 'Review', Icon: SparklesIcon, bg: 'bg-yellow-500', light: 'bg-yellow-50 text-yellow-600', emoji: '\u2B50' },
};

const FALLBACK_TAGS = ['freelancing', 'ushering', 'firstgig', 'campusjobs', 'dataentry', 'techgigs', 'giglife', 'studentsuccess'];

function getAuthorName(author: CommunityPost['author']): string {
  if (author.studentProfile) return `${author.studentProfile.firstName} ${author.studentProfile.lastName}`;
  if (author.employerProfile) return author.employerProfile.contactPerson || author.employerProfile.businessName;
  return author.email.split('@')[0];
}

function getAuthorTitle(author: CommunityPost['author']): string {
  if (author.studentProfile) return author.studentProfile.professionalTitle || 'Student';
  if (author.employerProfile) return 'Employer';
  return '';
}

function getAuthorOrg(author: CommunityPost['author']): string {
  if (author.studentProfile) return author.studentProfile.university || '';
  if (author.employerProfile) return author.employerProfile.businessName || '';
  return '';
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(dateStr).toLocaleDateString('en-GH', { month: 'short', day: 'numeric' });
}

const REPUTATION_TIERS: Record<string, { color: string; bg: string }> = {
  Newcomer:    { color: 'text-gray-600',   bg: 'bg-gray-100' },
  Active:      { color: 'text-blue-700',   bg: 'bg-blue-100' },
  Contributor: { color: 'text-green-700',  bg: 'bg-green-100' },
  Expert:      { color: 'text-purple-700', bg: 'bg-purple-100' },
  Leader:      { color: 'text-amber-700',  bg: 'bg-amber-100' },
};

function getReputationTierName(score: number): string {
  if (score >= 1000) return 'Leader';
  if (score >= 500) return 'Expert';
  if (score >= 200) return 'Contributor';
  if (score >= 50) return 'Active';
  return 'Newcomer';
}

function ReputationBadge({ score }: { score?: number }) {
  if (!score || score < 50) return null;
  const tier = getReputationTierName(score);
  const config = REPUTATION_TIERS[tier];
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
      {tier}
    </span>
  );
}

// ===================================================================
// AVATAR
// ===================================================================

function Avatar({ author, size = 40, ring = false }: { author: CommunityPost['author']; size?: number; ring?: boolean }) {
  const name = getAuthorName(author);
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const isStudent = author.role === 'student';
  const colors = isStudent
    ? 'bg-linear-to-br from-primary-400 to-primary-600 text-white'
    : 'bg-linear-to-br from-amber-400 to-amber-600 text-white';

  const ringClass = ring ? 'ring-3 ring-primary-500 ring-offset-2' : '';
  const fontSize = size <= 32 ? 'text-xs' : size <= 40 ? 'text-sm' : 'text-base';

  if (author.avatarUrl) {
    // Use on-the-fly optimizer: request 2x pixels for retina displays
    const optimizedSrc = author.avatarUrl.includes('cloudinary.com')
      ? author.avatarUrl.replace('/upload/', `/upload/w_${size * 2},h_${size * 2},c_fill,g_face,f_auto,q_auto/`)
      : author.avatarUrl;

    return (
      <img
        src={optimizedSrc}
        alt={name}
        className={`rounded-full object-cover ${ringClass}`}
        style={{ width: size, height: size }}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold ${colors} ${ringClass} ${fontSize}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

// ===================================================================
// STORY-STYLE HIGHLIGHTS BAR (Top of feed)
// ===================================================================

function StoryBar() {
  const stories = [
    { id: 'create', label: 'Your story', emoji: '+', isCreate: true },
    { id: 'tips', label: 'Top Tips', emoji: '\uD83D\uDCA1' },
    { id: 'wins', label: 'Wins', emoji: '\uD83C\uDFC6' },
    { id: 'events', label: 'Events', emoji: '\uD83D\uDCC5' },
    { id: 'questions', label: 'Q&A', emoji: '\u2753' },
    { id: 'campus', label: 'Campus', emoji: '\uD83C\uDF93' },
    { id: 'trending', label: 'Trending', emoji: '\uD83D\uDD25' },
  ];

  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 px-1 scrollbar-hide">
      {stories.map((s) => (
        <button key={s.id} className="flex flex-col items-center gap-1 sm:gap-1.5 shrink-0 group">
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-transform group-hover:scale-105 ${
              s.isCreate
                ? 'border-2 border-dashed border-gray-300 bg-gray-50 hover:border-primary-400 text-gray-400 text-lg sm:text-xl'
                : 'bg-linear-to-br from-primary-400 via-purple-500 to-pink-500 p-0.5'
            }`}
          >
            {s.isCreate ? (
              <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <span className="w-full h-full bg-white rounded-full flex items-center justify-center text-xl sm:text-2xl">
                {s.emoji}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate max-w-12 sm:max-w-16">{s.label}</span>
        </button>
      ))}
    </div>
  );
}

// ===================================================================
// COMPOSE POST (Facebook-style)
// ===================================================================

function ComposePost({ user, onPost }: { user: any; onPost: (data: { content: string; type: string; tags: string[]; images?: string[] }) => Promise<void> }) {
  const toast = useToast();
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [type, setType] = useState('discussion');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // @mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState<MentionUser[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionStart, setMentionStart] = useState(-1);
  const mentionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExpand = () => {
    setExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = 5 - imageUrls.length;
    if (remaining <= 0) {
      toast.warning('Maximum 5 images allowed');
      return;
    }
    const selected = Array.from(files).slice(0, remaining);
    setUploadingImages(true);
    try {
      const urls: string[] = [];
      for (const file of selected) {
        const result = await uploadsApi.uploadAttachment(file);
        urls.push(result.url);
      }
      setImageUrls((prev) => [...prev, ...urls]);
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImages(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    const cursor = e.target.selectionStart;
    const textBefore = val.slice(0, cursor);
    const mentionMatch = textBefore.match(/@([a-zA-Z0-9._-]*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionStart(cursor - query.length - 1);
      setMentionQuery(query);

      if (query.length >= 2) {
        if (mentionTimerRef.current) clearTimeout(mentionTimerRef.current);
        mentionTimerRef.current = setTimeout(async () => {
          try {
            const results = await communityApi.searchMentions(query);
            setMentionResults(results);
            setShowMentions(results.length > 0);
          } catch {
            setShowMentions(false);
          }
        }, 300);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  const insertMention = (mentionUser: MentionUser) => {
    const name = mentionUser.studentProfile
      ? `${mentionUser.studentProfile.firstName || ''}.${mentionUser.studentProfile.lastName || ''}`.replace(/\s/g, '')
      : mentionUser.employerProfile?.businessName?.replace(/\s/g, '_') || 'user';
    const before = content.slice(0, mentionStart);
    const after = content.slice(mentionStart + mentionQuery.length + 1);
    const newContent = `${before}@${name} ${after}`;
    setContent(newContent);
    setShowMentions(false);
    setMentionQuery('');
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = mentionStart + name.length + 2;
        textareaRef.current.selectionStart = pos;
        textareaRef.current.selectionEnd = pos;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onPost({ content: content.trim(), type, tags, images: imageUrls.length > 0 ? imageUrls : undefined });
      setContent('');
      setType('discussion');
      setTags([]);
      setImageUrls([]);
      setExpanded(false);
      toast.success('Post published!');
    } catch {
      toast.error('Failed to create post. Please try again.');
    }
    setSubmitting(false);
  };

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean && !tags.includes(clean) && tags.length < 5) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const authorName = user?.studentProfile
    ? `${user.studentProfile.firstName ?? ''}`
    : user?.employerProfile?.contactPerson || 'there';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Quick compose bar */}
      {!expanded && (
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {authorName[0]?.toUpperCase() || 'U'}
          </div>
          <button
            onClick={handleExpand}
            className="flex-1 text-left px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-500 transition-colors"
          >
            What&apos;s on your mind, {authorName}?
          </button>
        </div>
      )}

      {/* Quick action buttons */}
      {!expanded && (
        <div className="flex items-center border-t border-gray-100 divide-x divide-gray-100">
          {[
            { Icon: PhotoIcon, label: 'Photo', color: 'text-green-500', onClick: () => { handleExpand(); setTimeout(() => imageInputRef.current?.click(), 100); } },
            { Icon: TrophyIcon, label: 'Achievement', color: 'text-amber-500', onClick: () => { setType('achievement'); handleExpand(); } },
            { Icon: LightBulbIcon, label: 'Share a Tip', color: 'text-purple-500', onClick: () => { setType('tip'); handleExpand(); } },
          ].map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-gray-500 font-medium hover:bg-gray-50 transition-colors"
            >
              <action.Icon className={`w-5 h-5 ${action.color}`} />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Expanded compose modal-like */}
      {expanded && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Create Post</h3>
            <button onClick={() => setExpanded(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Author info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
              {authorName[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{authorName}</p>
              <div className="flex items-center gap-1.5">
                <GlobeAltIcon className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">Public</span>
                <ChevronDownIcon className="w-3 h-3 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Text area */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder={
                type === 'question' ? 'Ask the community...' :
                type === 'tip' ? 'Share your tip or advice...' :
                type === 'achievement' ? 'Tell us about your win!' :
                type === 'event' ? 'Share event details...' :
                "What's on your mind?"
              }
              rows={5}
              className="w-full text-gray-800 placeholder:text-gray-400 resize-none outline-none text-[15px] leading-relaxed"
            />

            {/* @mention autocomplete dropdown */}
            {showMentions && (
              <div className="absolute left-0 right-0 bottom-full mb-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-20">
                {mentionResults.map((mu) => {
                  const displayName = mu.studentProfile
                    ? `${mu.studentProfile.firstName || ''} ${mu.studentProfile.lastName || ''}`.trim()
                    : mu.employerProfile?.businessName || 'User';
                  return (
                    <button
                      key={mu.id}
                      onClick={() => insertMention(mu)}
                      className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 text-left transition-colors"
                    >
                      {mu.avatarUrl ? (
                        <img src={mu.avatarUrl.includes('cloudinary.com') ? mu.avatarUrl.replace('/upload/', '/upload/w_64,h_64,c_fill,g_face,f_auto,q_auto/') : mu.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">
                          {displayName[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">{displayName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs font-medium bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full">
                  #{tag}
                  <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-primary-800 p-0.5">
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Image previews */}
          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative group">
                  <img
                    src={url.includes('cloudinary.com') ? url.replace('/upload/', '/upload/w_160,h_120,c_fill,f_auto,q_auto/') : url}
                    alt={`Upload ${i + 1}`}
                    className="w-20 h-15 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => setImageUrls((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {uploadingImages && (
                <div className="w-20 h-15 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}

          {/* Post type pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {Object.entries(POST_TYPES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setType(key)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  type === key
                    ? `${config.light} border-transparent shadow-sm`
                    : 'text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{config.emoji}</span>
                {config.label}
              </button>
            ))}
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImages || imageUrls.length >= 5}
                className="p-2 hover:bg-gray-100 rounded-full text-green-500 transition-colors disabled:opacity-40"
                title="Photo"
              >
                <PhotoIcon className="w-5 h-5" />
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                className="p-2 hover:bg-gray-100 rounded-full text-amber-500 transition-colors"
                title="Tag"
                onClick={() => {
                  const tag = prompt('Add a tag:');
                  if (tag) addTag(tag);
                }}
              >
                <HashtagIcon className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full text-blue-500 transition-colors" title="Emoji">
                <FaceSmileIcon className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="px-6 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 disabled:bg-gray-200 disabled:text-gray-400 rounded-lg transition-colors"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================================================================
// REPORT MODAL
// ===================================================================

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam', description: 'Misleading or repetitive content' },
  { value: 'harassment', label: 'Harassment', description: 'Bullying, threats, or intimidation' },
  { value: 'inappropriate', label: 'Inappropriate', description: 'Nudity, violence, or offensive content' },
  { value: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
  { value: 'other', label: 'Other', description: 'Another reason not listed' },
];

function ReportModal({
  type,
  targetId,
  onClose,
}: {
  type: 'post' | 'comment';
  targetId: string;
  onClose: () => void;
}) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      if (type === 'post') {
        await communityApi.reportPost(targetId, { reason, description: description.trim() || undefined });
      } else {
        await communityApi.reportComment(targetId, { reason, description: description.trim() || undefined });
      }
      toast.success('Report submitted. We\u2019ll review it shortly.');
      onClose();
    } catch (err: any) {
      if (err?.message?.includes('already reported')) {
        toast.warning('You\u2019ve already reported this content.');
        onClose();
      } else {
        toast.error('Failed to submit report. Please try again.');
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-gray-900">Report {type === 'post' ? 'Post' : 'Comment'}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Reasons */}
        <div className="px-5 py-4 space-y-2">
          <p className="text-sm text-gray-500 mb-3">Why are you reporting this {type}?</p>
          {REPORT_REASONS.map((r) => (
            <label
              key={r.value}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                reason === r.value ? 'border-red-300 bg-red-50' : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={(e) => setReason(e.target.value)}
                className="mt-0.5 accent-red-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">{r.label}</span>
                <p className="text-xs text-gray-500">{r.description}</p>
              </div>
            </label>
          ))}

          {/* Optional description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add additional details (optional)"
            rows={2}
            maxLength={500}
            className="w-full mt-3 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// COMMENT
// ===================================================================

function CommentItem({
  comment,
  userId,
  onReply,
  onDelete,
}: {
  comment: CommunityComment;
  userId?: string;
  onReply: (parentId: string) => void;
  onDelete: (id: string) => void;
}) {
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [showReport, setShowReport] = useState(false);

  const handleLike = async () => {
    if (!userId) return;
    try {
      const res = await communityApi.toggleLikeComment(comment.id);
      setLiked(res.liked);
      setLikeCount((c) => c + (res.liked ? 1 : -1));
    } catch {
      toast.error('Failed to like comment.');
    }
  };

  return (
    <div className="flex gap-2.5 group">
      <Link href={`/profile/${comment.author.id}`} prefetch={false}>
        <Avatar author={comment.author} size={32} />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-2xl px-3.5 py-2.5 inline-block max-w-full">
          <Link href={`/profile/${comment.author.id}`} prefetch={false} className="text-[13px] font-semibold text-gray-900 block hover:underline">
            {getAuthorName(comment.author)}
          </Link>
          <p className="text-[13px] text-gray-700 whitespace-pre-wrap wrap-break-word">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 ml-1">
          <span className="text-[11px] text-gray-400">{timeAgo(comment.createdAt)}</span>
          <button
            onClick={handleLike}
            className={`text-[11px] font-bold transition-colors ${liked ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Like{likeCount > 0 && ` \u00B7 ${likeCount}`}
          </button>
          <button
            onClick={() => onReply(comment.id)}
            className="text-[11px] font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Reply
          </button>
          {userId === comment.authorId && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-[11px] font-bold text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              Delete
            </button>
          )}
          {userId && userId !== comment.authorId && (
            <button
              onClick={() => setShowReport(true)}
              className="text-[11px] font-bold text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              Report
            </button>
          )}
        </div>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2 group/reply">
                <Link href={`/profile/${reply.author.id}`} prefetch={false}>
                  <Avatar author={reply.author} size={24} />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full">
                    <Link href={`/profile/${reply.author.id}`} prefetch={false} className="text-xs font-semibold text-gray-900 block hover:underline">
                      {getAuthorName(reply.author)}
                    </Link>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap wrap-break-word">{reply.content}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 ml-1">
                    <span className="text-[10px] text-gray-400">{timeAgo(reply.createdAt)}</span>
                    <button className="text-[10px] font-bold text-gray-500 hover:text-gray-700">Like</button>
                  </div>
                </div>
              </div>
            ))}
            {comment._count && comment._count.replies > (comment.replies?.length || 0) && (
              <button className="text-xs font-semibold text-gray-500 hover:text-gray-700 ml-9">
                View {comment._count.replies - (comment.replies?.length || 0)} more {comment._count.replies - (comment.replies?.length || 0) === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        )}
      </div>
      {showReport && (
        <ReportModal type="comment" targetId={comment.id} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

// ===================================================================
// POST CARD (Facebook/LinkedIn hybrid)
// ===================================================================

function PostCard({
  post,
  userId,
  followingIds,
  onFollowToggle,
  onLike,
  onComment,
  onDelete,
  onUpdate,
}: {
  post: CommunityPost;
  userId?: string;
  followingIds: Set<string>;
  onFollowToggle: (targetId: string) => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string, parentId?: string) => void;
  onDelete: (postId: string) => void;
  onUpdate: (postId: string, data: { content?: string; tags?: string[] }) => void;
}) {
  const toast = useToast();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [saved, setSaved] = useState(post.isSaved ?? false);
  const [showReport, setShowReport] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editSaving, setEditSaving] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const postCardRef = useRef<HTMLDivElement>(null);

  // Viewport-based view tracking
  useEffect(() => {
    if (!userId || userId === post.authorId) return;
    const el = postCardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          communityApi.recordView(post.id).catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [post.id, userId, post.authorId]);

  const canEdit = userId === post.authorId && (Date.now() - new Date(post.createdAt).getTime()) < 24 * 60 * 60 * 1000;

  const handleSaveToggle = async () => {
    if (!userId) return;
    try {
      const result = await communityApi.toggleSavePost(post.id);
      setSaved(result.saved);
      toast.success(result.saved ? 'Post saved!' : 'Post unsaved.');
    } catch {
      toast.error('Failed to save post.');
    }
  };

  const handleEditSave = async () => {
    if (!editContent.trim() || editSaving) return;
    setEditSaving(true);
    try {
      await onUpdate(post.id, { content: editContent.trim() });
      setEditing(false);
    } catch {
      toast.error('Failed to update post.');
    }
    setEditSaving(false);
  };

  const typeConfig = POST_TYPES[post.type as keyof typeof POST_TYPES] || POST_TYPES.discussion;

  const loadComments = useCallback(async () => {
    if (loadingComments) return;
    setLoadingComments(true);
    try {
      const res = await communityApi.getComments(post.id);
      setComments(res.items);
    } catch {
      toast.error('Failed to load comments.');
    }
    setLoadingComments(false);
  }, [post.id, loadingComments]);

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) loadComments();
    setShowComments(!showComments);
  };

  const handleCommentClick = () => {
    if (!showComments) {
      if (comments.length === 0) loadComments();
      setShowComments(true);
    }
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onComment(post.id, commentText.trim(), replyTo || undefined);
      setCommentText('');
      setReplyTo(null);
      await loadComments();
    } catch {
      toast.error('Failed to add comment.');
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await communityApi.deleteComment(commentId);
      await loadComments();
    } catch {
      toast.error('Failed to delete comment.');
    }
  };

  // Format content with hashtag and @mention highlighting
  const formattedContent = post.content.split(/(#\w+|@[a-zA-Z0-9._-]+)/g).map((part, i) =>
    part.startsWith('#') ? (
      <span key={i} className="text-primary-600 hover:underline cursor-pointer font-medium">{part}</span>
    ) : part.startsWith('@') ? (
      <span key={i} className="text-primary-600 hover:underline cursor-pointer font-semibold">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );

  return (
    <>
    <article ref={postCardRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Pin banner */}
      {post.isPinned && (
        <div className="bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 flex items-center gap-1.5 border-b border-amber-100">
          <FireIcon className="w-3.5 h-3.5" />
          Pinned Post
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-4 flex items-start gap-3">
        <Link href={`/profile/${post.author.id}`} prefetch={false}>
          <Avatar author={post.author} size={40} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href={`/profile/${post.author.id}`} prefetch={false} className="text-[15px] font-bold text-gray-900 hover:underline">
              {getAuthorName(post.author)}
            </Link>
            <ReputationBadge score={post.author.reputationScore} />
            {post.type !== 'discussion' && (
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${typeConfig.light}`}>
                {typeConfig.emoji} {typeConfig.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>{getAuthorTitle(post.author)}</span>
            {getAuthorOrg(post.author) && (
              <>
                <span>at</span>
                <span className="font-medium text-gray-500">{getAuthorOrg(post.author)}</span>
              </>
            )}
            <span>{'\u00B7'}</span>
            <span>{timeAgo(post.createdAt)}</span>
            {post.editedAt && (
              <>
                <span>{'\u00B7'}</span>
                <span className="italic text-gray-400">edited</span>
              </>
            )}
            <span>{'\u00B7'}</span>
            <GlobeAltIcon className="w-3 h-3 text-gray-400" />
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-20">
                <button
                  onClick={() => { handleSaveToggle(); setShowMenu(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {saved ? <BookmarkSolidIcon className="w-5 h-5 text-primary-500" /> : <BookmarkIcon className="w-5 h-5" />}
                  {saved ? 'Unsave Post' : 'Save Post'}
                </button>
                {userId === post.authorId && canEdit && (
                  <button
                    onClick={() => { setEditing(true); setEditContent(post.content); setShowMenu(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                    Edit Post
                  </button>
                )}
                {userId === post.authorId && (
                  <button
                    onClick={() => { onDelete(post.id); setShowMenu(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="w-5 h-5" />
                    Delete Post
                  </button>
                )}
                {userId && userId !== post.authorId && (
                  <>
                    <button
                      onClick={() => { onFollowToggle(post.authorId); setShowMenu(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {followingIds.has(post.authorId) ? (
                        <><UserMinusIcon className="w-5 h-5" /> Unfollow {getAuthorName(post.author)}</>
                      ) : (
                        <><UserPlusIcon className="w-5 h-5" /> Follow {getAuthorName(post.author)}</>
                      )}
                    </button>
                    <button
                      onClick={() => { setShowReport(true); setShowMenu(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FlagIcon className="w-5 h-5" />
                      Report Post
                    </button>
                    <button
                      onClick={async () => {
                        setShowMenu(false);
                        try {
                          await communityApi.blockUser(post.authorId);
                          toast.success('User blocked. Their posts will be hidden from your feed.');
                        } catch (err: any) {
                          if (err?.message?.includes('already blocked')) {
                            toast.info('User is already blocked.');
                          } else {
                            toast.error('Failed to block user.');
                          }
                        }
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <NoSymbolIcon className="w-5 h-5" />
                      Block User
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-3">
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
              maxLength={5000}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving || !editContent.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {editSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[15px] text-gray-900 leading-relaxed whitespace-pre-wrap">{formattedContent}</p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-primary-600 text-[13px] font-medium hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className={`mt-3 grid gap-1 rounded-xl overflow-hidden ${
            post.images.length === 1 ? 'grid-cols-1' :
            post.images.length === 2 ? 'grid-cols-2' :
            post.images.length === 3 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}>
            {post.images.slice(0, 4).map((url, i) => (
              <button
                key={i}
                onClick={() => setLightboxUrl(url)}
                className={`relative block bg-gray-100 overflow-hidden cursor-pointer ${
                  post.images!.length === 1 ? 'aspect-video' :
                  post.images!.length === 3 && i === 0 ? 'row-span-2 aspect-square' :
                  'aspect-square'
                }`}
              >
                <img
                  src={url.includes('cloudinary.com') ? url.replace('/upload/', '/upload/w_600,c_limit,f_auto,q_auto/') : url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {i === 3 && post.images!.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">+{post.images!.length - 4}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Gig Preview Card */}
        {post.gig && (
          <Link
            href={`/gigs/${post.gig.id}`}
            className="block mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                <BriefcaseIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{post.gig.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  {(post.gig.budgetMin || post.gig.budgetMax) && (
                    <span className="font-medium text-gray-700">
                      {post.gig.currency}{' '}
                      {post.gig.budgetMin && post.gig.budgetMax
                        ? `${post.gig.budgetMin} - ${post.gig.budgetMax}`
                        : post.gig.budgetMin || `Up to ${post.gig.budgetMax}`}
                    </span>
                  )}
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    post.gig.status === 'completed' ? 'bg-green-100 text-green-700' :
                    post.gig.status === 'open' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {post.gig.status}
                  </span>
                </div>
                {post.gig.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.gig.requiredSkills.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-medium rounded-full">
                        {skill}
                      </span>
                    ))}
                    {post.gig.requiredSkills.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{post.gig.requiredSkills.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Engagement stats */}
      {(post.likeCount > 0 || post.commentCount > 0 || post.viewCount > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-[13px] text-gray-500">
          <div className="flex items-center gap-1.5">
            {post.likeCount > 0 && (
              <>
                <span className="flex items-center -space-x-1">
                  <span className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <HandThumbUpIcon className="w-3 h-3 text-white" />
                  </span>
                  <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <HeartIcon className="w-3 h-3 text-white" />
                  </span>
                </span>
                <span className="hover:underline cursor-pointer">
                  {post.isLiked && post.likeCount === 1
                    ? 'You'
                    : post.isLiked
                      ? `You and ${post.likeCount - 1} other${post.likeCount - 1 !== 1 ? 's' : ''}`
                      : `${post.likeCount}`}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {post.viewCount > 0 && (
              <span className="flex items-center gap-1">
                <EyeIcon className="w-3.5 h-3.5" />
                {post.viewCount} view{post.viewCount !== 1 ? 's' : ''}
              </span>
            )}
            {post.commentCount > 0 && (
              <button onClick={handleToggleComments} className="hover:underline cursor-pointer">
                {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mx-4 border-t border-gray-100" />
      <div className="flex items-center px-2">
        <button
          onClick={() => onLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg mx-1 my-1 transition-colors ${
            post.isLiked
              ? 'text-primary-600 hover:bg-primary-50'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {post.isLiked ? <ThumbUpSolidIcon className="w-5 h-5" /> : <HandThumbUpIcon className="w-5 h-5" />}
          Like
        </button>
        <button
          onClick={handleCommentClick}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg mx-1 my-1 transition-colors"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          Comment
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg mx-1 my-1 transition-colors"
        >
          <ShareIcon className="w-5 h-5" />
          Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3">
          {loadingComments && comments.length === 0 ? (
            <div className="flex justify-center py-3">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* View more comments */}
              {post.commentCount > comments.length && comments.length > 0 && (
                <button className="text-[13px] font-semibold text-gray-500 hover:text-gray-700">
                  View more comments
                </button>
              )}
              {comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  userId={userId}
                  onReply={(parentId) => {
                    setReplyTo(parentId);
                    commentInputRef.current?.focus();
                  }}
                  onDelete={handleDeleteComment}
                />
              ))}
            </>
          )}

          {/* Comment input */}
          {userId && (
            <div className="flex gap-2 pt-1">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0" />
              <div className="flex-1">
                {replyTo && (
                  <div className="flex items-center gap-2 mb-1.5 text-[11px] text-gray-400">
                    <span>Replying</span>
                    <button onClick={() => setReplyTo(null)} className="text-red-400 hover:text-red-600 font-semibold">Cancel</button>
                  </div>
                )}
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  <input
                    ref={commentInputRef}
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); } }}
                    className="flex-1 text-[13px] bg-transparent outline-none placeholder:text-gray-400"
                  />
                  <div className="flex items-center gap-1 ml-2">
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <FaceSmileIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || submitting}
                      className="text-primary-600 hover:text-primary-700 disabled:text-gray-300 p-1 transition-colors"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
    {showReport && (
      <ReportModal type="post" targetId={post.id} onClose={() => setShowReport(false)} />
    )}
    {lightboxUrl && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        onClick={() => setLightboxUrl(null)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setLightboxUrl(null); }}
          className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors z-10"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <img
          src={lightboxUrl}
          alt=""
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )}
    </>
  );
}

// ===================================================================
// LEFT SIDEBAR - Profile Card
// ===================================================================

function ProfileSidebar({ user, onMediaUpdated }: { user: any; onMediaUpdated: () => Promise<void> }) {
  const toast = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const name = user?.studentProfile
    ? `${user.studentProfile.firstName || ''} ${user.studentProfile.lastName || ''}`.trim()
    : user?.employerProfile?.contactPerson || user?.email?.split('@')[0] || 'User';
  const title = user?.studentProfile?.professionalTitle || (user?.role === 'student' ? 'Student' : 'Employer');
  const org = user?.studentProfile?.university || user?.employerProfile?.businessName || '';

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const result = await uploadsApi.uploadAvatar(file);
      await usersApi.updateMedia({ avatarUrl: result.url });
      await onMediaUpdated();
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const result = await uploadsApi.uploadAvatar(file);
      await usersApi.updateMedia({ bannerUrl: result.url });
      await onMediaUpdated();
      toast.success('Cover photo updated!');
    } catch {
      toast.error('Failed to upload cover');
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cover — clickable to upload banner */}
      <div
        onClick={() => bannerInputRef.current?.click()}
        role="button"
        tabIndex={0}
        className="relative w-full h-20 group cursor-pointer overflow-hidden"
      >
        {user?.bannerUrl ? (
          <img
            src={user.bannerUrl.includes('/uploads/') ? `${user.bannerUrl}?w=640&h=160` : user.bannerUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-primary-500 via-primary-600 to-purple-600" />
        )}
        <div className="absolute inset-0 hidden group-hover:flex bg-black/30 items-center justify-center transition-colors">
          <CameraIcon className="w-5 h-5 text-white" />
        </div>
        {uploadingBanner && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleBannerUpload}
      />

      {/* Avatar — clickable to upload */}
      <div className="px-4 pb-4 -mt-7">
        <div
          onClick={() => avatarInputRef.current?.click()}
          role="button"
          tabIndex={0}
          className="relative w-14 h-14 group cursor-pointer"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl.includes('/uploads/') ? `${user.avatarUrl}?w=112&h=112` : user.avatarUrl}
              alt=""
              className="w-14 h-14 rounded-full object-cover border-3 border-white"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-lg font-bold border-3 border-white">
              {name[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="absolute inset-0 rounded-full hidden group-hover:flex bg-black/30 items-center justify-center">
            <CameraIcon className="w-4 h-4 text-white" />
          </div>
          {uploadingAvatar && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarUpload}
        />

        <h3 className="text-sm font-bold text-gray-900 mt-2">{name}</h3>
        <p className="text-xs text-gray-500">{title}</p>
        {org && <p className="text-xs text-gray-400">{org}</p>}

        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <Link href="/dashboard/profile" className="flex items-center justify-between text-xs group">
            <span className="text-gray-500">Profile views</span>
            <span className="font-bold text-primary-600 group-hover:underline">24</span>
          </Link>
          <Link href="/dashboard" className="flex items-center justify-between text-xs group">
            <span className="text-gray-500">Gigs completed</span>
            <span className="font-bold text-primary-600 group-hover:underline">
              {user?.studentProfile?.gigsCompleted || 0}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// SKELETON POST CARD - Loading placeholder
// ===================================================================

function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-3.5 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-2.5 bg-gray-100 rounded w-24" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
      <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
        <div className="h-3 bg-gray-100 rounded w-12" />
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-3 bg-gray-100 rounded w-10" />
      </div>
    </div>
  );
}

// ===================================================================
// LEFT SIDEBAR - Quick Links
// ===================================================================

function QuickLinks({ onSavedClick }: { onSavedClick?: () => void }) {
  const links = [
    { Icon: UserGroupIcon, label: 'My Network', href: '/talent' },
    { Icon: BriefcaseIcon, label: 'Browse Gigs', href: '/gigs' },
    { Icon: CalendarIcon, label: 'Events', href: '#' },
    { Icon: AcademicCapIcon, label: 'Learning', href: '/resources' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
      {onSavedClick && (
        <button
          onClick={onSavedClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors w-full text-left"
        >
          <BookmarkIcon className="w-5 h-5 text-gray-400" />
          Saved Posts
        </button>
      )}
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          <link.Icon className="w-5 h-5 text-gray-400" />
          {link.label}
        </Link>
      ))}
    </div>
  );
}

// ===================================================================
// RIGHT SIDEBAR - Trending
// ===================================================================

function TrendingSidebar({ onTagClick, activeTag }: { onTagClick: (tag: string) => void; activeTag?: string }) {
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    communityApi.getTrendingTags({ days: 7, limit: 8 })
      .then((data) => {
        setTags(data.length > 0 ? data : FALLBACK_TAGS.map((t) => ({ tag: t, count: 0 })));
        setLoaded(true);
      })
      .catch(() => {
        setTags(FALLBACK_TAGS.map((t) => ({ tag: t, count: 0 })));
        setLoaded(true);
      });
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <ArrowTrendingUpIcon className="w-5 h-5 text-gray-700" />
        <h3 className="text-sm font-bold text-gray-900">Trending</h3>
      </div>
      <div className="space-y-3">
        {(loaded ? tags : FALLBACK_TAGS.map((t) => ({ tag: t, count: 0 }))).slice(0, 6).map((item, idx) => (
          <button
            key={item.tag}
            onClick={() => onTagClick(activeTag === item.tag ? '' : item.tag)}
            className={`group cursor-pointer w-full text-left ${
              activeTag === item.tag ? 'bg-primary-50 -mx-2 px-2 py-1 rounded-lg' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono w-5">{idx + 1}.</span>
              <div>
                <span className={`text-sm font-semibold transition-colors ${
                  activeTag === item.tag ? 'text-primary-600' : 'text-gray-900 group-hover:text-primary-600'
                }`}>
                  #{item.tag}
                </span>
                {item.count > 0 && (
                  <p className="text-[11px] text-gray-400">{item.count} posts</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ===================================================================
// RIGHT SIDEBAR - Who to Connect With
// ===================================================================

function SuggestedConnections() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    usersApi.getSuggestions(5)
      .then(setSuggestions)
      .catch(() => {});
  }, [user]);

  if (!user || suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3">People you may know</h3>
      <div className="space-y-3">
        {suggestions.map((s) => {
          const name = s.studentProfile
            ? `${s.studentProfile.firstName} ${s.studentProfile.lastName}`
            : s.employerProfile?.contactPerson || s.employerProfile?.businessName || 'User';
          const org = s.studentProfile?.university || s.employerProfile?.businessName || '';
          const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
          const isStudent = s.role === 'student';

          return (
            <Link key={s.id} href={`/profile/${s.id}`} prefetch={false} className="flex items-center gap-3 group">
              {s.avatarUrl ? (
                <img src={s.avatarUrl.includes('/uploads/') ? `${s.avatarUrl}?w=80&h=80` : s.avatarUrl} alt={name} className="w-10 h-10 rounded-full object-cover" loading="lazy" decoding="async" />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  isStudent ? 'bg-linear-to-br from-primary-400 to-primary-600' : 'bg-linear-to-br from-amber-400 to-amber-600'
                }`}>
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{name}</p>
                <p className="text-[11px] text-gray-400 truncate">{org}</p>
              </div>
            </Link>
          );
        })}
      </div>
      <Link href="/talent" className="block text-xs font-semibold text-gray-500 hover:text-gray-700 mt-3 w-full text-center">
        View all recommendations {'\u2192'}
      </Link>
    </div>
  );
}

// ===================================================================
// MAIN PAGE
// ===================================================================

export default function CommunityPage() {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [activeTag, setActiveTag] = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [feedTab, setFeedTab] = useState<'for-you' | 'following' | 'saved'>('for-you');
  const [newPostsBanner, setNewPostsBanner] = useState(0);
  const newPostsQueueRef = useRef<CommunityPost[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // ── Real-time WebSocket ──
  const { joinPost, leavePost, emitTyping } = useCommunitySocket(!!user, {
    onNewPost: (post) => {
      // Don't show own posts (already added via handlePost)
      if (post.authorId === user?.id) return;
      newPostsQueueRef.current = [post, ...newPostsQueueRef.current];
      setNewPostsBanner((prev) => prev + 1);
    },
    onPostUpdated: (post) => {
      setPosts((prev) => prev.map((p) =>
        p.id === post.id ? { ...p, content: post.content, tags: post.tags, editedAt: post.editedAt } : p,
      ));
    },
    onPostDeleted: ({ postId }) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    },
    onLikeUpdated: ({ postId, likeCount }) => {
      setPosts((prev) => prev.map((p) =>
        p.id === postId ? { ...p, likeCount } : p,
      ));
    },
    onCommentCountUpdated: ({ postId, commentCount }) => {
      setPosts((prev) => prev.map((p) =>
        p.id === postId ? { ...p, commentCount: commentCount ?? p.commentCount } : p,
      ));
    },
  });

  const showNewPosts = () => {
    setPosts((prev) => [...newPostsQueueRef.current, ...prev]);
    newPostsQueueRef.current = [];
    setNewPostsBanner(0);
  };

  const fetchFeed = useCallback(async (p = 1, type = typeFilter, tab = feedTab) => {
    setLoading(true);
    try {
      if (tab === 'saved' && user) {
        const res = await communityApi.getSavedPosts({ page: p, limit: 10 });
        if (p === 1) {
          setPosts(res.items);
        } else {
          setPosts((prev) => [...prev, ...res.items]);
        }
        setPage(res.page);
        setTotalPages(res.pages);
        setLoading(false);
        return;
      }
      const res = tab === 'following' && user
        ? await communityApi.getFollowingFeed({ page: p, limit: 10, type: type || undefined })
        : await communityApi.getFeed({
            page: p,
            limit: 10,
            type: type || undefined,
            authenticated: !!user,
          });
      if (p === 1) {
        setPosts(res.items);
      } else {
        setPosts((prev) => [...prev, ...res.items]);
      }
      setTotalPages(res.pages);
      setPage(p);
    } catch {
      toast.error('Failed to load feed. Please try again.');
    }
    setLoading(false);
  }, [user, typeFilter, feedTab]);

  const performSearch = useCallback(async (q: string, p = 1) => {
    if (!q.trim()) {
      setSearchMode(false);
      fetchFeed(1);
      return;
    }
    setLoading(true);
    setSearchMode(true);
    try {
      const res = await communityApi.search({
        q: q.trim(),
        type: typeFilter || undefined,
        tags: activeTag || undefined,
        page: p,
        limit: 10,
      });
      if (p === 1) {
        setPosts(res.items);
      } else {
        setPosts((prev) => [...prev, ...res.items]);
      }
      setTotalPages(res.pages);
      setPage(p);
    } catch {
      toast.error('Search failed. Please try again.');
    }
    setLoading(false);
  }, [typeFilter, activeTag]);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      if (value.trim()) {
        performSearch(value, 1);
      } else {
        setSearchMode(false);
        setActiveTag('');
        fetchFeed(1);
      }
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchMode(false);
    setActiveTag('');
    fetchFeed(1);
  };

  const handleTagClick = (tag: string) => {
    if (tag) {
      setActiveTag(tag);
      setSearchQuery(`#${tag}`);
      setSearchMode(true);
      setLoading(true);
      communityApi.search({ q: tag, tags: tag, page: 1, limit: 10 })
        .then((res) => {
          setPosts(res.items);
          setTotalPages(res.pages);
          setPage(1);
        })
        .catch(() => toast.error('Failed to filter by tag.'))
        .finally(() => setLoading(false));
    } else {
      clearSearch();
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  // Infinite scroll — intersection observer
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages && !loading && !loadingMore) {
          setLoadingMore(true);
          const loadNext = searchMode
            ? performSearch(searchQuery, page + 1)
            : fetchFeed(page + 1);
          loadNext.finally(() => setLoadingMore(false));
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, totalPages, loading, loadingMore, searchMode, searchQuery, fetchFeed, performSearch]);

  const handlePost = async (data: { content: string; type: string; tags: string[]; images?: string[] }) => {
    await communityApi.createPost(data);
    await fetchFeed(1);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      const result = await communityApi.toggleLikePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: result.liked, likeCount: p.likeCount + (result.liked ? 1 : -1) }
            : p,
        ),
      );
    } catch {
      toast.error('Failed to like post.');
    }
  };

  const handleComment = async (postId: string, content: string, parentId?: string) => {
    await communityApi.createComment(postId, content, parentId);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p,
      ),
    );
  };

  const handleDelete = async (postId: string) => {
    try {
      await communityApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post deleted.');
    } catch {
      toast.error('Failed to delete post.');
    }
  };

  const handleUpdate = async (postId: string, data: { content?: string; tags?: string[] }) => {
    try {
      const updated = await communityApi.updatePost(postId, data);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, content: updated.content, tags: updated.tags, editedAt: updated.editedAt } : p,
        ),
      );
      toast.success('Post updated.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update post.');
      throw err;
    }
  };

  // Load followed user IDs for the logged-in user
  useEffect(() => {
    if (!user) return;
    usersApi
      .getFollowing(user.id, 1, 1000)
      .then((res) => {
        setFollowingIds(new Set(res.data.map((f) => f.followingId)));
      })
      .catch(() => {});
  }, [user]);

  const handleFollowToggle = async (targetId: string) => {
    if (!user) return;
    try {
      if (followingIds.has(targetId)) {
        await usersApi.unfollowUser(targetId);
        setFollowingIds((prev) => { const next = new Set(prev); next.delete(targetId); return next; });
        toast.success('Unfollowed.');
      } else {
        await usersApi.followUser(targetId);
        setFollowingIds((prev) => new Set(prev).add(targetId));
        toast.success('Followed!');
      }
    } catch {
      toast.error('Failed to update follow.');
    }
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
  };

  const handleFeedTabChange = (tab: 'for-you' | 'following' | 'saved') => {
    setFeedTab(tab);
    setSearchMode(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Nav Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-primary-600 font-black text-lg">In</Link>
            <div className="relative hidden sm:block">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search community..."
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm bg-gray-100 rounded-lg w-64 outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Filter tabs */}
            <div className="hidden md:flex items-center gap-1 mr-4">
              <button
                onClick={() => handleTypeFilter('')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  !typeFilter ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {Object.entries(POST_TYPES).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleTypeFilter(key)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    typeFilter === key ? `${config.light}` : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{config.emoji}</span>
                  <span className="hidden lg:inline">{config.label}</span>
                </button>
              ))}
            </div>

            {user && (
              <>
                <button className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                  <BellIcon className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <button className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout - 3-column */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-6">
          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block space-y-4 self-start sticky top-20">
            {user ? (
              <>
                <ProfileSidebar user={user} onMediaUpdated={refreshProfile} />
                <QuickLinks onSavedClick={() => handleFeedTabChange('saved')} />
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                <SparklesIcon className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-900 mb-1">Join the Community</h3>
                <p className="text-xs text-gray-500 mb-4">Create posts, like, comment, and connect with others.</p>
                <Link
                  href="/auth/register"
                  className="block w-full text-center px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
                >
                  Sign Up Free
                </Link>
                <Link
                  href="/auth/login"
                  className="block w-full text-center px-4 py-2 mt-2 text-sm font-semibold text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </aside>

          {/* CENTER - FEED */}
          <main className="min-w-0 space-y-4">
            {/* Stories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <StoryBar />
            </div>

            {/* Compose */}
            {user && <ComposePost user={user} onPost={handlePost} />}

            {/* Feed tabs: For You / Following / Saved */}
            {user && (
              <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => handleFeedTabChange('for-you')}
                  className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors ${
                    feedTab === 'for-you'
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  For You
                </button>
                <button
                  onClick={() => handleFeedTabChange('following')}
                  className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors ${
                    feedTab === 'following'
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Following
                </button>
                <button
                  onClick={() => handleFeedTabChange('saved')}
                  className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors ${
                    feedTab === 'saved'
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Saved
                </button>
              </div>
            )}

            {/* Mobile filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:hidden">
              <button
                onClick={() => handleTypeFilter('')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-colors ${
                  !typeFilter ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                All
              </button>
              {Object.entries(POST_TYPES).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleTypeFilter(key)}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-colors ${
                    typeFilter === key ? `${config.light}` : 'bg-white text-gray-500 border border-gray-200'
                  }`}
                >
                  {config.emoji} {config.label}
                </button>
              ))}
            </div>

            {/* Sort bar / Search banner */}
            {searchMode ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-primary-50 rounded-xl border border-primary-100">
                <MagnifyingGlassIcon className="w-4 h-4 text-primary-500 shrink-0" />
                <p className="text-sm text-primary-700 flex-1">
                  {activeTag ? (
                    <>Showing posts tagged <span className="font-bold">#{activeTag}</span></>
                  ) : (
                    <>Results for &ldquo;<span className="font-bold">{searchQuery}</span>&rdquo;</>
                  )}
                </p>
                <button
                  onClick={clearSearch}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">Sort by: </span>
                <button className="text-xs font-semibold text-gray-600 hover:text-gray-900">
                  Most Recent <ChevronDownIcon className="w-3 h-3 inline" />
                </button>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}

            {/* New posts banner */}
            {newPostsBanner > 0 && !searchMode && feedTab !== 'saved' && (
              <button
                onClick={showNewPosts}
                className="w-full py-2.5 text-sm font-semibold text-primary-600 bg-primary-50 rounded-xl border border-primary-200 hover:bg-primary-100 transition-colors animate-pulse"
              >
                {newPostsBanner === 1 ? '1 new post' : `${newPostsBanner} new posts`} — tap to see
              </button>
            )}

            {/* Posts */}
            {loading && posts.length === 0 ? (
              <div className="space-y-4">
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                {searchMode ? (
                  <>
                    <MagnifyingGlassIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-600 mb-2">No results found</h3>
                    <p className="text-sm text-gray-400 mb-6">Try a different search term or browse the feed.</p>
                    <button
                      onClick={clearSearch}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
                    >
                      Back to Feed
                    </button>
                  </>
                ) : feedTab === 'following' ? (
                  <>
                    <UserGroupIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-600 mb-2">No posts from people you follow</h3>
                    <p className="text-sm text-gray-400 mb-6">Follow more people to see their posts here, or switch to the For You feed.</p>
                    <button
                      onClick={() => handleFeedTabChange('for-you')}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
                    >
                      Browse For You
                    </button>
                  </>
                ) : feedTab === 'saved' ? (
                  <>
                    <BookmarkIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-600 mb-2">No saved posts yet</h3>
                    <p className="text-sm text-gray-400 mb-6">Bookmark posts you want to revisit later and they&apos;ll appear here.</p>
                    <button
                      onClick={() => handleFeedTabChange('for-you')}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
                    >
                      Browse Feed
                    </button>
                  </>
                ) : (
                  <>
                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-600 mb-2">No posts yet</h3>
                    <p className="text-sm text-gray-400 mb-6">Be the first to share something with the community!</p>
                    {!user && (
                      <Link
                        href="/auth/register"
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
                      >
                        Join Now
                      </Link>
                    )}
                  </>
                )}
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userId={user?.id}
                    followingIds={followingIds}
                    onFollowToggle={handleFollowToggle}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                ))}

                {/* Infinite scroll sentinel + skeleton loaders */}
                {page < totalPages && (
                  <>
                    <div ref={loadMoreRef} className="h-1" />
                    {loadingMore && (
                      <>
                        <PostCardSkeleton />
                        <PostCardSkeleton />
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden lg:block space-y-4 self-start sticky top-20">
            <TrendingSidebar onTagClick={handleTagClick} activeTag={activeTag} />
            <SuggestedConnections />

            {/* Footer links */}
            <div className="px-2 text-[11px] text-gray-400 space-y-1">
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                <Link href="/about" className="hover:underline">About</Link>
                <Link href="/help" className="hover:underline">Help</Link>
                <Link href="/privacy" className="hover:underline">Privacy</Link>
                <Link href="/terms" className="hover:underline">Terms</Link>
              </div>
              <p>Intemso {'\u00A9'} {new Date().getFullYear()}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
