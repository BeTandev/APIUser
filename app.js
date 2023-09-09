const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());

const db = new sqlite3.Database("userData.sqlite3");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    email TEXT
  )`);

  db.run(
    `CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT, 
      phone INTEGER, 
      pickupLocation TEXT, 
      destination TEXT, 
      carType TEXT, 
      note TEXT)`
  );

  db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phoneNumber INTEGER,
    message TEXT
  )
`);
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) {
      console.error("Error getting users:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json(rows);
    }
  });
});

app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error getting user:", err);
      res.status(500).json({ error: "Internal server error" });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });
});

app.post("/users", (req, res) => {
  const { username, password, email } = req.body;
  db.run(
    "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
    [username, password, email],
    (err) => {
      if (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.json({ message: "User created successfully" });
      }
    }
  );
});

app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { username, password, email } = req.body;
  db.run(
    "UPDATE users SET username = ?, password = ?, email = ? WHERE id = ?",
    [username, password, email, id],
    (err) => {
      if (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.json({ message: "User updated successfully" });
      }
    }
  );
});

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM users WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json({ message: "User deleted successfully" });
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      console.error("Error getting user:", err);
      res.status(500).json({ error: "Internal server error" });
    } else if (row) {
      if (row.password === password) {
        // Mật khẩu khớp, đăng nhập thành công
        res.json({ message: "Đăng nhập thành công" });
      } else {
        // Mật khẩu không khớp, đăng nhập thất bại
        res.status(401).json({ error: "Mật khẩu không chính xác" });
      }
    } else {
      // Người dùng không tồn tại
      res.status(404).json({ error: "Người dùng không tồn tại" });
    }
  });
});

// API để đặt xe
app.post("/bookings", (req, res) => {
  const { name, phone, pickupLocation, destination, carType, note } = req.body;

  db.run(
    "INSERT INTO bookings (name, phone, pickupLocation, destination, carType, note) VALUES (?, ?, ?, ?, ?, ?)",
    [name, phone, pickupLocation, destination, carType, note],
    function (err) {
      if (err) {
        console.error(err);
        res.status(500).send("Lỗi khi tạo đơn đặt xe");
      } else {
        res.status(200).send("Đơn đặt xe đã được tạo thành công");
      }
    }
  );
});

// Lấy danh sách các đơn đặt xe
app.get("/bookings", (req, res) => {
  db.all("SELECT * FROM bookings", function (err, rows) {
    if (err) {
      console.error(err);
      res.status(500).send("Lỗi khi lấy danh sách đơn đặt xe");
    } else {
      res.status(200).json(rows);
    }
  });
});



// GET: Lấy tất cả các tin nhắn
app.get('/messages', (req, res) => {
  db.all('SELECT * FROM messages', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi server' });
    } else {
      res.json(rows);
    }
  });
});

// POST: Tạo một tin nhắn mới
app.post('/messages', (req, res) => {
  const { name, email, phonenumber, message } = req.body;
  const sql = 'INSERT INTO messages (name, email, phonenumber, message) VALUES (?, ?, ?, ?)';
  const params = [name, email, phonenumber, message];

  db.run(sql, params, function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi server' });
    } else {
      res.json({ id: this.lastID });
    }
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
