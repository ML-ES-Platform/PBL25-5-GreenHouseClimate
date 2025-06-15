// Main application logic

// Global variables
let currentTimeRange = 'day';
let deviceStates = {
    window: false,
    fan: false,
    led: false
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // First ensure authentication
    if (window.greenhouseAPI && !window.greenhouseAPI.ensureAuthenticated()) {
        // If authentication fails, show error and return
        showAuthenticationError();
        return;
    }

    initializeChart();
    initializeAPI();

    // Set up periodic data refresh
    setInterval(() => {
        if (window.greenhouseAPI && window.greenhouseAPI.ensureAuthenticated()) {
            loadCurrentData();
        }
    }, UPDATE_INTERVALS.currentData);

    setInterval(() => {
        if (window.greenhouseAPI && window.greenhouseAPI.ensureAuthenticated()) {
            loadHistoricalData(currentTimeRange);
        }
    }, UPDATE_INTERVALS.historicalData);

    // Add visual feedback for button clicks
    setupButtonFeedback();
});

// Show authentication error
function showAuthenticationError() {
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <div class="header">
                <h1>🌱 Greenhouse Climate Control</h1>
                <p style="color: #ff6b6b;">Authentication Required</p>
            </div>
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>Please refresh the page and provide a valid JWT token to access the system.</p>
                <button onclick="location.reload()" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 1rem;
                ">Refresh Page</button>
            </div>
        `;
    }
}
// Load and display setpoints
async function loadSetpoints() {
    if (window.greenhouseAPI && !window.greenhouseAPI.ensureAuthenticated()) {
        return;
    }

    try {
        const setpoints = await window.greenhouseAPI.loadSetpoints();
        updateSetpointDisplay(setpoints);
    } catch (error) {
        console.error('Failed to load setpoints:', error);
    }
}

// Update setpoint display
function updateSetpointDisplay(setpoints) {
    const tempInput = document.getElementById('tempSetpoint');
    const humidityInput = document.getElementById('humiditySetpoint');
    const lightInput = document.getElementById('lightSetpoint');

    if (tempInput) tempInput.value = setpoints.temperature || 21;
    if (humidityInput) humidityInput.value = setpoints.humidity || 55;
    if (lightInput) lightInput.value = setpoints.light || 40;
}

// Update individual setpoint
async function updateSetpoint(type) {
    if (window.greenhouseAPI && !window.greenhouseAPI.ensureAuthenticated()) {
        return;
    }

    const inputId = `${type}Setpoint`;
    const input = document.getElementById(inputId);
    const button = document.querySelector(`[onclick="updateSetpoint('${type}')"]`);

    if (!input) return;

    const value = input.value.trim();
    if (!value || isNaN(value)) {
        alert('Please enter a valid number');
        return;
    }

    // Visual feedback
    button.textContent = 'Updating...';
    button.disabled = true;

    try {
        const success = await window.greenhouseAPI.updateSetpoint(type, value);
        if (success) {
            button.textContent = 'Updated!';
            setTimeout(() => {
                button.textContent = 'Set';
                button.disabled = false;
            }, 1500);
        } else {
            throw new Error('Update failed');
        }
    } catch (error) {
        console.error(error);
        alert(`Failed to update ${type} setpoint`);
        button.textContent = 'Set';
        button.disabled = false;
    }
}
// Change time range for charts
function changeTimeRange(range) {
    if (window.greenhouseAPI && !window.greenhouseAPI.ensureAuthenticated()) {
        return;
    }

    currentTimeRange = range;

    // Update button states
    document.querySelectorAll('.time-button').forEach(btn => btn.classList.remove('active'));
    // Find the button that was clicked and add the active class
    const clickedButton = event.target;
    if (clickedButton && clickedButton.classList.contains('time-button')) {
        clickedButton.classList.add('active');
    }

    loadHistoricalData(range);
}

// Toggle device state
async function toggleDevice(device) {
    if (window.greenhouseAPI && !window.greenhouseAPI.ensureAuthenticated()) {
        return;
    }

    const newState = !deviceStates[device];
    const success = await toggleDeviceAPI(device, newState);

    if (success) {
        deviceStates[device] = newState;
        updateDeviceButtons();
        // Reload device status after a short delay to confirm the change
        setTimeout(() => loadDeviceStatus(), 500);
    }
}

// Update device states from API response
function updateDeviceStates(states) {
    deviceStates = states;
    updateDeviceButtons();
}

// Update device button states
function updateDeviceButtons() {
    const buttons = {
        window: document.getElementById('windowBtn'),
        fan: document.getElementById('fanBtn'),
        led: document.getElementById('ledBtn')
    };

    Object.keys(buttons).forEach(device => {
        const btn = buttons[device];
        if (btn) {
            const state = deviceStates[device];
            btn.className = `control-button ${state ? 'on' : 'off'}`;
            btn.textContent = getButtonText(device, state);
        }
    });
}

// Get button text based on device and state
function getButtonText(device, state) {
    const deviceNames = {
        window: 'Windows',
        fan: 'Fans',
        led: 'LED Lights'
    };

    return `${deviceNames[device]}: ${state ? 'ON' : 'OFF'}`;
}
// Set auto mode
async function setAutoMode() {
    if (window.greenhouseAPI && !window.greenhouseAPI.ensureAuthenticated()) {
        return;
    }

    const button = document.getElementById('autoModeBtn');

    // Visual feedback
    button.textContent = 'Setting...';
    button.disabled = true;

    try {
        const success = await window.greenhouseAPI.setAutoMode();
        if (success) {
            button.textContent = 'Auto Mode Set!';
            setTimeout(() => {
                button.textContent = 'Set Automode';
                button.disabled = false;
            }, 1500);
        } else {
            throw new Error('Set auto mode failed');
        }
    } catch (error) {
        console.error(error);
        alert('Failed to set auto mode');
        button.textContent = 'Set Automode';
        button.disabled = false;
    }
}
// Add visual feedback for button clicks
function setupButtonFeedback() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('control-button') || e.target.classList.contains('time-button')) {
            e.target.style.transform = 'translateY(-2px) scale(0.95)';
            setTimeout(() => {
                e.target.style.transform = '';
            }, 150);
        }
    });
}