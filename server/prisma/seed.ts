import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({});
  await prisma.video.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.broadcast.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.mentorshipGroup.deleteMany({});
  await prisma.mentorMessage.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.scholarship.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.adminRole.deleteMany({});
  await prisma.book.deleteMany({});

  console.log('Cleared database.');

  // Create Users
  // In a production app, we would hash the password using bcrypt. For simplicity of testing in the demo, we keep them simple.
  const users = [
    { name: 'System Admin', email: 'admin@sop.org', password: 'admin123', role: 'admin', enrolledCourses: '["1", "2", "3"]' },
    { name: 'Minister Grace Okoro', email: 'grace@example.com', password: 'password123', role: 'student', enrolledCourses: '["2", "3"]' },
    { name: 'Sister Chidinma Okafor', email: 'chidinma@example.com', password: 'password123', role: 'student', enrolledCourses: '["1", "2", "3"]' },
    { name: 'Sister Ruth Okafor', email: 'ruth@example.com', password: 'password123', role: 'student', status: 'Suspended' },
    { name: 'Demo Student', email: 'student@sop.org', password: 'student123', role: 'student', enrolledCourses: '["1", "2"]' },
    { name: 'Demo Instructor', email: 'instructor@sop.org', password: 'instructor123', role: 'instructor', enrolledCourses: '[]' },
    { name: 'Prophet Elijah Mensah', email: 'elijah@example.com', password: 'password123', role: 'instructor', enrolledCourses: '[]' },
    { name: 'Apostle David Okonkwo', email: 'david@example.com', password: 'password123', role: 'instructor', enrolledCourses: '[]' }
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log('Seeded users.');

  // Create Courses
  const courses = [
    {
      id: '1',
      title: 'Foundations of Prophetic Ministry',
      instructor: 'Prophet Elijah Mensah',
      price: 29999,
      originalPrice: 59999,
      rating: 4.9,
      students: 14520,
      thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&h=450&fit=crop',
      category: 'Prophetic',
      duration: '24 hours',
      lessons: 5,
      level: 'Beginner',
      description: "Learn the biblical foundations of the prophetic office, hearing God's voice, and operating in the gift of prophecy with accuracy and integrity.",
      whatYouLearn: JSON.stringify(["Hearing God's voice clearly", "Understanding prophetic gifts", "Delivering prophetic words", "Prophetic protocol & ethics", "Building a prophetic lifestyle"]),
      requirements: JSON.stringify(["A Bible (any version)", "A sincere desire to grow spiritually", "Willingness to practice hearing God"]),
      isFeatured: true,
      isBestseller: true
    },
    {
      id: '2',
      title: 'The School of Intercessory Prayer',
      instructor: 'Prophetess Grace Adeyemi',
      price: 19999,
      originalPrice: 39999,
      rating: 4.8,
      students: 11230,
      thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=450&fit=crop',
      category: 'Prayer',
      duration: '18 hours',
      lessons: 3,
      level: 'Intermediate',
      description: 'Master the art of intercessory prayer, travailing in the Spirit, and standing in the gap for nations, communities, and individuals.',
      whatYouLearn: JSON.stringify(["Principles of intercession", "Travailing prayer", "Spiritual warfare prayers", "Prayer watches & schedules", "Prophetic intercession"]),
      requirements: JSON.stringify(["Basic understanding of prayer", "Committed prayer life"]),
      isFeatured: true,
      isBestseller: false
    },
    {
      id: '3',
      title: 'Spiritual Warfare & Deliverance Mastery',
      instructor: 'Apostle David Okonkwo',
      price: 35000,
      rating: 4.7,
      students: 8945,
      thumbnail: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=450&fit=crop',
      category: 'Warfare',
      duration: '32 hours',
      lessons: 2,
      level: 'Advanced',
      description: 'Understand the dynamics of spiritual warfare, discerning demonic operations, and ministering deliverance with biblical authority.',
      whatYouLearn: JSON.stringify(["Armor of God deep study", "Identifying demonic strongholds", "Deliverance ministry protocols", "Self-deliverance techniques", "Maintaining freedom"]),
      requirements: JSON.stringify(["Strong biblical foundation", "Experience in prayer ministry"]),
      isFeatured: true,
      isBestseller: true
    }
  ];

  for (const c of courses) {
    await prisma.course.create({ data: c });
  }
  console.log('Seeded courses.');

  // Create Videos
  const videos = [
    { title: 'Lesson 1: The Calling of the Prophet', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '15 min', courseId: '1' },
    { title: 'Lesson 2: Protocol of the Spirit', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '20 min', courseId: '1' },
    { title: 'Lesson 3: Testing Prophetic Words', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '18 min', courseId: '1' },
    { title: 'Lesson 4: Spontaneous Songs of the Spirit', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '25 min', courseId: '1' },
    { title: 'Lesson 5: Activation Exercises', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '30 min', courseId: '1' },
    
    { title: 'Lesson 1: Understanding Intercession', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '22 min', courseId: '2' },
    { title: 'Lesson 2: Stand in the Gap', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '35 min', courseId: '2' },
    { title: 'Lesson 3: The Watchman Anointing', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '28 min', courseId: '2' },

    { title: 'Lesson 1: Discerning Demonic Strongholds', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '40 min', courseId: '3' },
    { title: 'Lesson 2: Deliverance Ministry Protocols', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '45 min', courseId: '3' }
  ];

  for (const v of videos) {
    await prisma.video.create({ data: v });
  }
  console.log('Seeded course videos.');

  // Create Transactions
  const transactions = [
    { student: 'Sister Chidinma Okafor', course: 'Foundations of Prophetic Ministry', amount: 29999, date: 'June 12, 2026', status: 'Successful' },
    { student: 'Brother Emmanuel Adeyemi', course: 'Spiritual Warfare & Deliverance Mastery', amount: 35000, date: 'June 11, 2026', status: 'Successful' },
    { student: 'Sister Grace Okoro', course: 'The School of Intercessory Prayer', amount: 19999, date: 'June 10, 2026', status: 'Successful' },
    { student: 'Sister Ruth Okafor', course: 'Kingdom Leadership & Apostolic Governance', amount: 39999, date: 'June 09, 2026', status: 'Successful' },
    { student: 'Sister Sarah Johnson', course: 'Divine Healing & Miracles', amount: 24999, date: 'June 08, 2026', status: 'Refunded' }
  ];

  for (const t of transactions) {
    await prisma.transaction.create({ data: t });
  }
  console.log('Seeded transactions.');

  // Create Assignments
  const assignments = [
    { student: 'Sister Chidinma Okafor', title: 'Activation 1: Discerning Atmosphere', date: 'June 12, 2026', submission: 'I sat in my quiet place and registered three distinct shifts in the atmosphere. The first was a sense of deep peace, followed by a heavy burden which resolved during intercessory prayers.', status: 'Pending Review' },
    { student: 'Sister Grace Okoro', title: 'Exercise 2: Journaling Prophetic Dreams', date: 'June 11, 2026', submission: 'In the dream, I saw a gate opening with letters written in gold. The interpretation seems to be that of a new portal of learning for our local community.', status: 'Graded', grade: 'A' }
  ];

  for (const a of assignments) {
    await prisma.assignment.create({ data: a });
  }
  console.log('Seeded assignments.');

  // Create SupportTickets
  const tickets = [
    { name: 'Sister Chidinma Okafor', category: 'Prophetic Counseling', subject: 'Dream Interpretation Guidance', message: 'I need guidance on a recurring dream regarding water gates. Can I schedule a session with a senior prophet?', status: 'Open', date: 'June 12, 2026' },
    { name: 'Brother Emmanuel Adeyemi', category: 'Technical Support', subject: 'Video Player Buffering', message: 'The videos in Lesson 3 are buffering repeatedly on my mobile web browser.', status: 'Open', date: 'June 11, 2026' },
    { name: 'Sister Grace Okoro', category: 'General Inquiry', subject: 'Certification Requirements', message: 'Will I receive a hardcopy certificate after completing the Advanced Prophetic Course?', status: 'Resolved', date: 'June 09, 2026' }
  ];

  for (const t of tickets) {
    await prisma.supportTicket.create({ data: t });
  }
  console.log('Seeded support tickets.');

  // Create Broadcasts
  const broadcasts = [
    { title: 'Prophetic Impartation Service', type: 'Live Stream', date: 'June 15, 2026', time: '7:00 PM WAT', host: 'Prophet Elijah Mensah', platform: 'YouTube Live', link: 'https://youtube.com/live/abc123', status: 'Upcoming', notified: true },
    { title: 'Intercessory Prayer Night', type: 'Zoom Meeting', date: 'June 18, 2026', time: '9:00 PM WAT', host: 'Minister Grace Okoro', platform: 'Zoom', link: 'https://zoom.us/j/123456', status: 'Upcoming', notified: false },
    { title: 'Kingdom Leadership Masterclass', type: 'Live Stream', date: 'June 05, 2026', time: '6:00 PM WAT', host: 'Apostle David Okonkwo', platform: 'YouTube Live', link: 'https://youtube.com/live/xyz789', status: 'Completed', notified: true }
  ];

  for (const b of broadcasts) {
    await prisma.broadcast.create({ data: b });
  }
  console.log('Seeded broadcasts.');

  // Create Certificates
  const certificates = [
    { id: 'CERT-2026-0001', student: 'Sister Chidinma Okafor', course: 'Foundations of Prophetic Ministry', completionDate: 'June 10, 2026', status: 'Issued', grade: 'A', verificationUrl: 'https://sop.org/verify/CERT-2026-0001' },
    { id: 'CERT-2026-0002', student: 'Brother Emmanuel Adeyemi', course: 'Spiritual Warfare & Deliverance Mastery', completionDate: 'June 08, 2026', status: 'Issued', grade: 'A-', verificationUrl: 'https://sop.org/verify/CERT-2026-0002' },
    { id: 'CERT-2026-0003', student: 'Sister Grace Okoro', course: 'The School of Intercessory Prayer', completionDate: 'June 12, 2026', status: 'Pending', grade: 'B+', verificationUrl: '' }
  ];

  for (const c of certificates) {
    await prisma.certificate.create({ data: c });
  }
  console.log('Seeded certificates.');

  // Create MentorshipGroups
  const mentorshipGroups = [
    { name: 'Eagles of Prophecy', mentor: 'Prophet Elijah Mensah', mentorEmail: 'elijah@example.com', students: '["Sister Chidinma Okafor", "Sister Grace Okoro"]', capacity: 5, status: 'Active', nextSession: 'June 16, 2026 — 4:00 PM' },
    { name: 'Warriors of Intercession', mentor: 'Minister Grace Okoro', mentorEmail: 'grace@example.com', students: '["Sister Ruth Okafor"]', capacity: 4, status: 'Active', nextSession: 'June 17, 2026 — 6:00 PM' }
  ];

  for (const m of mentorshipGroups) {
    await prisma.mentorshipGroup.create({ data: m });
  }
  console.log('Seeded mentorship groups.');

  // Create MentorMessages
  const mentorMessages = [
    { from: 'Sister Chidinma Okafor', to: 'Prophet Elijah Mensah', group: 'Eagles of Prophecy', message: 'Good evening Prophet. I had a vivid dream last night about golden scrolls. Can we discuss during our next session?', date: 'June 12, 2026' },
    { from: 'Brother Emmanuel Adeyemi', to: 'Apostle David Okonkwo', group: 'Kingdom Governors', message: 'Apostle, I have completed the governance map assignment. Please review when available.', date: 'June 11, 2026', read: true }
  ];

  for (const mm of mentorMessages) {
    await prisma.mentorMessage.create({ data: mm });
  }
  console.log('Seeded mentor messages.');

  // Create Coupons
  const coupons = [
    { code: 'PROPHETIC10', type: 'Percentage', value: 10, usageCount: 47, maxUses: 100, expiry: 'July 30, 2026', status: 'Active', description: 'New student welcome discount' },
    { code: 'PRAYER50', type: 'Fixed', value: 5000, usageCount: 12, maxUses: 25, expiry: 'June 30, 2026', status: 'Active', description: 'Prayer course special offer' }
  ];

  for (const c of coupons) {
    await prisma.coupon.create({ data: c });
  }
  console.log('Seeded coupons.');

  // Create Scholarships
  const scholarships = [
    { student: 'Sister Mary Adekunle', course: 'Foundations of Prophetic Ministry', reason: 'Financial hardship — single mother serving in local church ministry', status: 'Approved', dateApplied: 'June 05, 2026' },
    { student: 'Brother James Nwosu', course: 'Spiritual Warfare & Deliverance Mastery', reason: 'Full-time ministry worker with limited personal income', status: 'Pending', dateApplied: 'June 11, 2026' }
  ];

  for (const s of scholarships) {
    await prisma.scholarship.create({ data: s });
  }
  console.log('Seeded scholarships.');

  // Create AuditLogs
  const auditLogs = [
    { admin: 'System Admin', action: 'Created Course', target: 'Prophetic Worship & Psalmetry', date: 'June 12, 2026 — 2:15 PM', severity: 'info' },
    { admin: 'System Admin', action: 'Suspended User', target: 'Sister Ruth Okafor', date: 'June 12, 2026 — 1:30 PM', severity: 'warning' },
    { admin: 'Prophet Elijah Mensah', action: 'Graded Assignment', target: 'Activation 1 — Sister Grace Okoro', date: 'June 11, 2026 — 6:45 PM', severity: 'info' }
  ];

  for (const al of auditLogs) {
    await prisma.auditLog.create({ data: al });
  }
  console.log('Seeded audit logs.');

  // Create AdminRoles
  const adminRoles = [
    { name: 'System Admin', email: 'admin@sop.org', role: 'Super Admin', permissions: '["All Access"]', lastActive: 'Now' },
    { name: 'Prophet Elijah Mensah', email: 'elijah@example.com', role: 'Instructor', permissions: '["Grade Assignments", "View Students", "Manage Broadcasts"]', lastActive: '2 hours ago' },
    { name: 'Apostle David Okonkwo', email: 'david@example.com', role: 'Instructor', permissions: '["Grade Assignments", "View Students", "Manage Mentorship"]', lastActive: '5 hours ago' },
    { name: 'Demo Instructor', email: 'instructor@sop.org', role: 'Instructor', permissions: '["Grade Assignments", "View Students"]', lastActive: '1 hour ago' }
  ];

  for (const ar of adminRoles) {
    await prisma.adminRole.create({ data: ar });
  }
  console.log('Seeded admin roles.');

  const books = [
    {
      title: "Purpose & Destiny",
      author: "Pastor John Michael",
      coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
      description: "Discover God's unique purpose for your life and walk boldly in your destiny.",
      category: "Purpose",
      pdfUrl: "http://localhost:5001/books/purpose_and_destiny.pdf",
      selarUrl: "https://selar.co/purposedestiny",
      amazonUrl: "https://amazon.com/dp/purpose-destiny",
      price: 1500.0,
      pages: 120,
      downloads: 1530,
      rating: 4.9
    },
    {
      title: "The Prayer Warrior",
      author: "Sarah Williams",
      coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80",
      description: "A comprehensive guide to developing a powerful and effective prayer life.",
      category: "Prayer",
      pdfUrl: "http://localhost:5001/books/prayer_warrior.pdf",
      selarUrl: "https://selar.co/prayerwarrior",
      amazonUrl: "https://amazon.com/dp/prayer-warrior",
      price: 1000.0,
      pages: 150,
      downloads: 2100,
      rating: 4.8
    },
    {
      title: "Kingdom Economics",
      author: "David Thompson",
      coverUrl: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&q=80",
      description: "Biblical principles for financial freedom and kingdom stewardship.",
      category: "Finance",
      pdfUrl: "http://localhost:5001/books/kingdom_economics.pdf",
      selarUrl: "https://selar.co/kingdomeconomics",
      amazonUrl: "https://amazon.com/dp/kingdom-economics",
      price: 2000.0,
      pages: 180,
      downloads: 980,
      rating: 4.7
    },
    {
      title: "Walking in the Spirit",
      author: "Rachel Grace",
      coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80",
      description: "Learn to live a Spirit-led life in every area of your daily walk.",
      category: "Spiritual Growth",
      pdfUrl: "http://localhost:5001/books/walking_in_the_spirit.pdf",
      selarUrl: "https://selar.co/walkingspirit",
      amazonUrl: "https://amazon.com/dp/walking-spirit",
      price: 1200.0,
      pages: 140,
      downloads: 1420,
      rating: 4.9
    },
    {
      title: "Healing for the Broken",
      author: "Pastor John Michael",
      coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
      description: "Find emotional and spiritual healing through God's restoring power.",
      category: "Healing",
      pdfUrl: "http://localhost:5001/books/healing_broken.pdf",
      selarUrl: "https://selar.co/healingbroken",
      amazonUrl: "https://amazon.com/dp/healing-broken",
      price: 1800.0,
      pages: 165,
      downloads: 1150,
      rating: 4.8
    },
    {
      title: "The Family Altar",
      author: "Minister Rachel Grace",
      coverUrl: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&q=80",
      description: "Building a strong spiritual foundation for your family through daily devotion.",
      category: "Family",
      pdfUrl: "http://localhost:5001/books/family_altar.pdf",
      selarUrl: "https://selar.co/familyaltar",
      amazonUrl: "https://amazon.com/dp/family-altar",
      price: 1600.0,
      pages: 200,
      downloads: 750,
      rating: 4.9
    }
  ];
  for (const b of books) {
    await prisma.book.create({ data: b });
  }
  console.log('Seeded books.');

  console.log('Database seeding complete successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
