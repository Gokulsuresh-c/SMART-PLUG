const apiKey = 'AGD6ZD4MM8Q7TTJV'; // Replace with your ThingSpeak Read API Key
const writeKey = 'L2TDJ1Y4WC0HTNAQ'; // Replace with your ThingSpeak Write API Key
const channelId = '2716153'; // Replace with your ThingSpeak Channel ID

// Initialize chart elements
const voltageChart = new Chart(document.getElementById("voltageChart"), {
    type: 'line',
    data: {
        labels: [], // Will be filled with time labels
        datasets: [{
            label: 'Current', // Changed label to "Current (A)"
            borderColor: '#00ff00',
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            data: []
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                min: 0,
                max: 5, // Set y-axis range from 0 to 5
                title: {
                    display: true,
                    text: 'CURRENT (A)' // Label the y-axis as "CURRENT"
                }
            }
        }
    }
});

const currentChart = new Chart(document.getElementById("currentChart"), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Voltage', // Changed label to "Voltage (V)"
            borderColor: '#ff0000',
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            data: []
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                min: 0,
                max: 300, // Set y-axis range from 0 to 300
                title: {
                    display: true,
                    text: 'VOLTAGE (V)' // Label the y-axis as "VOLTAGE"
                }
            }
        }
    }
});

const powerChart = new Chart(document.getElementById("powerChart"), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Power',
            borderColor: '#0000ff',
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            data: []
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                min: 0,
                max: 1500, // Set y-axis range from 0 to 1500W
                title: {
                    display: true,
                    text: 'Power (W)' // Label the y-axis as "Power (W)"
                }
            }
        }
    }
});

let voltageData = [];
let currentData = [];
let powerData = [];
let timeLabels = [];

// Fetch data from ThingSpeak
async function fetchData() {
    const response = await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=96`);
    const data = await response.json();

    voltageData = [];
    currentData = [];
    powerData = [];
    timeLabels = [];

    data.feeds.forEach(feed => {
        voltageData.push(parseFloat(feed.field1));
        currentData.push(parseFloat(feed.field2));
        powerData.push(parseFloat(feed.field1) * parseFloat(feed.field2)); // Calculate power
        timeLabels.push(new Date(feed.created_at).toLocaleTimeString());
    });

    updateCharts();
}

// Update the charts
function updateCharts() {
    voltageChart.data.labels = timeLabels;
    voltageChart.data.datasets[0].data = voltageData;
    voltageChart.update();

    currentChart.data.labels = timeLabels;
    currentChart.data.datasets[0].data = currentData;
    currentChart.update();

    powerChart.data.labels = timeLabels;
    powerChart.data.datasets[0].data = powerData;
    powerChart.update();
}

// Schedule LED control
function scheduleLed() {
    const scheduleTime = document.getElementById("scheduleTime").value;
    if (scheduleTime) {
        const now = new Date();
        const [hours, minutes] = scheduleTime.split(":").map(Number);
        const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

        const delay = scheduledTime.getTime() - now.getTime();

        if (delay > 0) {
            setTimeout(() => toggleLed(true), delay);
            alert(`LED scheduled to turn on at ${scheduleTime}`);
        } else {
            alert("Please select a future time.");
        }
    }
}

// LED toggle function
async function toggleLed(state) {
    const status = state ? 1 : 0;
    document.getElementById("switchLabel").textContent = state ? "ON" : "OFF"; // Update label text
    await fetch(`https://api.thingspeak.com/update?api_key=${writeKey}&field3=${status}`);
}

// Initialize switch and data fetch intervals
document.getElementById("ledSwitch").addEventListener("change", function () {
    toggleLed(this.checked);
});

// Set up interval to fetch data every 15 seconds
setInterval(fetchData, 15000);
fetchData();
