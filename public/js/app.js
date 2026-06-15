let weightChart;
let humidityChart;

/**
 * Fetches the latest published food waste data from the backend API.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of food waste entries.
 */
async function fetchData() {
  // Use the same Express API route as the rest of the app instead of a hard-coded localhost port.
  const response = await fetch('/api/waste');
  if (!response.ok) throw new Error('Unable to fetch food waste data');

  // Parse the JSON response
  return response.json();
}
  
/**
 * Main function to fetch data and render/update the charts on the dashboard.
 */
async function renderCharts() {
  try {
    // Await the latest data from the backend
    const data = await fetchData();
    // If there is no data, show an empty state message in the UI instead of crashing or showing fake numbers
    if (!Array.isArray(data) || data.length === 0) {
      ['weightChart', 'humidityChart'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.parentElement) {
          el.parentElement.innerHTML = '<div style="padding: 2rem; text-align: center; color: #666;">No sensor or waste data available yet. Please add entries to see charts.</div>';
        }
      });
      ['fullnessValue', 'phValue'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = '--';
      });
      return;
    }
  
    // ==========================================
    // Data Processing & Extraction
    // ==========================================
    
    // Extract timestamps and format them to local time strings for the X-axis
    const timestamps = data.map(d => new Date(d.date || d.createdAt).toLocaleTimeString());
    
    // Extract weight values for the line chart dataset
    const weights = data.map(d => d.weight);
    
    // Extract humidity values for the bar chart dataset
    const humidities = data.map(d => d.humidity);
    
    // Get the most recent fullness and pH readings from the latest data point (last element)
    // DEFENSIVE CHECK: Fallback to 0 or a safe default if the sensor data fields are missing
    const latestEntry = data[data.length - 1] || {};
    const fullness = latestEntry.binFullness || 0;
    const ph = latestEntry.pH || '--';
  
    // ==========================================
    // Chart Initialization
    // ==========================================
  
    // Initialize the Weight Line Chart
    const weightChartElement = document.getElementById('weightChart');
    if (weightChartElement) {
      if (weightChart) {
        weightChart.data.labels = timestamps;
        weightChart.data.datasets[0].data = weights;
        weightChart.update();
      } else {
        weightChart = new Chart(weightChartElement, {
          type: 'line',
          data: {
            labels: timestamps,
            datasets: [{ 
              label: 'Weight (lbs)', 
              data: weights, 
              borderWidth: 2, 
              borderColor: '#4caf50' // Green border color
            }]
          }
        });
      }
    }
  
    // Initialize the Humidity Bar Chart
    const humidityChartElement = document.getElementById('humidityChart');
    if (humidityChartElement) {
      if (humidityChart) {
        humidityChart.data.labels = timestamps;
        humidityChart.data.datasets[0].data = humidities;
        humidityChart.update();
      } else {
        humidityChart = new Chart(humidityChartElement, {
          type: 'bar',
          data: {
            labels: timestamps,
            datasets: [{ 
              label: 'Humidity (%)', 
              data: humidities, 
              backgroundColor: '#42a5f5' // Blue background color
            }]
          }
        });
      }
    }
  
    // ==========================================
    // UI Updates
    // ==========================================
  
    // Update the Fullness Gauge element with the latest value
    const fullnessGauge = document.getElementById('fullnessGauge');
    if (fullnessGauge) fullnessGauge.value = fullness;
    // Update the textual display for the Fullness Gauge
    const fullnessValue = document.getElementById('fullnessValue');
    if (fullnessValue) fullnessValue.innerText = `${fullness}%`;
  
    // Update the pH Level display with the latest reading
    const phValue = document.getElementById('phValue');
    if (phValue) phValue.innerText = ph;
  } catch (error) {
    console.error('Unable to render charts:', error);
  }
}
  
// ==========================================
// Initialization & Polling
// ==========================================
  
// Perform an initial render of the charts immediately on load
renderCharts();
  
// Set up a polling interval to refresh the dashboard data every 10 seconds (10000ms)
setInterval(renderCharts, 10000);