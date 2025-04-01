const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check if running on Heroku (using DATABASE_URL)
const isHeroku = process.env.DATABASE_URL ? true : false;

// Setup database connection based on environment
let db;
let pgPool;

// Database path for SQLite
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Get database connection
const getDbConnection = () => {
  if (isHeroku) {
    // PostgreSQL connection for Heroku
    if (!pgPool) {
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      });
    }
    return pgPool;
  } else {
    // SQLite connection for local development
    return new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error connecting to SQLite database:', err.message);
      } else {
        console.log('Connected to the SQLite database');
      }
    });
  }
};

// Initialize database with tables
const initDb = async () => {
  if (isHeroku) {
    try {
      const pool = getDbConnection();
      const client = await pool.connect();

      // Create users table in PostgreSQL
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          is_admin INTEGER DEFAULT 0
        )
      `);
      console.log('Users table initialized or already exists in PostgreSQL');

      // Create certificates table in PostgreSQL
      await client.query(`
        CREATE TABLE IF NOT EXISTS certificates (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL,
          password TEXT NOT NULL,
          certificato TEXT UNIQUE NOT NULL,
          cognome TEXT NOT NULL,
          nome TEXT NOT NULL,
          data_nascita TEXT NOT NULL,
          luogo_nascita TEXT NOT NULL,
          nazione_nascita TEXT NOT NULL,
          matricola TEXT NOT NULL,
          data_esame TEXT NOT NULL,
          sede_esame TEXT NOT NULL,
          livello TEXT NOT NULL,
          risultato TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Certificates table initialized or already exists in PostgreSQL');

      // Check if admin user exists
      const adminResult = await client.query(
        'SELECT * FROM users WHERE username = $1',
        [process.env.ADMIN_USERNAME]
      );

      if (adminResult.rows.length === 0 && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
        // Hash the admin password
        const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        
        // Insert admin user
        await client.query(
          'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, 1)',
          [process.env.ADMIN_USERNAME, hash]
        );
        console.log('Admin user created successfully in PostgreSQL');
      }

      // Check if sample certificate exists
      const certResult = await client.query('SELECT * FROM certificates LIMIT 1');
      
      if (certResult.rows.length === 0) {
        // Insert a sample certificate
        const sampleCertificate = {
          username: 'test',
          password: 'test123',
          certificato: 'CERT001',
          cognome: 'Rossi',
          nome: 'Mario',
          data_nascita: '01/01/1980',
          luogo_nascita: 'Roma',
          nazione_nascita: 'Italia',
          matricola: 'MAT001',
          data_esame: '15/06/2023',
          sede_esame: 'Reggio Calabria',
          livello: 'B2',
          risultato: 'SUPERATO'
        };
        
        await client.query(`
          INSERT INTO certificates 
          (username, password, certificato, cognome, nome, data_nascita, luogo_nascita, 
          nazione_nascita, matricola, data_esame, sede_esame, livello, risultato) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            sampleCertificate.username,
            sampleCertificate.password,
            sampleCertificate.certificato,
            sampleCertificate.cognome,
            sampleCertificate.nome,
            sampleCertificate.data_nascita,
            sampleCertificate.luogo_nascita,
            sampleCertificate.nazione_nascita,
            sampleCertificate.matricola,
            sampleCertificate.data_esame,
            sampleCertificate.sede_esame,
            sampleCertificate.livello,
            sampleCertificate.risultato
          ]
        );
        console.log('Sample certificate added successfully in PostgreSQL');
      }
      
      client.release();
    } catch (err) {
      console.error('Error initializing PostgreSQL database:', err);
    }
  } else {
    // SQLite initialization
    const db = getDbConnection();
    
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
        db.close();
        return;
      } else {
        console.log('Users table initialized or already exists');
        
        // Check if admin user exists, if not create it
        db.get('SELECT * FROM users WHERE username = ?', [process.env.ADMIN_USERNAME], (err, row) => {
          if (err) {
            console.error('Error checking admin user:', err.message);
            db.close();
            return;
          } else if (!row && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
            // Hash the admin password
            bcrypt.hash(process.env.ADMIN_PASSWORD, 10, (err, hash) => {
              if (err) {
                console.error('Error hashing admin password:', err.message);
                db.close();
                return;
              } else {
                // Insert admin user
                db.run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, 1)', 
                  [process.env.ADMIN_USERNAME, hash], (err) => {
                  if (err) {
                    console.error('Error creating admin user:', err.message);
                  } else {
                    console.log('Admin user created successfully');
                  }
                  db.close();
                });
              }
            });
          } else {
            db.close();
          }
        });
      }
    });

    // Create certificates table
    db.run(`CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      certificato TEXT UNIQUE NOT NULL,
      cognome TEXT NOT NULL,
      nome TEXT NOT NULL,
      data_nascita TEXT NOT NULL,
      luogo_nascita TEXT NOT NULL,
      nazione_nascita TEXT NOT NULL,
      matricola TEXT NOT NULL,
      data_esame TEXT NOT NULL,
      sede_esame TEXT NOT NULL,
      livello TEXT NOT NULL,
      risultato TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating certificates table:', err.message);
      } else {
        console.log('Certificates table initialized or already exists');
        
        // Add a sample certificate if none exists
        db.get('SELECT * FROM certificates LIMIT 1', (err, row) => {
          if (err) {
            console.error('Error checking certificates:', err.message);
          } else if (!row) {
            // Insert a sample certificate
            const sampleCertificate = {
              username: 'test',
              password: 'test123',
              certificato: 'CERT001',
              cognome: 'Rossi',
              nome: 'Mario',
              data_nascita: '01/01/1980',
              luogo_nascita: 'Roma',
              nazione_nascita: 'Italia',
              matricola: 'MAT001',
              data_esame: '15/06/2023',
              sede_esame: 'Reggio Calabria',
              livello: 'B2',
              risultato: 'SUPERATO'
            };
            
            db.run(`INSERT INTO certificates 
              (username, password, certificato, cognome, nome, data_nascita, luogo_nascita, 
              nazione_nascita, matricola, data_esame, sede_esame, livello, risultato) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                sampleCertificate.username,
                sampleCertificate.password,
                sampleCertificate.certificato,
                sampleCertificate.cognome,
                sampleCertificate.nome,
                sampleCertificate.data_nascita,
                sampleCertificate.luogo_nascita,
                sampleCertificate.nazione_nascita,
                sampleCertificate.matricola,
                sampleCertificate.data_esame,
                sampleCertificate.sede_esame,
                sampleCertificate.livello,
                sampleCertificate.risultato
              ],
              (err) => {
                if (err) {
                  console.error('Error inserting sample certificate:', err.message);
                } else {
                  console.log('Sample certificate added successfully');
                }
              }
            );
          }
        });
      }
    });
  }
};

// Create .env file if it doesn't exist
const createEnvFile = () => {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    const envContent = `PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=7c31c2a8e2b94ef8b9ba9f9d8a5e7e2d
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('.env file created with default values');
  }
};

// Initialize environment
createEnvFile();

module.exports = {
  getDbConnection,
  initDb,
  isHeroku
}; 