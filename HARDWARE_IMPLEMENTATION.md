# 🔧 Hardware Implementation Guide
## Raspberry Pi & Arduino Solutions
### Smart Power Saving Automation System
**By Jatinkumar Parmar**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Solution A: Raspberry Pi 4](#solution-a-raspberry-pi-4)
3. [Solution B: Arduino Mega](#solution-b-arduino-mega)
4. [Solution C: Hybrid (Arduino + ESP32)](#solution-c-hybrid-arduino--esp32)
5. [Complete Parts List](#complete-parts-list)
6. [Safety Guidelines](#safety-guidelines)

---

## 🎯 Overview

This guide provides **complete working solutions** for integrating physical hardware control with the Smart Power Saving Automation System.

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   COMPLETE SYSTEM DIAGRAM                    │
└─────────────────────────────────────────────────────────────┘

LAPTOP/PC (Web Dashboard)
    │
    │ WiFi/Ethernet
    │
    ▼
┌─────────────────────────────────────┐
│   MICROCONTROLLER                   │
│   (Raspberry Pi / Arduino)          │
│                                     │
│   • Runs control server             │
│   • Receives commands via HTTP/WS   │
│   • Controls GPIO pins              │
│   • Reads current sensors           │
└──────────────┬──────────────────────┘
               │
               │ 5V/3.3V Control Signals
               │
               ▼
┌─────────────────────────────────────┐
│   8-CHANNEL RELAY MODULE            │
│                                     │
│   [R1] [R2] [R3] [R4] [R5] [R6] [R7] [R8]│
│    │    │    │    │    │    │    │    │ │
└────┼────┼────┼────┼────┼────┼────┼────┼─┘
     │    │    │    │    │    │    │    │
     │    │    │    │    │    │    │    │
     ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼
┌─────────────────────────────────────────┐
│   AC MAINS (230V) → DEVICES             │
│                                         │
│   💡 Lights   🌀 Fans   📺 TV  etc.    │
└─────────────────────────────────────────┘
```

---

## 🍓 Solution A: Raspberry Pi 4

**Best for:** Full system integration, Python-based control, WiFi built-in

### A1. Hardware Requirements

#### Core Components
```
1. Raspberry Pi 4 Model B (4GB)        - $45
2. MicroSD Card (32GB Class 10)        - $8
3. 5V 3A USB-C Power Supply            - $10
4. 8-Channel 5V Relay Module           - $12
5. ACS712 Current Sensors (5A) x8      - $24
6. Breadboard + Jumper Wires           - $10
7. Optocouplers (if not on relay)      - $5
8. LEDs + Resistors (indicators)       - $5
                              
Total Cost: ~$119
```

#### Safety Components
```
9. MCB Circuit Breakers (10-16A) x8    - $40
10. RCCB Earth Leakage (30mA)          - $25
11. Electrical Box (Fire-rated)         - $15
12. Wire (16 AWG) - 50ft                - $10
13. Terminal Blocks                     - $8

Total Safety: ~$98
Grand Total: ~$217
```

### A2. Circuit Diagram - Raspberry Pi

```
┌────────────────────────────────────────────────────────────┐
│              RASPBERRY PI GPIO PINOUT (Top View)            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  3V3  (1) ●  ● (2)  5V      ┌─────────────┐             │
│  GP2  (3) ●  ● (4)  5V      │   Pi 4      │             │
│  GP3  (5) ●  ● (6)  GND     │             │             │
│  GP4  (7) ●  ● (8)  GP14    │   [HDMI]    │             │
│  GND  (9) ●  ● (10) GP15    │   [USB]     │             │
│ ►GP17(11) ●  ● (12) GP18◄   └─────────────┘             │
│ ►GP27(13) ●  ● (14) GND                                  │
│ ►GP22(15) ●  ● (16) GP23◄   ► = Relay Control Pins      │
│  3V3 (17) ●  ● (18) GP24◄   (8 pins total)              │
│  GP10(19) ●  ● (20) GND                                  │
│  GP9 (21) ●  ● (22) GP25◄                                │
│  GP11(23) ●  ● (24) GP8                                  │
│  GND (25) ●  ● (26) GP7                                  │
│  GP0 (27) ●  ● (28) GP1                                  │
│ ►GP5 (29) ●  ● (30) GND                                  │
│ ►GP6 (31) ●  ● (32) GP12◄                                │
│ ►GP13(33) ●  ● (34) GND                                  │
│  GP19(35) ●  ● (36) GP16                                 │
│  GP26(37) ●  ● (38) GP20                                 │
│  GND (39) ●  ● (40) GP21                                 │
│                                                            │
└────────────────────────────────────────────────────────────┘

RELAY CONNECTIONS:
GPIO 17 (Pin 11) ──► Relay 1 (IN1) ──► Light 1
GPIO 18 (Pin 12) ──► Relay 2 (IN2) ──► Light 2
GPIO 22 (Pin 15) ──► Relay 3 (IN3) ──► Fan 1
GPIO 23 (Pin 16) ──► Relay 4 (IN4) ──► Fan 2
GPIO 24 (Pin 18) ──► Relay 5 (IN5) ──► TV
GPIO 25 (Pin 22) ──► Relay 6 (IN6) ──► AC
GPIO 5  (Pin 29) ──► Relay 7 (IN7) ──► Microwave
GPIO 6  (Pin 31) ──► Relay 8 (IN8) ──► Router

POWER CONNECTIONS:
Pi Pin 2 or 4 (5V) ──► Relay VCC
Pi Pin 6 (GND)     ──► Relay GND
```

### A3. Detailed Wiring Diagram

```
┌──────────────────────────────────────────────────────────────┐
│           COMPLETE RASPBERRY PI WIRING DIAGRAM                │
└──────────────────────────────────────────────────────────────┘

RASPBERRY PI 4                    8-CHANNEL RELAY MODULE
┌─────────────┐                   ┌──────────────────────┐
│             │                   │  VCC  ●─────────────┼─── 5V Power
│  GPIO 17◄───┼───────────────────┼─►IN1  ●             │
│  GPIO 18◄───┼───────────────────┼─►IN2  ●             │
│  GPIO 22◄───┼───────────────────┼─►IN3  ●             │
│  GPIO 23◄───┼───────────────────┼─►IN4  ●             │
│  GPIO 24◄───┼───────────────────┼─►IN5  ●             │
│  GPIO 25◄───┼───────────────────┼─►IN6  ●             │
│  GPIO 5 ◄───┼───────────────────┼─►IN7  ●             │
│  GPIO 6 ◄───┼───────────────────┼─►IN8  ●             │
│             │                   │  GND  ●─────────────┼─── Ground
│  5V     ────┼───────────────────┼─►VCC                │
│  GND    ────┼───────────────────┼─►GND                │
└─────────────┘                   └──────┬───────────────┘
                                         │
                                  RELAY OUTPUTS
                                         │
         ┌───────────────┬───────────────┼───────────────┬─────
         │               │               │               │
         ▼               ▼               ▼               ▼
    [Relay 1]       [Relay 2]       [Relay 3]       [Relay 4]
    COM  NO NC     COM  NO NC     COM  NO NC     COM  NO NC
     │   │         │   │           │   │           │   │
     │   │         │   │           │   │           │   │
    AC  Device    AC  Device      AC  Device      AC  Device


┌──────────────────────────────────────────────────────────────┐
│                  RELAY TO AC DEVICE CONNECTION                │
└──────────────────────────────────────────────────────────────┘

Each Relay Controls One Device:

     AC MAINS         RELAY MODULE           DEVICE
      (230V)                               (Light/Fan)
         │                                      │
    ┌────┴────┐                                │
    │ LIVE    │                                │
    │ (Brown) ├──►COM (Common)                 │
    └─────────┘         │                      │
                        │                      │
                       NO (Normally Open)──────┤
                        │                      │
                        │                   [Device]
                       NC (Normally Closed)    │
                        │                      │
    ┌─────────┐         │                      │
    │ NEUTRAL │◄────────┴──────────────────────┘
    │ (Blue)  │
    └─────────┘

When GPIO = LOW  → Relay OFF → Device OFF
When GPIO = HIGH → Relay ON  → Device ON
```

### A4. Raspberry Pi Code

#### Install Dependencies

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade

# Install Python packages
sudo apt-get install python3-pip python3-dev
pip3 install RPi.GPIO flask flask-cors flask-socketio

# Enable GPIO
sudo raspi-config
# Interface Options → Enable I2C, SPI, GPIO
```

#### Complete Python Code (`raspberry_pi_control.py`)

```python
#!/usr/bin/env python3
"""
Raspberry Pi Hardware Control Server
For Smart Power Saving Automation System
By Jatinkumar Parmar
"""

import RPi.GPIO as GPIO
import time
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import threading

# Flask app setup
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# GPIO Pin Configuration (BCM Mode)
RELAY_PINS = {
    'light-1': 17,   # GPIO 17 → Relay 1 → Living Room Light
    'light-2': 18,   # GPIO 18 → Relay 2 → Bedroom Light
    'fan-1': 22,     # GPIO 22 → Relay 3 → Living Room Fan
    'fan-2': 23,     # GPIO 23 → Relay 4 → Bedroom Fan
    'tv-1': 24,      # GPIO 24 → Relay 5 → TV
    'ac-1': 25,      # GPIO 25 → Relay 6 → AC
    'microwave-1': 5,# GPIO 5  → Relay 7 → Microwave
    'router-1': 6    # GPIO 6  → Relay 8 → Router
}

# Device states (in-memory storage)
device_states = {}

# Initialize GPIO
def init_gpio():
    """Initialize GPIO pins for relay control"""
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)  # Use BCM pin numbering
    
    # Setup all relay pins as outputs
    for device_id, pin in RELAY_PINS.items():
        GPIO.setup(pin, GPIO.OUT)
        GPIO.output(pin, GPIO.LOW)  # Start with all relays OFF
        device_states[device_id] = False
        print(f"✓ Initialized {device_id} on GPIO {pin}")
    
    print("✓ GPIO Initialization Complete")

# Cleanup GPIO on exit
def cleanup_gpio():
    """Cleanup GPIO pins"""
    print("Cleaning up GPIO...")
    GPIO.cleanup()

# Control device function
def control_device(device_id, turn_on):
    """
    Control a device via relay
    
    Args:
        device_id: Device identifier (e.g., 'light-1')
        turn_on: Boolean - True to turn ON, False to turn OFF
    
    Returns:
        dict: Success status and message
    """
    if device_id not in RELAY_PINS:
        return {
            'success': False,
            'error': f'Device {device_id} not found'
        }
    
    pin = RELAY_PINS[device_id]
    
    try:
        # Set GPIO pin (HIGH = ON, LOW = OFF)
        GPIO.output(pin, GPIO.HIGH if turn_on else GPIO.LOW)
        
        # Update state
        device_states[device_id] = turn_on
        
        # Verify state
        actual_state = GPIO.input(pin)
        expected_state = GPIO.HIGH if turn_on else GPIO.LOW
        
        if actual_state == expected_state:
            status_text = "ON" if turn_on else "OFF"
            print(f"✓ {device_id} turned {status_text} (GPIO {pin})")
            
            # Broadcast state change via WebSocket
            socketio.emit('device_update', {
                'device_id': device_id,
                'state': turn_on,
                'timestamp': time.time()
            })
            
            return {
                'success': True,
                'device_id': device_id,
                'state': status_text,
                'pin': pin,
                'timestamp': time.time()
            }
        else:
            return {
                'success': False,
                'error': 'State verification failed'
            }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

# Emergency shutdown
def emergency_shutdown():
    """Turn off ALL devices immediately"""
    print("🚨 EMERGENCY SHUTDOWN INITIATED")
    
    for device_id in RELAY_PINS:
        control_device(device_id, False)
    
    print("✓ All devices turned OFF")
    return {'success': True, 'message': 'Emergency shutdown complete'}

# Flask Routes

@app.route('/api/hardware/status', methods=['GET'])
def get_status():
    """Get current status of all devices"""
    status = {
        'devices': {},
        'pins': RELAY_PINS,
        'online': True
    }
    
    for device_id, pin in RELAY_PINS.items():
        state = GPIO.input(pin) == GPIO.HIGH
        status['devices'][device_id] = {
            'state': 'ON' if state else 'OFF',
            'pin': pin
        }
    
    return jsonify(status)

@app.route('/api/hardware/control', methods=['POST'])
def hardware_control():
    """Control a single device"""
    data = request.json
    
    device_id = data.get('device_id')
    action = data.get('action')  # 'ON' or 'OFF'
    
    if not device_id or not action:
        return jsonify({
            'success': False,
            'error': 'Missing device_id or action'
        }), 400
    
    turn_on = (action.upper() == 'ON')
    result = control_device(device_id, turn_on)
    
    return jsonify(result)

@app.route('/api/hardware/emergency', methods=['POST'])
def emergency_stop():
    """Emergency shutdown all devices"""
    result = emergency_shutdown()
    return jsonify(result)

@app.route('/api/hardware/test', methods=['POST'])
def test_relay():
    """Test a single relay"""
    data = request.json
    device_id = data.get('device_id')
    
    if device_id not in RELAY_PINS:
        return jsonify({'error': 'Device not found'}), 404
    
    # Quick ON/OFF test
    control_device(device_id, True)
    time.sleep(1)
    control_device(device_id, False)
    
    return jsonify({'success': True, 'message': 'Test complete'})

# WebSocket Events

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('status', {
        'connected': True,
        'devices': device_states
    })

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('control_request')
def handle_control(data):
    """Handle real-time control request via WebSocket"""
    device_id = data.get('device_id')
    turn_on = data.get('turn_on')
    
    result = control_device(device_id, turn_on)
    emit('control_response', result)

# Main execution
if __name__ == '__main__':
    try:
        print("=" * 60)
        print("  Smart Power Saving Automation - Raspberry Pi Server")
        print("  By Jatinkumar Parmar")
        print("=" * 60)
        
        # Initialize GPIO
        init_gpio()
        
        # Start Flask server
        print("\n🚀 Starting server on http://0.0.0.0:5001")
        print("   WebSocket enabled for real-time control")
        print("   Press Ctrl+C to stop\n")
        
        socketio.run(app, host='0.0.0.0', port=5001, debug=False)
    
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    
    finally:
        cleanup_gpio()
        print("✓ Cleanup complete. Goodbye!")
```

### A5. Testing Raspberry Pi Setup

```bash
# Make script executable
chmod +x raspberry_pi_control.py

# Run server
python3 raspberry_pi_control.py

# Test from another terminal or browser
curl -X POST http://localhost:5001/api/hardware/control \
  -H "Content-Type: application/json" \
  -d '{"device_id":"light-1","action":"ON"}'

# Emergency stop all
curl -X POST http://localhost:5001/api/hardware/emergency
```

---

## 🔧 Solution B: Arduino Mega

**Best for:** Standalone operation, many GPIO pins, cost-effective

### B1. Hardware Requirements

```
1. Arduino Mega 2560         - $35
2. Ethernet Shield W5100     - $15
3. 8-Channel 5V Relay Module - $12
4. 12V 2A Power Supply       - $8
5. Jumper Wires              - $5

Total: ~$75 (cheaper than Pi!)
```

### B2. Arduino Pin Configuration

```
┌────────────────────────────────────────────────────────────┐
│              ARDUINO MEGA 2560 PIN MAPPING                  │
└────────────────────────────────────────────────────────────┘

DIGITAL PINS (Relay Control):
Pin 22 ──► Relay 1 (IN1) ──► Light 1
Pin 23 ──► Relay 2 (IN2) ──► Light 2
Pin 24 ──► Relay 3 (IN3) ──► Fan 1
Pin 25 ──► Relay 4 (IN4) ──► Fan 2
Pin 26 ──► Relay 5 (IN5) ──► TV
Pin 27 ──► Relay 6 (IN6) ──► AC
Pin 28 ──► Relay 7 (IN7) ──► Microwave
Pin 29 ──► Relay 8 (IN8) ──► Router

POWER:
5V  ──► Relay Module VCC
GND ──► Relay Module GND

ETHERNET:
Pins 50-53 ──► Ethernet Shield (SPI)
```

### B3. Arduino Wiring Diagram

```
        ARDUINO MEGA 2560              8-CH RELAY MODULE
      ┌─────────────────┐            ┌──────────────────┐
      │                 │            │                  │
      │  Digital Pin 22 ├────────────┤► IN1             │
      │  Digital Pin 23 ├────────────┤► IN2             │
      │  Digital Pin 24 ├────────────┤► IN3             │
      │  Digital Pin 25 ├────────────┤► IN4             │
      │  Digital Pin 26 ├────────────┤► IN5             │
      │  Digital Pin 27 ├────────────┤► IN6             │
      │  Digital Pin 28 ├────────────┤► IN7             │
      │  Digital Pin 29 ├────────────┤► IN8             │
      │                 │            │                  │
      │  5V Power       ├────────────┤► VCC             │
      │  GND            ├────────────┤► GND             │
      │                 │            │                  │
      │  [Ethernet]     │            └──────────────────┘
      │  Shield on top  │
      └─────────────────┘
```

### B4. Complete Arduino Code

```cpp
/*
 * Arduino Mega Hardware Control Server
 * For Smart Power Saving Automation System
 * By Jatinkumar Parmar
 */

#include <SPI.h>
#include <Ethernet.h>

// Network Configuration
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192, 168, 1, 177);  // Change to your network
EthernetServer server(80);

// Relay Pin Configuration
const int RELAY_PINS[] = {22, 23, 24, 25, 26, 27, 28, 29};
const char* DEVICE_IDS[] = {
  "light-1", "light-2", "fan-1", "fan-2", 
  "tv-1", "ac-1", "microwave-1", "router-1"
};
const int NUM_DEVICES = 8;

// Device states
bool deviceStates[NUM_DEVICES] = {false};

void setup() {
  // Initialize Serial
  Serial.begin(9600);
  while (!Serial) {
    ; // Wait for serial port
  }
  
  Serial.println("====================================");
  Serial.println("Smart Power Automation - Arduino");
  Serial.println("By Jatinkumar Parmar");
  Serial.println("====================================");
  
  // Initialize Relay Pins
  Serial.println("Initializing GPIO pins...");
  for (int i = 0; i < NUM_DEVICES; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], LOW);  // Start OFF
    Serial.print("- Relay ");
    Serial.print(i + 1);
    Serial.print(" (Pin ");
    Serial.print(RELAY_PINS[i]);
    Serial.print("): ");
    Serial.println(DEVICE_IDS[i]);
  }
  Serial.println("GPIO init complete");
  
  // Initialize Ethernet
  Serial.println("Starting Ethernet...");
  Ethernet.begin(mac, ip);
  
  // Check Ethernet hardware
  if (Ethernet.hardwareStatus() == EthernetNoHardware) {
    Serial.println("ERROR: Ethernet shield not found!");
    while (true) {
      delay(1);
    }
  }
  
  // Check link status
  if (Ethernet.linkStatus() == LinkOFF) {
    Serial.println("WARNING: Ethernet cable not connected");
  }
  
  // Start server
  server.begin();
  Serial.print("Server started at: http://");
  Serial.println(Ethernet.localIP());
  Serial.println("Ready to accept connections!");
  Serial.println("====================================\n");
}

void loop() {
  // Listen for incoming clients
  EthernetClient client = server.available();
  
  if (client) {
    Serial.println("New client connected");
    
    String currentLine = "";
    String requestPath = "";
    String requestMethod = "";
    String postBody = "";
    bool isPost = false;
    int contentLength = 0;
    
    // Read HTTP request
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        
        // Parse first line for method and path
        if (currentLine.length() == 0 && c != '\n') {
          currentLine += c;
        }
        
        // End of first line
        if (c == '\n' && currentLine.length() > 0) {
          // Extract method and path
          if (requestMethod.length() == 0) {
            int firstSpace = currentLine.indexOf(' ');
            int secondSpace = currentLine.indexOf(' ', firstSpace + 1);
            requestMethod = currentLine.substring(0, firstSpace);
            requestPath = currentLine.substring(firstSpace + 1, secondSpace);
            isPost = (requestMethod == "POST");
            Serial.print("Request: ");
            Serial.print(requestMethod);
            Serial.print(" ");
            Serial.println(requestPath);
          }
          
          // Check for Content-Length
          if (currentLine.startsWith("Content-Length:")) {
            contentLength = currentLine.substring(16).toInt();
          }
          
          currentLine = "";
        }
        
        // Blank line = end of headers
        if (c == '\n' && currentLine.length() == 0) {
          // Read POST body if present
          if (isPost && contentLength > 0) {
            for (int i = 0; i < contentLength; i++) {
              if (client.available()) {
                postBody += (char)client.read();
              }
            }
            Serial.print("POST Body: ");
            Serial.println(postBody);
          }
          
          // Handle request
          handleRequest(client, requestPath, postBody);
          break;
        }
        
        if (c != '\r') {
          currentLine += c;
        }
      }
    }
    
    // Close connection
    delay(10);
    client.stop();
    Serial.println("Client disconnected\n");
  }
}

void handleRequest(EthernetClient &client, String path, String body) {
  // Route requests
  if (path == "/api/hardware/status") {
    handleStatus(client);
  }
  else if (path == "/api/hardware/control") {
    handleControl(client, body);
  }
  else if (path == "/api/hardware/emergency") {
    handleEmergency(client);
  }
  else {
    send404(client);
  }
}

void handleStatus(EthernetClient &client) {
  // Build JSON response
  String json = "{\"success\":true,\"devices\":{";
  
  for (int i = 0; i < NUM_DEVICES; i++) {
    if (i > 0) json += ",";
    json += "\"" + String(DEVICE_IDS[i]) + "\":{";
    json += "\"state\":\"" + String(deviceStates[i] ? "ON" : "OFF") + "\",";
    json += "\"pin\":" + String(RELAY_PINS[i]);
    json += "}";
  }
  
  json += "}}";
  
  sendJSON(client, json);
}

void handleControl(EthernetClient &client, String body) {
  // Parse JSON (simple parsing)
  String deviceId = extractValue(body, "device_id");
  String action = extractValue(body, "action");
  
  Serial.print("Control: ");
  Serial.print(deviceId);
  Serial.print(" → ");
  Serial.println(action);
  
  // Find device
  int deviceIndex = -1;
  for (int i = 0; i < NUM_DEVICES; i++) {
    if (deviceId == DEVICE_IDS[i]) {
      deviceIndex = i;
      break;
    }
  }
  
  if (deviceIndex == -1) {
    sendJSON(client, "{\"success\":false,\"error\":\"Device not found\"}");
    return;
  }
  
  // Control relay
  bool turnOn = (action == "ON");
  digitalWrite(RELAY_PINS[deviceIndex], turnOn ? HIGH : LOW);
  deviceStates[deviceIndex] = turnOn;
  
  Serial.print("✓ Relay ");
  Serial.print(deviceIndex + 1);
  Serial.print(" → ");
  Serial.println(turnOn ? "ON" : "OFF");
  
  // Response
  String json = "{\"success\":true,\"device_id\":\"" + deviceId + 
                "\",\"state\":\"" + action + "\"}";
  sendJSON(client, json);
}

void handleEmergency(EthernetClient &client) {
  Serial.println("🚨 EMERGENCY SHUTDOWN");
  
  // Turn off all relays
  for (int i = 0; i < NUM_DEVICES; i++) {
    digitalWrite(RELAY_PINS[i], LOW);
    deviceStates[i] = false;
  }
  
  Serial.println("✓ All devices OFF");
  
  sendJSON(client, "{\"success\":true,\"message\":\"Emergency shutdown complete\"}");
}

void sendJSON(EthernetClient &client, String json) {
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println("Access-Control-Allow-Origin: *");
  client.println("Connection: close");
  client.println();
  client.println(json);
}

void send404(EthernetClient &client) {
  client.println("HTTP/1.1 404 Not Found");
  client.println("Content-Type: text/plain");
  client.println("Connection: close");
  client.println();
  client.println("404 Not Found");
}

String extractValue(String json, String key) {
  // Simple JSON value extraction
  String searchKey = "\"" + key + "\":\"";
  int startIndex = json.indexOf(searchKey);
  if (startIndex == -1) return "";
  
  startIndex += searchKey.length();
  int endIndex = json.indexOf("\"", startIndex);
  
  return json.substring(startIndex, endIndex);
}
```

### B5. Upload & Test

```bash
# 1. Open Arduino IDE
# 2. Select Board: Tools → Board → Arduino Mega 2560
# 3. Select Port: Tools → Port → COM3 (or your port)
# 4. Upload sketch
# 5. Open Serial Monitor (9600 baud) to see IP address
# 6. Test from browser or curl:

curl http://192.168.1.177/api/hardware/status
curl -X POST http://192.168.1.177/api/hardware/control \
  -d '{"device_id":"light-1","action":"ON"}'
```

---

## 🔗 Solution C: Hybrid (Arduino + ESP32)

**Best for:** WiFi connectivity + maximum GPIO pins

### C1. Hardware Setup

```
Arduino Mega ──Serial──> ESP32 ──WiFi──> Dashboard

Arduino: Controls relays (local)
ESP32: Handles WiFi/HTTP communication
```

### C2. ESP32 Code (WiFi Bridge)

```cpp
#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";

WebServer server(80);

void setup() {
  Serial.begin(115200);  // To Arduino
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  
  server.on("/api/hardware/control", HTTP_POST, handleControl);
  server.begin();
}

void handleControl() {
  String body = server.arg("plain");
  
  // Forward to Arduino via Serial
  Serial.println(body);
  
  server.send(200, "application/json", "{\"success\":true}");
}

void loop() {
  server.handleClient();
}
```

---

## 📋 Complete Parts List

### Essential Components

| Item | Qty | Cost | Total |
|------|-----|------|-------|
| **Option A: Raspberry Pi Setup** | | | |
| Raspberry Pi 4 (4GB) | 1 | $45 | $45 |
| MicroSD 32GB | 1 | $8 | $8 |
| USB-C Power 5V/3A | 1 | $10 | $10 |
| **Option B: Arduino Setup** | | | |
| Arduino Mega 2560 | 1 | $35 | $35 |
| Ethernet Shield | 1 | $15 | $15 |
| **Common Components** | | | |
| 8-CH Relay Module 5V | 1 | $12 | $12 |
| Jumper Wires (M-M) | 40 | $0.10 | $4 |
| Breadboard | 1 | $5 | $5 |
| LEDs (indicator) | 8 | $0.25 | $2 |
| Resistors 220Ω | 8 | $0.10 | $1 |

### Safety Components (CRITICAL)

| Item | Qty | Cost | Total |
|------|-----|------|-------|
| MCB 16A | 8 | $5 | $40 |
| RCCB 30mA | 1 | $25 | $25 |
| Electrical Box | 1 | $15 | $15 |
| Wire 16 AWG | 50ft | $0.20/ft | $10 |
| Terminal Blocks | 10 | $0.80 | $8 |

**Total Cost:**
- **Raspberry Pi Solution:** ~$170
- **Arduino Solution:** ~$140

---

## ⚠️ Safety Guidelines

### CRITICAL WARNINGS

```
⚡ DANGER: HIGH VOLTAGE ⚡

1. ❌ NEVER work on live circuits
2. ✅ ALWAYS turn off mains power first
3. ✅ HIRE licensed electrician for AC wiring
4. ✅ USE RCCB/ELCB protection
5. ✅ TEST circuits before energizing
6. ✅ USE proper gauge wire (16 AWG minimum)
7. ✅ INSTALL in fire-rated enclosure
8. ✅ LABEL all circuits clearly
9. ✅ HAVE fire extinguisher nearby
10. ✅ FOLLOW local electrical codes
```

### Pre-Operation Checklist

- [ ] All connections double-checked
- [ ] No exposed wires
- [ ] RCCB installed and tested
- [ ] MCBs rated correctly
- [ ] Enclosure closed and secured
- [ ] Ground connections verified
- [ ] Test button works (emergency stop)
- [ ] Fire extinguisher accessible
- [ ] Electrical inspection passed

---

## 🧪 Testing Procedure

### Step 1: Bench Test (No AC Power)

```bash
1. Connect microcontroller to relays (DC only)
2. Upload code
3. Test relay clicking with LED indicators
4. Verify all 8 relays respond
5. Test emergency stop
```

### Step 2: Low Voltage Test

```bash
1. Connect 12V LED bulb to relay output
2. Test ON/OFF control
3. Verify state feedback
4. Test rapid switching (safety)
```

### Step 3: AC Test (With Electrician)

```bash
1. Install MCBs and RCCB
2. Wire one circuit only
3. Test with low power device (lamp)
4. Verify RCCB trips on fault
5. Gradually add more circuits
6. Final system test
```

---

## 📞 Support & Resources

**Author:** Jatinkumar Parmar  
**Email:** parmarjatin4911@gmail.com  
**Repository:** github.com/parmarjh/Smart-HOME-Power-Saving-Automation-System  

### Additional Resources

- Raspberry Pi GPIO: pinout.xyz
- Arduino Reference: arduino.cc/reference
- Relay Modules: Check optocoupler isolation
- Safety Codes: Consult local regulations

---

**⚡ SAFETY FIRST - When in doubt, hire a professional electrician! ⚡**

---

*Complete Hardware Implementation Guide*  
*Version 1.0 - January 12, 2026*  
*By Jatinkumar Parmar*
