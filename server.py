"""
Smart Power Saving Automation - Backend Server
Provides API endpoints for tracking, analytics, and data persistence
"""

from flask import Flask, jsonify, request, send_from_directory, session, redirect
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import os
import sqlite3
from pathlib import Path
from werkzeug.security import generate_password_hash, check_password_hash
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)  # Secure secret key for sessions
CORS(app, supports_credentials=True)

# Database setup
DB_PATH = 'power_tracking.db'

def init_database():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Lights table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lights (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            location TEXT,
            status INTEGER DEFAULT 0,
            last_used TEXT,
            total_usage_seconds INTEGER DEFAULT 0,
            total_energy REAL DEFAULT 0.0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Activity log table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            metadata TEXT
        )
    ''')
    
    # Detection events table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS detection_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            person_count INTEGER DEFAULT 0,
            faces_detected INTEGER DEFAULT 0,
            recognized_person TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            camera_status INTEGER DEFAULT 1
        )
    ''')
    
    # Registered faces table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS registered_faces (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT,
            image_path TEXT,
            registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_seen TEXT
        )
    ''')
    
    # Energy statistics table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS energy_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            total_energy REAL DEFAULT 0.0,
            money_spent REAL DEFAULT 0.0,
            money_saved REAL DEFAULT 0.0,
            detections_count INTEGER DEFAULT 0,
            avg_response_time REAL DEFAULT 0.0
        )
    ''')
    
    # Users table for authentication
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_login TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")

# API Routes

@app.route('/')
def index():
    """Serve the main HTML page (protected)"""
    if 'user_id' not in session:
        return redirect('/login')
    return send_from_directory('.', 'index.html')

@app.route('/login')
def login_page():
    """Serve the login page"""
    return send_from_directory('.', 'login.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('.', path)

@app.route('/api/lights', methods=['GET'])
def get_lights():
    """Get all lights and their current status"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM lights')
    lights = []
    for row in cursor.fetchall():
        lights.append({
            'id': row[0],
            'name': row[1],
            'location': row[2],
            'status': bool(row[3]),
            'lastUsed': row[4],
            'totalUsageSeconds': row[5],
            'totalEnergy': row[6]
        })
    
    conn.close()
    return jsonify(lights)

@app.route('/api/lights/<light_id>', methods=['PUT'])
def update_light(light_id):
    """Update light status"""
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE lights 
        SET status = ?, last_used = ?, total_energy = ?
        WHERE id = ?
    ''', (
        int(data.get('status', 0)),
        data.get('lastUsed'),
        data.get('totalEnergy', 0.0),
        light_id
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/lights/init', methods=['POST'])
def init_lights():
    """Initialize default lights"""
    lights = request.json
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    for light in lights:
        cursor.execute('''
            INSERT OR REPLACE INTO lights (id, name, location, status)
            VALUES (?, ?, ?, ?)
        ''', (light['id'], light['name'], light['location'], 0))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/activity', methods=['GET'])
def get_activity():
    """Get activity log"""
    limit = request.args.get('limit', 50, type=int)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, event_type, title, description, timestamp 
        FROM activity_log 
        ORDER BY timestamp DESC 
        LIMIT ?
    ''', (limit,))
    
    activities = []
    for row in cursor.fetchall():
        activities.append({
            'id': row[0],
            'type': row[1],
            'title': row[2],
            'description': row[3],
            'timestamp': row[4]
        })
    
    conn.close()
    return jsonify(activities)

@app.route('/api/activity', methods=['POST'])
def add_activity():
    """Add new activity log entry"""
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO activity_log (event_type, title, description, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (
        data['type'],
        data['title'],
        data['description'],
        data.get('timestamp', datetime.now().isoformat())
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'id': cursor.lastrowid})

@app.route('/api/detection', methods=['POST'])
def log_detection():
    """Log a detection event"""
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO detection_events (person_count, faces_detected, recognized_person, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (
        data.get('personCount', 0),
        data.get('facesDetected', 0),
        data.get('recognizedPerson'),
        data.get('timestamp', datetime.now().isoformat())
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/faces', methods=['GET'])
def get_faces():
    """Get all registered faces"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, name, role, registered_at, last_seen FROM registered_faces')
    faces = []
    for row in cursor.fetchall():
        faces.append({
            'id': row[0],
            'name': row[1],
            'role': row[2],
            'registeredAt': row[3],
            'lastSeen': row[4]
        })
    
    conn.close()
    return jsonify(faces)

@app.route('/api/faces', methods=['POST'])
def register_face():
    """Register a new face"""
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO registered_faces (id, name, role, image_path, registered_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        data['id'],
        data['name'],
        data.get('role', 'User'),
        data.get('imagePath'),
        data.get('registeredAt', datetime.now().isoformat())
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/faces/<face_id>', methods=['DELETE'])
def delete_face(face_id):
    """Delete a registered face"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM registered_faces WHERE id = ?', (face_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get current statistics"""
    time_range = request.args.get('range', 'today')
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Calculate date range
    if time_range == 'today':
        start_date = datetime.now().replace(hour=0, minute=0, second=0).isoformat()
    elif time_range == 'week':
        start_date = (datetime.now() - timedelta(days=7)).isoformat()
    elif time_range == 'month':
        start_date = (datetime.now() - timedelta(days=30)).isoformat()
    else:
        start_date = datetime.now().replace(hour=0, minute=0, second=0).isoformat()
    
    # Total energy consumed
    cursor.execute('SELECT SUM(total_energy) FROM lights')
    total_energy = cursor.fetchone()[0] or 0.0
    
    # Detection count
    cursor.execute('''
        SELECT COUNT(*) FROM detection_events 
        WHERE timestamp >= ?
    ''', (start_date,))
    detections_count = cursor.fetchone()[0] or 0
    
    # Calculate savings (assuming 20% savings from automation)
    energy_rate = 0.15  # ₹ per kWh
    money_spent = total_energy * energy_rate
    money_saved = money_spent * 0.2
    savings_percent = 20
    
    conn.close()
    
    return jsonify({
        'energyConsumed': round(total_energy, 3),
        'moneySaved': round(money_saved, 2),
        'detectionsCount': detections_count,
        'responseTime': 0.5,  # Simulated
        'totalSavings': savings_percent
    })

@app.route('/api/stats/history', methods=['GET'])
def get_stats_history():
    """Get historical statistics for charting"""
    days = request.args.get('days', 7, type=int)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT date, total_energy, money_spent, money_saved, detections_count
        FROM energy_stats
        ORDER BY date DESC
        LIMIT ?
    ''', (days,))
    
    history = []
    for row in cursor.fetchall():
        history.append({
            'date': row[0],
            'energy': row[1],
            'spent': row[2],
            'saved': row[3],
            'detections': row[4]
        })
    
    conn.close()
    return jsonify(history)

@app.route('/api/export', methods=['GET'])
def export_data():
    """Export all data as JSON"""
    export_type = request.args.get('type', 'all')
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    data = {}
    
    if export_type in ['all', 'lights']:
        cursor.execute('SELECT * FROM lights')
        data['lights'] = [dict(row) for row in cursor.fetchall()]
    
    if export_type in ['all', 'activity']:
        cursor.execute('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 100')
        data['activity'] = [dict(row) for row in cursor.fetchall()]
    
    if export_type in ['all', 'detections']:
        cursor.execute('SELECT * FROM detection_events ORDER BY timestamp DESC LIMIT 100')
        data['detections'] = [dict(row) for row in cursor.fetchall()]
    
    if export_type in ['all', 'faces']:
        cursor.execute('SELECT * FROM registered_faces')
        data['faces'] = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify(data)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected' if os.path.exists(DB_PATH) else 'not_found'
    })

# Authentication Routes

@app.route('/api/signup', methods=['POST'])
def signup():
    """Register a new user"""
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    # Validation
    if not name or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if user already exists
    cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Email already registered'}), 409
    
    # Hash password and create user
    password_hash = generate_password_hash(password)
    
    try:
        cursor.execute('''
            INSERT INTO users (name, email, password_hash, created_at)
            VALUES (?, ?, ?, ?)
        ''', (name, email, password_hash, datetime.now().isoformat()))
        
        conn.commit()
        user_id = cursor.lastrowid
        
        # Log activity
        cursor.execute('''
            INSERT INTO activity_log (event_type, title, description, timestamp)
            VALUES (?, ?, ?, ?)
        ''', ('user', 'New Account Created', f'{name} joined the system', datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Account created successfully',
            'user': {'id': user_id, 'name': name, 'email': email}
        }), 201
    
    except Exception as e:
        conn.close()
        return jsonify({'error': 'Failed to create account'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate user and create session"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Find user
    cursor.execute('SELECT id, name, email, password_hash, role FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'Invalid email or password'}), 401
    
    user_id, name, user_email, password_hash, role = user
    
    # Verify password
    if not check_password_hash(password_hash, password):
        conn.close()
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Update last login
    cursor.execute('UPDATE users SET last_login = ? WHERE id = ?', 
                  (datetime.now().isoformat(), user_id))
    
    # Log activity
    cursor.execute('''
        INSERT INTO activity_log (event_type, title, description, timestamp)
        VALUES (?, ?, ?, ?)
    ''', ('user', 'User Login', f'{name} logged in', datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    
    # Create session
    session['user_id'] = user_id
    session['user_name'] = name
    session['user_email'] = user_email
    session['user_role'] = role
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'user': {
            'id': user_id,
            'name': name,
            'email': user_email,
            'role': role
        }
    }), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    """Logout user and clear session"""
    user_name = session.get('user_name', 'Unknown')
    
    # Log activity
    if 'user_id' in session:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO activity_log (event_type, title, description, timestamp)
            VALUES (?, ?, ?, ?)
        ''', ('user', 'User Logout', f'{user_name} logged out', datetime.now().isoformat()))
        conn.commit()
        conn.close()
    
    # Clear session
    session.clear()
    
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200

@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'name': session['user_name'],
                'email': session['user_email'],
                'role': session.get('user_role', 'user')
            }
        }), 200
    else:
        return jsonify({'authenticated': False}), 401

@app.route('/api/user/profile', methods=['GET'])
def get_profile():
    """Get current user profile"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, email, role, created_at, last_login 
        FROM users WHERE id = ?
    ''', (session['user_id'],))
    
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user[0],
        'name': user[1],
        'email': user[2],
        'role': user[3],
        'createdAt': user[4],
        'lastLogin': user[5]
    }), 200

if __name__ == '__main__':
    print("🚀 Starting Smart Power Saving Automation Server...")
    print("=" * 50)
    
    # Initialize database
    init_database()
    
    # Start server
    port = 5000
    print(f"✅ Server running on http://localhost:{port}")
    print(f"📊 Dashboard: http://localhost:{port}")
    print(f"🔌 API Endpoint: http://localhost:{port}/api")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=port, debug=True)
