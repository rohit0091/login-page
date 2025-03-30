const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const db = require("./db");
require("dotenv").config();

const app = express();
app.use(express.json());

// Email Transporter for OTP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS, // Your App Password
    },
});

// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// REGISTER API (Sign up & send OTP)
app.post("/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email & Password required" });

    // Check if user exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length > 0) return res.status(400).json({ message: "User already exists" });

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 mins

        // Insert user with OTP
        db.query(
            "INSERT INTO users (email, password, otp, otp_expiry) VALUES (?, ?, ?, ?)",
            [email, hashedPassword, otp, otp_expiry],
            (err, result) => {
                if (err) return res.status(500).json({ message: "Database error" });

                // Send OTP via Email
                transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: "Your OTP Code",
                    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
                });

                res.json({ message: "User registered. OTP sent to email." });
            }
        );
    });
});

// LOGIN API (Password-based)
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email & Password required" });

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length === 0) return res.status(404).json({ message: "User not found" });

        const user = result[0];

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    });
});

// LOGIN API (OTP Request)
app.post("/login-otp", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length === 0) return res.status(404).json({ message: "User not found" });

        const otp = generateOTP();
        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 mins

        // Update OTP in DB
        db.query(
            "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?",
            [otp, otp_expiry, email],
            (err, result) => {
                if (err) return res.status(500).json({ message: "Database error" });

                // Send OTP via Email
                transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: "Your OTP Code",
                    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
                });

                res.json({ message: "OTP sent to email" });
            }
        );
    });
});

// VERIFY OTP API (OTP Login)
app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email & OTP required" });

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length === 0) return res.status(404).json({ message: "User not found" });

        const user = result[0];

        // Check OTP validity
        if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
        if (new Date(user.otp_expiry) < new Date()) return res.status(400).json({ message: "OTP expired" });

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Clear OTP after successful login
        db.query("UPDATE users SET otp = NULL, otp_expiry = NULL WHERE email = ?", [email]);

        res.json({ message: "Login successful", token });
    });
});

// Start the server (MOVED TO END)
app.listen(5000, () => console.log("Server running on port 5000"));
