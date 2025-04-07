# API Testing Guide: Authentication System

## Introduction
This guide provides a step-by-step approach to testing the authentication system using **Postman** or **cURL**. The system includes:
- **User Registration** (with OTP)
- **Password-Based Login**
- **OTP Request for Login**
- **OTP-Based Login**
- **OTP Verification**

## Prerequisites
- **Postman** or any API testing tool
- **Node.js & Express.js** backend running on `http://localhost:5000`
- **MySQL Database** configured and running
- **Valid email credentials** for sending OTP

---
## 1️⃣ User Registration (Signup with OTP)
### **Endpoint:**
`POST /api/register`

### **Request Body:**
```json
{
  "email": "testuser@example.com",
  "password": "securepassword123"
}
```

### **Expected Response:**
```json
{
  "message": "User registered. OTP sent to email."
}
```
**🔹 Check:** OTP should be sent to the given email.

---
## 2️⃣ Password-Based Login
### **Endpoint:**
`POST /api/login/password`

### **Request Body:**
```json
{
  "email": "testuser@example.com",
  "password": "securepassword123"
}
```

### **Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "email": "testuser@example.com"
  }
}
```
**🔹 Check:** Ensure correct email & password return success, and incorrect credentials return an error.

---
## 3️⃣ Request OTP for OTP-Based Login
### **Endpoint:**
`POST /api/request-otp`

### **Request Body:**
```json
{
  "email": "testuser@example.com"
}
```

### **Expected Response:**
```json
{
  "message": "OTP sent successfully!"
}
```
**🔹 Check:** OTP should be sent to the given email.

---
## 4️⃣ OTP-Based Login
### **Endpoint:**
`POST /api/login/otp`

### **Request Body:**
```json
{
  "email": "testuser@example.com",
  "otp": "123456"
}
```

### **Expected Response (If OTP is valid):**
```json
{
  "message": "OTP login successful",
  "user": {
    "email": "testuser@example.com"
  }
}
```
### **Expected Response (If OTP is invalid or expired):**
```json
{
  "error": "Invalid OTP!"
}
```
**🔹 Check:** Ensure correct OTP works, incorrect OTP fails, and expired OTP is rejected.

---
## 5️⃣ OTP Verification
### **Endpoint:**
`POST /api/verify-otp`

### **Request Body:**
```json
{
  "email": "testuser@example.com",
  "otp": "123456"
}
```

### **Expected Response (If OTP is correct):**
```json
{
  "message": "OTP verified successfully!"
}
```
### **Expected Response (If OTP is incorrect or expired):**
```json
{
  "error": "Invalid OTP!"
}
```
**🔹 Check:** Ensure OTP is verified successfully before proceeding.

---
## Notes
- OTP expires after **10 minutes**.
- If OTP verification fails, request a new OTP and try again.
- Use valid email credentials for OTP email delivery.
- Check the MySQL database to verify OTP storage and expiry timestamps.

---
## Conclusion
Following this guide ensures that all authentication APIs are working correctly. If any test fails, check logs and database values for debugging.

✅ **API Authentication System Successfully Tested!** 🎉

