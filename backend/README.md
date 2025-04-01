# Certificate Verification System Backend

This is the backend server for the Certificate Verification System. It provides API endpoints for verifying certificates and an admin panel for managing certificates.

## Features

- User authentication system for administrators
- RESTful API for certificate verification and management
- Admin panel for managing certificates
- SQLite database for data storage
- Integration with existing HTML/CSS frontend

## Installation

1. Clone the repository (if you haven't already):
   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory:
   ```
   cd backend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file (one will be created automatically if not present) with the following variables:
   ```
   PORT=3000
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   JWT_SECRET=7c31c2a8e2b94ef8b9ba9f9d8a5e7e2d
   ```
   Note: You should change these values for production use.

## Usage

### Start the Server

```
npm start
```

For development with automatic reloading:
```
npm run dev
```

### API Endpoints

#### Authentication

- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify a certificate

#### Certificate Management (Admin only)

- `GET /api/certificates` - Get all certificates
- `GET /api/certificates/:id` - Get a single certificate
- `POST /api/certificates` - Create a new certificate
- `PUT /api/certificates/:id` - Update a certificate
- `DELETE /api/certificates/:id` - Delete a certificate

### Admin Panel

Access the admin panel at:
```
http://localhost:3000/admin
```

Default credentials (as specified in the .env file):
- Username: admin
- Password: admin123

## Frontend Integration

The backend is designed to work with the existing HTML/CSS files without modifying them. It serves the static files and provides API endpoints for the frontend to interact with.

## Database

The application uses SQLite for data storage. The database file (`database.sqlite`) will be created automatically in the backend directory when the server starts.

## Security Notes

- For production use, make sure to change the default admin credentials
- Consider implementing proper authentication with JWT for API access
- Use HTTPS in production environments 