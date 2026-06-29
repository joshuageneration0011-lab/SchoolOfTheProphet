import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ status: 'ok' });
});

// Helper to log audit actions
async function createAuditLog(admin: string, action: string, target: string, severity: 'info' | 'warning' | 'danger') {
  try {
    await prisma.auditLog.create({
      data: {
        admin,
        action,
        target,
        date: new Date().toLocaleString(),
        severity
      }
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// ─── AUTHENTICATION ENDPOINTS ────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    await createAuditLog(user.name, 'User Login', user.email, 'info');

    // Parse enrolled and completed courses JSON strings
    const enrolled = JSON.parse(user.enrolledCourses);
    const completed = JSON.parse(user.completedCourses);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      enrolledCourses: enrolled,
      completedCourses: completed
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: 'student',
        enrolledCourses: '[]',
        completedCourses: '[]'
      }
    });

    await createAuditLog(user.name, 'User Signup', user.email, 'info');

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      enrolledCourses: [],
      completedCourses: []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ─── COURSES ENDPOINTS ───────────────────────────────────────────────────────
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: { videos: true }
    });

    const parsed = courses.map(c => ({
      ...c,
      whatYouLearn: JSON.parse(c.whatYouLearn),
      requirements: JSON.parse(c.requirements)
    }));

    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/courses', async (req, res) => {
  const { title, instructor, price, originalPrice, thumbnail, category, duration, level, description, whatYouLearn, requirements, videos } = req.body;
  try {
    const course = await prisma.course.create({
      data: {
        title,
        instructor,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        thumbnail,
        category,
        duration,
        lessons: videos ? videos.length : 0,
        level,
        description,
        whatYouLearn: JSON.stringify(whatYouLearn || []),
        requirements: JSON.stringify(requirements || []),
        isFeatured: true
      }
    });

    if (videos && Array.isArray(videos)) {
      for (const v of videos) {
        await prisma.video.create({
          data: {
            title: v.title,
            url: v.url,
            duration: v.duration,
            courseId: course.id
          }
        });
      }
    }

    await createAuditLog('Admin', 'Created Course', title, 'info');

    const createdCourse = await prisma.course.findUnique({
      where: { id: course.id },
      include: { videos: true }
    });

    res.status(201).json({
      ...createdCourse,
      whatYouLearn: JSON.parse(createdCourse!.whatYouLearn),
      requirements: JSON.parse(createdCourse!.requirements)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/courses/:id/videos', async (req, res) => {
  const { id } = req.params;
  const { title, url, duration } = req.body;
  try {
    const video = await prisma.video.create({
      data: {
        title,
        url,
        duration,
        courseId: id
      }
    });

    // Update lessons count
    const count = await prisma.video.count({ where: { courseId: id } });
    await prisma.course.update({
      where: { id },
      data: { lessons: count }
    });

    res.status(201).json(video);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ─── BOOKS ENDPOINTS ─────────────────────────────────────────────────────────
app.get('/api/books', async (req, res) => {
  try {
    const books = await prisma.book.findMany();
    res.json(books);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', async (req, res) => {
  const { title, author, coverUrl, description, category, pdfUrl, selarUrl, amazonUrl, price, pages } = req.body;
  try {
    const book = await prisma.book.create({
      data: {
        title,
        author,
        coverUrl,
        description,
        category,
        pdfUrl: pdfUrl || null,
        selarUrl: selarUrl || null,
        amazonUrl: amazonUrl || null,
        price: price ? parseFloat(price) : 0.0,
        pages: pages ? parseInt(pages) : 0,
        downloads: 0,
        rating: 5.0
      }
    });

    await createAuditLog('Admin', 'Created Book', title, 'info');
    res.status(201).json(book);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const { title, author, coverUrl, description, category, pdfUrl, selarUrl, amazonUrl, price, pages } = req.body;
  try {
    const book = await prisma.book.update({
      where: { id },
      data: {
        title,
        author,
        coverUrl,
        description,
        category,
        pdfUrl: pdfUrl || null,
        selarUrl: selarUrl || null,
        amazonUrl: amazonUrl || null,
        price: price ? parseFloat(price) : 0.0,
        pages: pages ? parseInt(pages) : 0
      }
    });

    await createAuditLog('Admin', 'Updated Book', title, 'info');
    res.json(book);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const book = await prisma.book.delete({
      where: { id }
    });

    await createAuditLog('Admin', 'Deleted Book', book.title, 'warning');
    res.json({ message: 'Book deleted successfully', id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});



// ─── USERS ENDPOINTS ─────────────────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const parsed = users.map(u => ({
      ...u,
      enrolledCourses: JSON.parse(u.enrolledCourses),
      completedCourses: JSON.parse(u.completedCourses)
    }));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { status }
    });

    await createAuditLog('Admin', `${status === 'Suspended' ? 'Suspended' : 'Activated'} User`, user.name, 'warning');

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ─── TRANSACTIONS ENDPOINTS ──────────────────────────────────────────────────
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  const { student, course, amount } = req.body;
  try {
    const tx = await prisma.transaction.create({
      data: {
        student,
        course,
        amount: parseFloat(amount),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: 'Successful'
      }
    });

    // Also auto enroll the student if matched by name/email
    const user = await prisma.user.findFirst({ where: { name: student } });
    if (user) {
      // Find course to get ID
      const courseRecord = await prisma.course.findFirst({ where: { title: course } });
      if (courseRecord) {
        const enrolled = JSON.parse(user.enrolledCourses);
        if (!enrolled.includes(courseRecord.id)) {
          enrolled.push(courseRecord.id);
          await prisma.user.update({
            where: { id: user.id },
            data: { enrolledCourses: JSON.stringify(enrolled) }
          });
        }
      }
    }

    res.status(201).json(tx);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ─── ASSIGNMENTS ENDPOINTS ───────────────────────────────────────────────────
app.get('/api/assignments', async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany();
    res.json(assignments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assignments', async (req, res) => {
  const { student, title, submission } = req.body;
  try {
    const assignment = await prisma.assignment.create({
      data: {
        student,
        title,
        submission,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: 'Pending Review'
      }
    });
    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/assignments/:id/grade', async (req, res) => {
  const { id } = req.params;
  const { grade, feedback, grader } = req.body;
  try {
    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        grade,
        feedback,
        status: 'Graded'
      }
    });

    await createAuditLog(grader || 'Instructor', 'Graded Assignment', `${assignment.title} — ${assignment.student}`, 'info');

    res.json(assignment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ─── SUPPORT TICKETS ENDPOINTS ───────────────────────────────────────────────
app.get('/api/support', async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany();
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/support', async (req, res) => {
  const { name, category, subject, message } = req.body;
  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        name,
        category,
        subject,
        message,
        status: 'Open',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      }
    });
    res.status(201).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/support/:id/resolve', async (req, res) => {
  const { id } = req.params;
  const { replyText, resolver } = req.body;
  try {
    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status: 'Resolved' }
    });

    await createAuditLog(resolver || 'Admin', 'Resolved Support Ticket', ticket.subject, 'info');

    res.json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ─── BROADCASTS ENDPOINTS ────────────────────────────────────────────────────
app.get('/api/broadcasts', async (req, res) => {
  try {
    const broadcasts = await prisma.broadcast.findMany();
    res.json(broadcasts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/broadcasts', async (req, res) => {
  const { title, type, date, time, host, platform, link } = req.body;
  try {
    const bc = await prisma.broadcast.create({
      data: {
        title,
        type,
        date,
        time,
        host,
        platform,
        link,
        status: 'Upcoming',
        notified: false
      }
    });

    await createAuditLog('Admin', 'Scheduled Broadcast', title, 'info');

    res.status(201).json(bc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/broadcasts/:id/notify', async (req, res) => {
  const { id } = req.params;
  try {
    const bc = await prisma.broadcast.update({
      where: { id },
      data: { notified: true }
    });

    await createAuditLog('Admin', 'Notified Students of Broadcast', bc.title, 'info');

    res.json(bc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/broadcasts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const bc = await prisma.broadcast.delete({
      where: { id }
    });

    await createAuditLog('Admin', 'Deleted Broadcast', bc.title, 'warning');

    res.json({ message: 'Deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ─── CERTIFICATES ENDPOINTS ──────────────────────────────────────────────────
app.get('/api/certificates', async (req, res) => {
  try {
    const certs = await prisma.certificate.findMany();
    res.json(certs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/certificates/verify/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const cert = await prisma.certificate.findUnique({
      where: { id }
    });
    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.json(cert);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/certificates', async (req, res) => {
  const { id, student, course, completionDate, grade } = req.body;
  try {
    const cert = await prisma.certificate.create({
      data: {
        id,
        student,
        course,
        completionDate,
        grade,
        status: 'Issued',
        verificationUrl: `https://sop.org/verify/${id}`
      }
    });

    await createAuditLog('Admin', 'Issued Certificate', `${id} — ${student}`, 'info');

    res.status(201).json(cert);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/certificates/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const cert = await prisma.certificate.update({
      where: { id },
      data: { status }
    });

    await createAuditLog('Admin', `${status} Certificate`, id, status === 'Revoked' ? 'danger' : 'info');

    res.json(cert);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ─── MENTORSHIP ENDPOINTS ────────────────────────────────────────────────────
app.get('/api/mentorship/groups', async (req, res) => {
  try {
    const groups = await prisma.mentorshipGroup.findMany();
    const parsed = groups.map(g => ({
      ...g,
      students: JSON.parse(g.students)
    }));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mentorship/groups', async (req, res) => {
  const { name, mentor, mentorEmail, capacity, nextSession } = req.body;
  try {
    const group = await prisma.mentorshipGroup.create({
      data: {
        name,
        mentor,
        mentorEmail,
        capacity: parseInt(capacity),
        nextSession,
        students: '[]'
      }
    });

    await createAuditLog(mentor, 'Created Mentorship Group', name, 'info');

    res.status(201).json({
      ...group,
      students: []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mentorship/messages', async (req, res) => {
  try {
    const messages = await prisma.mentorMessage.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mentorship/messages', async (req, res) => {
  const { from, to, group, message } = req.body;
  try {
    const msg = await prisma.mentorMessage.create({
      data: {
        from,
        to,
        group,
        message,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      }
    });
    res.status(201).json(msg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ─── PROMOTIONS & SCHOLARSHIPS ENDPOINTS ─────────────────────────────────────
app.get('/api/promotions/coupons', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany();
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promotions/coupons', async (req, res) => {
  const { code, type, value, maxUses, expiry, description } = req.body;
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        value: parseFloat(value),
        maxUses: parseInt(maxUses),
        expiry,
        description,
        status: 'Active'
      }
    });

    await createAuditLog('Admin', 'Created Promo Coupon', code, 'info');

    res.status(201).json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/promotions/coupons/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: { status }
    });

    await createAuditLog('Admin', `Updated Coupon status to ${status}`, coupon.code, 'info');

    res.json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/promotions/coupons/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const coupon = await prisma.coupon.delete({
      where: { id }
    });
    await createAuditLog('Admin', 'Deleted Promo Coupon', coupon.code, 'warning');
    res.json({ message: 'Deleted successfully', id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/promotions/scholarships', async (req, res) => {
  try {
    const list = await prisma.scholarship.findMany();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promotions/scholarships', async (req, res) => {
  const { student, course, reason } = req.body;
  try {
    const scholarship = await prisma.scholarship.create({
      data: {
        student,
        course,
        reason,
        status: 'Pending',
        dateApplied: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      }
    });
    res.status(201).json(scholarship);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/promotions/scholarships/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const s = await prisma.scholarship.update({
      where: { id },
      data: { status }
    });

    await createAuditLog('Admin', `${status} Financial Aid Request`, s.student, status === 'Approved' ? 'info' : 'warning');

    // If approved, auto-enroll student in the course
    if (status === 'Approved') {
      const user = await prisma.user.findFirst({ where: { name: s.student } });
      const course = await prisma.course.findFirst({ where: { title: s.course } });
      if (user && course) {
        const enrolled = JSON.parse(user.enrolledCourses);
        if (!enrolled.includes(course.id)) {
          enrolled.push(course.id);
          await prisma.user.update({
            where: { id: user.id },
            data: { enrolledCourses: JSON.stringify(enrolled) }
          });
        }
      }
    }

    res.json(s);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ─── AUDIT LOGS & ROLES ENDPOINTS ───────────────────────────────────────────
app.get('/api/audit/logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit/logs', async (req, res) => {
  const { admin, action, target, severity } = req.body;
  try {
    const log = await prisma.auditLog.create({
      data: {
        admin,
        action,
        target,
        date: new Date().toLocaleString(),
        severity
      }
    });
    res.status(201).json(log);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/audit/roles', async (req, res) => {
  try {
    const roles = await prisma.adminRole.findMany();
    const parsed = roles.map(r => ({
      ...r,
      permissions: JSON.parse(r.permissions)
    }));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit/roles', async (req, res) => {
  const { name, email, role, permissions } = req.body;
  try {
    const staff = await prisma.adminRole.create({
      data: {
        name,
        email,
        role,
        permissions: JSON.stringify(permissions || []),
        lastActive: 'Never'
      }
    });

    // Also auto-register a corresponding User account for staff access
    await prisma.user.create({
      data: {
        name,
        email,
        password: 'staffpassword123',
        role: role.toLowerCase().includes('admin') ? 'admin' : 'instructor'
      }
    });

    await createAuditLog('Admin', 'Invited Administrative Staff', `${name} (${role})`, 'info');

    res.status(201).json({
      ...staff,
      permissions: permissions || []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/audit/roles/:id/permissions', async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;
  try {
    const staff = await prisma.adminRole.update({
      where: { id },
      data: {
        permissions: JSON.stringify(permissions || [])
      }
    });

    await createAuditLog('Admin', 'Updated Staff Permissions', staff.name, 'info');

    res.json({
      ...staff,
      permissions: permissions || []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/audit/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const staff = await prisma.adminRole.delete({
      where: { id }
    });

    // Delete corresponding user profile
    await prisma.user.deleteMany({
      where: { email: staff.email }
    });

    await createAuditLog('Admin', 'Revoked Administrative Staff Access', staff.name, 'warning');

    res.json({ message: 'Staff registry credentials revoked successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`SOP Academy REST API Backend running on http://localhost:${PORT}`);
});
