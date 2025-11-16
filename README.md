# AfriFund - Crowdfunding + Mentorship Platform for African Innovators

![AfriFund Logo](https://via.placeholder.com/800x200?text=AfriFund+-+Empowering+African+Innovation)

AfriFund is a comprehensive crowdfunding and mentorship platform designed specifically for African innovators. The platform enables creators to raise funds, connect with experienced mentors who earn equity, and provides automatic free digital certificates to all donors.

## 🎯 Key Features

### Core Functionality
- ✅ **User Authentication** - Secure JWT-based authentication with role-based access control (Creator, Backer, Mentor, Admin)
- ✅ **KYC Verification** - Mock KYC system with auto-approval for MVP (structured for real integration)
- ✅ **Campaign Management** - Full CRUD operations with admin approval workflow
- ✅ **Payment Integration** - Mock payment providers (Flutterwave, Paystack, M-Pesa) with webhook handling
- ✅ **Pledge System** - Complete donation flow with automatic fee calculation (3%)
- ✅ **Certificate Generation** - Automatic PDF certificate generation for all donors (FREE, no upgrades)
- ✅ **Mentor System** - Mentor profiles, session tracking, and equity ledger
- ✅ **Admin Dashboard** - Platform analytics, revenue tracking, and management tools
- ✅ **Notifications** - Event-driven notification system
- ✅ **Activity Feed** - Real-time updates on platform activities

### Security Features
- 🔐 Field-level validation with Zod
- 🔐 Rate limiting (IP + user-based)
- 🔐 Webhook signature validation
- 🔐 RBAC (Role-Based Access Control)
- 🔐 Input sanitization
- 🔐 UUID v7 for all IDs

## 📦 Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache/Queue**: Redis + BullMQ
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **PDF Generation**: pdf-lib
- **Payments**: Axios (for payment gateway APIs)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **UI Components**: Custom components with CVA
- **Icons**: Lucide React
- **Notifications**: Sonner

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Deployment**: Vercel (frontend) + Railway/Render (backend)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Docker & Docker Compose (for containerized setup)
- PostgreSQL 15+ (for local development)
- Redis 7+ (for local development)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/afrifund.git
cd afrifund
```

2. **Set up environment variables**
```bash
# Create backend .env file
cp backend/.env.example backend/.env

# Create frontend .env.local file
cp frontend/.env.local.example frontend/.env.local
```

3. **Start all services with Docker Compose**
```bash
cd docker
docker-compose up -d
```

4. **Run database migrations**
```bash
docker exec -it afrifund-backend npx prisma migrate deploy
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Postgres: localhost:5432
- Redis: localhost:6379

### Option 2: Local Development Setup

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start PostgreSQL and Redis**
```bash
# Using Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15-alpine
docker run -d -p 6379:6379 redis:7-alpine
```

5. **Run database migrations**
```bash
npm run prisma:migrate
npm run prisma:generate
```

6. **Start the backend server**
```bash
npm run start:dev
```

Backend will be running at http://localhost:3001

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. **Start the development server**
```bash
npm run dev
```

Frontend will be running at http://localhost:3000

## 📂 Project Structure

```
afrifund/
├── backend/                  # NestJS Backend
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication
│   │   │   ├── users/       # User management
│   │   │   ├── kyc/         # KYC verification
│   │   │   ├── campaigns/   # Campaign CRUD
│   │   │   ├── pledges/     # Donation system
│   │   │   ├── payments/    # Payment integration
│   │   │   ├── certificates/# PDF generation
│   │   │   ├── mentors/     # Mentor system
│   │   │   ├── notifications/# Event notifications
│   │   │   └── admin/       # Admin dashboard
│   │   ├── common/          # Shared utilities
│   │   │   ├── guards/      # Auth guards
│   │   │   ├── decorators/  # Custom decorators
│   │   │   ├── filters/     # Exception filters
│   │   │   └── interceptors/# Response interceptors
│   │   ├── config/          # Configuration
│   │   ├── database/        # Prisma setup
│   │   ├── app.module.ts    # Root module
│   │   └── main.ts          # Entry point
│   ├── prisma/              # Database schema
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # Next.js Frontend
│   ├── app/                 # App router pages
│   │   ├── auth/            # Authentication pages
│   │   ├── campaigns/       # Campaign pages
│   │   ├── dashboard/       # User dashboard
│   │   ├── mentors/         # Mentor pages
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── layouts/         # Layout components
│   │   ├── forms/           # Form components
│   │   └── campaigns/       # Campaign components
│   ├── lib/                 # Utilities
│   │   ├── api/             # API clients
│   │   ├── stores/          # Zustand stores
│   │   ├── utils/           # Helper functions
│   │   └── validators/      # Zod schemas
│   ├── public/              # Static assets
│   ├── styles/              # Global styles
│   ├── Dockerfile
│   └── package.json
│
├── prisma/                   # Prisma files
│   └── schema.prisma        # Database schema
│
├── docker/                   # Docker configuration
│   └── docker-compose.yml
│
├── docs/                     # Documentation
├── tests/                    # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .gitignore
└── README.md
```

## 🗄️ Database Schema

The platform uses PostgreSQL with Prisma ORM. Key tables include:

- **users** - User accounts with roles
- **kyc** - KYC verification data
- **campaigns** - Crowdfunding campaigns
- **campaign_media** - Campaign images/videos
- **pledges** - Donation records
- **payment_transactions** - Payment processing
- **certificates** - Donor certificates
- **mentors** - Mentor profiles
- **mentor_sessions** - Mentoring sessions
- **mentor_ledger** - Equity tracking
- **platform_revenue** - Fee collection
- **notifications** - User notifications

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/verify-token` - Verify JWT token
- `GET /api/v1/auth/me` - Get current user

### KYC
- `POST /api/v1/kyc/submit` - Submit KYC
- `GET /api/v1/kyc/status` - Get KYC status
- `GET /api/v1/kyc/pending` - Get pending KYC (Admin)
- `PATCH /api/v1/kyc/:id/approve` - Approve KYC (Admin)
- `PATCH /api/v1/kyc/:id/reject` - Reject KYC (Admin)

### Campaigns
- `GET /api/v1/campaigns` - List campaigns
- `GET /api/v1/campaigns/:id` - Get campaign by ID
- `GET /api/v1/campaigns/slug/:slug` - Get campaign by slug
- `POST /api/v1/campaigns` - Create campaign
- `PATCH /api/v1/campaigns/:id` - Update campaign
- `POST /api/v1/campaigns/:id/approve` - Approve campaign (Admin)
- `POST /api/v1/campaigns/:id/reject` - Reject campaign (Admin)

### Pledges
- `POST /api/v1/pledges` - Create pledge
- `GET /api/v1/pledges/my-pledges` - Get user pledges
- `GET /api/v1/pledges/campaign/:id` - Get campaign pledges
- `GET /api/v1/pledges/:id` - Get pledge details

### Payments
- `POST /api/v1/payments/initiate` - Initialize payment
- `GET /api/v1/payments/verify/:provider/:reference` - Verify payment
- `POST /api/v1/payments/webhook/:provider` - Payment webhooks

### Certificates
- `GET /api/v1/certificates/my-certificates` - Get user certificates
- `GET /api/v1/certificates/:id` - Get certificate
- `GET /api/v1/certificates/:id/download` - Download PDF

### Mentors
- `GET /api/v1/mentors` - List mentors
- `GET /api/v1/mentors/:id` - Get mentor profile
- `POST /api/v1/mentors/profile` - Create mentor profile
- `POST /api/v1/mentors/:id/sessions` - Create session
- `GET /api/v1/mentors/:id/ledger` - Get equity ledger

### Admin
- `GET /api/v1/admin/dashboard` - Dashboard stats
- `GET /api/v1/admin/activity` - Recent activity
- `GET /api/v1/admin/revenue` - Revenue analytics
- `POST /api/v1/admin/payout/:campaignId` - Process payout

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests
```bash
cd frontend

# Run tests
npm test
```

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. Set up PostgreSQL database
2. Set up Redis instance
3. Configure environment variables
4. Deploy from GitHub repository
5. Run migrations: `npx prisma migrate deploy`

### Frontend Deployment (Vercel)

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push to main

## 🔒 Security Considerations

- All user inputs are validated using Zod schemas
- Passwords are hashed with bcrypt
- JWT tokens for authentication
- Rate limiting on all endpoints
- Webhook signature verification
- SQL injection prevention via Prisma
- XSS protection
- CORS configuration
- Environment variable protection

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/afrifund
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
PLATFORM_FEE_PERCENTAGE=3.0
MOCK_KYC_AUTO_APPROVE=true
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS=true
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Project Lead**: Your Name
- **Backend Developer**: Your Name
- **Frontend Developer**: Your Name
- **DevOps**: Your Name

## 📧 Contact

For questions or support, please contact:
- Email: support@afrifund.com
- Website: https://afrifund.com
- Twitter: @afrifund

## 🙏 Acknowledgments

- All African innovators and entrepreneurs
- Open source community
- Payment gateway providers
- Mentors and supporters

---

**Built with ❤️ for Africa**
