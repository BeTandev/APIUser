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
  db.run("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [username, password, email], (err) => {
    if (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json({ message: "User created successfully" });
    }
  });
});

app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { username, password, email } = req.body;
  db.run("UPDATE users SET username = ?, password = ?, email = ? WHERE id = ?", [username, password, email, id], (err) => {
    if (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json({ message: "User updated successfully" });
    }
  });
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

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});