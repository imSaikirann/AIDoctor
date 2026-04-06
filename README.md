# AI Doctor Appointment & Medical Support System

This project is a full-stack healthcare web application built for project submission. It helps patients connect with doctors, book appointments, access medical support features, and order medicines through one platform.

The system includes role-based access for patients, doctors, and admins. It also provides an AI-powered medical assistant for basic guidance and triage support.

## Project Overview

The application is designed to simplify common healthcare tasks in a digital environment. Patients can register, find verified doctors, book appointments, view records, chat with the AI assistant, and order medicines. Doctors can manage their appointments, and admins can verify doctors and manage platform operations.

## Main Features

- Patient registration and login
- Doctor registration with admin verification flow
- Admin login and dashboard
- Role-based dashboards for patient, doctor, and admin
- Doctor listing with available appointment slots
- Appointment booking and emergency booking
- AI chat assistant for basic medical guidance
- AI triage endpoint for symptom risk analysis
- Medical record management with encrypted content storage
- Medicine listing and shopping cart
- Order placement and order tracking
- Multi-language support in the frontend

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- i18next
- Axios

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- MongoDB
- JWT authentication
- Groq API for AI chat and triage

## Project Structure

```text
doctor/
|-- client/
|   `-- client/
|       |-- src/
|       |-- public/
|       `-- package.json
|-- server/
|   |-- prisma/
|   |-- src/
|   `-- package.json
`-- README.md
```

## User Roles

### Patient
- Register and log in
- View verified doctors
- Book appointments
- Use emergency consultation option
- Access AI medical assistant
- Manage cart and place medicine orders
- View appointments, orders, and medical records

### Doctor
- Register with name, specialization, and consultation link
- Wait for admin verification
- View booked appointments after approval

### Admin
- Seed or create admin account
- Access admin dashboard
- Verify doctors
- Manage medicines and orders

## Setup Instructions

### 1. Clone the project

```bash
git clone <repository-url>
cd doctor
```

### 2. Install dependencies

Install frontend dependencies:

```bash
cd client/client
npm install
```

Install backend dependencies:

```bash
cd ../../server
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `server` folder.

Example:

```env
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
GROQ_API_KEY="your_groq_api_key"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
PORT=5000
NODE_ENV=development
```

## Database Setup

This project uses MongoDB with Prisma.

Generate Prisma client:

```bash
cd server
npx prisma generate
```

If needed, push the schema to the database:

```bash
npx prisma db push
```

Seed the admin account:

```bash
npm run seed:admin
```

## Run the Project

### Start the backend

```bash
cd server
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Start the frontend

Open a new terminal:

```bash
cd client/client
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Important API Areas

- `/api/auth` - authentication and user session routes
- `/api/admin` - admin actions
- `/api/appointments` - doctor listing, slots, and booking
- `/api/records` - medical record routes
- `/api/ai` - AI chat and triage routes
- `/api/medicines` - medicine management
- `/api/cart` - cart operations
- `/api/orders` - order operations
- `/health` - server health check

## Submission Notes

This project demonstrates:

- Full-stack web application development
- Role-based authentication and authorization
- REST API development
- MongoDB database integration using Prisma
- AI integration for medical assistance
- E-commerce style medicine ordering flow
- Multilingual frontend support

## Future Improvements

- Add online payment integration
- Add email or SMS notifications
- Improve doctor scheduling with real calendar integration
- Add file upload for reports and prescriptions
- Strengthen production security and validation

## Conclusion

This project is a healthcare support platform that combines appointment booking, medicine ordering, medical record handling, and AI-based assistance in one system. It is suitable as an academic or portfolio submission because it demonstrates both frontend and backend development with practical real-world features.
