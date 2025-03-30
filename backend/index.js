const express = require("express");
const app = express();
require("dotenv").config(); // Load environment variables
const mysql = require("mysql2");

// Middleware
app.use(express.json());

// Create MySQL connection (Ensure it's defined only once)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,  // Ensure this is correctly set
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL database");
    }
});

// Test Route
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Import Authentication Routes
const authRoutes = require("./routes/auth");  // Ensure this file exists
app.use("/", authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = db; // Export db correctly
