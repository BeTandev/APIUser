const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
app.use(express.json());

const router = express.Router();

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

module.exports = router;
