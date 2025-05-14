# 🐝 AuthHive – Centralized Authentication-as-a-Service

**AuthHive** is a lightweight, reusable microservice that provides secure and scalable user authentication for your SaaS products. Whether you're building an internal tool or offering login/signup APIs for external clients, AuthHive handles it all — with simplicity and security at its core.

---

## 🚀 Features

- 🔐 **JWT Authentication**  
- 📧 **Email & Password Login/Signup**  
- 🔁 **Password Reset & Recovery**  
- 📨 **Email Verification via Token**  
- 🛡️ **CSRF & XSRF Protection**  
- 🧱 **RethinkDB & Hapi.js Based**  

---

## 🧑‍💻 Tech Stack

- **Backend Framework:** Hapi.js  
- **Database:** RethinkDB  
- **Token Management:** JWT  
- **Security:** CSRF, XSRF protection  

---

## 📁 API Endpoints

### 🔹 CSRF Token

`GET /api/auth/csrf-token`  
> Returns a fresh CSRF token for secured form submissions.

---

### 🔹 Signup

`POST /api/auth/signup`  
> Registers a new user with `email`, `username`, and `password`.

---

### 🔹 Login

`POST /api/auth/login`  
> Authenticates user using email/password and returns JWT.

---

### 🔹 Forgot Password

`POST /api/auth/forgot-password`  
> Sends a reset token to the registered email.

---

### 🔹 Reset Password

`POST /api/auth/reset-password`  
> Resets user password using valid token.

---

### 🔹 Send Verification Token

`POST /api/auth/send-verification-token`  
> Sends a verification email/token to a user.

---

### 🔹 Verify Email Token

`POST /api/auth/verify-token`  
> Verifies the token and marks email as verified.

---

## 📦 Use Cases

- Internal login system for your SaaS dashboard(s)  
- Shared authentication across multiple microservices  
- External API authentication for third-party clients  

---

## 🛡️ Security Practices

- All routes protected against CSRF and XSRF attacks  
- Passwords are securely hashed using industry-standard algorithms  
- Rate-limiting and brute-force protection ready to plug in

---

## 🧪 Coming Soon

- 🔁 Refresh Tokens  
- 📱 2FA (Two-Factor Authentication)  
- ⚙️ Admin Dashboard  
- 📊 Usage Analytics  

---

## 💡 Tip

Use this with reverse proxies like Nginx and HTTPS to ensure full-stack security in production!

---

## 🧑‍🔧 Author

**Made with 💛 by Mehyab**

---

## 📜 License

MIT License – Free for commercial and personal use.

