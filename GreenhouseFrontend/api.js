// API configuration
const API_BASE_URL = 'http://44.201.149.111:8080';
const API_ENDPOINTS = {
    controlPanelState: `${API_BASE_URL}/control-panel/state`,
    toggleWindows: `${API_BASE_URL}/control-panel/toggle-windows`,
    toggleFans: `${API_BASE_URL}/control-panel/toggle-fans`,
    toggleLights: `${API_BASE_URL}/control-panel/toggle-lights`,
    sensorMeasurements: `${API_BASE_URL}/sensor-measurements`,
    addSensorMeasurement: `${API_BASE_URL}/sensor-measurements/add`
};

// Authentication token storage
let authToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkaW1hQGdtYWlsLmNvbSIsImlhdCI6MTc0OTQ2MTQ2MSwiZXhwIjoxNzUzMDYxNDYxfQ.Vj9-UEzpsw5TrfBSJorageQnkxS5uuMxilKaTMRT_ik';

// Helper function to get headers with authentication
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

// Helper function to handle API errors
function handleApiError(error, operation) {
    console.error(`Error ${operation}:`, error);

    if (error.status === 401) {
        console.error('Authentication required or token expired');
    } else if (error.status === 403) {
        console.error('Access forbidden - insufficient permissions');
    }

    throw error;
}

// Load current sensor data from the latest measurements
async function loadCurrentData() {
    try {
        const response = await fetch(API_ENDPOINTS.sensorMeasurements, {
            method: 'GET',
            headers: getAuthHeaders(),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const measurements = await response.json();
        console.log('Loaded measurements:', measurements);

        // Get the latest measurement
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

// Update current data display
function updateCurrentDataDisplay(data) {
    const tempElement = document.getElementById('temperature');
    const humidityElement = document.getElementById('humidity');
    const lightElement = document.getElementById('light');

    if (tempElement) tempElement.textContent = data.temperature.toFixed(1);
    if (humidityElement) humidityElement.textContent = data.humidity.toFixed(1);
    if (lightElement) lightElement.textContent = Math.floor(data.light);
}

// Show error state for current data
function showDataError() {
    const tempElement = document.getElementById('temperature');
    const humidityElement = document.getElementById('humidity');
    const lightElement = document.getElementById('light');

    if (tempElement) tempElement.textContent = 'Error';
    if (humidityElement) humidityElement.textContent = 'Error';
    if (lightElement) lightElement.textContent = 'Error';
}

// Load device status from control panel
async function loadDeviceStatus() {
    try {
        const response = await fetch(API_ENDPOINTS.controlPanelState, {
            method: 'GET',
            headers: getAuthHeaders(),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

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

// Load historical data for charts
async function loadHistoricalData(timeRange) {
    try {
        console.log(`Loading historical data for time range: ${timeRange}`);

        const response = await fetch(API_ENDPOINTS.sensorMeasurements, {
            method: 'GET',
            headers: getAuthHeaders(),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const measurements = await response.json();
        console.log('Raw measurements:', measurements);

        if (!measurements || measurements.length === 0) {
            console.warn('No measurements available, using mock data');
            const mockData = generateMockHistoricalData(timeRange);
            updateChart(mockData);
            return;
        }

        // Filter data based on time range
        const filteredData = filterDataByTimeRange(measurements, timeRange);
        console.log('Filtered data:', filteredData);

        // Convert to chart format
        const chartData = convertToChartFormat(filteredData, timeRange);
        console.log('Chart data:', chartData);

        updateChart(chartData);

    } catch (error) {
        console.error('Failed to load historical data:', error);
        // Fall back to mock data if API fails
        const mockData = generateMockHistoricalData(timeRange);
        updateChart(mockData);
    }
}

// Filter measurements by time range
function filterDataByTimeRange(measurements, timeRange) {
    if (!measurements || measurements.length === 0) {
        console.warn('No measurements to filter');
        return [];
    }

    const now = new Date();
    let cutoffTime;

    switch (timeRange) {
        case 'day': // Last 24 hours
            cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case 'week': // Last 7 days
            cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month': // Last 30 days
            cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 'day'
    }

    console.log(`Filtering for time range: ${timeRange}, cutoff: ${cutoffTime.toISOString()}`);
    console.log(`Total measurements before filtering: ${measurements.length}`);

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

        const isValidTime = !isNaN(measurementTime);
        return isValidTime && measurementTime >= cutoffTime;
    });

    console.log(`Measurements after filtering: ${filtered.length}`);

    // If no data passes the filter, sort all measurements and return recent ones
    if (filtered.length === 0 && measurements.length > 0) {
        console.warn('No data passed time filter, returning most recent data');
        const sortedMeasurements = [...measurements].sort((a, b) => {
            const timeA = parseTimestamp(a.timestamp) || parseTimestamp(a.createdAt) || parseTimestamp(a.created_at) || 0;
            const timeB = parseTimestamp(b.timestamp) || parseTimestamp(b.createdAt) || parseTimestamp(b.created_at) || 0;
            return timeB - timeA;
        });
        return sortedMeasurements.slice(0, Math.min(50, sortedMeasurements.length)); // Return up to 50 recent measurements
    }

    filtered.sort((a, b) => {
        const timeA = parseTimestamp(a.timestamp) || parseTimestamp(a.createdAt) || parseTimestamp(a.created_at) || 0;
        const timeB = parseTimestamp(b.timestamp) || parseTimestamp(b.createdAt) || parseTimestamp(b.created_at) || 0;
        return timeA - timeB;
    });

    return filtered;
}

// Helper function to parse timestamps consistently
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

// Convert sensor measurements to chart format
function convertToChartFormat(measurements, timeRange) {
    if (!measurements || measurements.length === 0) {
        console.warn('No measurements available for chart');
        return {
            labels: [],
            temperature: [],
            humidity: [],
            light: []
        };
    }

    console.log(`Converting ${measurements.length} measurements to chart format for ${timeRange}`);

    const chartData = {
        labels: [],
        temperature: [],
        humidity: [],
        light: []
    };

    // Aggregate data for 'week' and 'month' to avoid too many data points
    if (timeRange === 'week' || timeRange === 'month') {
        const aggregatedData = {}; // Key: date string, Value: array of measurements for that day

        measurements.forEach(measurement => {
            const timestamp = parseTimestamp(measurement.timestamp) || parseTimestamp(measurement.createdAt) || parseTimestamp(measurement.created_at);
            if (timestamp) {
                const date = new Date(timestamp);
                // Group by day for 'week' and 'month'
                const dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                if (!aggregatedData[dateString]) {
                    aggregatedData[dateString] = {
                        sumTemp: 0, countTemp: 0,
                        sumHumidity: 0, countHumidity: 0,
                        sumLight: 0, countLight: 0,
                        date: date // Store date object for sorting
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

        // Convert aggregated data to chart format
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

    } else { // For 'day' (1h, 6h, 24h - use specific time format)
        measurements.forEach((measurement, index) => {
            const timestamp = parseTimestamp(measurement.timestamp) || parseTimestamp(measurement.createdAt) || parseTimestamp(measurement.created_at);
            if (timestamp) {
                const time = new Date(timestamp);
                chartData.labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            } else {
                chartData.labels.push(`Point ${index + 1}`);
            }

            chartData.temperature.push(parseFloat(measurement.temperature) || 0);
            chartData.humidity.push(parseFloat(measurement.humidity) || 0);
            chartData.light.push(parseFloat(measurement.light) || 0);
        });
    }

    console.log('Chart data converted:', {
        points: chartData.labels.length,
        tempRange: [Math.min(...chartData.temperature), Math.max(...chartData.temperature)],
        humidityRange: [Math.min(...chartData.humidity), Math.max(...chartData.humidity)],
        lightRange: [Math.min(...chartData.light), Math.max(...chartData.light)]
    });

    return chartData;
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

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: getAuthHeaders(),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log(`${device} toggled successfully`);
        return true;

    } catch (error) {
        console.error(`Failed to toggle ${device}:`, error);
        return false;
    }
}

// Add a new sensor measurement
async function addSensorMeasurement(measurementData) {
    try {
        const response = await fetch(API_ENDPOINTS.addSensorMeasurement, {
            method: 'POST',
            headers: getAuthHeaders(),
            mode: 'cors',
            body: JSON.stringify(measurementData)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log('Sensor measurement added successfully');
        return true;

    } catch (error) {
        console.error('Failed to add sensor measurement:', error);
        return false;
    }
}

// Generate mock historical data (fallback)
function generateMockHistoricalData(timeRange) {
    const now = new Date();
    const dataPoints = [];
    let interval, count;

    switch (timeRange) {
        case 'day':
            interval = 60 * 60 * 1000; // 1 hour
            count = 24;
            break;
        case 'week':
            interval = 24 * 60 * 60 * 1000; // 1 day
            count = 7;
            break;
        case 'month':
            interval = 24 * 60 * 60 * 1000; // 1 day
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
        if (timeRange === 'day') {
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

// Set authentication token
function setAuthToken(token) {
    authToken = token;
}

// Clear authentication token
function clearAuthToken() {
    authToken = null;
}

// Initialize API connection
function initializeAPI() {
    console.log('Initializing API connection...');
    loadCurrentData();
    loadDeviceStatus();
    loadHistoricalData('day');
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.greenhouseAPI = {
        loadCurrentData,
        loadDeviceStatus,
        loadHistoricalData,
        toggleDeviceAPI,
        addSensorMeasurement,
        setAuthToken,
        clearAuthToken,
        initializeAPI
    };
}