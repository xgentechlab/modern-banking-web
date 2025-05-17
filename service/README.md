# Node.js Authentication Service

A Node.js service with Express, JWT authentication, and logging capabilities.

## Features

- Express server setup
- JWT-based authentication
- Winston logging
- Error handling middleware
- Route and service separation
- Request/Response data format documentation

## Project Structure

```
src/
├── app.js                 # Application entry point
├── routes/               # Route definitions
│   └── auth.routes.js
├── services/            # Business logic
│   └── auth.service.js
├── middleware/          # Middleware functions
│   ├── authMiddleware.js
│   └── errorHandler.js
├── utils/              # Utility functions
│   └── logger.js
└── dataFormats/        # API request/response formats
    ├── login.request.json
    ├── login.response.json
    └── logout.response.json
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```
   PORT=3000
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

3. Start the server:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

#### Login
- **POST** `/api/auth/login`
- Request body: See `src/dataFormats/login.request.json`
- Response: See `src/dataFormats/login.response.json`

#### Logout
- **POST** `/api/auth/logout`
- Requires Authentication Header: `Bearer <token>`
- Response: See `src/dataFormats/logout.response.json`

## Authentication

The service uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
``` 