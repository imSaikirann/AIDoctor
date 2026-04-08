# AI Doctor Appointment and Medical Support System

## Overview

The AI Doctor Appointment and Medical Support System is a full-stack healthcare web application developed for project submission. It provides a single platform where patients can book doctor appointments, access medical support features, manage records, and order medicines.

The application supports three main user roles:
- Patient
- Doctor
- Admin

It also includes an AI-powered assistant for basic medical guidance and symptom triage support.

## Project Goal

The goal of this project is to create a simple and user-friendly digital healthcare system that brings important medical services together in one place.

This project helps solve common problems such as:
- difficulty in finding available doctors quickly
- manual and slow appointment booking process
- separate systems for records and medicine ordering
- lack of quick basic healthcare guidance

## Core Features

- Patient registration and login
- Doctor registration with admin approval
- Admin login and dashboard
- Role-based access control
- Verified doctor listing
- Appointment slot viewing and booking
- Emergency consultation booking
- AI chat for basic medical guidance
- AI triage support for symptom-based response
- Medical record management
- Medicine browsing and stock display
- Cart and order management
- Multi-language support

## User Roles

### Patient
A patient can:
- create an account and log in
- view verified doctors
- check available appointment slots
- book appointments
- use emergency booking
- access the AI assistant
- view medical records
- browse medicines
- add medicines to cart
- place and track orders

### Doctor
A doctor can:
- register in the system
- add professional details such as name and specialization
- provide a consultation link
- wait for admin verification
- view appointments after approval

### Admin
An admin can:
- log in to the admin panel
- verify doctor registrations
- manage medicines
- manage orders
- monitor platform activity

## Project Modules

### Authentication Module
Handles user registration, login, logout, and role-based authorization.

### Appointment Module
Allows patients to view doctors, check available slots, and book appointments.

### Emergency Booking Module
Provides quick consultation support for urgent cases.

### AI Assistant Module
Offers AI-based medical chat and triage support. This module is for informational guidance only and does not replace professional medical advice.

### Medical Records Module
Stores and manages patient medical records in a protected format.

### Medicine and Orders Module
Allows users to browse medicines, add products to cart, place orders, and track order status.

### Admin Module
Enables doctor verification and management of medicines and orders.

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- i18next

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication
- Groq API

### Database
- MongoDB

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

## Main Backend Routes

- `/api/auth` for authentication and user session management
- `/api/admin` for admin operations
- `/api/appointments` for doctor listing, slots, and booking
- `/api/records` for medical record operations
- `/api/ai` for AI chat and triage support
- `/api/medicines` for medicine management
- `/api/cart` for cart operations
- `/api/orders` for order placement and tracking
- `/health` for server health status

## Setup Instructions

### 1. Install frontend dependencies

```bash
cd client/client
npm install
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Create environment file

Create a `.env` file inside the `server` folder and add:

```env
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
GROQ_API_KEY="your_groq_api_key"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
PORT=5000
NODE_ENV=development
```

### 4. Generate Prisma client

```bash
cd server
npx prisma generate
```

### 5. Push the schema to the database

```bash
npx prisma db push
```

### 6. Seed the admin account

```bash
npm run seed:admin
```

## Running the Application

### Start the backend server

```bash
cd server
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

### Start the frontend server

```bash
cd client/client
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Expected Outcome

After running the project:
- patients can book appointments and order medicines online
- doctors can manage consultations after verification
- admins can control major platform operations
- users can access basic AI-powered medical support
- healthcare-related actions become easier to manage in one platform

## Advantages

- simple and centralized healthcare platform
- secure role-based access
- appointment and medicine services in one application
- AI support for quick basic guidance
- useful for academic and practical demonstration purposes

## Limitations

- AI responses are only informational
- payment integration is not implemented yet
- notification system is not added yet
- production-level deployment improvements are still possible

## Future Enhancements

- add online payment support
- add email or SMS notifications
- add video consultation support
- add report and prescription upload
- improve admin analytics and reporting
- develop a mobile application version

## Conclusion

The AI Doctor Appointment and Medical Support System is a practical full-stack healthcare project that combines doctor appointment booking, AI-based assistance, medical records, and medicine ordering in a single platform. It is suitable for academic submission because it demonstrates frontend development, backend API design, database integration, authentication, and AI integration in a real-world use case.
