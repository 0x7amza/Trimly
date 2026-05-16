Auth Flow Diagram
    graph TD
    %% Barber Auth Flow
    subgraph Barber [Barber / Salon Owner]
        B1[Login/Signup] --> B2[Clerk SDK Frontend]
        B2 -->|Token| B3[Backend API]
        B3 --> B4{Clerk Express Middleware}
        B4 -->|Valid| B5[Access Protected B2B Routes]
        B4 -->|Invalid| B6[401 Unauthorized]
    end

    %% Customer Auth Flow
    subgraph Customer [Customer]
        C1[Enter Phone/Email] --> C2[Backend Auth Route]
        C2 --> C3{Has Account?}
        C3 -->|No| C4[Send OTP via WhatsApp/SMS Twilio]
        C4 --> C5[Verify OTP & Create User]
        C3 -->|Yes| C6[Login with Password or OTP]
        C5 --> C7[Generate Custom JWT]
        C6 --> C7
        C7 --> C8[Access Protected B2C Routes]
    end


MongoDB Schema Relations
    erDiagram
    BARBER ||--o{ SERVICE : offers
    BARBER ||--o{ BOOKING : receives
    CUSTOMER ||--o{ BOOKING : makes
    
    BARBER {
        string clerkId PK
        string name
        string slug "For custom URL"
        object settings "Business Hours, etc."
    }
    
    SERVICE {
        objectId id PK
        string barberId FK
        string name "e.g. Haircut"
        number price
        number durationMinutes "e.g. 15, 30"
    }
    
    CUSTOMER {
        objectId id PK
        string phone "Unique"
        string email
        string passwordHash
    }
    
    BOOKING {
        objectId id PK
        string barberId FK
        string customerId FK "Null if Walk-in"
        string serviceId FK
        datetime startTime
        datetime endTime
        string status "PENDING, CONFIRMED, CANCELLED, COMPLETED"
        string paymentStatus "UNPAID, DEPOSIT_PAID, PAID_IN_FULL"
        boolean isManual "True if added by Barber"
    }



Act as a Senior Backend Engineer and Cloud Architect. I need you to build the core backend for a B2B2C SaaS platform targeting Barbershops, using Node.js, Express, TypeScript, and MongoDB.

The application strictly follows "Clean Architecture" principles (Entities, Use Cases, Controllers, Infrastructure/Repositories).

Here are the strict requirements and features:

1. INFRASTRUCTURE & DB:
- Provide a `docker-compose.yml` that sets up MongoDB with basic authentication for local development.
- Use Mongoose for schemas.

2. AUTHENTICATION STRATEGY (CRUCIAL):
- Barber Auth (B2B): Must use the latest `@clerk/express` SDK. Implement middleware to protect barber routes by verifying the Clerk session token. Barbers will have a `clerkId` in our DB.
- Customer Auth (B2C): Build a custom auth system. Implement endpoints for: Login/Register via Email & Password, and a flow to Send/Verify OTP (assume integration with Twilio/WhatsApp API). Generate a custom JWT for customers upon successful login/verification.

3. SECURITY & FINANCIAL DATA:
- Security best practices: Helmet, CORS, Rate Limiting (express-rate-limit).
- Use `zod` for strict request body and query validation before hitting the controllers.
- Stripe Integration: Implement a Stripe Payment Intent creation endpoint. CRITICAL: For Stripe Webhooks, ensure the route uses `express.raw({ type: 'application/json' })` to properly verify webhook signatures. Do NOT trust frontend pricing; fetch the service price directly from the database based on the service ID during checkout.

4. REQUIRED ENDPOINTS (Grouped by domain):

** Auth (Customer - Custom JWT) **
- POST /api/v1/auth/customer/send-otp (Takes phone number)
- POST /api/v1/auth/customer/verify-otp
- POST /api/v1/auth/customer/register (Email/Pass)
- POST /api/v1/auth/customer/login

** Barber Profile & Settings (Protected by Clerk Middleware) **
- POST /api/v1/barbers/sync (Sync Clerk user to our DB)
- GET /api/v1/barbers/me (Get profile)
- PUT /api/v1/barbers/me (Update business hours, shop details)

** Services (Protected by Clerk Middleware for CUD, Public for GET) **
- POST /api/v1/services (Barber adds a custom service: name, price, duration in minutes)
- GET /api/v1/services/barber/:clerkId (Public: Customers can see barber's services)
- PUT /api/v1/services/:id
- DELETE /api/v1/services/:id

** Bookings (Complex Logic) **
- GET /api/v1/bookings/barber/:clerkId/availability (Public: Calculate available time slots based on requested service duration and barber's existing bookings/business hours)
- POST /api/v1/bookings/online (Protected by Customer JWT: Customer creates a booking. Requires selecting a time slot, service, and creating a Stripe intent for deposit)
- POST /api/v1/bookings/manual (Protected by Clerk Middleware: Barber manually adds a walk-in/WhatsApp booking. Skips Stripe, blocks the calendar time immediately)
- GET /api/v1/bookings/me (For both Barber and Customer to see their respective upcoming schedules)
- PATCH /api/v1/bookings/:id/status (Barber can update status: e.g., Cancelled, Completed)

** Payments **
- POST /api/v1/payments/webhook (Stripe webhook endpoint for payment confirmation. Updates booking status to CONFIRMED).

OUTPUT REQUIREMENTS:
Please generate the foundational project structure, the Docker Compose file, the Mongoose models, the Authentication middlewares (Clerk & Custom JWT), and the Zod validation schemas. Then, write the Controller and Use Case for the most critical flow: "Calculate Availability & Create Booking (Online and Manual)". Ensure the code is production-ready, highly secure, and well-commented.