const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const router = express.Router();

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

module.exports = router;
