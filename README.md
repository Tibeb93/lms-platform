# 🎓 LearnHub — Full-Stack LMS Platform

A production-ready Learning Management System built with React, Node.js, MongoDB, and Stripe.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion, Zustand |
| Backend | Node.js, Express.js, MongoDB + Mongoose |
| Auth | JWT + Refresh Tokens, bcryptjs |
| Payments | Stripe Checkout |
| Media | Cloudinary (images + videos) |
| Real-time | Socket.io |
| Email | Nodemailer |
| PDF | PDFKit (certificates) |

---

## 📁 Project Structure

```
LMS/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, Cloudinary config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, error handling, validation
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helpers (email, tokens, PDF)
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   │   ├── common/     # CourseCard, StarRating, Loaders
    │   │   └── layout/     # Navbar, Footer, DashboardLayout
    │   ├── pages/          # All page components
    │   │   ├── auth/       # Login, Register, ForgotPassword
    │   │   ├── student/    # Dashboard, LearnCourse, Certificates
    │   │   ├── instructor/ # Dashboard, CourseEditor, Earnings
    │   │   └── admin/      # Dashboard, Users, Courses
    │   ├── services/       # API service layer (axios)
    │   ├── store/          # Zustand state management
    │   └── lib/            # Utilities
    ├── .env.example
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Stripe account

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
# Fill in your .env values
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env
# Fill in your .env values
npm install
npm run dev
```

### 2. Environment Variables

**Backend `.env`:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
EMAIL_FROM=LearnHub <noreply@learnhub.com>
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:5173
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/verify-email/:token` | Verify email |
| POST | `/api/auth/forgot-password` | Request reset |
| PUT | `/api/auth/reset-password/:token` | Reset password |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List courses (with filters) |
| GET | `/api/courses/:slug` | Get course details |
| POST | `/api/courses` | Create course (instructor) |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |
| PUT | `/api/courses/:id/publish` | Toggle publish |

### Enrollments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/enrollments/:courseId` | Enroll (free) |
| GET | `/api/enrollments/:courseId/progress` | Get progress |
| PUT | `/api/enrollments/:courseId/progress` | Update progress |
| GET/POST | `/api/enrollments/:courseId/notes` | Notes |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/checkout/:courseId` | Create Stripe session |
| GET | `/api/payments/verify/:sessionId` | Verify payment |
| POST | `/api/payments/webhook` | Stripe webhook |

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
# Set VITE_API_URL to your backend URL
```

### Backend → Render/Railway
```bash
# Set all environment variables in dashboard
# Start command: npm start
# Build command: npm install
```

### Database → MongoDB Atlas
1. Create a free cluster at mongodb.com/atlas
2. Add your IP to the allowlist (or 0.0.0.0/0 for all)
3. Create a database user
4. Copy the connection string to MONGODB_URI

---

## 🔑 Key Features

- ✅ JWT Authentication with refresh tokens
- ✅ Role-based access (Student / Instructor / Admin)
- ✅ Email verification & password reset
- ✅ Course creation with sections & lessons
- ✅ Video upload via Cloudinary
- ✅ Progress tracking with resume playback
- ✅ Quiz system with auto-grading
- ✅ PDF certificate generation
- ✅ Stripe payment integration
- ✅ Real-time notifications via Socket.io
- ✅ Discussion forums
- ✅ In-video notes
- ✅ Dark/light mode
- ✅ Fully responsive design
- ✅ Admin dashboard with analytics

---

## 📄 License

MIT License — free to use for personal and commercial projects.
