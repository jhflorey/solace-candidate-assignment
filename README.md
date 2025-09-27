## Solace Candidate Assignment

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Install dependencies

```bash
npm i
```

Run the development server:

```bash
npm run dev
```

## Database set up

The app is configured to return a default list of advocates. This will allow you to get the app up and running without needing to configure a database. If you’d like to configure a database, you’re encouraged to do so. You can uncomment the url in `.env` and the line in `src/app/api/advocates/route.ts` to test retrieving advocates from the database.

1. Feel free to use whatever configuration of postgres you like. The project is set up to use docker-compose.yml to set up postgres. The url is in .env.

```bash
docker compose up -d
```

2. Create a `solaceassignment` database.

3. Push migration to the database

```bash
npx drizzle-kit push
```

4. Seed the database

```bash
curl -X POST http://localhost:3000/api/seed
```

## API Design & Performance Architecture

This API is designed to handle large-scale data efficiently, supporting hundreds of thousands of advocate records with optimal performance.

### Performance Considerations

#### Database Connection Pooling
- **Connection Pool Size**: 100 maximum connections configured for high-concurrency scenarios
- **Why**: Handles hundreds of thousands of database rows efficiently by reusing connections
- **Benefits**: Reduces connection overhead, prevents connection exhaustion under heavy load

#### Pagination Strategy
- **Mandatory Pagination**: All list endpoints use cursor-based pagination to prevent memory issues
- **Limit Constraints**: Maximum 100 records per request to maintain response times under high data volumes
- **Why**: Loading hundreds of thousands of records without pagination would cause memory exhaustion and poor user experience

### Advocates Endpoint

**GET** `/api/advocates`

Retrieves a paginated list of advocates with their details.

#### Query Parameters
- `page` (optional): Page number (default: 1, minimum: 1)
- `limit` (optional): Number of items per page (default: 10, minimum: 1, maximum: 100)

#### Response Format
```json
{
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "city": "New York",
      "degree": "JD",
      "specialties": ["Criminal Law", "Civil Rights"],
      "yearsOfExperience": 5,
      "phoneNumber": 1234567890,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Authentication

All endpoints require JWT authentication:

**Headers Required:**
```
Authorization: Bearer <jwt_token>
```

#### Error Handling

- **400 Bad Request**: Returns when pagination parameters are invalid (page < 1, limit < 1, or limit > 100)
- **401 Unauthorized**: Returns when JWT token is missing or invalid
- **500 Internal Server Error**: Returns when database connections fail or other unexpected server errors occur
- All errors are logged to the console for debugging purposes

Example error responses:
```json
// Invalid pagination
{
  "error": "Invalid pagination parameters"
}

// Unauthorized
{
  "error": "Unauthorized - Valid JWT token required"
}

// Server error
{
  "error": "Internal server error"
}
```

## Authentication

### Login Endpoint

**POST** `/api/auth/login`

Authenticates users and returns a JWT token for API access.

#### Request Body
```json
{
  "username": "admin",
  "password": "testadmin@1234"
}
```

#### Response Format
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

#### Security Features
- **JWT Tokens**: 24-hour expiration for security
- **Protected Routes**: All data endpoints require valid JWT
- **Role-based Access**: Token includes user role for future authorization
