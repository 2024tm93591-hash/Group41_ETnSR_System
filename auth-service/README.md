# Auth Service

Authentication service for the Event Ticketing and Seating Reservation System.

## Features

- User registration
- User login
- JWT-based authentication
- Role-based access control
- Password hashing
- Token verification middleware

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a .env file with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/auth-service
JWT_SECRET=your_jwt_secret_here
```

3. Run the service:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### POST /api/auth/register
Register a new user
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/auth/login
Login with existing credentials
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Testing

Run tests with:
```bash
npm test
```