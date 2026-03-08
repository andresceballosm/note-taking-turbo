# Note Taking Turbo

A full-stack note-taking application built with Django REST Framework and Next.js, featuring JWT authentication and a modern, responsive UI.

## Architecture Overview

This project follows a monorepo structure with separate backend and frontend applications:

```
note-taking-turbo/
├── backend/          # Django REST API
└── frontend/         # Next.js application
```

### Backend (Django)

The backend is a Django REST Framework API that provides authentication and note management endpoints. It runs in a Dockerized environment with PostgreSQL as the database.

**Tech Stack:**
- **Framework:** Django 5.0.2
- **API:** Django REST Framework 3.14.0
- **Authentication:** JWT (djangorestframework-simplejwt 5.3.1)
- **Database:** PostgreSQL 16
- **Container:** Docker + Docker Compose
- **CORS:** django-cors-headers 4.3.1

**Key Features:**
- JWT-based authentication
- RESTful API design
- PostgreSQL database with migrations
- Dockerized development environment
- Health checks for database connectivity

### Frontend (Next.js)

The frontend is a modern Next.js application built with TypeScript, React 19, and Tailwind CSS. It uses NextAuth for authentication and TanStack Query for data fetching.

**Tech Stack:**
- **Framework:** Next.js 16.1.6
- **Language:** TypeScript 5
- **UI:** React 19.2.3
- **Styling:** Tailwind CSS 4
- **Authentication:** NextAuth 4.24.13
- **Data Fetching:** TanStack React Query 5.90.21
- **Environment Variables:** T3 Env (type-safe with Zod validation)

## Project Structure

### Backend Structure

```
backend/
├── apps/
│   ├── notes/              # Notes application
│   │   ├── models.py       # Note data models
│   │   ├── views.py        # API views
│   │   ├── serializers.py  # DRF serializers
│   │   └── urls.py         # Notes endpoints
│   └── users/              # Users application
│       ├── models.py       # User models
│       ├── views.py        # Auth views
│       ├── serializers.py  # User serializers
│       └── urls.py         # Auth endpoints
├── config/                 # Django project settings
│   ├── settings.py         # Main settings
│   ├── urls.py            # URL configuration
│   └── wsgi.py            # WSGI configuration
├── docker-compose.yml      # Docker services definition
├── Dockerfile             # Backend container image
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
└── .env.example          # Environment variables template
```

### Frontend Structure

```
frontend/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (public)/                 # Public routes (unauthenticated)
│   │   │   └── auth/                 # Authentication pages
│   │   │       ├── login/            # Login page
│   │   │       └── signup/           # Signup page
│   │   ├── (secure)/                 # Protected routes (authenticated)
│   │   │   ├── notes/                # Notes management
│   │   │   │   ├── (editor)/         # Note editor routes
│   │   │   │   │   ├── [id]/         # Edit specific note
│   │   │   │   │   ├── create/       # Create new note
│   │   │   │   │   ├── layout.tsx    # Editor layout
│   │   │   │   │   └── error.tsx     # Error handling
│   │   │   │   └── page.tsx          # Notes list page
│   │   │   └── layout.tsx            # Secure layout wrapper
│   │   ├── api/                      # API routes (Next.js route handlers)
│   │   │   ├── auth/                 # Auth API endpoints
│   │   │   │   ├── [...nextauth]/    # NextAuth handler
│   │   │   │   ├── login/            # Login API route
│   │   │   │   ├── signup/           # Signup API route
│   │   │   │   ├── signout/          # Signout API route
│   │   │   │   └── me/               # Current user API route
│   │   │   └── notes/                # Notes API endpoints
│   │   │       ├── [id]/             # Single note operations
│   │   │       └── route.ts          # Notes list operations
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   ├── components/                   # React components
│   │   ├── auth-form.component.tsx   # Authentication form
│   │   ├── button.component.tsx      # Button component
│   │   ├── input.component.tsx       # Input component
│   │   ├── note-card.component.tsx   # Note card display
│   │   ├── note-editor.component.tsx # Note editor
│   │   ├── category-select.component.tsx # Category selector
│   │   └── icons/                    # Icon components
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-auth-me.ts           # User authentication hook
│   │   ├── use-notes.ts             # Fetch notes hook
│   │   └── use-note-mutations.ts    # Note CRUD mutations
│   ├── lib/                          # Utility functions and configs
│   │   ├── api/                      # API client functions
│   │   │   ├── auth.ts              # Auth API calls
│   │   │   └── notes.ts             # Notes API calls
│   │   ├── constants/                # Application constants
│   │   │   └── categories.ts        # Note categories
│   │   ├── server/                   # Server-side utilities
│   │   │   └── django-auth.ts       # Django auth integration
│   │   └── env/                      # Environment config
│   ├── providers/                    # React context providers
│   │   └── react-query.provider.tsx # TanStack Query provider
│   ├── types/                        # TypeScript type definitions
│   │   └── next-auth.d.ts           # NextAuth type extensions
│   ├── auth.ts                       # NextAuth configuration
│   └── proxy.ts                      # API proxy setup
├── public/                           # Static assets
├── package.json                      # Node dependencies
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS configuration
└── .env.example                      # Environment variables template
```

## Getting Started

### Prerequisites

- Docker and Docker Compose (for backend)
- Node.js 20+ and pnpm (for frontend)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Start the services with Docker Compose:
   ```bash
   docker-compose up --build
   ```

   This will:
   - Start PostgreSQL on port `5432`
   - Run database migrations
   - Start Django development server on port `8000`

4. The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Update the `.env.local` file with your backend URL and NextAuth secrets

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login (returns JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token

### Notes
- `GET /api/notes/` - List all notes (authenticated)
- `POST /api/notes/` - Create a new note (authenticated)
- `GET /api/notes/:id/` - Get a specific note (authenticated)
- `PUT /api/notes/:id/` - Update a note (authenticated)
- `DELETE /api/notes/:id/` - Delete a note (authenticated)

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://postgres:postgres@db:5432/note_taking_db
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## Development Workflow

1. **Backend Development:**
   - Make changes to Django code
   - Docker volumes sync changes automatically
   - Run migrations: `docker-compose exec backend python manage.py migrate`
   - Create superuser: `docker-compose exec backend python manage.py createsuperuser`

2. **Frontend Development:**
   - Make changes to Next.js code
   - Hot reload updates automatically
   - Type checking: `pnpm build`
   - Linting: `pnpm lint`

## Database

The application uses PostgreSQL 16 running in a Docker container. Database data is persisted in a Docker volume named `postgres_data`.

### Database Schema
- **Users:** Custom user model with JWT authentication
- **Notes:** User-owned notes with title, content, and timestamps

## Authentication Flow

1. User registers/logs in via the frontend
2. Frontend sends credentials to Django backend
3. Backend validates and returns JWT access/refresh tokens
4. Frontend stores tokens and includes them in subsequent requests
5. NextAuth manages session state on the client side
6. Backend validates JWT tokens on protected endpoints

## Technologies

### Backend
- Django 5.0.2 - High-level Python web framework
- Django REST Framework - Powerful toolkit for building Web APIs
- PostgreSQL 16 - Robust relational database
- Docker - Containerization platform
- JWT - Secure token-based authentication

### Frontend
- Next.js 16 - React framework with App Router
- TypeScript - Type-safe JavaScript
- React 19 - UI library with latest features
- TanStack Query - Async state management
- Tailwind CSS - Utility-first CSS framework
- NextAuth - Authentication for Next.js
- Zod - Schema validation

## License

This project is private and proprietary.

## Contributing

This is a private project. For any questions or issues, please contact the project maintainer.
