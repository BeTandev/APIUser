const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const multer = require('multer');

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
  
  db.run(`
  CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT,
    dateOfBirth TEXT,
    idNumber INTEGER,
    phoneNumber INTEGER,
    address TEXT,
    faceImage TEXT
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


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Đăng ký tài xế
app.post('/registerDriver', upload.single('faceImage'), (req, res) => {
  const { fullName, dateOfBirth, idNumber, phoneNumber, address } = req.body;
  const faceImage = req.file.filename;

  // Chuyển đổi số điện thoại sang kiểu INT
  const parsedPhoneNumber = parseInt(phoneNumber);

  // Thêm thông tin tài xế vào cơ sở dữ liệu
  db.run(`INSERT INTO drivers (fullName, dateOfBirth, idNumber, phoneNumber, address, faceImage)
    VALUES (?, ?, ?, ?, ?, ?)`, [fullName, dateOfBirth, parseInt(idNumber), parsedPhoneNumber, address, faceImage], function (err) {
    if (err) {
      console.error('Lỗi khi thêm thông tin tài xế:', err);
      res.status(500).json({ error: 'Đã xảy ra lỗi' });
    } else {
      console.log('Tài xế đã được đăng ký thành công');
      res.status(200).json({ message: 'Tài xế đã được đăng ký thành công' });
    }
});
});
// API lấy dữ liệu của tất cả các tài xế
app.get('/registerDriver', (req, res) => {
  // Truy vấn tất cả các tài xế trong cơ sở dữ liệu
  db.all('SELECT * FROM drivers', (err, rows) => {
    if (err) {
      console.error('Lỗi khi lấy dữ liệu tài xế:', err);
      res.status(500).json({ error: 'Đã xảy ra lỗi' });
    } else {
      res.status(200).json(rows);
    }
  });
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
