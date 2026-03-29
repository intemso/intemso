# Intemso Community Platform — Implementation Roadmap

> A phased plan to transform the community from an isolated social feed into a fully integrated, production-ready social platform synced with the Intemso gig marketplace.

---

## Phase 1: Foundation & Navigation (Critical Path)

**Goal:** Make the community discoverable and fix silent failures so users actually know what's happening.

### 1.1 — Add "Community" to Main Navbar
- Add Community link to main navigation between "Find Talent" and "Why Intemso"
- Add active state highlighting when on `/community`
- Add mobile menu Community link
- Files: `apps/web/src/components/layout/Navbar.tsx`

### 1.2 — Toast Notification System (Frontend)
- Create a reusable Toast/Alert component (success, error, warning, info)
- Replace all silent `catch { /* ignore */ }` blocks in community page with user-facing error toasts
- Show success feedback on: post created, comment added, post deleted
- Show error feedback on: network failure, auth expired, validation error
- Files: `apps/web/src/components/ui/Toast.tsx`, `apps/web/src/app/community/page.tsx`

### 1.3 — Rate Limiting on Community API
- Add `@nestjs/throttler` to community endpoints
- Limits: 5 posts/min, 20 comments/min, 60 likes/min
- Return 429 with clear error message
- Files: `apps/api/src/community/community.controller.ts`, `apps/api/src/app.module.ts`

### 1.4 — Input Sanitization
- Sanitize post/comment content server-side (strip HTML tags, prevent script injection)
- Validate image URLs (must be valid URL format, optionally whitelist domains)
- Cap tags array at 5 items server-side (already done client-side)
- Files: `apps/api/src/community/community.service.ts`, `apps/api/src/community/dto/create-post.dto.ts`

---

## Phase 2: User Profiles & Identity

**Goal:** Make community users clickable, browsable, and real — not anonymous text.

### 2.1 — Public User Profile API
- Create `GET /api/v1/users/:id/profile` endpoint (public, read-only)
- Returns: name, avatar, role, university/business, bio, gigs completed, rating, join date
- Returns: user's community posts (paginated)
- Does NOT return: email, password, tokens, private settings
- Files: `apps/api/src/users/users.controller.ts`, `apps/api/src/users/users.service.ts`

### 2.2 — Public Profile Page (Frontend)
- Create `/profile/[id]/page.tsx` — public user profile
- Sections: cover + avatar, name/title/org, stats (gigs, rating, posts), bio
- Tab: Community Posts — user's posts feed
- Tab: Reviews — reviews received
- Tab: Gigs — completed gigs (student) or posted gigs (employer)
- Files: `apps/web/src/app/profile/[id]/page.tsx`

### 2.3 — Link Author Names to Profiles
- Replace all `href="#"` on author names in PostCard/CommentItem with `/profile/{authorId}`
- Make avatars clickable too
- Files: `apps/web/src/app/community/page.tsx`

### 2.4 — Community API: Get Posts by User
- Add `GET /api/v1/community/feed/user/:userId` endpoint
- Paginated, returns that user's posts
- Files: `apps/api/src/community/community.controller.ts`, `apps/api/src/community/community.service.ts`

---

## Phase 3: Notifications & Activity Sync

**Goal:** When something happens in community, users know about it everywhere on the platform.

### 3.1 — Notification Service Integration
- Inject existing `Notification` model into community events
- Trigger notifications on:
  - Someone likes your post
  - Someone comments on your post
  - Someone replies to your comment
  - Your post is pinned by admin
  - Someone mentions you (future: @mentions)
- Notification types: `community_like`, `community_comment`, `community_reply`, `community_pin`
- Files: `apps/api/src/community/community.service.ts`, `apps/api/src/notifications/` (may need new module)

### 3.2 — Notification Bell Integration
- Community notifications appear in the existing Navbar notification dropdown
- Show notification count badge
- Click notification → navigate to the specific post
- Files: `apps/web/src/components/layout/Navbar.tsx`

### 3.3 — Dashboard Community Card
- Add "Community Activity" card to dashboard overview page
- Shows: your recent posts (last 3), total likes received, unread replies count
- "View Community →" link
- Files: `apps/web/src/app/dashboard/page.tsx`

---

## Phase 4: Content Moderation & Safety

**Goal:** Protect the community from abuse before it has real users.

### 4.1 — Report System (Backend)
- Wire existing `Report` model to community
- Create `POST /api/v1/community/posts/:id/report` endpoint
- Create `POST /api/v1/community/comments/:id/report` endpoint
- Report reasons: spam, harassment, inappropriate, misinformation, other
- One report per user per item (prevent spam reports)
- Files: `apps/api/src/community/community.controller.ts`, `apps/api/src/community/community.service.ts`, new DTO

### 4.2 — Report UI (Frontend)
- Add "Report" option to PostCard 3-dot menu
- Add "Report" option to CommentItem (on hover)
- Report modal: reason selector + optional description
- Success toast: "Report submitted. We'll review it."
- Files: `apps/web/src/app/community/page.tsx`

### 4.3 — Admin Moderation Queue
- Create admin-only endpoint: `GET /api/v1/admin/reports` (paginated, filterable)
- Admin actions: dismiss report, hide post, delete post, warn user, suspend user
- Create basic admin page: `/dashboard/admin/moderation`
- Files: new admin module/controller, new frontend page

### 4.4 — Block User System
- Create `BlockedUser` model: blockerId, blockedId
- `POST /api/v1/users/:id/block` and `DELETE /api/v1/users/:id/block`
- Blocked users' posts are hidden from your feed
- Blocked users can't comment on your posts
- Files: schema update, users controller/service, community service filter

---

## Phase 5: Search & Discovery

**Goal:** Make content findable. Make trending real.

### 5.1 — Community Search API
- Create `GET /api/v1/community/search?q=...` endpoint
- Full-text search on post content and tags
- Paginated results with relevance scoring
- Optional filters: type, author, date range, tags
- Files: `apps/api/src/community/community.controller.ts`, `apps/api/src/community/community.service.ts`

### 5.2 — Wire Search Bar (Frontend)
- Connect the community nav search bar to the search API
- Show search results in feed area (replaces normal feed while searching)
- Debounced input (300ms)
- Clear search button to return to normal feed
- Files: `apps/web/src/app/community/page.tsx`

### 5.3 — Real Trending Tags API
- Create `GET /api/v1/community/trending` endpoint
- Aggregates tags from posts created in the last 7 days
- Returns top 10 tags with actual post counts
- Cache result for 5 minutes (avoid expensive re-query)
- Files: `apps/api/src/community/community.controller.ts`, `apps/api/src/community/community.service.ts`

### 5.4 — Wire Trending Sidebar to Real Data
- Replace hardcoded `TRENDING_TAGS` with API call to trending endpoint
- Click a trending tag → filter feed by that tag
- Files: `apps/web/src/app/community/page.tsx`

### 5.5 — Suggested Connections (Real Data)
- Create `GET /api/v1/users/suggestions` endpoint
- Returns users from same university, similar skills, or active in community
- Replace hardcoded suggestions with real data
- Files: `apps/api/src/users/users.controller.ts`, `apps/web/src/app/community/page.tsx`

---

## Phase 6: Gig-Community Bridge ✅

**Goal:** Connect the community to the core marketplace so they reinforce each other.

### 6.1 — Auto-Achievement Posts
- When a contract is marked complete, auto-generate an Achievement post:
  - "🏆 [Student Name] just completed '[Gig Title]' for [Employer Name]!"
  - Tagged with gig category
  - Links to gig (if public) or student profile
- Configurable: user can opt-out in settings
- Files: `apps/api/src/contracts/` (or wherever contract completion happens), `apps/api/src/community/community.service.ts`

### 6.2 — Gig Discussion Posts
- Add "Discuss on Community" button to gig detail page
- Creates a Discussion post linked to the gig (new `gigId` field on CommunityPost)
- On gig page, show link to community discussion if one exists
- Files: schema migration (add optional `gigId` to CommunityPost), gig detail page, community service

### 6.3 — Community Post Types for Gigs
- Add new PostType values: `gig_posted`, `gig_completed`, `review_received`
- These auto-generated posts have special card designs (show gig preview, rating stars)
- Files: schema enum update, community page PostCard

### 6.4 — Cross-Post Gig to Community Feed
- When employer creates a gig, option to cross-post to community
- Shows as a special "Gig" card with title, budget, apply button
- Click → navigates to gig detail page
- Files: `apps/web/src/app/post-gig/` page, community service

---

## Phase 7: Social Graph (Follow System) ✅

**Goal:** Personalized feeds. Network effects. User retention.

### 7.1 — Follow Model ✅
- New schema: `UserFollow` (followerId, followingId, createdAt)
- Unique constraint: one follow per pair
- Add follower/following counts to user
- Files: `packages/database/prisma/schema.prisma`, migration

### 7.2 — Follow API ✅
- `POST /api/v1/users/:id/follow` — follow a user
- `DELETE /api/v1/users/:id/follow` — unfollow
- `GET /api/v1/users/:id/followers` — who follows them
- `GET /api/v1/users/:id/following` — who they follow
- `GET /api/v1/users/:id/follow-status` — isFollowing + counts
- Follow notification: `user_followed` type sent via NotificationsService
- Files: `apps/api/src/users/users.controller.ts`, `apps/api/src/users/users.service.ts`

### 7.3 — Follow UI ✅
- "Follow" / "Following" button on user profiles with optimistic count updates
- Follower/following counts on profile page header
- Follow/unfollow option in PostCard 3-dot menu with per-feed followingIds tracking
- Files: `apps/web/src/app/profile/[id]/page.tsx`, `apps/web/src/app/community/page.tsx`

### 7.4 — Personalized Feed ✅
- Feed tab: "For You" / "Following" switcher (logged-in users only)
- `GET /api/v1/community/feed/following` — posts from followed users, respects block list
- Empty state for "Following" tab with CTA to switch back
- Files: `apps/api/src/community/community.service.ts`, `apps/api/src/community/community.controller.ts`, `apps/api/src/community/community.module.ts`, community page, `apps/web/src/lib/api.ts`

---

## Phase 8: Content Enrichment

**Goal:** Make posts richer and more engaging.

### 8.1 — Post Editing
- Add `PATCH /api/v1/community/posts/:id` endpoint
- Only author can edit, within 24 hours of creation
- Track edit history: `editedAt` timestamp, show "edited" badge
- Files: schema, community service/controller, community page

### 8.2 — Saved Posts (Backend)
- Create `SavedPost` model (userId, postId, createdAt)
- `POST /api/v1/community/posts/:id/save` — toggle save
- `GET /api/v1/community/saved` — get saved posts
- Files: schema, community service/controller

### 8.3 — Saved Posts (Frontend)
- Wire existing "Save Post" button in PostCard menu to real API
- Add "Saved Posts" section accessible from left sidebar
- Files: community page, api.ts

### 8.4 — @Mentions
- Parse @username in post/comment content
- Create mention notifications
- Render mentions as clickable links to profiles
- Autocomplete dropdown when typing @
- Files: community service (parsing), community page (rendering + autocomplete)

---

## Phase 9: Real-Time & Performance

**Goal:** Live updates. Fast at scale.

### 9.1 — WebSocket Gateway
- Add `@nestjs/websockets` + Socket.IO
- Community events broadcast: new post, new comment, like count updates
- User-specific channels for notifications
- Files: new `apps/api/src/gateway/` module

### 9.2 — Live Feed Updates (Frontend)
- Connect to WebSocket on community page mount
- New posts appear at top of feed with animation
- Like/comment counts update in real-time
- Typing indicators on comment input
- Files: community page, new WebSocket hook

### 9.3 — Caching Layer
- Cache trending tags (Redis, 5-min TTL)
- Cache user profiles for community display (Redis, 1-min TTL)
- Cache feed pages for anonymous users (Redis, 30-sec TTL)
- Files: community service, Redis integration

### 9.4 — Infinite Scroll
- Replace "Load more" button with intersection observer
- Automatically load next page when user scrolls near bottom
- Skeleton loading cards while fetching
- Files: community page

---

## Phase 10: Analytics & Reputation

**Goal:** Measure engagement. Reward contributors.

### 10.1 — Post View Tracking
- Track post impressions (when post enters viewport)
- `POST /api/v1/community/posts/:id/view` endpoint
- Show view count on posts (like LinkedIn)
- Files: schema (add `viewCount`), community service, community page

### 10.2 — Community Reputation Score
- Calculate based on: posts created, likes received, comments received, helpful answers
- Display reputation badge on profile and community posts
- Tiers: Newcomer, Active, Contributor, Expert, Leader
- Files: new service, user profile integration

### 10.3 — Analytics Dashboard (Admin)
- Total posts/comments/likes per day/week/month
- Most active users
- Most engaged posts
- Growth metrics
- Files: new admin page

---

## Implementation Priority

| Phase | Effort | Impact | Start After |
|-------|--------|--------|-------------|
| **Phase 1: Foundation** | Small | Critical | Now |
| **Phase 2: Profiles** | Medium | High | Phase 1 |
| **Phase 3: Notifications** | Medium | High | Phase 1 |
| **Phase 4: Moderation** | Medium | Critical (before launch) | Phase 1 |
| **Phase 5: Search** | Medium | High | Phase 2 |
| **Phase 6: Gig Bridge** | Large | Very High | Phase 2 + 3 |
| **Phase 7: Follow System** | Large | High | Phase 2 |
| **Phase 8: Content** | Medium | Medium | Phase 5 |
| **Phase 9: Real-Time** | Large | Medium | Phase 3 |
| **Phase 10: Analytics** | Medium | Low (pre-launch) | Phase 6 |

---

## Status Tracker

- [x] Phase 1: Foundation & Navigation
- [x] Phase 2: User Profiles & Identity
- [x] Phase 3: Notifications & Activity Sync
- [x] Phase 4: Content Moderation & Safety
- [x] Phase 5: Search & Discovery
- [x] Phase 6: Gig-Community Bridge
- [x] Phase 7: Social Graph (Follow System)
- [x] Phase 8: Content Enrichment
- [x] Phase 9: Real-Time & Performance
- [x] Phase 10: Analytics & Reputation
