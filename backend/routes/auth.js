const express = require("express");
const router = express.Router();
const db = require("../db"); // Ensure correct DB connection
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ REGISTER API (User Signup with OTP)
router.post("/api/register", async (req, res) => {
    const { email, password } = req.body;

    // ✅ Validate Input
    if (!email || !password) {
        return res.status(400).json({ message: "Email & Password are required" });
    }

    // ✅ Check if the User Already Exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // ✅ Hash Password Securely
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otp_expiry = Math.floor(Date.now() / 1000) + 600; // OTP expiry in 10 mins (Unix timestamp)

        // ✅ Insert User into Database
        db.query(
            "INSERT INTO users (email, password, otp, otp_expiry) VALUES (?, ?, ?, ?)",
            [email, hashedPassword, otp, otp_expiry],
            async (err, result) => {
                if (err) {
                    console.error("Database insert error:", err);
                    return res.status(500).json({ message: "Database error" });
                }

                // ✅ Send OTP via Email
                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: "Your OTP Code",
                        text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
                    });

                    res.json({ message: "User registered. OTP sent to email." });
                } catch (emailError) {
                    console.error("Email sending error:", emailError);
                    return res.status(500).json({ message: "Failed to send OTP email" });
                }
            }
        );
    });
});

// ✅ EXPORT ROUTER (Important!)
module.exports = router;
