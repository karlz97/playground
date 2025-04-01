const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models/db');

const router = express.Router();

// Admin login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }
  
  const dbConn = db.getDbConnection();
  
  dbConn.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Database error during login:', err.message);
      dbConn.close();
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    
    if (!user) {
      dbConn.close();
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error('Error comparing passwords:', err.message);
        dbConn.close();
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      
      if (!match) {
        dbConn.close();
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
      
      // User authenticated successfully
      dbConn.close();
      return res.status(200).json({ 
        success: true, 
        message: 'Authentication successful',
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.is_admin === 1
        }
      });
    });
  });
});

// Verify certificate route
router.post('/verify', (req, res) => {
  const { username, password, certificato } = req.body;
  
  if (!username || !password || !certificato) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username, password and certificato are required' 
    });
  }
  
  const dbConn = db.getDbConnection();
  
  dbConn.get(
    'SELECT * FROM certificates WHERE username = ? AND password = ? AND certificato = ?', 
    [username, password, certificato], 
    (err, certificate) => {
      if (err) {
        console.error('Database error during certificate verification:', err.message);
        dbConn.close();
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      
      if (!certificate) {
        dbConn.close();
        return res.status(404).json({ success: false, message: 'Certificate not found' });
      }
      
      // Certificate found, return the data
      dbConn.close();
      return res.status(200).json({
        success: true,
        certificate: {
          cognome: certificate.cognome,
          nome: certificate.nome,
          data_nascita: certificate.data_nascita,
          luogo_nascita: certificate.luogo_nascita,
          nazione_nascita: certificate.nazione_nascita,
          matricola: certificate.matricola,
          data_esame: certificate.data_esame,
          sede_esame: certificate.sede_esame,
          livello: certificate.livello,
          risultato: certificate.risultato
        }
      });
    }
  );
});

module.exports = router; 