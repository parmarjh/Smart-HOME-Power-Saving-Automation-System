# 🔐 Smart Account Login System

## Overview

A complete, secure authentication system has been added to the Smart Power Saving Automation System with modern UI/UX, session management, and database integration.

---

## ✨ Features Implemented

### 1. **Beautiful Login/Signup Page** (`login.html`)
- **Modern Glassmorphism Design**
  - Purple/blue gradient theme matching the main application
  - Animated background particles for dynamic visual appeal
  - Smooth transitions and micro-animations

- **Dual Authentication Modes**
  - Seamless tab switching between Login and Sign Up
  - Form validation with real-time feedback
  - Password strength requirements (minimum 6 characters)
  - Password confirmation matching

- **Form Fields**
  - Login: Email + Password
  - Signup: Name + Email + Password + Confirm Password
  - All fields with custom icons and placeholders

- **Additional Features**
  - "Forgot password?" link (placeholder for future implementation)
  - Social login buttons (Google & GitHub - placeholders)
  - Error/Success alert notifications
  - Loading spinner during authentication

---

### 2. **Secure Backend Authentication** (`server.py`)

#### **New Dependencies**
```python
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
```

#### **Session Management**
- Secure session key using `secrets.token_hex(32)`
- Flask sessions with CORS support for credentials
- Persistent login state across requests

#### **Database Schema**
New `users` table with:
- `id` (PRIMARY KEY)
- `name` (TEXT)
- `email` (UNIQUE)
- `password_hash` (TEXT - encrypted)
- `role` (TEXT - default: 'user')
- `created_at` (TIMESTAMP)
- `last_login` (TIMESTAMP)

#### **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/signup` | POST | Register new user account |
| `/api/login` | POST | Authenticate and create session |
| `/api/logout` | POST | Clear session and logout |
| `/api/auth/check` | GET | Verify authentication status |
| `/api/user/profile` | GET | Get current user profile |

#### **Security Features**
- **Password Hashing**: Uses `werkzeug.security` for bcrypt-based hashing
- **Email Uniqueness**: Prevents duplicate accounts
- **Input Validation**: Server-side validation for all fields
- **Session Protection**: Dashboard routes protected with session checks
- **Activity Logging**: User actions logged in database

---

### 3. **Protected Dashboard** (`index.html` + `app.js`)

#### **Header Updates**
New user profile section displaying:
- User icon with gradient background
- User's full name
- User's email address
- Logout button with icon

#### **Authentication Flow**
```javascript
// On page load
1. Check authentication via /api/auth/check
2. If not authenticated → redirect to /login
3. If authenticated → display user info and proceed

// On logout
1. Call /api/logout (POST)
2. Clear browser session
3. Redirect to /login
```

#### **Frontend Features**
- Real-time user info display
- Visual feedback on hover states
- Smooth logout transition
- Auto-redirect for unauthorized access

---

## 🎨 UI/UX Design

### Login Page Design Elements

**Color Palette:**
- Background: `linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)`
- Primary Button: `linear-gradient(135deg, #8a2be2, #4169e1)`
- Glass Effect: `rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(20px)`

**Animations:**
- Particle floating animation (30 particles, 15s duration)
- Tab switching fade-in effect
- Button hover with transform and glow
- Loading spinner rotation

**Responsive Design:**
- Mobile-first approach
- Max-width container (450px)
- Adjusts padding and font sizes on small screens

---

## 📋 Complete Authentication Flow

### 1. **New User Registration**
```
User visits http://localhost:5000
  ↓
Redirected to /login (no session)
  ↓
Click "Sign Up" tab
  ↓
Fill: Name, Email, Password, Confirm Password
  ↓
Click "Create Account"
  ↓
Server validates and hashes password
  ↓
User created in database
  ↓
Success message + Auto-switch to Login tab
```

### 2. **User Login**
```
User on /login page
  ↓
Enter: Email + Password
  ↓
Click "Sign In"
  ↓
Server validates credentials
  ↓
Session created with user data
  ↓
Redirected to / (Dashboard)
  ↓
User info displayed in header
```

### 3. **Session Protection**
```
User tries to access /
  ↓
Server checks session
  ↓
If no session → Redirect to /login
If valid session → Serve dashboard
```

### 4. **User Logout**
```
User clicks logout button
  ↓
Call /api/logout
  ↓
Server clears session
  ↓
Log activity in database
  ↓
Redirect to /login
```

---

## 🔧 Technical Implementation

### File Changes

**New Files:**
- `login.html` - Authentication page (fully self-contained with CSS & JS)

**Modified Files:**
1. `server.py`
   - Added session management
   - Created authentication endpoints
   - Added route protection
   - Updated database schema

2. `index.html`
   - Added user profile section in header
   - Added logout button

3. `style.css`
   - Added user profile styles
   - Added logout button styles
   - Hover effects and animations

4. `app.js`
   - Added `checkAuthentication()` method
   - Added `handleLogout()` method
   - Auto-redirect on no auth
   - Display user info on load

---

## 🧪 Testing Results

### ✅ Test 1: Page Protection
- **Result**: Accessing `/` without session redirects to `/login` ✓

### ✅ Test 2: User Registration
- **Input**: Name: "Test User", Email: "test@smartpower.com", Pass: "test123456"
- **Result**: Account created, redirected to login tab ✓

### ✅ Test 3: User Login
- **Input**: Email: "test@smartpower.com", Pass: "test123456"
- **Result**: Session created, redirected to dashboard ✓

### ✅ Test 4: User Info Display
- **Result**: Header shows "Test User" and "test@smartpower.com" ✓

### ✅ Test 5: Logout
- **Result**: Clicked logout → Session cleared → Redirected to login ✓

### ✅ Test 6: Session Persistence
- **Result**: Trying to access `/` after logout redirects to `/login` ✓

---

## 📊 Database Schema

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_login TEXT
);

CREATE TABLE activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT
);
```

**Sample User Data:**
```json
{
  "id": 1,
  "name": "Test User",
  "email": "test@smartpower.com",
  "password_hash": "$pbkdf2-sha256$...",
  "role": "user",
  "created_at": "2026-01-12T12:35:20",
  "last_login": "2026-01-12T12:36:45"
}
```

---

## 🚀 Usage

### Starting the Server
```bash
cd "c:\Users\parma\OneDrive\Desktop\lIGHT auTOMATION"
python server.py
```

### Accessing the Application
1. Open browser: `http://localhost:5000`
2. You'll be redirected to login page
3. Create an account or login
4. Access the smart automation dashboard

### First-Time Setup
1. Navigate to `http://localhost:5000`
2. Click "Sign Up" tab
3. Enter your details
4. Click "Create Account"
5. Login with your credentials
6. Start using the AI-powered automation system!

---

## 🔒 Security Best Practices Implemented

1. **Password Hashing**
   - Uses `generate_password_hash()` with salt
   - Never stores plain-text passwords
   - Bcrypt-based hashing algorithm

2. **Session Security**
   - Random secret key generation
   - Server-side session storage
   - Session timeout on logout

3. **Input Validation**
   - Server-side validation
   - Client-side validation
   - SQL injection prevention (parameterized queries)
   - Email format validation
   - Password strength requirements

4. **HTTPS Ready**
   - CORS configured for production
   - Session cookies can be marked secure
   - Ready for SSL/TLS deployment

5. **Activity Logging**
   - All auth events logged
   - User creation tracked
   - Login/Logout recorded
   - Timestamp tracking

---

## 📱 Screenshots

The system includes:
- **Login Page**: Modern purple/blue gradient with particles
- **Signup Page**: Same design with additional fields
- **Dashboard Header**: User profile with name, email, logout button
- **Protected Routes**: Auto-redirect when not authenticated

All screenshots captured during testing are available in the `.gemini` directory.

---

## 🎯 Future Enhancements

### Planned Features
1. **Password Recovery**
   - Email-based password reset
   - Secure token generation
   - Expiring reset links

2. **Social Authentication**
   - Google OAuth integration
   - GitHub OAuth integration
   - Facebook login option

3. **Enhanced Security**
   - Two-factor authentication (2FA)
   - Email verification on signup
   - Account lockout after failed attempts
   - Password complexity requirements

4. **User Management**
   - User roles (Admin, User, Guest)
   - Permission-based access control
   - User profile editing
   - Avatar upload

5. **Session Management**
   - "Remember me" functionality
   - Multiple device tracking
   - Active session viewing
   - Remote logout

---

## 🛠️ Configuration

### Environment Variables (Future)
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///power_tracking.db
SESSION_TIMEOUT=3600
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Current Configuration
All configuration is currently embedded in `server.py`:
- Session key: Auto-generated on startup
- Database: SQLite (`power_tracking.db`)
- Port: 5000
- Debug mode: Enabled

---

## 📝 API Documentation

### POST /api/signup
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response (Error):**
```json
{
  "error": "Email already registered"
}
```

---

### POST /api/login
**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid email or password"
}
```

---

### GET /api/auth/check
**Response (Authenticated):**
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Response (Not Authenticated):**
```json
{
  "authenticated": false
}
```

---

### POST /api/logout
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 💡 Tips for Users

1. **Strong Passwords**: Use at least 6 characters (8+ recommended)
2. **Unique Email**: Each account requires a unique email address
3. **Remember Credentials**: No password recovery yet, keep them safe!
4. **Logout When Done**: Always logout on shared computers
5. **Browser Compatibility**: Works best on Chrome, Firefox, Edge

---

## 🐛 Troubleshooting

### Issue: Can't Access Dashboard
**Solution**: Make sure you're logged in. Visit `/login` and enter credentials.

### Issue: "Email already registered"
**Solution**: Use a different email or login with the existing account.

### Issue: "Invalid email or password"
**Solution**: Check credentials carefully. Passwords are case-sensitive.

### Issue: Server Not Starting
**Solution**: 
```bash
pip install Flask flask-cors werkzeug
python server.py
```

### Issue: Session Expired
**Solution**: The session expires when server restarts. Simply login again.

---

## 📄 License

This authentication system is part of the Smart Power Saving Automation System.
All rights reserved © 2026

---

## 👥 Credits

**Developed by**: Jatin Parmar (parmarjatin4911@gmail.com)

**Technologies Used**:
- Flask (Backend Framework)
- Werkzeug (Password Hashing)
- SQLite (Database)
- JavaScript (Frontend Logic)
- HTML5 & CSS3 (UI Design)
- Session Management (Flask Sessions)

---

## ✅ Summary

The Smart Account Login System provides:
- ✅ Secure user authentication
- ✅ Beautiful, modern UI
- ✅ Session-based protection
- ✅ Password encryption
- ✅ User profile display
- ✅ Activity logging
- ✅ Mobile-responsive design
- ✅ Smooth user experience

**Status**: Fully Implemented & Tested ✓

---

*Last Updated: January 12, 2026*
