// Export functions for global use
if (typeof window !== 'undefined') {
    window.chartFunctions = {
        initializeChart,
        updateChart,
        updateChartTimeRange,
        generateMockHistoricalData,
        destroyChart
    };
}

// Chart management functions
let climateChart;

// Initialize Chart.js
function initializeChart() {
    const ctx = document.getElementById('climateChart');
    if (!ctx) {
        console.error('Chart canvas element not found');
        return;
    }

    // Destroy existing chart if it exists
    if (climateChart) {
        climateChart.destroy();
        climateChart = null;
    }

    climateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: CHART_CONFIG.colors.temperature,
                    backgroundColor: CHART_CONFIG.backgroundColors.temperature,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 6
                },
                {
                    label: 'Humidity (%)',
                    data: [],
                    borderColor: CHART_CONFIG.colors.humidity,
                    backgroundColor: CHART_CONFIG.backgroundColors.humidity,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                },
                {
                    label: 'Light (Lux/10)',
                    data: [],
                    borderColor: CHART_CONFIG.colors.light,
                    backgroundColor: CHART_CONFIG.backgroundColors.light,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    yAxisID: 'y2'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white',
                        font: {
                            size: 14
                        },
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white',
                        maxTicksLimit: 10
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C) / Humidity (%)',
                        color: 'white'
                    },
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    min: 0,
                    max: 100
                },
                y2: {
                    type: 'linear',
                    display: false,
                    position: 'right'
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    console.log('Chart initialized successfully');
}

// Update chart with new data
function updateChart(data) {
    if (!climateChart) {
        console.error('Chart not initialized');
        return;
    }

    console.log('Updating chart with data:', data);

    if (!data || !data.labels || data.labels.length === 0) {
        console.warn('No data available for chart');
        // Show empty state
        climateChart.data.labels = ['No Data Available'];
        climateChart.data.datasets[0].data = [0];
        climateChart.data.datasets[1].data = [0];
        climateChart.data.datasets[2].data = [0];
        climateChart.update();
        return;
    }

    // Update chart data
    climateChart.data.labels = data.labels;
    climateChart.data.datasets[0].data = data.temperature || [];
    climateChart.data.datasets[1].data = data.humidity || [];
    climateChart.data.datasets[2].data = (data.light || []).map(val => Number(val) / 10);

    // Update chart
    climateChart.update('active');
    console.log('Chart updated successfully with', data.labels.length, 'data points');
}

// Update chart time range
function updateChartTimeRange(timeRange) {
    console.log('Updating chart for time range:', timeRange);

    // Update button states
    document.querySelectorAll('.time-button').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[onclick="changeTimeRange('${timeRange}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Load new data
    if (window.greenhouseAPI) {
        window.greenhouseAPI.loadHistoricalData(timeRange);
    } else {
        console.warn('greenhouseAPI not available, using mock data');
        const mockData = generateMockHistoricalData(timeRange);
        updateChart(mockData);
    }
}

// Generate mock data for fallback
function generateMockHistoricalData(timeRange) {
    const data = {
        labels: [],
        temperature: [],
        humidity: [],
        light: []
    };

    let points, interval, baseTime;
    const now = new Date();

    switch (timeRange) {
        case 'day':
            points = 24;
            interval = 60 * 60 * 1000; // 1 hour
            baseTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case 'week':
            points = 7;
            interval = 24 * 60 * 60 * 1000; // 1 day
            baseTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            points = 30;
            interval = 24 * 60 * 60 * 1000; // 1 day
            baseTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            points = 24;
            interval = 60 * 60 * 1000;
            baseTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    for (let i = 0; i < points; i++) {
        const time = new Date(baseTime.getTime() + i * interval);

        // Format time based on range
        let timeLabel;
        if (timeRange === 'day') {
            timeLabel = time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        } else {
            timeLabel = time.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
        }

        data.labels.push(timeLabel);

        // Generate realistic sensor data with some variation
        data.temperature.push(22 + Math.sin(i * 0.5) * 5 + (Math.random() - 0.5) * 2);
        data.humidity.push(55 + Math.cos(i * 0.3) * 15 + (Math.random() - 0.5) * 5);
        data.light.push(400 + Math.sin(i * 0.8) * 200 + (Math.random() - 0.5) * 100);
    }

    console.log('Generated mock data for', timeRange, ':', data);
    return data;
}

// Initialize chart when DOM is loaded
function initializeChartWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeChart);
    } else {
        // Add a small delay to ensure other scripts are loaded
        setTimeout(initializeChart, 100);
    }
}

// Destroy chart function
function destroyChart() {
    if (climateChart) {
        climateChart.destroy();
        climateChart = null;
        console.log('Chart destroyed');
    }
}

// Auto-initialize only if not already initialized
if (!climateChart) {
    initializeChartWhenReady();
}