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
    initializeChart();
    loadCurrentData();
    loadDeviceStatus();
    loadHistoricalData(currentTimeRange);

    // Set up periodic data refresh
    setInterval(loadCurrentData, UPDATE_INTERVALS.currentData);
    setInterval(() => loadHistoricalData(currentTimeRange), UPDATE_INTERVALS.historicalData);

    // Add visual feedback for button clicks
    setupButtonFeedback();
});

// Change time range for charts
function changeTimeRange(range) {
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
    const newState = !deviceStates[device];
    const success = await toggleDeviceAPI(device, newState);

    if (success) {
        deviceStates[device] = newState;
        updateDeviceButtons();
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
        const state = deviceStates[device];

        btn.className = `control-button ${state ? 'on' : 'off'}`;
        btn.textContent = getButtonText(device, state);
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