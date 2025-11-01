# OfficePro - HR Management System

A comprehensive Human Resources Management System (HRMS) built with the MERN stack, featuring employee management, attendance tracking, leave management, asset management, and more.

## 🚀 Features

### Core Features

- **User Authentication & Authorization** - Secure login/signup with JWT tokens
- **Company Management** - Multi-tenant architecture with company onboarding
- **Employee Management** - Complete employee lifecycle management
- **Department Management** - Organize employees into departments
- **Attendance Tracking** - Check-in/check-out with location tracking
- **Leave Management** - Request, approve, and track employee leaves
- **Asset Management** - Track and assign company assets
- **Billing & Subscriptions** - Multiple subscription plans (Free, Pro, Enterprise)
- **Reports & Analytics** - Comprehensive reporting dashboard
- **Mobile Responsive** - Works seamlessly on all devices

### Technical Features

- **RESTful API** - Well-structured backend API
- **Database Models** - MongoDB with Mongoose ODM
- **Authentication Middleware** - Role-based access control
- **Data Validation** - Input validation and sanitization
- **Error Handling** - Comprehensive error management
- **Security** - Helmet, CORS, rate limiting
- **Modern UI** - Tailwind CSS with responsive design

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Multer** - File uploads
- **Stripe** - Payment processing
- **Nodemailer** - Email services

### Frontend

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **Heroicons** - Icons
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Framer Motion** - Animations

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

4. Start the backend server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend/vite-project
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:

```bash
npm run dev
```

## 🚀 Getting Started

1. **Start MongoDB** - Make sure MongoDB is running on your system
2. **Start Backend** - Run `npm run dev` in the backend directory
3. **Start Frontend** - Run `npm run dev` in the frontend directory
4. **Open Browser** - Navigate to `http://localhost:5173`

## 📱 Usage

### First Time Setup

1. Create a new account by clicking "Sign Up"
2. Fill in your company information
3. Choose a subscription plan
4. Start managing your HR processes

### Key Features

- **Dashboard** - Overview of key metrics and recent activities
- **Employee Management** - Add, edit, and manage employee information
- **Attendance Tracking** - Monitor employee check-ins and check-outs
- **Leave Management** - Handle leave requests and approvals
- **Asset Management** - Track company assets and assignments
- **Reports** - Generate comprehensive reports and analytics

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Companies

- `GET /api/companies` - Get all companies (Super Admin)
- `GET /api/companies/:id` - Get company by ID
- `PUT /api/companies/:id` - Update company
- `PUT /api/companies/:id/plan` - Update subscription plan
- `PUT /api/companies/:id/status` - Update company status

### Employees

- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Departments

- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Attendance

- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/today` - Get today's attendance
- `POST /api/attendance/checkin` - Check in employee
- `POST /api/attendance/checkout` - Check out employee
- `PUT /api/attendance/:id` - Update attendance record

### Leaves

- `GET /api/leaves` - Get leave requests
- `GET /api/leaves/pending` - Get pending leaves
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id/approve` - Approve leave
- `PUT /api/leaves/:id/reject` - Reject leave
- `PUT /api/leaves/:id/cancel` - Cancel leave

### Assets

- `GET /api/assets` - Get all assets
- `GET /api/assets/:id` - Get asset by ID
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `POST /api/assets/:id/assign` - Assign asset
- `POST /api/assets/:id/unassign` - Unassign asset

### Billing

- `GET /api/billing/plans` - Get subscription plans
- `GET /api/billing/current` - Get current subscription
- `POST /api/billing/subscribe` - Subscribe to plan
- `POST /api/billing/cancel` - Cancel subscription
- `GET /api/billing/invoices` - Get invoices
- `GET /api/billing/usage` - Get usage statistics

### Reports

- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/attendance` - Get attendance report
- `GET /api/reports/leaves` - Get leave report
- `GET /api/reports/employees` - Get employee report
- `GET /api/reports/assets` - Get asset report
- `POST /api/reports/export` - Export report data

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for password security
- **Input Validation** - Express validator for data validation
- **Rate Limiting** - Prevent abuse with rate limiting
- **CORS Protection** - Cross-origin resource sharing protection
- **Helmet Security** - Security headers
- **Role-based Access** - Different permissions for different roles

## 📊 Database Schema

### User Model

- Personal information (name, email, phone, address)
- Company and department associations
- Role-based permissions
- Authentication data

### Company Model

- Company information and settings
- Subscription and billing data
- Multi-tenant configuration

### Department Model

- Department information
- Head of department
- Employee associations

### Attendance Model

- Check-in/check-out times
- Location tracking
- Status and notes

### Leave Model

- Leave type and duration
- Approval workflow
- Status tracking

### Asset Model

- Asset information and specifications
- Assignment tracking
- Maintenance history

## 🚀 Deployment

### Backend Deployment

1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Set up domain and SSL certificates

### Frontend Deployment

1. Build the production version: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS
3. Configure environment variables
4. Set up custom domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Roadmap

- [ ] Advanced reporting features
- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] Integration with third-party services
- [ ] Advanced workflow automation
- [ ] Multi-language support
- [ ] Advanced security features

---

Built with ❤️ using the MERN stack

