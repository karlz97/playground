const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const certificateRoutes = require('./routes/certificates');
const dbSetup = require('./models/db');

// Load environment variables
dotenv.config();

// Initialize database
dbSetup.initDb();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from parent directory (for the HTML files)
app.use(express.static(path.join(__dirname, '..')));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the original HTML files directory
app.use('/Controllo certificazioni - UNIDARC_files', 
  express.static(path.join(__dirname, '..', 'Controllo certificazioni - UNIDARC_files')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve main page for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Running in ${dbSetup.isHeroku ? 'Heroku' : 'local'} environment`);
}); 