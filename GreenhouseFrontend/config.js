// Update intervals (in milliseconds)
const UPDATE_INTERVALS = {
    currentData: 30000,    // Update every 30 seconds
    historicalData: 300000 // Update charts every 5 minutes
};

// Chart configuration
const CHART_CONFIG = {
    colors: {
        temperature: '#FF6B6B',
        humidity: '#4ECDC4',
        light: '#FFE66D'
    },
    backgroundColors: {
        temperature: 'rgba(255, 107, 107, 0.1)',
        humidity: 'rgba(78, 205, 196, 0.1)',
        light: 'rgba(255, 230, 109, 0.1)'
    }
};