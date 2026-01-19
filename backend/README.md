# Car Health Platform - Backend API

Backend API built with NestJS for the Car Health Platform.

## Features

- 🔐 Authentication & Authorization (JWT)
- 📊 Car Health Reports
- 🏪 Marketplace Listings
- 💬 Real-time Chat
- 🚗 Dealer Tools & Bulk Upload
- 💳 Payment Processing
- 📁 File Upload & Media Management

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger

## Getting Started

### Option 1: Using Docker (Recommended) 🐳

The easiest way to run the backend with PostgreSQL is using Docker Compose.

#### Prerequisites
- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

#### Quick Start

```bash
# From the project root directory
# Start both PostgreSQL and Backend in development mode (with hot-reload)
docker-compose -f docker-compose.dev.yml up

# Or start in production mode
docker-compose up
```

#### Docker Commands

```bash
# Start services in detached mode (background)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Stop services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (clears database data)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild containers after code changes
docker-compose -f docker-compose.dev.yml up --build
```

The API will be available at `http://localhost:3001/api`

**Note:** The database is automatically created when PostgreSQL starts. No manual setup needed!

---

### Option 2: Local Development

#### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

#### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

#### Database Setup

```bash
# Create database
createdb car_health_platform

# Run migrations (when available)
npm run migration:run
```

#### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001/api`

### API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3001/api/docs`

## Project Structure

```
src/
├── auth/              # Authentication module
├── users/             # User management
├── reports/           # Car health reports
├── marketplace/       # Marketplace listings
├── chat/              # Chat functionality
├── dealer/            # Dealer tools
├── payments/          # Payment processing
├── common/            # Shared utilities, guards, decorators
├── config/            # Configuration files
└── main.ts            # Application entry point
```

## Environment Variables

See `.env.example` for all available environment variables.

## License

MIT
