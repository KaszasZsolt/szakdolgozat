require('dotenv').config(); // .env fájl beolvasása
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT;
const SECRET_KEY = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// MySQL kapcsolat létrehozása pool segítségével a .env fájlban megadott adatokkal
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Táblák inicializálása: Ha a 'users' tábla még nem létezik, létrehozzuk
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
    `);
    console.log('A users tábla létezik, vagy sikeresen létre lett hozva.');
  } catch (err) {
    console.error('Hiba a users tábla létrehozásakor:', err);
  }
}

initDB();

// Regisztráció
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email és jelszó megadása kötelező." });
    }
    
    // Ellenőrizzük, hogy létezik-e már ilyen email az adatbázisban
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "A felhasználó már létezik." });
    }
    
    // Jelszó hash-elése
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Új felhasználó beszúrása az adatbázisba
    await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
    
    return res.status(201).json({ message: "Felhasználó sikeresen regisztrálva." });
  } catch (error) {
    console.error("Regisztrációs hiba:", error);
    res.status(500).json({ message: "Valami hiba történt a regisztráció során." });
  }
});

// Bejelentkezés
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email és jelszó megadása kötelező." });
    }
    
    // Felhasználó keresése az adatbázisban
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Érvénytelen email vagy jelszó." });
    }
    
    const user = rows[0];
    
    // Jelszó ellenőrzése
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Érvénytelen email vagy jelszó." });
    }
    
    // Token generálása (például 1 órás érvényességgel)
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    
    return res.json({ message: "Sikeres bejelentkezés.", token });
  } catch (error) {
    console.error("Bejelentkezési hiba:", error);
    res.status(500).json({ message: "Valami hiba történt a bejelentkezés során." });
  }
});

// HTTP szerver indítása
app.listen(PORT, () => {
  console.log(`HTTP szerver fut a ${PORT}-es porton`);
});
