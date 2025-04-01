const express = require('express');
const db = require('../models/db');

const router = express.Router();

// Get all certificates (admin only)
router.get('/', (req, res) => {
  const dbConn = db.getDbConnection();
  
  dbConn.all('SELECT * FROM certificates ORDER BY created_at DESC', [], (err, certificates) => {
    if (err) {
      console.error('Error fetching certificates:', err.message);
      dbConn.close();
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    
    dbConn.close();
    res.json({ success: true, certificates });
  });
});

// Get a single certificate by ID (admin only)
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const dbConn = db.getDbConnection();
  
  dbConn.get('SELECT * FROM certificates WHERE id = ?', [id], (err, certificate) => {
    if (err) {
      console.error('Error fetching certificate:', err.message);
      dbConn.close();
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    
    if (!certificate) {
      dbConn.close();
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    
    dbConn.close();
    res.json({ success: true, certificate });
  });
});

// Create a new certificate (admin only)
router.post('/', (req, res) => {
  const { 
    username, password, certificato, cognome, nome, data_nascita, 
    luogo_nascita, nazione_nascita, matricola, data_esame, 
    sede_esame, livello, risultato 
  } = req.body;
  
  // Validate required fields
  if (!username || !password || !certificato || !cognome || !nome || 
      !data_nascita || !luogo_nascita || !nazione_nascita || !matricola || 
      !data_esame || !sede_esame || !livello || !risultato) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  
  const dbConn = db.getDbConnection();
  
  // Check if certificate number already exists
  dbConn.get('SELECT * FROM certificates WHERE certificato = ?', [certificato], (err, existingCert) => {
    if (err) {
      console.error('Error checking certificate:', err.message);
      dbConn.close();
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    
    if (existingCert) {
      dbConn.close();
      return res.status(400).json({ success: false, message: 'Certificate number already exists' });
    }
    
    // Insert new certificate
    const sql = `
      INSERT INTO certificates (
        username, password, certificato, cognome, nome, data_nascita, 
        luogo_nascita, nazione_nascita, matricola, data_esame, 
        sede_esame, livello, risultato
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    dbConn.run(sql, [
      username, password, certificato, cognome, nome, data_nascita, 
      luogo_nascita, nazione_nascita, matricola, data_esame, 
      sede_esame, livello, risultato
    ], function(err) {
      if (err) {
        console.error('Error creating certificate:', err.message);
        dbConn.close();
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      
      dbConn.close();
      res.status(201).json({ 
        success: true, 
        message: 'Certificate created successfully', 
        certificateId: this.lastID 
      });
    });
  });
});

// Update a certificate (admin only)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { 
    username, password, certificato, cognome, nome, data_nascita, 
    luogo_nascita, nazione_nascita, matricola, data_esame, 
    sede_esame, livello, risultato 
  } = req.body;
  
  // Validate required fields
  if (!username || !password || !certificato || !cognome || !nome || 
      !data_nascita || !luogo_nascita || !nazione_nascita || !matricola || 
      !data_esame || !sede_esame || !livello || !risultato) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  
  const dbConn = db.getDbConnection();
  
  // Check if certificate exists
  dbConn.get('SELECT * FROM certificates WHERE id = ?', [id], (err, existingCert) => {
    if (err) {
      console.error('Error checking certificate:', err.message);
      dbConn.close();
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    
    if (!existingCert) {
      dbConn.close();
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    
    // Check if new certificate number conflicts with another certificate
    dbConn.get('SELECT * FROM certificates WHERE certificato = ? AND id != ?', [certificato, id], (err, conflictCert) => {
      if (err) {
        console.error('Error checking certificate conflict:', err.message);
        dbConn.close();
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      
      if (conflictCert) {
        dbConn.close();
        return res.status(400).json({ success: false, message: 'Certificate number already exists' });
      }
      
      // Update certificate
      const sql = `
        UPDATE certificates SET
          username = ?, password = ?, certificato = ?, cognome = ?, nome = ?, 
          data_nascita = ?, luogo_nascita = ?, nazione_nascita = ?, matricola = ?, 
          data_esame = ?, sede_esame = ?, livello = ?, risultato = ?
        WHERE id = ?
      `;
      
      dbConn.run(sql, [
        username, password, certificato, cognome, nome, data_nascita, 
        luogo_nascita, nazione_nascita, matricola, data_esame, 
        sede_esame, livello, risultato, id
      ], function(err) {
        if (err) {
          console.error('Error updating certificate:', err.message);
          dbConn.close();
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        
        dbConn.close();
        res.json({ success: true, message: 'Certificate updated successfully' });
      });
    });
  });
});

// Delete a certificate (admin only)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const dbConn = db.getDbConnection();
  
  // Check if certificate exists
  dbConn.get('SELECT * FROM certificates WHERE id = ?', [id], (err, existingCert) => {
    if (err) {
      console.error('Error checking certificate:', err.message);
      dbConn.close();
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    
    if (!existingCert) {
      dbConn.close();
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    
    // Delete certificate
    dbConn.run('DELETE FROM certificates WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting certificate:', err.message);
        dbConn.close();
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      
      dbConn.close();
      res.json({ success: true, message: 'Certificate deleted successfully' });
    });
  });
});

module.exports = router; 