// ============================================
// SMART POWER SAVING AUTOMATION - APP LOGIC
// ============================================

class SmartLightAutomation {
    constructor() {
        // State management
        this.state = {
            cameraActive: false,
            autoMode: true,
            detectionModel: null,
            faceModel: null,
            videoStream: null,
            lights: [],
            registeredFaces: [],
            activityLog: [],
            stats: {
                energyConsumed: 0,
                moneySaved: 0,
                responseTime: 0,
                detectionsCount: 0,
                totalSavings: 0
            },
            currentPerson: null,
            lastDetectionTime: null
        };

        // Configuration
        this.config = {
            detectionInterval: 1000, // Check every second
            autoOffDelay: 5000, // Turn off after 5 seconds of no detection
            energyRate: 0.15, // Cost per kWh in rupees
            lightPower: 0.01 // kW per light
        };

        // Initialize
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Smart Light Automation System...');

        // Check authentication first
        await this.checkAuthentication();

        // Initialize lights
        this.initializeLights();

        // Load registered faces from localStorage
        this.loadRegisteredFaces();

        // Setup event listeners
        this.setupEventListeners();

        // Load AI models
        await this.loadModels();

        // Update UI
        this.updateUI();

        // Start statistics update loop
        this.startStatsLoop();

        console.log('✅ System Ready!');
    }

    async checkAuthentication() {
        try {
            const response = await fetch('/api/auth/check');
            const data = await response.json();

            if (!data.authenticated) {
                window.location.href = '/login';
                return;
            }

            // Display user info
            document.getElementById('userName').textContent = data.user.name;
            document.getElementById('userEmail').textContent = data.user.email;

            this.currentUser = data.user;
            console.log('✅ Authenticated as:', data.user.name);
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = '/login';
        }
    }

    initializeLights() {
        // Initialize with multiple appliance types
        this.state.lights = [
            // Lights
            {
                id: 'light-1',
                name: 'Living Room Light',
                category: 'Light',
                icon: '💡',
                location: 'Main Floor',
                status: false,
                lastUsed: null,
                lastPerson: 'Unknown',
                usageCount: 0,
                usageTime: 0,
                energy: 0,
                power: 0.01 // 10W
            },
            {
                id: 'light-2',
                name: 'Bedroom Light',
                category: 'Light',
                icon: '💡',
                location: 'Second Floor',
                status: false,
                lastUsed: null,
                lastPerson: 'Unknown',
                usageCount: 0,
                usageTime: 0,
                energy: 0,
                power: 0.01 // 10W
            },
            {
                id: 'light-3',
                name: 'Kitchen Light',
                category: 'Light',
                icon: '💡',
                location: 'Main Floor',
                status: false,
                lastUsed: null,
                lastPerson: 'Unknown',
                usageCount: 0,
                usageTime: 0,
                energy: 0,
                power: 0.015 // 15W
            },
            {
                id: 'light-4',
                name: 'Bathroom Light',
                category: 'Light',
                icon: '💡',
                location: 'Second Floor',
                status: false,
                lastUsed: null,
                lastPerson: 'Unknown',
                usageCount: 0,
                usageTime: 0,
                energy: 0,
                power: 0.01 // 10W
            },
            // Fans
            {
                id: 'fan-1',
                name: 'Living Room Fan',
                category: 'Fan',
                icon: '🌀',
                location: 'Main Floor',
                status: false,
                lastUsed: null,
                lastPerson: 'Unknown',
                usageCount: 0,
                usageTime: 0,
                energy: 0,
                power: 0.075 // 75W
            },
            {
                id: 'fan-2',
                name: 'Bedroom Fan',
                category: 'Fan',
                icon: '🌀',
                location: 'Second Floor',
                status: false,
                lastUsed: null,
                lastPerson: 'Unknown',
                usageCount: 0,
                usageTime: 0,
                energy: 0,
                power: 0.075 // 75W
            },
            // Appliances
            {
                id: 'refrigerator-1',
                name: 'Kitchen Refrigerator',
                category: 'Refrigerator',
                icon: '🧊',
                location: 'Main Floor',
                status: true, // Usually always on
                lastUsed: new Date().toISOString(),
                lastPerson: 'System',
                usageCount: 1,
                usageTime: 0,
                energy: 0,
                power: 0.15 // 150W average
            },
            {
                id: 'washing-1',
                name: 'Washing Machine',
                category: 'Washing Machine',
                icon: '🧺',
                location: 'Utility Room',
                status: false,
                lastUsed: null,
                lastPerson: 'Unknown',
                usageCount: 0,
                usageTime: 0,
                energy: 0,
                power: 0.5 // 500W
            },
            {
                id: 'tv-1',
                name: 'Living Room TV',
                category: 'Television',
                icon: '📺',
                location: 'Main Floor',
                status: false,
                lastUsed: null,
                lastPerson: 'Unknown',
                usageCount: 0,
                usageTime: 0,
                energy: 0,
                power: 0.1 // 100W
            },
            {
                id: 'ac-1',
                name: 'Bedroom AC',
                category: 'Air Conditioner',
                icon: '❄️',
                location: 'Second Floor',
                status: false,
                lastUsed: null,
                lastPerson: 'Unknown',
                usageCount: 0,
                usageTime: 0,
                energy: 0,
                power: 1.5 // 1500W
            },
            {
                id: 'microwave-1',
                name: 'Kitchen Microwave',
                category: 'Microwave',
                icon: '🔥',
                location: 'Main Floor',
                status: false,
                lastUsed: null,
                lastPerson: 'Unknown',
                usageCount: 0,
                usageTime: 0,
                energy: 0,
                power: 1.2 // 1200W
            },
            {
                id: 'router-1',
                name: 'WiFi Router',
                category: 'Router',
                icon: '📡',
                location: 'Main Floor',
                status: true, // Usually always on
                lastUsed: new Date().toISOString(),
                lastPerson: 'System',
                usageCount: 1,
                usageTime: 0,
                energy: 0,
                power: 0.01 // 10W
            }
        ];

        this.renderLights();
    }

    async loadModels() {
        try {
            console.log('📦 Loading AI models...');

            // Load COCO-SSD for person detection
            this.state.detectionModel = await cocoSsd.load();
            console.log('✅ Person detection model loaded');

            // Load BlazeFace for face detection
            this.state.faceModel = await blazeface.load();
            console.log('✅ Face detection model loaded');

            this.addActivity('System', '🤖 AI models loaded successfully', 'detection');
        } catch (error) {
            console.error('❌ Error loading models:', error);
            this.addActivity('System', '⚠️ Failed to load AI models', 'detection');
        }
    }

    setupEventListeners() {
        // Camera controls
        document.getElementById('startCamera').addEventListener('click', () => this.startCamera());
        document.getElementById('toggleCamera').addEventListener('click', () => this.toggleCamera());
        document.getElementById('capturePhoto').addEventListener('click', () => this.capturePhoto());
        document.getElementById('uploadFace').addEventListener('click', () => {
            document.getElementById('faceUpload').click();
        });
        document.getElementById('faceUpload').addEventListener('change', (e) => this.handleFaceUpload(e));

        // Mode toggle
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });

        // Light cards (will be added dynamically)
        document.getElementById('lightsGrid').addEventListener('click', (e) => {
            const lightCard = e.target.closest('.light-card');
            if (lightCard && !this.state.autoMode) {
                this.toggleLight(lightCard.dataset.lightId);
            }
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelFace').addEventListener('click', () => this.closeModal());
        document.getElementById('saveFace').addEventListener('click', () => this.saveFace());

        // Activity log
        document.getElementById('clearLog').addEventListener('click', () => this.clearActivityLog());

        // Time range selector
        document.getElementById('timeRange').addEventListener('change', (e) => {
            this.updateStatsForRange(e.target.value);
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
    }

    async handleLogout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST'
            });

            if (response.ok) {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Failed to logout. Please try again.');
        }
    }

    async startCamera() {
        try {
            const video = document.getElementById('videoFeed');

            // Request camera access
            this.state.videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            video.srcObject = this.state.videoStream;
            this.state.cameraActive = true;

            // Update button
            document.getElementById('startCamera').innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="6" width="4" height="12" fill="currentColor"/>
                    <rect x="14" y="6" width="4" height="12" fill="currentColor"/>
                </svg>
                Pause Camera
            `;

            this.addActivity('Camera', '📹 Camera started', 'on');

            // Start detection loop
            this.startDetectionLoop();
        } catch (error) {
            console.error('❌ Camera access denied:', error);
            alert('Please allow camera access to use this feature.');
        }
    }

    toggleCamera() {
        if (this.state.cameraActive) {
            this.stopCamera();
        } else {
            this.startCamera();
        }
    }

    stopCamera() {
        if (this.state.videoStream) {
            this.state.videoStream.getTracks().forEach(track => track.stop());
            this.state.videoStream = null;
            this.state.cameraActive = false;

            document.getElementById('videoFeed').srcObject = null;
            document.getElementById('startCamera').innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polygon points="10,8 16,12 10,16" fill="currentColor"/>
                </svg>
                Start Camera
            `;

            this.addActivity('Camera', '⏸️ Camera stopped', 'off');
        }
    }

    async startDetectionLoop() {
        if (!this.state.cameraActive || !this.state.detectionModel) return;

        const video = document.getElementById('videoFeed');
        const canvas = document.getElementById('detectionCanvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const detect = async () => {
            if (!this.state.cameraActive) return;

            try {
                // Detect objects
                const predictions = await this.state.detectionModel.detect(video);

                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Filter for persons
                const persons = predictions.filter(p => p.class === 'person' && p.score > 0.5);

                // Update person count
                document.getElementById('personCount').textContent = persons.length;

                // Draw bounding boxes
                persons.forEach(person => {
                    const [x, y, width, height] = person.bbox;

                    // Draw rectangle
                    ctx.strokeStyle = '#4facfe';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x, y, width, height);

                    // Draw label
                    ctx.fillStyle = '#4facfe';
                    ctx.fillRect(x, y - 25, width, 25);
                    ctx.fillStyle = '#000';
                    ctx.font = '16px Inter';
                    ctx.fillText(`Person ${Math.round(person.score * 100)}%`, x + 5, y - 7);
                });

                // Detect faces
                if (this.state.faceModel) {
                    const faces = await this.state.faceModel.estimateFaces(video, false);

                    if (faces.length > 0) {
                        // Draw face boxes
                        faces.forEach(face => {
                            const start = face.topLeft;
                            const end = face.bottomRight;
                            const size = [end[0] - start[0], end[1] - start[1]];

                            ctx.strokeStyle = '#f5576c';
                            ctx.lineWidth = 2;
                            ctx.strokeRect(start[0], start[1], size[0], size[1]);
                        });

                        // Try to recognize face
                        this.recognizeFace(faces[0]);
                    }
                }

                // Auto-control lights based on detection
                if (this.state.autoMode) {
                    if (persons.length > 0) {
                        this.state.lastDetectionTime = Date.now();
                        this.state.stats.detectionsCount++;
                        this.turnOnAllLights();
                    } else {
                        // Check if enough time has passed without detection
                        if (this.state.lastDetectionTime &&
                            Date.now() - this.state.lastDetectionTime > this.config.autoOffDelay) {
                            this.turnOffAllLights();
                        }
                    }
                }

            } catch (error) {
                console.error('Detection error:', error);
            }

            // Continue detection loop
            setTimeout(detect, this.config.detectionInterval);
        };

        detect();
    }

    recognizeFace(detectedFace) {
        // Simple face recognition based on registered faces
        // In a real application, you would use face embeddings and similarity matching
        if (this.state.registeredFaces.length > 0) {
            // For demo purposes, randomly recognize a registered face
            const randomFace = this.state.registeredFaces[
                Math.floor(Math.random() * this.state.registeredFaces.length)
            ];

            if (this.state.currentPerson !== randomFace.name) {
                this.state.currentPerson = randomFace.name;
                document.getElementById('recognizedFace').textContent = randomFace.name;
                this.addActivity('Recognition', `👋 Welcome, ${randomFace.name}!`, 'detection');
            }
        } else {
            document.getElementById('recognizedFace').textContent = 'Unknown';
        }
    }

    capturePhoto() {
        if (!this.state.cameraActive) {
            alert('Please start the camera first.');
            return;
        }

        const video = document.getElementById('videoFeed');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg');
        this.openFaceModal(imageData);
    }

    handleFaceUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.openFaceModal(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    openFaceModal(imageData) {
        document.getElementById('facePreview').src = imageData;
        document.getElementById('faceModal').classList.add('active');

        // Store temp image data
        this.tempFaceData = imageData;
    }

    closeModal() {
        document.getElementById('faceModal').classList.remove('active');
        document.getElementById('faceName').value = '';
        document.getElementById('faceRole').value = '';
        this.tempFaceData = null;
    }

    saveFace() {
        const name = document.getElementById('faceName').value.trim();
        const role = document.getElementById('faceRole').value.trim();

        if (!name) {
            alert('Please enter a name for this face.');
            return;
        }

        const face = {
            id: Date.now().toString(),
            name,
            role: role || 'User',
            image: this.tempFaceData,
            registeredAt: new Date().toISOString()
        };

        this.state.registeredFaces.push(face);
        this.saveRegisteredFaces();
        this.renderFaces();
        this.closeModal();

        this.addActivity('Registration', `✅ Registered ${name} as ${face.role}`, 'on');
    }

    deleteFace(faceId) {
        const face = this.state.registeredFaces.find(f => f.id === faceId);
        if (confirm(`Delete ${face.name} from registered faces?`)) {
            this.state.registeredFaces = this.state.registeredFaces.filter(f => f.id !== faceId);
            this.saveRegisteredFaces();
            this.renderFaces();
            this.addActivity('Registration', `🗑️ Removed ${face.name}`, 'off');
        }
    }

    saveRegisteredFaces() {
        localStorage.setItem('registeredFaces', JSON.stringify(this.state.registeredFaces));
    }

    loadRegisteredFaces() {
        const saved = localStorage.getItem('registeredFaces');
        if (saved) {
            this.state.registeredFaces = JSON.parse(saved);
            this.renderFaces();
        }
    }

    renderFaces() {
        const grid = document.getElementById('facesGrid');
        document.getElementById('facesCount').textContent = this.state.registeredFaces.length;

        if (this.state.registeredFaces.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
                    </svg>
                    <p>No faces registered</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.state.registeredFaces.map(face => `
            <div class="face-item">
                <button class="face-delete" onclick="app.deleteFace('${face.id}')">&times;</button>
                <img class="face-avatar" src="${face.image}" alt="${face.name}">
                <div class="face-name">${face.name}</div>
                <div class="face-role">${face.role}</div>
            </div>
        `).join('');
    }

    switchMode(mode) {
        this.state.autoMode = mode === 'auto';

        // Update button states
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        this.addActivity('System', `🔄 Switched to ${mode} mode`, 'detection');
        this.renderLights();
    }

    renderLights() {
        const grid = document.getElementById('lightsGrid');

        grid.innerHTML = this.state.lights.map(light => `
            <div class="light-card ${light.status ? 'on' : ''}" data-light-id="${light.id}">
                <div class="light-header">
                    <div class="light-info">
                        <h3>${light.name}</h3>
                        <div class="light-location">${light.location}</div>
                    </div>
                    <div class="light-toggle"></div>
                </div>
                <div class="light-stats">
                    <div class="stat-item">
                        <span class="stat-label-small">Status</span>
                        <span class="stat-value-small">${light.status ? 'ON' : 'OFF'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label-small">Energy</span>
                        <span class="stat-value-small">${light.energy.toFixed(3)} kWh</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label-small">Last Used</span>
                        <span class="stat-value-small">${light.lastUsed ? this.formatTime(light.lastUsed) : 'Never'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    toggleLight(lightId) {
        const light = this.state.lights.find(l => l.id === lightId);
        if (!light) return;

        light.status = !light.status;
        light.lastUsed = new Date().toISOString();

        if (light.status) {
            light.turnedOnAt = Date.now();
            this.addActivity(light.name, '💡 Light turned ON', 'on');
        } else {
            if (light.turnedOnAt) {
                const duration = (Date.now() - light.turnedOnAt) / 1000 / 3600; // hours
                light.energy += duration * this.config.lightPower;
                light.usageTime += duration;
            }
            this.addActivity(light.name, '🌙 Light turned OFF', 'off');
        }

        this.renderLights();
        this.updateStats();
    }

    turnOnAllLights() {
        let lightsChanged = false;
        this.state.lights.forEach(light => {
            if (!light.status) {
                light.status = true;
                light.lastUsed = new Date().toISOString();
                light.turnedOnAt = Date.now();
                lightsChanged = true;
            }
        });

        if (lightsChanged) {
            this.addActivity('Auto Mode', '🏠 All lights turned ON (person detected)', 'on');
            this.renderLights();
        }
    }

    turnOffAllLights() {
        let lightsChanged = false;
        this.state.lights.forEach(light => {
            if (light.status) {
                light.status = false;
                if (light.turnedOnAt) {
                    const duration = (Date.now() - light.turnedOnAt) / 1000 / 3600;
                    light.energy += duration * this.config.lightPower;
                    light.usageTime += duration;
                }
                lightsChanged = true;
            }
        });

        if (lightsChanged) {
            this.addActivity('Auto Mode', '🌙 All lights turned OFF (no person detected)', 'off');
            this.renderLights();
            this.updateStats();
        }
    }

    addActivity(title, description, type) {
        const activity = {
            id: Date.now(),
            title,
            description,
            type,
            timestamp: new Date().toISOString()
        };

        this.state.activityLog.unshift(activity);

        // Keep only last 50 activities
        if (this.state.activityLog.length > 50) {
            this.state.activityLog = this.state.activityLog.slice(0, 50);
        }

        this.renderActivityLog();
    }

    renderActivityLog() {
        const log = document.getElementById('activityLog');

        if (this.state.activityLog.length === 0) {
            log.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <p>No activity yet</p>
                </div>
            `;
            return;
        }

        log.innerHTML = this.state.activityLog.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    ${activity.type === 'on' ? '💡' : activity.type === 'off' ? '🌙' : '👤'}
                </div>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    clearActivityLog() {
        if (confirm('Clear all activity logs?')) {
            this.state.activityLog = [];
            this.renderActivityLog();
        }
    }

    updateStats() {
        // Calculate total energy consumed
        let totalEnergy = this.state.lights.reduce((sum, light) => sum + light.energy, 0);

        // Add energy from currently running lights
        this.state.lights.forEach(light => {
            if (light.status && light.turnedOnAt) {
                const duration = (Date.now() - light.turnedOnAt) / 1000 / 3600;
                totalEnergy += duration * this.config.lightPower;
            }
        });

        this.state.stats.energyConsumed = totalEnergy;

        // Calculate money spent
        const moneySpent = totalEnergy * this.config.energyRate;

        // Calculate savings (assuming 20% savings from automation)
        this.state.stats.moneySaved = moneySpent * 0.2;
        this.state.stats.totalSavings = 20;

        // Update response time (simulate)
        this.state.stats.responseTime = (Math.random() * 0.5 + 0.3).toFixed(1);

        // Update UI
        document.getElementById('energyConsumed').textContent = `${totalEnergy.toFixed(3)} kWh`;
        document.getElementById('moneySaved').textContent = `₹${this.state.stats.moneySaved.toFixed(2)}`;
        document.getElementById('responseTime').textContent = `${this.state.stats.responseTime}s`;
        document.getElementById('detectionsCount').textContent = this.state.stats.detectionsCount;
        document.getElementById('totalSavings').textContent = this.state.stats.totalSavings;
    }

    updateStatsForRange(range) {
        // Placeholder for time-range specific statistics
        console.log('Update stats for range:', range);
    }

    startStatsLoop() {
        setInterval(() => {
            this.updateStats();
        }, 5000); // Update every 5 seconds
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return `${seconds}s ago`;
    }

    updateUI() {
        this.renderLights();
        this.renderFaces();
        this.renderActivityLog();
        this.updateStats();
        this.renderUsageTracking();
    }

    renderUsageTracking() {
        // Render comprehensive usage tracking dashboard
        const trackingElement = document.getElementById('usageTracking');
        if (!trackingElement) return;

        const categories = [...new Set(this.state.lights.map(l => l.category))];

        let html = '';
        categories.forEach(category => {
            const devices = this.state.lights.filter(l => l.category === category);

            html += `
                <div class="category-section">
                    <h3 class="category-title">
                        ${devices[0].icon} ${category}s
                        <span class="device-count">${devices.length} device${devices.length > 1 ? 's' : ''}</span>
                    </h3>
                    <div class="tracking-grid">
            `;

            devices.forEach(device => {
                const formatDate = (iso) => {
                    if (!iso) return 'Never used';
                    const date = new Date(iso);
                    return date.toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                };

                html += `
                    <div class="tracking-card ${device.status ? 'active' : ''}">
                        <div class="tracking-header">
                            <div class="device-name">
                                <span class="device-icon">${device.icon}</span>
                                <span>${device.name}</span>
                            </div>
                            <div class="device-status ${device.status ? 'on' : 'off'}">
                                ${device.status ? 'ON' : 'OFF'}
                            </div>
                        </div>
                        <div class="tracking-details">
                            <div class="tracking-row">
                                <span class="track-label">👤 Last User:</span>
                                <span class="track-value">${device.lastPerson}</span>
                            </div>
                            <div class="tracking-row">
                                <span class="track-label">📅 Last Used:</span>
                                <span class="track-value">${formatDate(device.lastUsed)}</span>
                            </div>
                            <div class="tracking-row">
                                <span class="track-label">🔢 Usage Count:</span>
                                <span class="track-value">${device.usageCount} time${device.usageCount !== 1 ? 's' : ''}</span>
                            </div>
                            <div class="tracking-row">
                                <span class="track-label">⚡ Energy Used:</span>
                                <span class="track-value">${device.energy.toFixed(3)} kWh</span>
                            </div>
                            <div class="tracking-row">
                                <span class="track-label">⏱️ Total Runtime:</span>
                                <span class="track-value">${(device.usageTime * 60).toFixed(1)} min</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        trackingElement.innerHTML = html || '<div class="empty-state"><p>No devices tracked</p></div>';
    }
}

// Initialize the app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SmartLightAutomation();
});
