# Certificate Verification System

A web-based system for verifying certificates and managing certification data.

## Deployment to Heroku

Follow these steps to deploy the application to Heroku:

### Prerequisites

1. Create a [Heroku account](https://signup.heroku.com/) if you don't have one
2. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
3. Login to Heroku from your terminal:
   ```
   heroku login
   ```

### Deployment Steps

1. Clone this repository (if you haven't already)
   ```
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies locally (optional, good for testing)
   ```
   npm install
   cd backend && npm install && cd ..
   ```

3. Create a new Heroku app
   ```
   heroku create your-app-name
   ```

4. Add the Heroku PostgreSQL add-on (to replace SQLite in production)
   ```
   heroku addons:create heroku-postgresql:mini
   ```

5. Set environment variables
   ```
   heroku config:set JWT_SECRET=your_jwt_secret_key
   heroku config:set ADMIN_USERNAME=your_admin_username
   heroku config:set ADMIN_PASSWORD=your_secure_password
   ```

6. Deploy to Heroku
   ```
   git push heroku main
   ```
   
   Note: The `heroku-postbuild` script in package.json will automatically run `npm install` in the backend directory.

7. Initialize the database (if needed)
   ```
   heroku run node backend/models/db.js
   ```

8. Open your app in the browser
   ```
   heroku open
   ```

### Important Notes

- The application uses SQLite locally but PostgreSQL on Heroku.
- Make sure all environment variables are properly set in Heroku dashboard or via CLI.
- If you make changes to the database schema, you may need to reset the database:
  ```
  heroku pg:reset DATABASE --confirm your-app-name
  heroku run node backend/models/db.js
  ```

### Troubleshooting

- If you encounter issues, check the logs:
  ```
  heroku logs --tail
  ```
- Ensure your Procfile is correctly set up (`web: npm start`)
- Verify that your package.json scripts are configured properly
- If you get "Application Error" after deployment, check if all environment variables are set correctly 