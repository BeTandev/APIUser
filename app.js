const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

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
  db.run(
    `CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT, 
      dob TEXT, 
      cmnd INTEGER, 
      phone INTEGER, 
      address TEXT
      )`
  );
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

  // Truy vấn cơ sở dữ liệu để kiểm tra tên người dùng đã tồn tại hay chưa
  db.get(
    "SELECT username FROM users WHERE username = ?",
    [username],
    (err, row) => {
      if (err) {
        console.error("Error checking username:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      if (row) {
        ``;
        // Tên người dùng đã tồn tại, trả về phản hồi lỗi
        res.status(400).json({ error: "Username already exists" });
        return;
      }

      // Tên người dùng chưa tồn tại, thêm người dùng mới vào cơ sở dữ liệu
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

  // Truy vấn cơ sở dữ liệu để kiểm tra tên người dùng và mật khẩu
  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        console.error("Error checking credentials:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      if (!row) {
        // Tên người dùng hoặc mật khẩu không chính xác, trả về phản hồi lỗi
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      // Đăng nhập thành công, trả về phản hồi thành công
      res.json({ message: "Login successful" });
    }
  );
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
app.get("/messages", (req, res) => {
  db.all("SELECT * FROM messages", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Lỗi server" });
    } else {
      res.json(rows);
    }
  });
});

// POST: Tạo một tin nhắn mới
app.post("/messages", (req, res) => {
  const { name, email, phonenumber, message } = req.body;
  const sql =
    "INSERT INTO messages (name, email, phonenumber, message) VALUES (?, ?, ?, ?)";
  const params = [name, email, phonenumber, message];

  db.run(sql, params, function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Lỗi server" });
    } else {
      res.json({ id: this.lastID });
    }
  });
});

// Đăng ký tài xế
app.post("/regisDriver", (req, res) => {
  const { name, dob, cmnd, phone, address } = req.body;

  // Kiểm tra nếu thiếu thông tin
  if (!name || !dob || !cmnd || !phone || !address) {
    return res.status(400).json({ error: "Missing information" });
  }

  // Thêm tài xế vào cơ sở dữ liệu
  const query = `
    INSERT INTO drivers (name, dob, cmnd, phone, address)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(query, [name, dob, cmnd, phone, address], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Trả về thông tin tài xế đã đăng ký
    const driverId = this.lastID;
    res.status(201).json({ id: driverId, name, dob, cmnd, phone, address });
  });
});
// Lấy tất cả các tài xế
app.get("/regisDriver", (req, res) => {
  const query = "SELECT * FROM drivers";

  db.all(query, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.json(rows);
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
