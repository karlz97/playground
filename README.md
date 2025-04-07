# Certificate Verification System

A web-based system for verifying certificates and managing certification data.

## Deployment

Follow these steps to deploy the application:

### Prerequisites

1. Node.js (v14 or higher)
2. npm (Node Package Manager)

### Deployment Steps

1. Clone this repository
   ```
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies
   ```
   npm install
   cd backend && npm install && cd ..
   ```

3. Set up environment variables
   Create a `.env` file in the backend directory with the following content:
   ```
   PORT=3000
   ADMIN_USERNAME=your_admin_username
   ADMIN_PASSWORD=your_secure_password
   JWT_SECRET=your_jwt_secret_key
   ```

4. Initialize the database
   ```
   node backend/models/db.js
   ```

5. Start the server
   ```
   cd backend && npm start
   ```

### Important Notes

- The application uses SQLite for data storage
- The SQLite database file will be created at `backend/database.sqlite`
- Make sure to regularly backup the database file
- For production deployment, consider setting up:
  - A process manager (like PM2) to keep the application running
  - HTTPS for secure communication
  - Regular database backups
  - Proper file permissions for the database file

### Database Management

- The database file is located at `backend/database.sqlite`
- To backup the database, simply copy the database file
- To restore from a backup, stop the server, replace the database file, and restart the server

### Security Recommendations

1. Change the default admin credentials
2. Use a strong JWT secret
3. Set up HTTPS
4. Implement rate limiting
5. Regular security updates
6. Proper file permissions for the database

### Troubleshooting

- If you encounter database errors, check:
  - File permissions on the database file
  - Available disk space
  - Database file is not corrupted
- For application errors, check the server logs
- Make sure all environment variables are properly set 