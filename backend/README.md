# Note Taking API - Django REST Framework

A REST API for note-taking with user authentication (email/password) and note management.

## Features

- **User Authentication**
  - Email-based registration and login
  - JWT token authentication
  - Token refresh endpoint

- **note Management**
  - CRUD operations for notes
  - Categories: Random Thoughts, School, Personal
  - Automatic timestamps (created_at, updated_at)
  - User-specific notes (users only see their own notes)
  - Search and filtering capabilities

## Tech Stack

- Django 5.0
- Django REST Framework
- JWT Authentication (djangorestframework-simplejwt)
- PostgreSQL (via Docker)
- Docker & Docker Compose

## Project Structure

```
backend/
├── config/                 # Django project settings
├── apps/
│   ├── users/             # User authentication app
│   └── notes/             # Notes management app
├── docker-compose.yml     # Docker services configuration
├── Dockerfile             # Backend container definition
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Git (optional)

### Installation & Setup

1. **Clone or navigate to the project directory:**

   ```bash
   cd backend
   ```

2. **Ensure .env file exists** (already created with default values)

3. **Build and start the containers:**

   ```bash
   docker-compose up --build
   ```

   This will:
   - Start PostgreSQL database on port 5432
   - Start Django backend on port 8000
   - Run migrations automatically

4. **Create a superuser (optional, for admin access):**

   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

5. **Access the application:**
   - API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

## API Endpoints

### Authentication Endpoints

| Method | Endpoint                   | Description              | Auth Required |
| ------ | -------------------------- | ------------------------ | ------------- |
| POST   | `/api/auth/register/`      | Register new user        | No            |
| POST   | `/api/auth/login/`         | Login (get JWT tokens)   | No            |
| POST   | `/api/auth/token/refresh/` | Refresh access token     | No            |
| GET    | `/api/auth/me/`            | Get current user details | Yes           |

### Note Endpoints

| Method | Endpoint           | Description           | Auth Required |
| ------ | ------------------ | --------------------- | ------------- |
| GET    | `/api/notes/`      | List all user's notes | Yes           |
| POST   | `/api/notes/`      | Create new note       | Yes           |
| GET    | `/api/notes/{id}/` | Get note detail       | Yes           |
| PUT    | `/api/notes/{id}/` | Update note           | Yes           |
| PATCH  | `/api/notes/{id}/` | Partial update note   | Yes           |
| DELETE | `/api/notes/{id}/` | Delete note           | Yes           |

### Query Parameters for Notes

- `search` - Search in title and content
- `ordering` - Sort by fields (created_at, updated_at, title)
- `page` - Pagination (10 items per page)

## API Usage Examples

### 1. Register a new user

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "password2": "securePassword123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### 2. Login to get JWT tokens

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

Response:

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 3. Create a new note

```bash
curl -X POST http://localhost:8000/api/notes/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "My First Note",
    "content": "This is a note about Django",
    "category": "School"
  }'
```

### 4. List all notes

```bash
curl -X GET http://localhost:8000/api/notes/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Update a note

```bash
curl -X PUT http://localhost:8000/api/notes/1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Updated Note",
    "content": "Updated content",
    "category": "Personal"
  }'
```

### 6. Delete a note

```bash
curl -X DELETE http://localhost:8000/api/notes/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Note Categories

Available categories for notes:

- `Random Thoughts`
- `School`
- `Personal`

## Development

### Running commands inside Docker

```bash
# Access Django shell
docker-compose exec backend python manage.py shell

# Create migrations
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### Stop the application

```bash
docker-compose down
```

### Stop and remove volumes (clean database)

```bash
docker-compose down -v
```

## Environment Variables

Configure these in `.env` file:

| Variable                   | Description                      | Default             |
| -------------------------- | -------------------------------- | ------------------- |
| SECRET_KEY                 | Django secret key                | (provided)          |
| DEBUG                      | Debug mode                       | True                |
| ALLOWED_HOSTS              | Allowed hosts                    | localhost,127.0.0.1 |
| DB_NAME                    | Database name                    | note_taking_db      |
| DB_USER                    | Database user                    | postgres            |
| DB_PASSWORD                | Database password                | postgres            |
| DB_HOST                    | Database host                    | db                  |
| DB_PORT                    | Database port                    | 5432                |
| JWT_ACCESS_TOKEN_LIFETIME  | Access token lifetime (minutes)  | 60                  |
| JWT_REFRESH_TOKEN_LIFETIME | Refresh token lifetime (minutes) | 1440                |

## Production Deployment

For production deployment:

1. Change `SECRET_KEY` to a secure random string
2. Set `DEBUG=False`
3. Update `ALLOWED_HOSTS` with your domain
4. Use strong database credentials
5. Consider using environment-specific settings
6. Set up HTTPS/SSL
7. Configure static files serving
8. Use production-grade WSGI server (gunicorn)

## Troubleshooting

### Database connection errors

- Ensure PostgreSQL container is running: `docker-compose ps`
- Check database credentials in `.env`

### Port already in use

- Change ports in `docker-compose.yml` if 8000 or 5432 are taken

### Permission errors

- Run: `docker-compose down -v` and rebuild

## License

This project is for educational purposes.
