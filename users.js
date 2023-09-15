const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const jwt = require('jsonwebtoken');

const router = express.Router();

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
    db.get("SELECT username FROM users WHERE username = ?", [username], (err, row) => {
      if (err) {
        console.error("Error checking username:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
  
      if (row) {``
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
    });
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

  module.exports = router