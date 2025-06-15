// API configuration
const API_BASE_URL = 'http://gccbackALB-228053873.us-east-1.elb.amazonaws.com';
const API_ENDPOINTS = {
    login: `${API_BASE_URL}/auth/login`,
    controlPanelState: `${API_BASE_URL}/control-panel/state`,
    toggleWindows: `${API_BASE_URL}/control-panel/toggle-windows`,
    toggleFans: `${API_BASE_URL}/control-panel/toggle-fans`,
    toggleLights: `${API_BASE_URL}/control-panel/toggle-lights`,
    sensorMeasurements: `${API_BASE_URL}/sensor-measurements`,
    addSensorMeasurement: `${API_BASE_URL}/sensor-measurements/add`,
    getSetpoints: `${API_BASE_URL}/setpoints`,
    updateHumiditySetpoints: `${API_BASE_URL}/control-panel/set-humidity-setpoint`,
    updateLightSetpoints: `${API_BASE_URL}/control-panel/set-light-setpoint`,
    updateTemperatureSetpoints: `${API_BASE_URL}/control-panel/set-temperature-setpoint`,
    setAutomode: `${API_BASE_URL}/control-panel/set-auto-mode`
};

// Authentication token storage
let authToken = null;
let isAuthenticating = false;

// Create login modal/form
function createLoginModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('loginModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
    `;

    const form = document.createElement('div');
    form.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
    `;

    form.innerHTML = `
        <h2 style="margin: 0 0 20px 0; text-align: center; color: #333;">
            Greenhouse Login
        </h2>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; color: #555; font-weight: bold;">
                Email:
            </label>
            <input type="email" id="loginEmail" style="
                width: 100%;
                padding: 10px;
                border: 2px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            " placeholder="Enter your email" required>
        </div>
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; color: #555; font-weight: bold;">
                Password:
            </label>
            <input type="password" id="loginPassword" style="
                width: 100%;
                padding: 10px;
                border: 2px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            " placeholder="Enter your password" required>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="loginSubmit" style="
                background: #4CAF50;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
            ">Login</button>
            <button id="loginCancel" style="
                background: #f44336;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
            ">Cancel</button>
        </div>
        <div id="loginError" style="
            margin-top: 15px;
            padding: 10px;
            background: #ffebee;
            color: #c62828;
            border-radius: 5px;
            display: none;
            text-align: center;
        "></div>
        <div id="loginLoading" style="
            margin-top: 15px;
            text-align: center;
            color: #666;
            display: none;
        ">
            <span>Logging in...</span>
        </div>
    `;

    modal.appendChild(form);
    document.body.appendChild(modal);

    return new Promise((resolve) => {
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const submitBtn = document.getElementById('loginSubmit');
        const cancelBtn = document.getElementById('loginCancel');
        const errorDiv = document.getElementById('loginError');
        const loadingDiv = document.getElementById('loginLoading');

        function showError(message) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            loadingDiv.style.display = 'none';
            submitBtn.disabled = false;
            cancelBtn.disabled = false;
        }

        function showLoading() {
            errorDiv.style.display = 'none';
            loadingDiv.style.display = 'block';
            submitBtn.disabled = true;
            cancelBtn.disabled = true;
        }

        async function handleSubmit() {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                showError('Please enter both email and password');
                return;
            }

            showLoading();

            try {
                const success = await performLogin({ email, password });
                modal.remove();
                resolve(success);
            } catch (error) {
                showError(error.message || 'Login failed. Please try again.');
            }
        }

        function handleCancel() {
            modal.remove();
            resolve(false);
        }

        // Event listeners
        submitBtn.addEventListener('click', handleSubmit);
        cancelBtn.addEventListener('click', handleCancel);

        // Enter key support
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                passwordInput.focus();
            }
        });

        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        });

        // Focus on email input
        emailInput.focus();

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        });
    });
}

// Perform the actual login API call
async function performLogin(credentials) {
    try {
        console.log('Attempting login for:', credentials.email);

        const response = await fetch(API_ENDPOINTS.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify(credentials)
        });

        const responseText = await response.text();
        console.log('Login response status:', response.status);
        console.log('Login response:', responseText);

        if (!response.ok) {
            let errorMessage = `Login failed (${response.status})`;

            if (response.status === 401) {
                errorMessage = 'Invalid email or password';
            } else if (response.status === 403) {
                errorMessage = 'Access forbidden';
            } else if (response.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            throw new Error(errorMessage);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse login response as JSON:', responseText);
            throw new Error('Invalid response from server');
        }

        if (data.token) {
            authToken = data.token;
            console.log('Login successful, token received');
            return true;
        } else {
            console.error('No token in response:', data);
            throw new Error('Login successful but no token received');
        }

    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Check if token is expired
function isTokenExpired() {
    if (!authToken) return true;

    try {
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        const isExpired = Date.now() >= exp;
        if (isExpired) {
            console.log('Token is expired');
        }
        return isExpired;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
}

// Ensure user is authenticated
async function ensureAuthenticated() {
    if (isAuthenticating) {
        console.log('Already authenticating, waiting...');
        return false;
    }

    if (authToken && !isTokenExpired()) {
        return true;
    }

    isAuthenticating = true;
    console.log('Authentication required');

    try {
        const success = await createLoginModal();
        if (!success) {
            console.log('Authentication cancelled by user');
            return false;
        }
        await Promise.all([
            loadCurrentData(),
            loadDeviceStatus(),
            loadHistoricalData('day'),
            loadSetpoints()  // Add this line
        ]);
        console.log('Authentication successful');
        return true;
    } finally {
        isAuthenticating = false;
    }
}

// Get headers with authentication
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    return headers;
}

// Handle API errors with automatic retry for auth issues
async function handleApiError(error, operation) {
    console.error(`Error ${operation}:`, error);

    if (error.status === 401) {
        console.log('Token expired or invalid, clearing token');
        clearAuthToken();
        return true; // Indicate retry should be attempted
    } else if (error.status === 403) {
        console.error('Access forbidden - insufficient permissions');
        alert('Access denied. You do not have permission to perform this action.');
    } else if (error.status >= 500) {
        console.error('Server error');
        alert(`Server error occurred while ${operation}. Please try again later.`);
    } else {
        console.error('Unexpected error');
        alert(`An error occurred while ${operation}. Please check your connection and try again.`);
    }

    return false;
}

// Generic API call wrapper with authentication
async function makeAuthenticatedRequest(url, options = {}, operation = 'making request') {
    if (!(await ensureAuthenticated())) {
        throw new Error('Authentication required');
    }

    const requestOptions = {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        },
        mode: 'cors'
    };

    try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            const shouldRetry = await handleApiError({
                status: response.status,
                statusText: response.statusText
            }, operation);

            if (shouldRetry && response.status === 401) {
                // Retry once with new authentication
                if (await ensureAuthenticated()) {
                    requestOptions.headers = {
                        ...getAuthHeaders(),
                        ...options.headers
                    };
                    const retryResponse = await fetch(url, requestOptions);
                    if (!retryResponse.ok) {
                        throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
                    }
                    return retryResponse;
                }
            }

            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('Network error:', error);
            alert('Network error. Please check your internet connection.');
        }
        throw error;
    }
}

// Load current sensor data
async function loadCurrentData() {
    try {
        const response = await makeAuthenticatedRequest(
            API_ENDPOINTS.sensorMeasurements,
            { method: 'GET' },
            'loading current data'
        );

        const measurements = await response.json();
        console.log('Loaded measurements:', measurements);

        const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;

        if (latestMeasurement) {
            const data = {
                temperature: latestMeasurement.temperature || 0,
                humidity: latestMeasurement.humidity || 0,
                light: latestMeasurement.light || 0
            };
            updateCurrentDataDisplay(data);
        } else {
            console.warn('No measurements found');
            showDataError();
        }

    } catch (error) {
        console.error('Failed to load current data:', error);
        showDataError();
    }
}

// Load device status
async function loadDeviceStatus() {
    try {
        const response = await makeAuthenticatedRequest(
            API_ENDPOINTS.controlPanelState,
            { method: 'GET' },
            'loading device status'
        );

        const controlPanel = await response.json();
        console.log('Control panel state:', controlPanel);

        const deviceStates = {
            window: controlPanel.areWindowsOpened || false,
            fan: controlPanel.areFansOn || false,
            led: controlPanel.areLightsOn || false
        };

        updateDeviceStates(deviceStates);

    } catch (error) {
        console.error('Failed to load device status:', error);
        updateDeviceStates({ window: false, fan: false, led: false });
    }
}

// Toggle device state
async function toggleDeviceAPI(device, newState) {
    try {
        let endpoint;

        switch (device) {
            case 'window':
                endpoint = API_ENDPOINTS.toggleWindows;
                break;
            case 'fan':
                endpoint = API_ENDPOINTS.toggleFans;
                break;
            case 'led':
                endpoint = API_ENDPOINTS.toggleLights;
                break;
            default:
                throw new Error(`Unknown device: ${device}`);
        }

        await makeAuthenticatedRequest(
            endpoint,
            { method: 'POST' },
            `toggling ${device}`
        );

        console.log(`${device} toggled successfully`);
        return true;

    } catch (error) {
        console.error(`Failed to toggle ${device}:`, error);
        return false;
    }
}

// Add sensor measurement
async function addSensorMeasurement(measurementData) {
    try {
        await makeAuthenticatedRequest(
            API_ENDPOINTS.addSensorMeasurement,
            {
                method: 'POST',
                body: JSON.stringify(measurementData)
            },
            'adding sensor measurement'
        );

        console.log('Sensor measurement added successfully');
        return true;

    } catch (error) {
        console.error('Failed to add sensor measurement:', error);
        return false;
    }
}

// Load historical data
async function loadHistoricalData(timeRange) {
    try {
        console.log(`Loading historical data for time range: ${timeRange}`);

        const response = await makeAuthenticatedRequest(
            API_ENDPOINTS.sensorMeasurements,
            { method: 'GET' },
            'loading historical data'
        );

        const measurements = await response.json();
        console.log('Raw measurements:', measurements);

        if (!measurements || measurements.length === 0) {
            console.warn('No measurements available, using mock data');
            const mockData = generateMockHistoricalData(timeRange);
            updateChart(mockData);
            return;
        }

        const filteredData = filterDataByTimeRange(measurements, timeRange);
        console.log('Filtered data:', filteredData);

        const chartData = convertToChartFormat(filteredData, timeRange);
        console.log('Chart data:', chartData);

        updateChart(chartData);

    } catch (error) {
        console.error('Failed to load historical data:', error);
        const mockData = generateMockHistoricalData(timeRange);
        updateChart(mockData);
    }
}

// Utility functions (keeping your existing implementations)
function updateCurrentDataDisplay(data) {
    const tempElement = document.getElementById('temperature');
    const humidityElement = document.getElementById('humidity');
    const lightElement = document.getElementById('light');

    if (tempElement) tempElement.textContent = data.temperature.toFixed(1);
    if (humidityElement) humidityElement.textContent = data.humidity.toFixed(1);
    if (lightElement) lightElement.textContent = Math.floor(data.light);
}

function showDataError() {
    const tempElement = document.getElementById('temperature');
    const humidityElement = document.getElementById('humidity');
    const lightElement = document.getElementById('light');

    if (tempElement) tempElement.textContent = 'Error';
    if (humidityElement) humidityElement.textContent = 'Error';
    if (lightElement) lightElement.textContent = 'Error';
}

// Clear authentication token
function clearAuthToken() {
    authToken = null;
    console.log('Authentication token cleared');
}

// Add logout function
function logout() {
    clearAuthToken();
    console.log('User logged out');
    // Optionally refresh the page or redirect
    // window.location.reload();
}

// Initialize API connection
async function initializeAPI() {
    console.log('Initializing API connection...');

    try {
        if (await ensureAuthenticated()) {
            console.log('Authentication successful, loading data...');
            await Promise.all([
                loadCurrentData(),
                loadDeviceStatus(),
                loadHistoricalData('day'),
                loadSetpoints()  // Add this line
            ]);
            console.log('API initialization complete');
        } else {
            console.log('Authentication failed or cancelled');
        }
    } catch (error) {
        console.error('Failed to initialize API:', error);
    }
}
// Keep your existing utility functions
function filterDataByTimeRange(measurements, timeRange) {
    if (!measurements || measurements.length === 0) {
        console.warn('No measurements to filter');
        return [];
    }

    const now = new Date();
    let cutoffTime;

    switch (timeRange) {
        case 'now':
            cutoffTime = new Date(now.getTime() - 5 * 60 * 1000);
            break;
        case 'day':
            cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case 'week':
            cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const filtered = measurements.filter((measurement) => {
        let measurementTime;

        if (typeof measurement.timestamp === 'number') {
            measurementTime = new Date(measurement.timestamp < 1e12 ? measurement.timestamp * 1000 : measurement.timestamp);
        } else if (typeof measurement.timestamp === 'string') {
            measurementTime = new Date(measurement.timestamp);
            if (isNaN(measurementTime)) {
                measurementTime = new Date(measurement.timestamp.replace(' ', 'T'));
            }
            if (isNaN(measurementTime)) {
                measurementTime = new Date(measurement.timestamp.replace(' ', 'T') + 'Z');
            }
        } else if (measurement.createdAt) {
            measurementTime = new Date(measurement.createdAt);
        } else if (measurement.created_at) {
            measurementTime = new Date(measurement.created_at);
        } else {
            return false;
        }

        return !isNaN(measurementTime) && measurementTime >= cutoffTime;
    });

    if (filtered.length === 0 && measurements.length > 0) {
        const sortedMeasurements = [...measurements].sort((a, b) => {
            const timeA = parseTimestamp(a.timestamp) || parseTimestamp(a.createdAt) || parseTimestamp(a.created_at) || 0;
            const timeB = parseTimestamp(b.timestamp) || parseTimestamp(b.createdAt) || parseTimestamp(b.created_at) || 0;
            return timeB - timeA;
        });
        return sortedMeasurements.slice(0, Math.min(50, sortedMeasurements.length));
    }

    filtered.sort((a, b) => {
        const timeA = parseTimestamp(a.timestamp) || parseTimestamp(a.createdAt) || parseTimestamp(a.created_at) || 0;
        const timeB = parseTimestamp(b.timestamp) || parseTimestamp(b.createdAt) || parseTimestamp(b.created_at) || 0;
        return timeA - timeB;
    });

    return filtered;
}

function parseTimestamp(timestamp) {
    if (!timestamp) return null;

    if (typeof timestamp === 'number') {
        return timestamp < 1e12 ? timestamp * 1000 : timestamp;
    } else if (typeof timestamp === 'string') {
        let date = new Date(timestamp);
        if (isNaN(date)) {
            date = new Date(timestamp.replace(' ', 'T'));
        }
        if (isNaN(date)) {
            date = new Date(timestamp.replace(' ', 'T') + 'Z');
        }
        return isNaN(date) ? null : date.getTime();
    }
    return null;
}

function convertToChartFormat(measurements, timeRange) {
    if (!measurements || measurements.length === 0) {
        return {
            labels: [],
            temperature: [],
            humidity: [],
            light: []
        };
    }

    const chartData = {
        labels: [],
        temperature: [],
        humidity: [],
        light: []
    };

    if (timeRange === 'week' || timeRange === 'month') {
        const aggregatedData = {};

        measurements.forEach(measurement => {
            const timestamp = parseTimestamp(measurement.timestamp) || parseTimestamp(measurement.createdAt) || parseTimestamp(measurement.created_at);
            if (timestamp) {
                const date = new Date(timestamp);
                const dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                if (!aggregatedData[dateString]) {
                    aggregatedData[dateString] = {
                        sumTemp: 0, countTemp: 0,
                        sumHumidity: 0, countHumidity: 0,
                        sumLight: 0, countLight: 0,
                        date: date
                    };
                }
                if (measurement.temperature) {
                    aggregatedData[dateString].sumTemp += parseFloat(measurement.temperature);
                    aggregatedData[dateString].countTemp++;
                }
                if (measurement.humidity) {
                    aggregatedData[dateString].sumHumidity += parseFloat(measurement.humidity);
                    aggregatedData[dateString].countHumidity++;
                }
                if (measurement.light) {
                    aggregatedData[dateString].sumLight += parseFloat(measurement.light);
                    aggregatedData[dateString].countLight++;
                }
            }
        });

        const sortedAggregatedDates = Object.keys(aggregatedData).sort((a, b) => {
            return aggregatedData[a].date.getTime() - aggregatedData[b].date.getTime();
        });

        sortedAggregatedDates.forEach(dateString => {
            const data = aggregatedData[dateString];
            chartData.labels.push(dateString);
            chartData.temperature.push(data.countTemp > 0 ? (data.sumTemp / data.countTemp).toFixed(1) : 0);
            chartData.humidity.push(data.countHumidity > 0 ? (data.sumHumidity / data.countHumidity).toFixed(1) : 0);
            chartData.light.push(data.countLight > 0 ? Math.floor(data.sumLight / data.countLight) : 0);
        });

    } else {
        measurements.forEach((measurement, index) => {
            const timestamp = parseTimestamp(measurement.timestamp) || parseTimestamp(measurement.createdAt) || parseTimestamp(measurement.created_at);
            if (timestamp) {
                const time = new Date(timestamp);
                if (timeRange === 'now') {
                    chartData.labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                } else {
                    chartData.labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                }
            } else {
                chartData.labels.push(`Point ${index + 1}`);
            }

            chartData.temperature.push(parseFloat(measurement.temperature) || 0);
            chartData.humidity.push(parseFloat(measurement.humidity) || 0);
            chartData.light.push(parseFloat(measurement.light) || 0);
        });
    }

    return chartData;
}

function generateMockHistoricalData(timeRange) {
    const now = new Date();
    const dataPoints = [];
    let interval, count;

    switch (timeRange) {
        case 'now':
            interval = 30 * 1000;
            count = 10;
            break;
        case 'day':
            interval = 60 * 60 * 1000;
            count = 24;
            break;
        case 'week':
            interval = 24 * 60 * 60 * 1000;
            count = 7;
            break;
        case 'month':
            interval = 24 * 60 * 60 * 1000;
            count = 30;
            break;
        default:
            interval = 60 * 60 * 1000;
            count = 24;
    }

    const labels = [];
    const temperature = [];
    const humidity = [];
    const light = [];

    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * interval);
        if (timeRange === 'now') {
            labels.push(time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'}));
        } else if (timeRange === 'day') {
            labels.push(time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
        } else {
            labels.push(time.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}));
        }

        temperature.push(20 + Math.sin(i * 0.5) * 5 + Math.random() * 2);
        humidity.push(40 + Math.cos(i * 0.3) * 15 + Math.random() * 5);
        light.push(300 + Math.sin(i * 0.8) * 200 + Math.random() * 100);
    }

    return { labels, temperature, humidity, light };
}
// Load current setpoints
async function loadSetpoints() {
    try {
        const response = await makeAuthenticatedRequest(
            API_ENDPOINTS.controlPanelState,
            { method: 'GET' },
            'loading setpoints'
        );

        const controlPanel = await response.json();
        console.log('Loaded setpoints:', controlPanel);
        await updateSetpoint("temperature", controlPanel.temperatureSetpoint)
        await updateSetpoint("humidity", controlPanel.humiditySetpoint)
        await updateSetpoint("light", controlPanel.lightSetpoint)
        return setpoints;

    } catch (error) {
        console.error('Failed to load setpoints:', error);
        return { temperature: 21, humidity: 51, light: 40 };
    }
}
async function loadDeviceStatus() {
    try {
        const response = await makeAuthenticatedRequest(
            API_ENDPOINTS.controlPanelState,
            { method: 'GET' },
            'loading device status'
        );

        const controlPanel = await response.json();
        console.log('Control panel state:', controlPanel);

        const deviceStates = {
            window: controlPanel.areWindowsOpened || false,
            fan: controlPanel.areFansOn || false,
            led: controlPanel.areLightsOn || false
        };

        updateDeviceStates(deviceStates);

    } catch (error) {
        console.error('Failed to load device status:', error);
        updateDeviceStates({ window: false, fan: false, led: false });
    }
}

// Update setpoint
async function updateSetpoint(type, value) {
console.log(JSON.stringify({ ["setpoint"]: parseFloat(value) }))
    try {
        console.log("TYPE OF:" , type);
        let endpoint
        switch (type) {
            case 'temperature':
                endpoint = API_ENDPOINTS.updateTemperatureSetpoints;
                break;
            case 'humidity':
                endpoint = API_ENDPOINTS.updateHumiditySetpoints;
                break;
            case 'light':
                endpoint = API_ENDPOINTS.updateLightSetpoints;
                break;
            default:
                throw new Error(`Unknown type: ${type}`);
        }
        await makeAuthenticatedRequest(
            endpoint,
            {
                method: 'POST',
                body: JSON.stringify({ ["setpoint"]: parseFloat(value) })
            },
            `updating ${type} setpoint`
        );

        console.log(`${type} setpoint updated to ${value}`);
        return true;

    } catch (error) {
        console.log(JSON.stringify({ ["setpoint"]: parseFloat(value) }))
        console.error(`Failed tototo update ${type} setpoint:`, error);
        return false;
    }
}
// Set auto mode
async function setAutoMode() {
    try {
        await makeAuthenticatedRequest(
            API_ENDPOINTS.setAutomode,
            { method: 'POST' },
            'setting auto mode'
        );

        console.log('Auto mode set successfully');
        return true;

    } catch (error) {
        console.error('Failed to set auto mode:', error);
        return false;
    }
}
// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.greenhouseAPI = {
        loadCurrentData,
        loadDeviceStatus,
        loadHistoricalData,
        toggleDeviceAPI,
        addSensorMeasurement,
        clearAuthToken,
        logout,
        initializeAPI,
        ensureAuthenticated,
        updateSetpoint,
        setAutoMode
    };
}