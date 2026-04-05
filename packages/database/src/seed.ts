import { PrismaClient } from '@prisma/client';
import { GIG_CATEGORIES } from '@intemso/shared';

const prisma = new PrismaClient();

// ---------- helpers ----------
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}
function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000);
}
function hoursAgo(n: number) {
  return new Date(Date.now() - n * 3_600_000);
}

// Pre-hashed "Password1!" with bcrypt 12 rounds
const PASSWORD_HASH =
  '$2b$12$.eK1TvGSI6Gaz/tgpq9nM..NiWDvsiotupNdQ/rXdPbXwBKHaGggO';

// ============================================================
// DATA
// ============================================================
const STUDENTS = [
  { email: 'kwame.asante@student.knust.edu.gh', firstName: 'Kwame', lastName: 'Asante', uni: 'KNUST', title: 'Full-Stack Developer', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'], rate: 45, bio: 'Passionate full-stack developer building modern web experiences. 2+ years of freelance experience with startups across Ghana.', major: 'Computer Science', gradYear: 2026, badge: 'top_rated' as const, completed: 23, earned: 8500, rating: 4.9, ratingCount: 18, successScore: 96 },
  { email: 'ama.mensah@ug.edu.gh', firstName: 'Ama', lastName: 'Mensah', uni: 'University of Ghana', title: 'UI/UX Designer', skills: ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping'], rate: 40, bio: 'Creative designer who turns complex problems into elegant, intuitive interfaces. Love building for African markets.', major: 'Information Technology', gradYear: 2025, badge: 'top_rated' as const, completed: 31, earned: 12400, rating: 4.95, ratingCount: 27, successScore: 99 },
  { email: 'kofi.boateng@ucc.edu.gh', firstName: 'Kofi', lastName: 'Boateng', uni: 'University of Cape Coast', title: 'Mobile App Developer', skills: ['Flutter', 'Dart', 'React Native', 'Firebase', 'Android'], rate: 50, bio: 'Flutter specialist with 15+ published apps on Play Store. I ship fast and iterate based on feedback.', major: 'Computer Engineering', gradYear: 2025, badge: 'rising_talent' as const, completed: 12, earned: 4200, rating: 4.7, ratingCount: 10, successScore: 88 },
  { email: 'abena.owusu@ashesi.edu.gh', firstName: 'Abena', lastName: 'Owusu', uni: 'Ashesi University', title: 'Content Strategist & Writer', skills: ['SEO Writing', 'Copywriting', 'Blog Articles', 'Social Media', 'Brand Voice'], rate: 30, bio: 'Words are my craft. I create content that converts — from brand strategy to viral blog posts.', major: 'Business Administration', gradYear: 2026, badge: 'rising_talent' as const, completed: 18, earned: 3600, rating: 4.8, ratingCount: 14, successScore: 92 },
  { email: 'yaw.adu@gimpa.edu.gh', firstName: 'Yaw', lastName: 'Adu-Gyamfi', uni: 'GIMPA', title: 'Video Editor & Motion Designer', skills: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Motion Graphics', 'Color Grading'], rate: 55, bio: 'Cinematic storytelling through video. I edit for YouTubers, brands, and documentary filmmakers.', major: 'Communications', gradYear: 2025, badge: 'top_rated_plus' as const, completed: 42, earned: 22000, rating: 4.98, ratingCount: 38, successScore: 100 },
  { email: 'efua.tetteh@knust.edu.gh', firstName: 'Efua', lastName: 'Tetteh', uni: 'KNUST', title: 'Data Analyst', skills: ['Python', 'Excel', 'Tableau', 'SQL', 'Power BI'], rate: 35, bio: 'Turning raw data into actionable insights. I help businesses make data-driven decisions.', major: 'Statistics', gradYear: 2026, badge: 'none' as const, completed: 7, earned: 1800, rating: 4.6, ratingCount: 5, successScore: 80 },
  { email: 'kwesi.appiah@uew.edu.gh', firstName: 'Kwesi', lastName: 'Appiah', uni: 'University of Education, Winneba', title: 'Academic Tutor', skills: ['Mathematics', 'Physics', 'Chemistry', 'WASSCE Prep', 'SAT Prep'], rate: 25, bio: 'Helping students excel in STEM subjects. Patient, methodical, and result-oriented teaching approach.', major: 'Mathematics Education', gradYear: 2025, badge: 'rising_talent' as const, completed: 55, earned: 5500, rating: 4.85, ratingCount: 42, successScore: 95 },
  { email: 'akosua.darko@central.edu.gh', firstName: 'Akosua', lastName: 'Darko', uni: 'Central University', title: 'Graphic Designer', skills: ['Photoshop', 'Illustrator', 'InDesign', 'Canva', 'Brand Identity'], rate: 35, bio: 'Visual storyteller specializing in brand identity and marketing materials for SMEs across West Africa.', major: 'Graphic Design', gradYear: 2026, badge: 'none' as const, completed: 9, earned: 2100, rating: 4.5, ratingCount: 7, successScore: 78 },
];

const EMPLOYERS = [
  { email: 'hr@techstartgh.com', bizName: 'TechStart Ghana', bizType: 'startup', contact: 'Nana Yaa Serwaa', desc: 'Early-stage tech startup building fintech solutions for the unbanked in West Africa.', posted: 8, spent: 15000, rating: 4.8, ratingCount: 6 },
  { email: 'projects@accradigital.agency', bizName: 'Accra Digital Agency', bizType: 'agency', contact: 'Kweku Mensah', desc: 'Full-service digital marketing and web agency serving businesses across Ghana.', posted: 15, spent: 42000, rating: 4.9, ratingCount: 12 },
  { email: 'admin@kumasifarms.com', bizName: 'Kumasi Farms Co-op', bizType: 'cooperative', contact: 'Akua Boateng', desc: 'Agricultural cooperative connecting local farmers with urban markets through technology.', posted: 4, spent: 6000, rating: 4.6, ratingCount: 3 },
  { email: 'ops@ghanaedutech.org', bizName: 'Ghana EduTech', bizType: 'ngo', contact: 'Fiifi Anto', desc: 'Non-profit building free educational tools and curriculum for Ghanaian secondary schools.', posted: 6, spent: 9800, rating: 5.0, ratingCount: 5 },
];

// ============================================================
// MAIN SEED
// ============================================================
async function main() {
  // Prevent running seed in production — only seed categories
  if (process.env.NODE_ENV === 'production') {
    console.log('Production mode — seeding categories only (no test data)\n');
    const categoryMap: Record<string, string> = {};
    for (let i = 0; i < GIG_CATEGORIES.length; i++) {
      const cat = GIG_CATEGORIES[i];
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, icon: cat.emoji, description: cat.description, sortOrder: i },
        create: { name: cat.name, slug: cat.slug, icon: cat.emoji, description: cat.description, sortOrder: i, isActive: true },
      });
    }
    console.log(`  ✅ ${GIG_CATEGORIES.length} categories upserted`);
    return;
  }

  console.log('🌱 Starting development seed…\n');

  // ---- 1. Categories (from shared package) ----
  console.log('📁 Seeding categories…');
  const categoryMap: Record<string, string> = {};
  for (let i = 0; i < GIG_CATEGORIES.length; i++) {
    const cat = GIG_CATEGORIES[i];
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.emoji, description: cat.description, sortOrder: i },
      create: { name: cat.name, slug: cat.slug, icon: cat.emoji, description: cat.description, sortOrder: i, isActive: true },
    });
    categoryMap[cat.slug] = row.id;
    console.log(`  ✅ ${cat.emoji} ${cat.name}`);
  }

  // Build a quick slug lookup so gig data can reference categories by slug
  const allCategories = await prisma.category.findMany();
  for (const c of allCategories) categoryMap[c.slug] = c.id;

  // ---- 2. Student users ----
  console.log('\n👤 Seeding students…');
  const studentUsers: { userId: string; profileId: string; data: (typeof STUDENTS)[0] }[] = [];
  for (const s of STUDENTS) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash: PASSWORD_HASH,
        role: 'student',
        emailVerified: true,
        isActive: true,
        reputationScore: Math.floor(s.earned / 50),
        lastLoginAt: hoursAgo(Math.floor(Math.random() * 48)),
      },
    });
    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: s.firstName,
        lastName: s.lastName,
        university: s.uni,
        professionalTitle: s.title,
        bio: s.bio,
        major: s.major,
        graduationYear: s.gradYear,
        skills: s.skills,
        hourlyRate: s.rate,
        talentBadge: s.badge,
        gigsCompleted: s.completed,
        totalEarned: s.earned,
        ratingAvg: s.rating,
        ratingCount: s.ratingCount,
        jobSuccessScore: s.successScore,
        responseTimeHrs: Math.round(Math.random() * 40 + 5) / 10,
        onTimeRate: 90 + Math.round(Math.random() * 100) / 10,
        rehireRate: 40 + Math.round(Math.random() * 550) / 10,
        availability: { status: 'available', hoursPerWeek: 20 + Math.floor(Math.random() * 20) },
      },
    });
    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, balance: Math.floor(Math.random() * 3000), pendingBalance: Math.floor(Math.random() * 500) },
    });
    await prisma.connectBalance.upsert({
      where: { studentId: profile.id },
      update: {},
      create: { studentId: profile.id, freeConnects: 10 + Math.floor(Math.random() * 20), purchasedConnects: Math.floor(Math.random() * 40) },
    });
    studentUsers.push({ userId: user.id, profileId: profile.id, data: s });
    console.log(`  ✅ ${s.firstName} ${s.lastName} (${s.uni})`);
  }

  // ---- 3. Employer users ----
  console.log('\n🏢 Seeding employers…');
  const employerUsers: { userId: string; profileId: string; data: (typeof EMPLOYERS)[0] }[] = [];
  for (const e of EMPLOYERS) {
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: {},
      create: {
        email: e.email,
        passwordHash: PASSWORD_HASH,
        role: 'employer',
        emailVerified: true,
        isActive: true,
        reputationScore: Math.floor(e.spent / 100),
        lastLoginAt: hoursAgo(Math.floor(Math.random() * 24)),
      },
    });
    const profile = await prisma.employerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        businessName: e.bizName,
        businessType: e.bizType,
        description: e.desc,
        contactPerson: e.contact,
        isVerified: true,
        paymentVerified: true,
        gigsPosted: e.posted,
        totalSpent: e.spent,
        ratingAvg: e.rating,
        ratingCount: e.ratingCount,
        hireRate: 60 + Math.round(Math.random() * 350) / 10,
      },
    });
    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, balance: Math.floor(Math.random() * 10000 + 5000) },
    });
    employerUsers.push({ userId: user.id, profileId: profile.id, data: e });
    console.log(`  ✅ ${e.bizName}`);
  }

  // ---- 4. Admin user ----
  console.log('\n🔑 Seeding admin…');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@intemso.com' },
    update: {},
    create: { email: 'admin@intemso.com', passwordHash: PASSWORD_HASH, role: 'admin', emailVerified: true, isActive: true, reputationScore: 999 },
  });
  console.log('  ✅ admin@intemso.com');

  // ---- 5. Gigs ----
  console.log('\n💼 Seeding gigs…');
  const GIG_DATA = [
    { title: 'Build E-commerce Website with Paystack Integration', desc: 'We need a modern e-commerce store built with Next.js and Paystack for payments. Must support MoMo and card payments. Product catalog, cart, checkout, admin dashboard.', cat: 'web-app-dev', skills: ['React', 'Next.js', 'Node.js', 'Paystack', 'PostgreSQL'], min: 3000, max: 5000, empIdx: 0, scope: 'large' as const, exp: 'intermediate' as const, urgency: 'this_week' as const, status: 'open' as const },
    { title: 'Design Brand Identity for Agritech Startup', desc: 'Looking for a creative designer to build full brand identity: logo, color palette, typography, business cards, letterhead, and brand guidelines document.', cat: 'creative-craft', skills: ['Brand Identity', 'Logo Design', 'Illustrator', 'Photoshop'], min: 800, max: 1500, empIdx: 2, scope: 'medium' as const, exp: 'intermediate' as const, urgency: 'flexible' as const, status: 'open' as const },
    { title: 'Flutter App for Farm Produce Marketplace', desc: 'Cross-platform mobile app connecting farmers in Kumasi with buyers in Accra. Real-time pricing, order tracking, MoMo payments.', cat: 'web-app-dev', skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs'], min: 4000, max: 7000, empIdx: 2, scope: 'large' as const, exp: 'expert' as const, urgency: 'this_week' as const, status: 'open' as const },
    { title: 'Write 20 SEO Blog Posts about Fintech in Africa', desc: 'Need 20 well-researched, SEO-optimized blog posts (1500+ words each) about mobile money, fintech trends, and digital banking in Ghana and West Africa.', cat: 'writing-communication', skills: ['SEO Writing', 'Blog Articles', 'Content Strategy', 'Fintech Knowledge'], min: 1000, max: 2000, empIdx: 0, scope: 'medium' as const, exp: 'intermediate' as const, urgency: 'flexible' as const, status: 'open' as const },
    { title: 'Edit YouTube Series for EduTech Channel', desc: 'Edit 10 educational YouTube videos (15-20 min each). Add intros/outros, lower thirds, transitions, background music, and color correction.', cat: 'photography-video', skills: ['Premiere Pro', 'After Effects', 'Color Grading', 'Sound Design'], min: 2000, max: 3500, empIdx: 3, scope: 'large' as const, exp: 'intermediate' as const, urgency: 'this_week' as const, status: 'open' as const },
    { title: 'UI/UX Redesign — Banking Dashboard', desc: 'Redesign our existing fintech dashboard. Create Figma prototypes for web and mobile. User research with 10 participants, competitive analysis, design system.', cat: 'web-app-dev', skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'], min: 2500, max: 4000, empIdx: 0, scope: 'large' as const, exp: 'expert' as const, urgency: 'this_week' as const, status: 'open' as const },
    { title: 'WASSCE Mathematics Tutoring — 5 Students', desc: 'Looking for an experienced maths tutor for 5 SHS students preparing for WASSCE. 3 sessions per week, each 2 hours.', cat: 'tutoring-academic', skills: ['Mathematics', 'WASSCE Prep', 'Teaching'], min: 500, max: 800, empIdx: 3, scope: 'small' as const, exp: 'entry' as const, urgency: 'asap' as const, status: 'open' as const },
    { title: 'Social Media Management for Digital Agency', desc: 'Manage Instagram, Twitter/X, LinkedIn, and TikTok for our agency. Content calendar, daily posting, engagement, monthly analytics report.', cat: 'social-media', skills: ['Social Media', 'Canva', 'Content Creation', 'Analytics'], min: 600, max: 1200, empIdx: 1, scope: 'medium' as const, exp: 'entry' as const, urgency: 'flexible' as const, status: 'open' as const },
    { title: 'Product Photography — 50 Items for Online Store', desc: 'Need professional product photos for our e-commerce catalog. White background, lifestyle shots, and detail close-ups.', cat: 'photography-video', skills: ['Product Photography', 'Photo Editing', 'Lightroom'], min: 400, max: 700, empIdx: 1, scope: 'small' as const, exp: 'entry' as const, urgency: 'flexible' as const, status: 'open' as const },
    { title: 'Build Admin Panel with Analytics & Charts', desc: 'Internal admin dashboard with user management, revenue charts, activity logs, and export functionality. React + Chart.js.', cat: 'web-app-dev', skills: ['React', 'TypeScript', 'Chart.js', 'REST APIs'], min: 2000, max: 3500, empIdx: 1, scope: 'medium' as const, exp: 'intermediate' as const, urgency: 'this_week' as const, status: 'in_progress' as const },
    { title: 'Translate Twi Educational Content to English', desc: 'Translate 30 lessons from Twi to English for our e-learning platform. Must maintain educational tone and accuracy.', cat: 'writing-communication', skills: ['Twi', 'English', 'Translation', 'Localization'], min: 600, max: 1000, empIdx: 3, scope: 'medium' as const, exp: 'entry' as const, urgency: 'flexible' as const, status: 'in_progress' as const },
    { title: 'Market Research — Student Freelancing in Ghana', desc: 'Conduct comprehensive market research on student freelancing trends in Ghana. Surveys, interviews, data analysis, and final report.', cat: 'surveys-research', skills: ['Market Research', 'Survey Design', 'Data Analysis', 'Report Writing'], min: 1500, max: 2500, empIdx: 0, scope: 'medium' as const, exp: 'intermediate' as const, urgency: 'flexible' as const, status: 'completed' as const },
  ];

  const createdGigs: { id: string; empIdx: number }[] = [];
  for (const g of GIG_DATA) {
    const emp = employerUsers[g.empIdx];
    const catId = categoryMap[g.cat] ?? null;
    const gig = await prisma.gig.create({
      data: {
        employerId: emp.profileId,
        title: g.title,
        description: g.desc,
        categoryId: catId,
        requiredSkills: g.skills,
        budgetType: 'fixed',
        budgetMin: g.min,
        budgetMax: g.max,
        currency: 'GHS',
        locationType: 'remote',
        experienceLevel: g.exp,
        projectScope: g.scope,
        urgency: g.urgency,
        status: g.status,
        viewsCount: 20 + Math.floor(Math.random() * 200),
        applicationsCount: 2 + Math.floor(Math.random() * 10),
        publishedAt: daysAgo(Math.floor(Math.random() * 30) + 1),
      },
    });
    createdGigs.push({ id: gig.id, empIdx: g.empIdx });
    console.log(`  ✅ ${g.title.slice(0, 55)}…`);
  }

  // ---- 6. Applications ----
  console.log('\n📝 Seeding applications…');
  const applicationPairs: [number, number][] = [
    [0, 0], [1, 5], [2, 2], [3, 3], [4, 4], [0, 9], [1, 0], [5, 11], [6, 6], [7, 1],
    [2, 0], [3, 7], [4, 5], [6, 10], [7, 8], [0, 5], [5, 3],
  ];
  const createdApplications: { id: string; gigIdx: number; studentIdx: number }[] = [];
  for (const [sIdx, gIdx] of applicationPairs) {
    if (!createdGigs[gIdx]) continue;
    const stu = studentUsers[sIdx];
    const g = GIG_DATA[gIdx];
    try {
      const application = await prisma.application.create({
        data: {
          gigId: createdGigs[gIdx].id,
          studentId: stu.profileId,
          note: `Hi! I'm ${stu.data.firstName} and I'd love to work on "${g.title}". I have experience in ${stu.data.skills.slice(0, 3).join(', ')}.`,
          suggestedRate: g.min + Math.floor(Math.random() * (g.max - g.min) * 0.5),
          status: pick(['applied', 'reviewed']),
          connectsSpent: 1,
        },
      });
      createdApplications.push({ id: application.id, gigIdx: gIdx, studentIdx: sIdx });
    } catch {
      // unique constraint — skip
    }
  }
  console.log(`  ✅ ${createdApplications.length} applications`);

  // ---- 7. Contracts & Milestones ----
  console.log('\n📋 Seeding contracts…');
  const contractData = [
    { sIdx: 0, gIdx: 9, status: 'active' as const, rate: 2800, title: 'Admin Panel with Analytics' },
    { sIdx: 1, gIdx: 5, status: 'active' as const, rate: 3200, title: 'Fintech Dashboard Redesign' },
    { sIdx: 4, gIdx: 4, status: 'active' as const, rate: 2800, title: 'EduTech YouTube Series Editing' },
    { sIdx: 2, gIdx: 2, status: 'completed' as const, rate: 5500, title: 'Farm Produce Marketplace App' },
    { sIdx: 3, gIdx: 3, status: 'completed' as const, rate: 1500, title: 'Fintech Blog Content Pack' },
    { sIdx: 6, gIdx: 6, status: 'active' as const, rate: 650, title: 'WASSCE Maths Tutoring' },
  ];
  const createdContracts: { id: string; sIdx: number; empProfileId: string; studentUserId: string; employerUserId: string; status: string }[] = [];
  for (const cd of contractData) {
    const stu = studentUsers[cd.sIdx];
    const gig = createdGigs[cd.gIdx];
    const emp = employerUsers[gig.empIdx];
    const contract = await prisma.contract.create({
      data: {
        gigId: gig.id,
        studentId: stu.profileId,
        employerId: emp.profileId,
        contractType: 'fixed',
        title: cd.title,
        description: `Contract for: ${cd.title}`,
        agreedRate: cd.rate,
        currency: 'GHS',
        status: cd.status,
        startedAt: daysAgo(cd.status === 'completed' ? 45 : 15),
        completedAt: cd.status === 'completed' ? daysAgo(5) : null,
        lifetimeBillings: cd.status === 'completed' ? cd.rate : Math.floor(cd.rate * 0.4),
      },
    });
    createdContracts.push({ id: contract.id, sIdx: cd.sIdx, empProfileId: emp.profileId, studentUserId: stu.userId, employerUserId: emp.userId, status: cd.status });
    console.log(`  ✅ ${cd.title} (${cd.status})`);

    // Milestones
    const msNames = ['Discovery & Planning', 'Core Development', 'Testing & Polish', 'Final Delivery'];
    for (let mi = 0; mi < msNames.length; mi++) {
      const msAmount = Math.floor(cd.rate / msNames.length);
      await prisma.milestone.create({
        data: {
          contractId: contract.id,
          title: msNames[mi],
          description: `${msNames[mi]} phase of the project`,
          amount: msAmount,
          sortOrder: mi,
          status: cd.status === 'completed' ? 'paid' : mi < 2 ? 'approved' : mi === 2 ? 'in_progress' : 'pending',
          dueDate: daysAgo(-7 * (msNames.length - mi)),
        },
      });
    }
  }

  // ---- 8. Payments for completed contracts ----
  console.log('\n💳 Seeding payments…');
  const completedContracts = createdContracts.filter((c) => c.status === 'completed');
  for (const cc of completedContracts) {
    const cd = contractData.find((_, i) => createdContracts[i].id === cc.id)!;
    const feeRate = 0.15;
    const fee = Math.floor(cd.rate * feeRate);
    await prisma.payment.create({
      data: {
        contractId: cc.id,
        payerId: cc.employerUserId,
        payeeId: cc.studentUserId,
        amount: cd.rate,
        platformFee: fee,
        feePercentage: feeRate * 100,
        netAmount: cd.rate - fee,
        type: 'milestone_release',
        status: 'released',
        releasedAt: daysAgo(5),
      },
    });
  }
  console.log(`  ✅ ${completedContracts.length} payments`);

  // ---- 9. Reviews ----
  console.log('\n⭐ Seeding reviews…');
  const reviewTexts = [
    'Exceptional work! Delivered ahead of schedule with outstanding quality. Highly recommended.',
    'Great communicator and very professional. The final product exceeded our expectations.',
    'Very talented and reliable. Would definitely hire again for future projects.',
  ];
  for (const cc of completedContracts) {
    await prisma.review.create({
      data: { contractId: cc.id, reviewerId: cc.employerUserId, revieweeId: cc.studentUserId, rating: 5, comment: pick(reviewTexts) },
    }).catch(() => {});
    await prisma.review.create({
      data: { contractId: cc.id, reviewerId: cc.studentUserId, revieweeId: cc.employerUserId, rating: pick([4, 5]), comment: 'Great client! Clear requirements and timely payments.' },
    }).catch(() => {});
  }
  console.log(`  ✅ ${completedContracts.length * 2} reviews`);

  // ---- 10. Client Relationships ----
  console.log('\n🤝 Seeding client relationships…');
  for (const cc of createdContracts) {
    const cd = contractData.find((_, i) => createdContracts[i].id === cc.id)!;
    const stu = studentUsers[cc.sIdx];
    await prisma.clientRelationship.upsert({
      where: { studentId_employerId: { studentId: stu.profileId, employerId: cc.empProfileId } },
      update: {},
      create: {
        studentId: stu.profileId,
        employerId: cc.empProfileId,
        lifetimeBillings: cd.rate,
        contractsCount: 1,
        firstContractAt: daysAgo(45),
        lastContractAt: daysAgo(5),
      },
    });
  }
  console.log('  ✅ Relationships created');

  // ---- 11. Service Listings ----
  console.log('\n🛍️ Seeding service listings…');
  const SERVICES = [
    { sIdx: 0, title: 'Professional React/Next.js Website', desc: 'I will build a modern, responsive website using React and Next.js with Tailwind CSS.', cat: 'web-app-dev', tags: ['react', 'nextjs', 'tailwind'], days: 7, tiers: [{ name: 'Basic', price: 500, desc: '1-page landing' }, { name: 'Standard', price: 1500, desc: '5-page site with CMS' }, { name: 'Premium', price: 3000, desc: 'Full web app' }] },
    { sIdx: 1, title: 'Complete Brand Identity Package', desc: 'Full brand identity: logo, color palette, typography, business cards, brand guidelines.', cat: 'creative-craft', tags: ['branding', 'logo', 'identity'], days: 10, tiers: [{ name: 'Basic', price: 400, desc: 'Logo + colors' }, { name: 'Standard', price: 800, desc: 'Full brand kit' }, { name: 'Premium', price: 1500, desc: 'Full identity + stationery' }] },
    { sIdx: 4, title: 'Professional Video Editing', desc: 'High-quality video editing for YouTube, social media, and brand content.', cat: 'photography-video', tags: ['youtube', 'editing', 'premiere'], days: 5, tiers: [{ name: 'Basic', price: 200, desc: '5-min edit' }, { name: 'Standard', price: 500, desc: '15-min with graphics' }, { name: 'Premium', price: 1200, desc: 'Full production' }] },
    { sIdx: 3, title: 'SEO Blog Content Package', desc: 'Well-researched, SEO-optimized blog posts with keyword research and compelling headlines.', cat: 'writing-communication', tags: ['seo', 'blog', 'content'], days: 5, tiers: [{ name: 'Basic', price: 100, desc: '1 article' }, { name: 'Standard', price: 400, desc: '5 articles' }, { name: 'Premium', price: 800, desc: '10 articles + strategy' }] },
    { sIdx: 2, title: 'Cross-Platform Mobile App', desc: 'Flutter mobile app for iOS and Android with clean architecture and beautiful UI.', cat: 'web-app-dev', tags: ['flutter', 'mobile', 'android'], days: 14, tiers: [{ name: 'Basic', price: 1000, desc: '3-screen app' }, { name: 'Standard', price: 3000, desc: '8-screen + backend' }, { name: 'Premium', price: 6000, desc: 'Full-featured app' }] },
    { sIdx: 6, title: 'WASSCE & SAT Tutoring Sessions', desc: 'Expert tutoring in Mathematics and Sciences. Custom lesson plans and exam strategies.', cat: 'tutoring-academic', tags: ['wassce', 'math', 'tutoring'], days: 30, tiers: [{ name: 'Basic', price: 150, desc: '4 sessions' }, { name: 'Standard', price: 350, desc: '12 sessions' }, { name: 'Premium', price: 600, desc: '24 sessions + materials' }] },
  ];
  for (const svc of SERVICES) {
    const stu = studentUsers[svc.sIdx];
    const catId = categoryMap[svc.cat] ?? null;
    await prisma.serviceListing.create({
      data: {
        studentId: stu.profileId,
        title: svc.title,
        description: svc.desc,
        categoryId: catId,
        tags: svc.tags,
        deliveryDays: svc.days,
        tiers: svc.tiers,
        status: 'active',
        ordersCount: Math.floor(Math.random() * 20),
        ratingAvg: 4.5 + Math.round(Math.random() * 50) / 100,
        ratingCount: Math.floor(Math.random() * 15),
      },
    });
    console.log(`  ✅ ${svc.title.slice(0, 45)}…`);
  }

  // ---- 12. Portfolio Items (Showcase) ----
  console.log('\n🎨 Seeding portfolio showcase items…');
  const PORTFOLIO_ITEMS = [
    { sIdx: 0, title: 'TechStart Admin Dashboard', desc: 'Built a comprehensive admin dashboard for TechStart Ghana\'s fintech platform. Features include real-time transaction monitoring, user management, KYC verification flows, and interactive analytics charts. The dashboard handles 5,000+ daily active users and processes over GH₵2M in transactions monthly.', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'PostgreSQL'], cat: 'web-app-dev', client: 'TechStart Ghana', url: 'https://admin.techstartgh.com', daysAgo: 15, featured: true },
    { sIdx: 0, title: 'Marketplace REST API', desc: 'Designed and implemented a scalable REST API for an e-commerce marketplace connecting local artisans with buyers across West Africa. Implemented JWT auth, rate limiting, image optimization pipeline, and mobile money payment integration via Paystack.', skills: ['Node.js', 'NestJS', 'PostgreSQL', 'Redis', 'Docker'], cat: 'web-app-dev', client: 'Accra Digital Agency', daysAgo: 45, featured: false },
    { sIdx: 1, title: 'FarmConnect Brand Identity', desc: 'Complete brand identity for FarmConnect — an agritech startup linking Ghanaian farmers to urban markets. Delivered logo system, color palette inspired by Ghana\'s landscape, typography guidelines, business cards, letterheads, and a comprehensive 40-page brand manual.', skills: ['Figma', 'Adobe Illustrator', 'Brand Strategy', 'Typography'], cat: 'creative-craft', client: 'Kumasi Farms Co-op', daysAgo: 20, featured: true },
    { sIdx: 1, title: 'EduTech Learning App Redesign', desc: 'Redesigned the mobile learning experience for Ghana EduTech\'s free educational platform. Conducted user research with 50+ secondary school students, created user personas, and redesigned 28 screens. Result: 40% increase in daily active users and 65% improvement in lesson completion rates.', skills: ['Figma', 'User Research', 'Prototyping', 'Usability Testing'], cat: 'creative-craft', client: 'Ghana EduTech', daysAgo: 60, featured: true },
    { sIdx: 2, title: 'KwikDelivery Mobile App', desc: 'Cross-platform delivery app built with Flutter for a last-mile logistics startup. Real-time GPS tracking, push notifications, in-app chat between riders and customers, and mobile money payment. Published on Google Play Store with 10K+ downloads.', skills: ['Flutter', 'Dart', 'Firebase', 'Google Maps API', 'Paystack'], cat: 'web-app-dev', client: 'KwikLogistics', url: 'https://play.google.com', daysAgo: 30, featured: true },
    { sIdx: 2, title: 'Campus Events Social App', desc: 'Social event discovery app for UCC students. Browse campus events, RSVP, share with friends, and get reminders. Integrated with university calendar API and features a beautiful Material Design 3 interface.', skills: ['Flutter', 'Firebase', 'React Native', 'Android'], cat: 'web-app-dev', daysAgo: 90, featured: false },
    { sIdx: 3, title: 'TechStart Content Strategy', desc: 'Developed a 6-month content strategy for TechStart Ghana including 30 SEO-optimized blog posts, social media calendar, email newsletter series, and brand voice guidelines. Organic traffic increased by 280% within 4 months.', skills: ['SEO Writing', 'Content Strategy', 'Copywriting', 'Analytics'], cat: 'writing-communication', client: 'TechStart Ghana', daysAgo: 25, featured: false },
    { sIdx: 3, title: 'Ghana Tourism Blog Series', desc: 'Wrote a 12-part blog series showcasing hidden gems across Ghana — from Cape Coast castles to Mole National Park. Each article featured original photography, historical context, and practical travel tips. The series was shared by the Ghana Tourism Authority.', skills: ['Blog Articles', 'SEO Writing', 'Travel Writing', 'Photography'], cat: 'writing-communication', daysAgo: 70, featured: true },
    { sIdx: 4, title: 'Accra Music Festival Documentary', desc: 'Shot and edited a 25-minute documentary covering the Accra Music Festival. Captured performances, backstage moments, and audience reactions. Color graded in DaVinci Resolve with a cinematic West African color palette. Premiered on YouTube with 50K+ views.', skills: ['Premiere Pro', 'DaVinci Resolve', 'After Effects', 'Color Grading'], cat: 'photography-video', client: 'Accra Music Festival', url: 'https://youtube.com', daysAgo: 10, featured: true },
    { sIdx: 4, title: 'Product Launch Video — FinPay', desc: 'Created a 90-second animated product launch video for FinPay\'s new mobile money feature. Storyboarding, motion graphics, sound design, and final delivery in 4K. The video was used across social media and at the launch event.', skills: ['After Effects', 'Motion Graphics', 'Premiere Pro', 'Sound Design'], cat: 'photography-video', client: 'TechStart Ghana', daysAgo: 40, featured: false },
    { sIdx: 5, title: 'Agricultural Data Dashboard', desc: 'Built an interactive Tableau dashboard for Kumasi Farms Co-op to track crop yields, rainfall patterns, and market prices across 15 farming communities. The dashboard reduced reporting time from 2 weeks to real-time.', skills: ['Tableau', 'Python', 'SQL', 'Data Visualization', 'Excel'], cat: 'data-analytics', client: 'Kumasi Farms Co-op', daysAgo: 35, featured: false },
    { sIdx: 5, title: 'Student Performance Analysis', desc: 'Analyzed WASSCE performance data across 200+ schools for Ghana EduTech. Built predictive models to identify at-risk students and created intervention recommendations. The analysis helped target tutoring resources where they were needed most.', skills: ['Python', 'Pandas', 'Power BI', 'Machine Learning', 'Statistics'], cat: 'data-analytics', client: 'Ghana EduTech', daysAgo: 55, featured: true },
    { sIdx: 7, title: 'Accra Digital Agency Rebrand', desc: 'Complete visual rebrand for Accra Digital Agency including new logo, website mockups, social media templates, and presentation decks. The modern, bold identity helped the agency win 3 new enterprise clients within the first month.', skills: ['Photoshop', 'Illustrator', 'Brand Identity', 'Canva'], cat: 'creative-craft', client: 'Accra Digital Agency', daysAgo: 50, featured: false },
    { sIdx: 7, title: 'KNUST Tech Week Poster Series', desc: 'Designed a series of 8 event posters for KNUST\'s annual Tech Week. Each poster featured unique geometric patterns inspired by Kente cloth motifs combined with modern tech imagery. The designs were displayed campus-wide and shared on social media.', skills: ['Illustrator', 'Photoshop', 'InDesign', 'Typography'], cat: 'creative-craft', daysAgo: 80, featured: false },
  ];
  for (const pi of PORTFOLIO_ITEMS) {
    const stu = studentUsers[pi.sIdx];
    const catId = categoryMap[pi.cat] ?? null;
    await prisma.portfolioItem.create({
      data: {
        studentId: stu.profileId,
        title: pi.title,
        description: pi.desc,
        skills: pi.skills,
        categoryId: catId,
        clientName: pi.client || null,
        projectUrl: pi.url || null,
        completedAt: daysAgo(pi.daysAgo),
        status: 'published',
        isFeatured: pi.featured,
        likeCount: 5 + Math.floor(Math.random() * 45),
        viewCount: 20 + Math.floor(Math.random() * 300),
        createdAt: daysAgo(pi.daysAgo),
      },
    });
    console.log(`  ✅ ${pi.title.slice(0, 50)}…`);
  }

  // ---- 13. Conversations & Messages ----
  console.log('\n💬 Seeding conversations…');
  const convos = [
    { parts: [studentUsers[0].userId, employerUsers[0].userId], msgs: [
      [1, 'Hi Kwame, I loved your application for the admin panel. Can you start next week?'],
      [0, 'Hi! Thank you! Yes, I can start Monday. Should I set up the repo first?'],
      [1, 'Perfect. I will send you the Figma designs and API docs by Friday.'],
      [0, 'Sounds great! I will review them over the weekend and prepare a sprint plan.'],
      [1, 'Looking forward to it. Welcome aboard! 🎉'],
    ]},
    { parts: [studentUsers[1].userId, employerUsers[0].userId], msgs: [
      [1, 'Ama, your portfolio is impressive! We need a dashboard redesign urgently.'],
      [0, 'Thank you! I saw the project brief. I have some ideas for improving the user flow.'],
      [1, 'Great, can you share a quick wireframe concept before we finalize?'],
      [0, 'Sure! I will have a low-fidelity wireframe ready by tomorrow afternoon.'],
    ]},
    { parts: [studentUsers[4].userId, employerUsers[3].userId], msgs: [
      [1, 'Yaw, we absolutely love your reel! Could you handle our entire YouTube series?'],
      [0, 'I would love to! I watched your current videos — I think we can level up the production quality.'],
      [1, 'That is exactly what we need. Can we do a test edit with Episode 1 first?'],
      [0, 'Absolutely. Send me the raw footage and I will turn it around in 3 days.'],
      [1, 'Sending via Google Drive now. Budget discussion when you are done? 😊'],
      [0, 'Perfect! I will review tonight and start editing tomorrow morning.'],
    ]},
    { parts: [studentUsers[2].userId, employerUsers[2].userId], msgs: [
      [1, 'Kofi, our farmers need this app badly. How quickly can you build an MVP?'],
      [0, 'I can have a working MVP in 3 weeks. The pricing engine will be the trickiest part.'],
      [1, 'We can simplify pricing for v1. Just fixed prices from a catalogue.'],
      [0, 'That makes it easier. I will start with the buyer flow and farmer registration.'],
    ]},
  ];
  for (const convo of convos) {
    const conversation = await prisma.conversation.create({
      data: { participantIds: convo.parts, lastMessageAt: hoursAgo(1) },
    });
    for (let mi = 0; mi < convo.msgs.length; mi++) {
      const [senderIdx, text] = convo.msgs[mi] as [number, string];
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: convo.parts[senderIdx],
          content: text,
          isRead: mi < convo.msgs.length - 1,
          createdAt: hoursAgo(convo.msgs.length * 2 - mi * 2),
        },
      });
    }
    console.log(`  ✅ Conversation (${convo.msgs.length} messages)`);
  }

  // ---- 13. Community Posts ----
  console.log('\n📣 Seeding community posts…');
  const POSTS: { authorIdx: number; isStudent: boolean; type: 'discussion' | 'question' | 'tip' | 'achievement' | 'event'; content: string; tags: string[]; likes: number; comments: number; views: number }[] = [
    { authorIdx: 0, isStudent: true, type: 'tip', content: '💡 Quick tip for fellow devs: When using Prisma with Next.js App Router, always instantiate your PrismaClient as a singleton in a separate file. This prevents "too many connections" errors during hot reload.\n\n#webdev #nextjs #prisma', tags: ['webdev', 'nextjs', 'prisma'], likes: 24, comments: 8, views: 156 },
    { authorIdx: 1, isStudent: true, type: 'achievement', content: '🏆 Just hit a milestone — 30 projects completed on Intemso! When I started freelancing as a design student at UG, I never imagined I would build a career this way.\n\nTo all new designers: keep learning, keep shipping, and always over-deliver. The referrals will come! 🎨✨\n\n#freelancing #design #milestone', tags: ['freelancing', 'design', 'milestone'], likes: 67, comments: 23, views: 412 },
    { authorIdx: 4, isStudent: true, type: 'discussion', content: 'What editing software do you all prefer for short-form content?\n\nI have been using Premiere Pro but DaVinci Resolve has been catching up — especially the color grading tools. Considering switching for my TikTok/Reels workflow.\n\nWhat do you use and why? 👇\n\n#videoediting #creativetools', tags: ['videoediting', 'creativetools'], likes: 31, comments: 15, views: 234 },
    { authorIdx: 3, isStudent: true, type: 'tip', content: '📝 5 things I wish I knew before starting as a freelance writer:\n\n1. Niche down early\n2. Build a swipe file of great content\n3. Learn basic SEO — it makes you 3x more valuable\n4. Always get 50% upfront\n5. Your portfolio matters more than your degree\n\nSave this! 📌\n\n#contentwriting #freelancetips', tags: ['contentwriting', 'freelancetips'], likes: 45, comments: 12, views: 298 },
    { authorIdx: 0, isStudent: false, type: 'event', content: '📅 TechStart Ghana — FREE webinar this Saturday!\n\n"Building Scalable Fintech Products in West Africa"\n\n🕐 2:00 PM GMT · 📍 Zoom\n\nTopics: Mobile money integrations, regulatory compliance, scaling from Ghana to Nigeria, payment gateways.\n\nOpen to all! Drop a 🙋 if attending.\n\n#fintech #webinar #techstartgh', tags: ['fintech', 'webinar', 'techstartgh'], likes: 38, comments: 19, views: 520 },
    { authorIdx: 2, isStudent: true, type: 'achievement', content: '🎉 My farm marketplace app just crossed 1,000 downloads on the Play Store!\n\nBuilt with Flutter for Kumasi Farms Co-op. Farmers in the Ashanti region can now list produce and connect with buyers in Accra.\n\nAverage farmer income up 30% since launch. This is why I love tech. 🌱📱\n\n#flutter #impacttech #madeInGhana', tags: ['flutter', 'impacttech', 'madeinghana'], likes: 89, comments: 34, views: 678 },
    { authorIdx: 6, isStudent: true, type: 'question', content: 'Fellow tutors — how do you handle students who consistently no-show for sessions?\n\nI have a WASSCE prep student who has missed 3 of the last 5 sessions. It is affecting our timeline.\n\nDo you charge cancellation fees? Strict policy? Would love to hear your approaches.\n\n#tutoring #freelancing', tags: ['tutoring', 'freelancing'], likes: 12, comments: 9, views: 87 },
    { authorIdx: 5, isStudent: true, type: 'tip', content: '📊 Data analysts — stop learning every tool. Master these 3:\n\n1. SQL — the foundation\n2. Python (pandas + matplotlib) — analysis & viz\n3. Power BI or Tableau — dashboards stakeholders use\n\nOnce solid on these, you can pick up anything else in days.\n\n#dataanalysis #careeradvice', tags: ['dataanalysis', 'careeradvice'], likes: 56, comments: 18, views: 445 },
    { authorIdx: 1, isStudent: false, type: 'discussion', content: 'Accra Digital Agency is hiring 3 freelance designers! 🎨\n\n• 1 UI Designer (Figma expert)\n• 1 Motion Graphics Designer\n• 1 Brand Strategist\n\nRemote-friendly, 2-month engagement, competitive rates.\n\nDrop your portfolio below or DM us! Ghanaian students preferred.\n\n#hiring #design #opportunity', tags: ['hiring', 'design', 'opportunity'], likes: 72, comments: 41, views: 890 },
    { authorIdx: 7, isStudent: true, type: 'discussion', content: 'Just finished rebranding a restaurant chain in Tema — before/after was 🔥\n\nOld logo was clip art from 2008. New identity uses Adinkra-inspired patterns blended with modern minimalism.\n\nClient said sales went up 15% in the first month! The power of good design.\n\n#graphicdesign #branding #ghanadesign', tags: ['graphicdesign', 'branding', 'ghanadesign'], likes: 43, comments: 16, views: 312 },
  ];

  const createdPostIds: string[] = [];
  for (const p of POSTS) {
    const authorId = p.isStudent ? studentUsers[p.authorIdx].userId : employerUsers[p.authorIdx].userId;
    const post = await prisma.communityPost.create({
      data: {
        authorId,
        type: p.type,
        content: p.content,
        tags: p.tags,
        likeCount: p.likes,
        commentCount: p.comments,
        viewCount: p.views,
        createdAt: hoursAgo(Math.floor(Math.random() * 168)),
      },
    });
    createdPostIds.push(post.id);
    console.log(`  ✅ ${p.type}: "${p.content.slice(0, 45)}…"`);
  }

  // ---- 14. Community Comments ----
  console.log('\n💬 Seeding comments…');
  const COMMENT_TEXTS = [
    'This is incredibly helpful, thank you for sharing! 🙏',
    'Great insights! Saved for later.',
    'Totally agree — had the same experience.',
    'Could you elaborate on point 3?',
    'This is gold! Every freelancer should read this.',
    'Been looking for this kind of advice. Thanks!',
    'Love the Ghanaian tech community! 🇬🇭',
    'Congrats on the milestone! Well deserved.',
    'Really inspiring journey. Keep going!',
    'Interesting perspective. Networking is also key.',
    'Same here — communication is everything in freelancing.',
    'The Adinkra-inspired patterns sound amazing! Would love to see them.',
  ];
  for (const postId of createdPostIds) {
    const numComments = 2 + Math.floor(Math.random() * 4);
    for (let ci = 0; ci < numComments; ci++) {
      const commenter = pick(studentUsers);
      await prisma.communityComment.create({
        data: {
          postId,
          authorId: commenter.userId,
          content: pick(COMMENT_TEXTS),
          likeCount: Math.floor(Math.random() * 10),
          createdAt: hoursAgo(Math.floor(Math.random() * 72)),
        },
      });
    }
  }
  console.log(`  ✅ Comments on ${createdPostIds.length} posts`);

  // ---- 15. Community Likes ----
  console.log('\n❤️ Seeding likes…');
  let likeCount = 0;
  for (const postId of createdPostIds) {
    const likers = pickN([...studentUsers, ...employerUsers.map((e) => ({ userId: e.userId }))], 3 + Math.floor(Math.random() * 5));
    for (const liker of likers) {
      await prisma.communityLike.create({
        data: { userId: liker.userId, postId },
      }).catch(() => {});
      likeCount++;
    }
  }
  console.log(`  ✅ ${likeCount} likes`);

  // ---- 16. Follows ----
  console.log('\n🤝 Seeding follows…');
  let followCount = 0;
  for (const stu of studentUsers) {
    const toFollow = pickN(studentUsers.filter((s) => s.userId !== stu.userId), 3);
    for (const target of toFollow) {
      await prisma.userFollow.create({ data: { followerId: stu.userId, followingId: target.userId } }).catch(() => {});
      followCount++;
    }
    const emp = pick(employerUsers);
    await prisma.userFollow.create({ data: { followerId: stu.userId, followingId: emp.userId } }).catch(() => {});
    followCount++;
  }
  console.log(`  ✅ ${followCount} follows`);

  // ---- 17. Saved Gigs ----
  console.log('\n📌 Seeding saved gigs…');
  for (const stu of studentUsers.slice(0, 5)) {
    const gigsToSave = pickN(createdGigs, 2);
    for (const g of gigsToSave) {
      await prisma.savedGig.create({ data: { studentId: stu.profileId, gigId: g.id } }).catch(() => {});
    }
  }
  console.log('  ✅ Saved gigs');

  // ---- 18. Saved Talent ----
  console.log('\n⭐ Seeding saved talent…');
  for (const emp of employerUsers) {
    const talented = pickN(studentUsers, 2);
    for (const t of talented) {
      await prisma.savedTalent.create({
        data: { employerId: emp.profileId, studentId: t.profileId, notes: `Great ${t.data.title.toLowerCase()}` },
      }).catch(() => {});
    }
  }
  console.log('  ✅ Saved talent');

  // ---- 19. Notifications ----
  console.log('\n🔔 Seeding notifications…');
  const notifs = [
    { type: 'application_received', title: 'New Application Received', body: 'A student applied to your gig.' },
    { type: 'contract_started', title: 'Contract Started', body: 'Your contract has begun. Good luck!' },
    { type: 'payment_received', title: 'Payment Received', body: 'You received a payment of GHS 500.00' },
    { type: 'review_received', title: 'New Review', body: 'Someone left you a 5-star review!' },
    { type: 'message', title: 'New Message', body: 'You have a new message in your inbox.' },
    { type: 'milestone_approved', title: 'Milestone Approved', body: 'Your milestone was approved and payment released.' },
    { type: 'post_liked', title: 'Post Liked', body: 'Someone liked your community post.' },
  ];
  for (const stu of studentUsers) {
    for (let ni = 0; ni < 4 + Math.floor(Math.random() * 4); ni++) {
      const n = pick(notifs);
      await prisma.notification.create({
        data: { userId: stu.userId, type: n.type, title: n.title, body: n.body, isRead: ni > 1, createdAt: hoursAgo(ni * 6 + Math.floor(Math.random() * 12)) },
      });
    }
  }
  for (const emp of employerUsers) {
    for (let ni = 0; ni < 3; ni++) {
      const n = pick(notifs);
      await prisma.notification.create({
        data: { userId: emp.userId, type: n.type, title: n.title, body: n.body, isRead: ni > 0, createdAt: hoursAgo(ni * 8 + Math.floor(Math.random() * 24)) },
      });
    }
  }
  console.log('  ✅ Notifications');

  // ---- 20. Audit Logs ----
  console.log('\n📋 Seeding audit logs…');
  const auditActions = ['user.login', 'gig.create', 'application.submit', 'contract.start', 'payment.release', 'profile.update'];
  for (let i = 0; i < 20; i++) {
    const user = pick([...studentUsers.map((s) => s.userId), ...employerUsers.map((e) => e.userId), adminUser.id]);
    await prisma.auditLog.create({
      data: { userId: user, action: pick(auditActions), entity: 'system', ipAddress: '102.176.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255), createdAt: hoursAgo(Math.floor(Math.random() * 200)) },
    });
  }
  console.log('  ✅ 20 audit log entries');

  // ---- Summary ----
  console.log('\n' + '='.repeat(60));
  console.log('🎉 COMPREHENSIVE SEED COMPLETE!');
  console.log('='.repeat(60));
  console.log(`
📊 Summary:
  Categories:       ${GIG_CATEGORIES.length}
  Students:         ${STUDENTS.length}
  Employers:        ${EMPLOYERS.length}
  Admin:            1
  Gigs:             ${GIG_DATA.length}
  Applications:     ${createdApplications.length}
  Contracts:        ${contractData.length}
  Service Listings: ${SERVICES.length}
  Portfolio Items:  ${PORTFOLIO_ITEMS.length}
  Community Posts:  ${POSTS.length}
  Conversations:    ${convos.length}

🔑 Login credentials (all users):
  Password: Password1!

👤 Quick test accounts:
  Student:  kwame.asante@student.knust.edu.gh
  Employer: hr@techstartgh.com
  Admin:    admin@intemso.com
`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
