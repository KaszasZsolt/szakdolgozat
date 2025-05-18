require('dotenv').config(); // .env fájl beolvasása
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const cookieParser = require('cookie-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 31112;
const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

app.set('trust proxy', true);
app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? "http://localhost:5173"
    : "https://kartyajatek.soon.it",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// MySQL kapcsolat pool létrehozása a .env fájlban megadott adatokkal
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Táblák inicializálása: 'users' és 'games'
// A games táblában a config oszlopban JSON stringként tároljuk a konfigurációt.
async function initDB() {
  try {
    // Users tábla létrehozása
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
    `);
    console.log('A users tábla létezik, vagy sikeresen létre lett hozva.');

    // Games tábla létrehozása – UNIQUE kulcs nélkül
    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        config TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('A games tábla létezik, vagy sikeresen létre lett hozva.');
  } catch (err) {
    console.error('Hiba a táblák inicializálásakor:', err);
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
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "A felhasználó már létezik." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
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
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Érvénytelen email vagy jelszó." });
    }
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Érvénytelen email vagy jelszó." });
    }
    const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_SECRET, { expiresIn: '7d' });
    
    // A refresh token-t HTTPOnly cookie-ként küldjük vissza
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 nap
    });
    console.log('Refresh toke',user.id)
    return res.json({ 
      message: "Sikeres bejelentkezés.", 
      accessToken,
      userId: user.id 
    });
  } catch (error) {
    console.error("Bejelentkezési hiba:", error);
    res.status(500).json({ message: "Valami hiba történt a bejelentkezés során." });
  }
});


// Hitelesítő middleware a token ellenőrzéséhez
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: "Hiányzó token." });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Token hiányzik." });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.error("Token ellenőrzési hiba:", err);
      return res.status(401).json({ message: "Érvénytelen vagy lejárt token." });
    }
    req.user = user;
    next();
  });
}

app.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token hiányzik." });
  jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Refresh token érvénytelen vagy lejárt." });
    const newAccessToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  });
});

// Logout endpoint: törli a refresh token cookie-t
app.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: "Sikeres kijelentkezés." });
});

// Védett Dashboard végpont
app.get('/dashboard', authenticateToken, async (req, res) => {
  res.json({ email: req.user.email, id: req.user.id });
});

// Játék létrehozása (csak a neve)
app.post('/games', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "A játék neve kötelező." });
    }
    await pool.query('INSERT INTO games (user_id, name) VALUES (?, ?)', [userId, name]);
    res.status(201).json({ message: "Játék sikeresen létrehozva." });
  } catch (err) {
    console.error("Hiba a játék létrehozásakor:", err);
    res.status(500).json({ message: "Hiba történt a játék létrehozása során." });
  }
});

// Egyedi játék lekérése (az adott gameId-hoz)
app.get('/games/:gameId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM games WHERE id = ? AND user_id = ?',
      [gameId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "A játék nem található vagy nem tartozik a felhasználóhoz." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Hiba a játék lekérésekor:", err);
    res.status(500).json({ message: "Hiba történt a játék lekérésekor." });
  }
});

// Játékok lekérése – csak a bejelentkezett felhasználó játékai
app.get('/games', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [games] = await pool.query('SELECT * FROM games WHERE user_id = ?', [userId]);
    res.json(games);
  } catch (err) {
    console.error("Hiba a játékok lekérésekor:", err);
    res.status(500).json({ message: "Hiba történt a játékok lekérésekor." });
  }
});

// Játék létrehozása konfigurációval
app.post('/games/config', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, config } = req.body;
    if (!name || !config) {
      return res.status(400).json({ message: "A játék neve és konfiguráció kötelező." });
    }
    const [result] = await pool.query('INSERT INTO games (user_id, name, config) VALUES (?, ?, ?)', [userId, name, config]);
    res.status(201).json({ message: "Játék konfiguráció sikeresen elmentve.", id: result.insertId });
  } catch (err) {
    console.error("Hiba a játék konfiguráció mentésekor:", err);
    res.status(500).json({ message: "Hiba történt a játék konfiguráció mentése során." });
  }
});

// Játék konfiguráció frissítése
app.put('/games/:gameId/config', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const { config } = req.body;
    if (!config) {
      return res.status(400).json({ message: "A konfiguráció kötelező." });
    }
    const [rows] = await pool.query('SELECT * FROM games WHERE id = ? AND user_id = ?', [gameId, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "A játék nem található vagy nem tartozik a felhasználóhoz." });
    }
    await pool.query('UPDATE games SET config = ? WHERE id = ?', [config, gameId]);
    res.json({ message: "Játék konfiguráció sikeresen frissítve." });
  } catch (err) {
    console.error("Hiba a játék konfiguráció frissítésekor:", err);
    res.status(500).json({ message: "Hiba történt a játék konfiguráció frissítése során." });
  }
});

// Játék törlése
app.delete('/games/:gameId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const [rows] = await pool.query('SELECT * FROM games WHERE id = ? AND user_id = ?', [gameId, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "A játék nem található vagy nem tartozik a felhasználóhoz." });
    }
    await pool.query('DELETE FROM games WHERE id = ?', [gameId]);
    res.json({ message: "Játék sikeresen törölve." });
  } catch (err) {
    console.error("Hiba a játék törlésekor:", err);
    res.status(500).json({ message: "Hiba történt a játék törlése során." });
  }
});

let serverInstance;

if (process.env.NODE_ENV === 'development') {
  serverInstance = http.createServer(app);
} else {
  const httpsOptions = {
    key: fs.readFileSync('/home/ubuntu/kartyajatek/megvalositas/server/ssl/privkey.pem'),
    cert: fs.readFileSync('/home/ubuntu/kartyajatek/megvalositas/server/ssl/fullchain.pem')
  };
  serverInstance = https.createServer(httpsOptions, app);
}


//#region Játék szoba létrehozása és lekérése
const rooms = {};
app.post('/rooms', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.body;
    if (!gameId) {
      return res.status(400).json({ message: "A gameId kötelező." });
    }
    
    const [games] = await pool.query('SELECT * FROM games WHERE id = ? AND user_id = ?', [gameId, userId]);
    if (games.length === 0) {
      return res.status(404).json({ message: "A játék nem található, vagy nem a felhasználóhoz tartozik." });
    }
    
    const gameConfig = games[0].config; 
    
    let code = Math.floor(1000 + Math.random() * 9000).toString();
    while (rooms[code]) {
      code = Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    rooms[code] = {
      host: userId,
      gameId,
      gameConfig,
      createdAt: new Date(),
      players: [] 
    };
    
    res.status(201).json({ message: "Szoba létrehozva.", code });
  } catch (err) {
    console.error("Hiba a szoba létrehozásakor:", err);
    res.status(500).json({ message: "Hiba történt a szoba létrehozása során." });
  }
});

app.get('/rooms/:code', authenticateToken, (req, res) => {
  try {
    const { code } = req.params;
    const room = rooms[code];
    if (!room) {
      return res.status(404).json({ message: "Szoba nem található." });
    }
    res.json(room);
  } catch (err) {
    console.error("Hiba a szoba lekérésekor:", err);
    res.status(500).json({ message: "Hiba történt a szoba lekérésekor." });
  }
});
function playersListForRoom(roomCode) {
  return rooms[roomCode] ? rooms[roomCode].players : [];
}
//#endregion Játék szoba létrehozása és lekérése


//#region  io connection
const io = require("socket.io")(serverInstance, {
  cors: {
    origin: process.env.NODE_ENV === 'development'
      ? "http://localhost:5173"
      : "https://kartyajatek.soon.it",
    methods: ["GET", "POST"],
    credentials: true
  }
});




io.on("connection", (socket) => {
  socket.on("joinRoom", ({ roomCode, user }) => {
    if (!rooms[roomCode]) {
      return socket.emit("roomNotFound");
    }
    socket.roomCode = roomCode;
    socket.user = user;
    const roomPlayers = rooms[roomCode].players;
    const userExists = roomPlayers.some((u) => u.id === user.id);
    if (!userExists) {
      roomPlayers.push(user);
    }


    socket.join(roomCode);
    io.to(roomCode).emit("updatePlayers", playersListForRoom(roomCode));
  });

  socket.on("startGame", ({ roomCode }) => {
    if (!rooms[roomCode]) {
      return socket.emit("error", { message: "A szoba nem található." });
    }
    if (rooms[roomCode].host !== socket.user.id) {
      return socket.emit("error", { message: "Csak a host indíthatja a játékot." });
    }
    io.to(roomCode).emit("gameStarted", { message: "A játék elindult!" });
  });
  socket.on("resetGame", ({ roomCode }) => {
    if (!rooms[roomCode]) return;
    if (rooms[roomCode].host !== socket.user.id) {
      
      return socket.emit("error", { message: "Csak a host indíthat új játékot." });
    }
    io.to(roomCode).emit("resetGame"); 
  });

  socket.on("actionSelected", (data) => {
    io.to(socket.roomCode).emit("actionSelected", data);
  });
  socket.on("customSelectionMade", (data) => {
    io.to(socket.roomCode).emit("customSelectionMade", data);
  });
  
  socket.on("actionExecuted", (data) => {
    io.to(socket.roomCode).emit("actionExecuted", data);
  });

  socket.on("stepCompleted", (data) => {
    io.to(socket.roomCode).emit("stepCompleted", data);
  });

  socket.on("log", (message) => {
    io.to(socket.roomCode).emit("log", message);
  });

  socket.on("awaitSelection", (data) => {
    io.to(socket.roomCode).emit("awaitSelection", data);
  });
  
  socket.on("disconnect", () => {
    if (socket.roomCode && socket.user) {
      if (rooms[socket.roomCode]) {
        rooms[socket.roomCode].players = rooms[socket.roomCode].players.filter(
          (u) => u.id !== socket.user.id
        );
        io.to(socket.roomCode).emit("updatePlayers", playersListForRoom(socket.roomCode));
      }
    }
  });

  socket.on("handsUpdate", (data) => {
    if (!socket.roomCode) return;
    console.log(data)

    io.to(socket.roomCode).emit("handsUpdate", data);
  });

  socket.on("handUpdate", (data) => {
    if (!socket.roomCode) return;
    io.to(socket.roomCode).emit("handUpdate",data);
  });
  socket.on("drawPileUpdated", (data) => {
    if (!socket.roomCode) return;
    io.to(socket.roomCode).emit("drawPileUpdated",data);
  });
  socket.on("tableCardsSet", (data) => {
    if (!socket.roomCode) return;
    io.to(socket.roomCode).emit("tableCardsSet",data);
  });
  socket.on("tableCardMode", (data) => {
    if (!socket.roomCode) return;
    io.to(socket.roomCode).emit("tableCardMode",data);
  });
  socket.on("notification", (data) => {
    if (!socket.roomCode) return;
    io.to(socket.roomCode).emit("notification",data);
  });
});


//#endregion io connection


serverInstance.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTPS szerver fut a ${PORT}-es porton`);
});