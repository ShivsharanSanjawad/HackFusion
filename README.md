# HackFusion : Incident Reporting & Management System

## Project Overview

HackFusion is a comprehensive, real-time incident reporting and management platform designed to streamline communication between citizens, authorities, and field staff. The system leverages modern web technologies, AI-powered analysis, and distributed APIs to create an efficient incident lifecycle management solution.

---

## System Architecture

The HackFusion platform is built on a multi-tier, scalable architecture designed for high availability and real-time processing:

```
┌──────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                            │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    React Frontend (Vite)                        │ │
│  │         Citizen | Authority | Field Staff | Public Dashboard    │ │
│  │            Dark/Light Theme • Mobile Responsive UI              │ │
│  │                  Real-time Notifications                        │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                  │                    │                    │
                  │                    │                    │
        ┌─────────┘                    │                    └──────────┐
        │                              │                               │
        ▼                              ▼                               ▼

┌──────────────────┐    ┌──────────────────────────────────┐   ┌─────────────────┐
│   Auth Service   │    │   HackFusion Server              │   │  HackServer     │
│   (Node.js)      │    │   (Spring Boot) :8080            │   │  (Admin)        │
│   :3000          │    │                                  │   │  :9090          │
├──────────────────┤    ├──────────────────────────────────┤   ├─────────────────┤
│ • JWT Token Gen  │    │ • Incident Management            │   │ • Health Status │
│ • User Auth      │    │ • Analytics & Reporting          │   │ • Metrics       │
│ • Sign In/Up     │    │ • Pattern Detection              │   │ • Logs          │
│                  │    │ • Workflow Management            │   │ • Configuration │
│                  │    │ • Swagger API Docs               │   │                 │
│                  │    │ • Telegram Bot Integration       │   └─────────────────┘
│                  │    │ • Spring AOP Audit System        │           ▲
└──────────────────┘    │                                  │           │
                        └───────────────┬──────────────────┘      (Monitoring)
                                        │
                        ┌───────────────┴────────────────┐
                        │                                │
                        ▼                                ▼

                   ┌────────────────┐           ┌─────────────┐
                   │  PostgreSQL    │           │   PINATA    │
                   │   Database     │           │   Storage   │
                   ├────────────────┤           ├─────────────┤
                   │ • All Data     │           │ • Audit     │
                   │ • Metadata     │           │   Logs      │
                   │ • Operations   │           │ • (Spring   │
                   │                │           │   AOP)      │
                   └────────────────┘           └─────────────┘
```

### Architecture Layers

**Presentation Layer** - React-based UI for Citizens, Authorities, Field Staff, and public with theme support and real-time notifications

**API & Services Layer**:
- **Authentication Service (Node.js)**: Lightweight JWT token generation and user authentication
- **HackFusion Server (Spring Boot)**: Comprehensive application server with all business logic, incident management, analytics, AI pipeline, Telegram bot, and REST APIs
- **HackServer (Spring Boot Admin)**: Dedicated monitoring dashboard that tracks health metrics and system status from HackFusion Server

**Data Layer**:
- **PostgreSQL**: Primary database for all operational data and metadata
- **PINATA**: Immutable audit logs managed through Spring AOP custom annotations

**Key Architectural Decisions**:
- Single unified application server (HackFusion) eliminates complexity and improves data consistency
- PostgreSQL provides ACID compliance and data integrity for all operational data
- Separation of authentication (Node.js) from business logic (Spring Boot) enables independent scaling
- Spring AOP handles audit transparency without intrusion into business code
- Dedicated monitoring server (HackServer) observes HackFusion health without impact on core operations

---

## Core Components

1. **Multi-Role Dashboards** - Specialized interfaces for Citizens, Authorities, and Field Staff with role-based features and workflows
2. **PINATA Integration System** - Decentralized storage and management of incident data and evidence
3. **AI Pipeline** - Intelligent incident classification, severity analysis, and automated response suggestions
4. **Swagger API Documentation** - Complete RESTful API specifications for seamless integration
5. **Admin Actuator** - System health monitoring, metrics, and administrative controls
6. **Real-time Geolocation** - Map-based incident visualization and field staff tracking
7. **Authentication & Authorization** - Secure JWT-based authentication with role-based access control
8. **Notification System** - Real-time alerts and updates across all user types

---

## Workflow Overview

The HackFusion system operates on a structured workflow ensuring accountability and efficient resolution:

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐         ┌─────────────┐
│   CITIZEN   │-------->│ AUTHORITIES  │-------->│ FIELD STAFF  │-------->│   CITIZEN   │
│             │         │              │         │              │         │  (Updates)  │
│ Report      │         │ Validate &   │         │ Investigate  │         │             │
│ Incident    │         │ Assign Work  │         │ & Resolve    │         │ Track       │
└─────────────┘         └──────────────┘         └──────────────┘         └─────────────┘

```

### Workflow Steps:

1. **Citizen Reports** → Citizens submit incident reports with location, description, and media evidence
2. **Authority Validation** → Authorities review, categorize, and assign incidents to field staff
3. **Field Staff Response** → Field staff investigates, updates status, and works on resolution
4. **Citizen Notification** → Real-time updates keep reporters informed throughout the process
5. **Resolution & Feedback** → Closed incidents with resolution details and citizen feedback

---

## Detailed Features

### 1. **Public Dashboard**

- View all reported incidents in the system across all categories
- Search and filter incidents by location, category, status, and priority
- Community support system - users can add support votes to incidents
- Department performance leaderboard with metrics and statistics
- Real-time incident creation timeline and updates
- Incident categorization visualization and analytics
- Public reports and summaries of incident trends

### 2. **Citizen (Reporting User) Dashboard**

- Report incidents with detailed descriptions, location coordinates, and media attachments (images/videos)
- Select incident category and provide urgency assessment
- Real-time tracking of personal incident reports
- View complete incident history and resolution details
- Receive notifications on incident status updates
- Submit feedback and rate resolved incidents
- Track response times and resolution timelines
- View investigation progress and field staff updates
- Add comments and evidence during investigation

### 3. **Authority Dashboard**

- Central console to view all incidents in the system
- Search and filter incidents by region, category, priority, and status
- Assign priority levels (Critical, High, Medium, Low) to incidents
- Assign incidents to field staff teams based on location and expertise
- Collaborate with other departments through inter-department messaging
- Send notifications and alerts to relevant departments
- Generate incident analytics and performance reports
- Monitor field staff workload and productivity
- Track incident resolution rates and time metrics
- Approve or reject incident reports
- Access incident evidence and documentation

### 4. **Field Staff (Worker) Dashboard**

- View assigned incidents with priority levels and detailed information
- Mobile-friendly interface for on-field operations
- Update incident status (Pending, In-Progress, Investigating, Resolved)
- Attach investigation notes, findings, and proof of work
- Upload photographic and video evidence from the field
- Communicate with authorities and citizens about incident status
- Track geolocation and maintain work logs
- Access incident history and previous case details
- Submit final resolution details and recommendations
- Real-time push notifications for new assignments

### 5. **Incident Management Features**

- Geolocation-based incident mapping with real-time visualization
- Incident categorization and status tracking through multi-step workflow
- Priority classification (Critical, High, Medium, Low)
- Evidence and media attachment management
- Comment threads and collaborative communication
- Incident linking to detect patterns
- Complete audit trail of all changes

### 7. **Audit Trail & PINATA Integration**

- Spring AOP intercepts all significant operations for audit logging
- Custom annotations enable selective audit capture without code duplication
- Immutable audit records stored in PINATA
- Read-only archive ensures compliance and integrity
- Asynchronous audit writes prevent performance impact
- GDPR-compliant retention policies supported
- Advanced filtering for audit log retrieval

### 8. **API & Integration**

- Swagger/OpenAPI 3.0 REST API specification with interactive documentation
- Standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
- JWT bearer token authentication
- Rate limiting per user/role
- Pagination for large datasets
- Comprehensive error codes and messages
- Telegram bot for incident notifications

### 9. **Admin & Monitoring**

- Spring Boot Actuator endpoints for system health and metrics
- Real-time status monitoring of HackFusion server
- Performance metrics (response times, throughput, latency)
- Database connection pool monitoring
- Error rate tracking and alerts
- System configuration and environment visibility
- Request/response monitoring

### 10. **Authentication & Security**

- Multi-role authentication (Citizens, Authorities, Field Staff)
- JWT tokens with expiration and refresh mechanism
- Role-Based Access Control (RBAC)
- Bcrypt password hashing
- Automatic session timeout
- HTTPS/TLS encryption for all communications
- Pinata Based Audit Logs 

### 11. **User Experience**

- Dark and light theme toggle
- Mobile-responsive design for all devices
- Real-time notifications and alerts
- Intuitive navigation with breadcrumbs
- Data visualization through charts and maps
- Advanced search and filtering

### 12. **Reporting & Analytics**

- Incident statistics and trend analysis
- Resolution time metrics and SLA tracking
- Category-wise breakdown of incidents
- Geographic heatmaps of incident distribution
- Field staff and department performance metrics
- PDF and Excel report generation
- Department leaderboards by resolution rate
- Historical trend analysis

---

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Context API
- **Build Tool**: Vite
- **Testing**: Vitest
- **HTTP Client**: Fetch API / Axios
- **Form Handling**: React Hook Form
- **Maps**: Leaflet or similar for incident mapping
- **Bundler**: Vite (Hot Module Replacement)

### Backend - Main Server (HackFusion)
**Technology Stack**
- Framework: Spring Boot 3.x with Spring Data JPA
- Language: Java 17+
- Database: PostgreSQL with Hibernate ORM
- Audit: Spring AOP with custom annotations
- API: Springdoc OpenAPI (Swagger)
- Security: Spring Security 6.x with JWT
- Validation: Jakarta Bean Validation
- Logging: SLF4J + Logback
- Scheduling: Spring Scheduler

### Backend - Admin Server (HackServer)
**Technology Stack**
- Framework: Spring Boot 3.x with Spring Boot Admin
- Language: Java 17+
- Monitoring: Spring Boot Admin UI + Micrometer metrics

### Authentication Service (Auth)

**Technology Stack**
- Runtime: Node.js (Express.js/Fastify)
- JWT: jsonwebtoken library
- Password Security: bcrypt
- Middleware: Custom authentication and rate limiting

### Storage & Distribution

- **Primary Database**: PostgreSQL 12+ for all operational data and metadata
- **Audit Storage**: PINATA for immutable audit trail storage via Spring AOP
- **Data Integrity**: Cryptographic verification of all audit records

### DevOps & Infrastructure

- **Containerization**: Docker for all services
- **Orchestration**: Docker Compose for multi-container deployment
- **Version Control**: Git
---

## Build & Deployment

### Prerequisites

- Docker and Docker Compose installed
- Java 17+ (for backend development)
- Node.js 18+ (for frontend and auth service)
- npm or yarn package manager
- Git for version control
- PostgreSQL 12+ (for local database)

### Docker Deployment (Recommended)

The entire application is containerized and can be deployed using Docker Compose:

```bash
git clone <repository-url>
cd HackFusion
docker-compose up -d
```

This will start all services:
- Frontend React application (Vite)
- HackFusion Server (Core API, Analytics, AI Pipeline) - :8080
- HackServer (Admin Dashboard & Health Monitoring) - :9090
- Auth Service (Node.js - JWT) - :3000
- PostgreSQL Database
- PINATA Integration

Access points:
- Frontend: http://localhost:5173
- HackFusion API Documentation: http://localhost:8080/swagger-ui.html
- HackFusion Health/Actuator: http://localhost:8080/actuator
- HackServer Admin Dashboard: http://localhost:9090
- Auth Service: http://localhost:3000

### Local Development Setup

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173 with hot module reloading

#### Authentication Service

```bash
cd Auth
npm install
npm start
```

Runs on http://localhost:3000

#### HackFusion Server (Main API)

```bash
cd HackFusion
mvn clean install
mvn spring-boot:run
```

Runs on http://localhost:8080

#### HackServer (Admin Dashboard)

```bash
cd HackServer
mvn clean install
mvn spring-boot:run
```

Runs on http://localhost:9090

### Build Commands

#### Frontend Build

```bash
cd frontend
npm run build  # Production build
npm run test   # Run tests
npm run lint   # Run linter
```

#### Backend Build

```bash
cd HackFusion
mvn clean package  # Create JAR
mvn test          # Run tests
mvn verify        # Run verification
```

#### Admin Server Build

```bash
cd HackServer
mvn clean package
```

### Docker Build

Individual services can be built and pushed:

```bash
docker build -t hackfusion-frontend ./frontend
docker build -t hackfusion-server ./HackFusion
docker build -t hackfusion-admin ./HackServer
docker build -t hackfusion-auth ./Auth
```

---

## API Documentation

Full API documentation is available in Swagger UI after starting the application at `/swagger-ui.html`

### Key Endpoints

**Incidents**
- GET /api/incidents - List all incidents with filtering and pagination
- POST /api/incidents - Create new incident report
- GET /api/incidents/{id} - Retrieve incident details
- PUT /api/incidents/{id} - Update incident information
- PATCH /api/incidents/{id}/status - Update incident status
- DELETE /api/incidents/{id} - Delete incident (admin only)
- GET /api/incidents/{id}/comments - Get incident comments
- POST /api/incidents/{id}/comments - Add comment to incident

**Users & Authentication**
- POST /api/auth/login - User login with credentials
- POST /api/auth/signup - User registration
- POST /api/auth/logout - User logout
- POST /api/auth/refresh - Refresh JWT token
- GET /api/users/{id} - Get user profile
- PUT /api/users/{id} - Update user profile
- POST /api/auth/forgot-password - Password reset request

**Assignment & Workflows**
- GET /api/assignments - List assignments for field staff
- POST /api/assignments - Create incident assignment
- PUT /api/assignments/{id} - Update assignment
- GET /api/assignments/{id}/status - Get assignment status

**Analytics & Reports**
- GET /api/analytics/incidents - Incident statistics
- GET /api/analytics/resolution-time - Resolution time metrics
- GET /api/analytics/categories - Category breakdown
- GET /api/reports/generate - Generate custom report

**Admin & Health**
- GET /actuator/health - System health status
- GET /actuator/metrics - System metrics
- GET /actuator/loggers - Logger configuration
- GET /actuator/env - Environment properties

---
## Configuration

#### Environment Variables

Create a .env file in the project root with:

```
DATABASE_URL=jdbc:postgresql://localhost:5432/hackfusion
DATABASE_USER=postgres
DATABASE_PASSWORD=password
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400000
PINATA_API_KEY=your-pinata-key
PINATA_API_SECRET=your-pinata-secret
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
NODE_ENV=development
```

#### Application Properties

Key configuration in HackFusion/src/main/resources/application.properties:

```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/hackfusion
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
logging.level.root=INFO
springdoc.swagger-ui.path=/swagger-ui.html
```

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

## Contributors
**Team CodeNerds**

**Team CodeNerds**
- **[Madhukar Pai](https://github.com/Lead-Coder)** — Frontend & Workflow  
- **[Heet Shah](https://github.com/heet616)** — AI & Backend  
- **[Vedaant Mahale](https://github.com/Vedaant-Mahale)** — Backend & Docker

- **[Shivsharan Sanjawad](https://github.com/ShivsharanSanjawad)** — Backend & Pinata  
