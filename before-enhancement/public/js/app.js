/**
 * Fetches the latest sensor data from the backend API.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of sensor data objects.
 */
async function fetchData() {
    // Send a GET request to the local backend server for data
    const response = await fetch('http://localhost:8000/data');
    // Parse the JSON response
    const json = await response.json();
    // Return the actual data array from the parsed response
    return json.data;
  }
  
  /**
   * Main function to fetch data and render/update the charts on the dashboard.
   */
  async function renderCharts() {
    // Await the latest data from the backend
    const data = await fetchData();
  
    // ==========================================
    // Data Processing & Extraction
    // ==========================================
    
    // Extract timestamps and format them to local time strings for the X-axis
    const timestamps = data.map(d => new Date(d.timestamp).toLocaleTimeString());
    
    // Extract weight values for the line chart dataset
    const weights = data.map(d => d.weight);
    
    // Extract humidity values for the bar chart dataset
    const humidities = data.map(d => d.humidity);
    
    // Get the most recent fullness and pH readings from the latest data point (last element)
    const fullness = data[data.length - 1].fullness;
    const ph = data[data.length - 1].pH;
  
    // ==========================================
    // Chart Initialization
    // ==========================================
  
    // Initialize the Weight Line Chart
    new Chart(document.getElementById('weightChart'), {
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
  
    // Initialize the Humidity Bar Chart
    new Chart(document.getElementById('humidityChart'), {
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
  
    // ==========================================
    // UI Updates
    // ==========================================
  
    // Update the Fullness Gauge element with the latest value
    document.getElementById('fullnessGauge').value = fullness;
    // Update the textual display for the Fullness Gauge
    document.getElementById('fullnessValue').innerText = `${fullness}%`;
  
    // Update the pH Level display with the latest reading
    document.getElementById('phValue').innerText = ph;
  }
  
  // ==========================================
  // Initialization & Polling
  // ==========================================
  
  // Perform an initial render of the charts immediately on load
  renderCharts();
  
  // Set up a polling interval to refresh the dashboard data every 10 seconds (10000ms)
  setInterval(renderCharts, 10000);
  