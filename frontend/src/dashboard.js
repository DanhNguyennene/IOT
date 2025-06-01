import React, { useRef, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import Sidebar from "./sidebar"; // Import the Sidebar component
import apiClient from "./api";
// Import the CSS file
import "./dashboard.css";

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const chartRef = useRef(null);
  const [humidity, setHumidity] = useState(0);
  const [lightframe, setLightFrame] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [temperatureData, setTemperatureData] = useState({
    labels: [],
    values: [],
  });
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // Track current values for warning checks
  const currentValues = useRef({ temp: 0, hum: 0, lightframe: 0 });

  // Get color based on value and type
  const getColor = (value, type) => {
    if (type === "temperature") {
      if (value < 20) return "#add8e6"; // light blue
      if (value > 40) return "#ff0000"; // red
      return "#f5e5b3"; // default color
    } else if (type === "humidity") {
      if (value < 20) return "#add8e6"; // light blue
      if (value > 35) return "#ff0000"; // red
      return "#f5e5b3"; // default color
    }
    return "#f5e5b3";
  };

  // Check for warnings
  const checkWarnings = (temp, hum) => {
    const warnings = [];
    if (temp !== 0 && (temp < 20 || temp > 40)) {
      warnings.push(
        `Temperature is ${temp < 20 ? "too low" : "too high"} (${temp.toFixed(
          1
        )}°C)`
      );
    }
    // if (hum < 20 || hum > 35) {
    //   warnings.push(`Humidity is ${hum < 20 ? 'too low' : 'too high'} (${hum.toFixed(1)}%)`);
    // }

    if (warnings.length > 0) {
      setWarningMessage(warnings.join("\n"));
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  // Poll for latest data every 1 second and check warnings
  useEffect(() => {
    // Initial fetch
    fetchTemperatureData();
    fetchHumidityData();

    // Set up interval for updates
    const fetchInterval = setInterval(() => {
      fetchTemperatureData();
      fetchHumidityData();
      fetchLightFrameValue();
    }, 1000);

    // Set up separate interval for warning checks with 1.2s delay
    const warningInterval = setInterval(() => {
      checkWarnings(currentValues.current.temp, currentValues.current.hum);
    }, 1200);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(warningInterval);
    };
  }, []);

  // Function to fetch temperature data from the server
  const fetchTemperatureData = async () => {
    try {
      const response = await apiClient.get("/device/feeds/temperature");
      const newTemp = Math.min(
        100,
        Math.max(-100, parseFloat(response.data.value))
      ); // [CHANGED]
      setTemperature(newTemp);
      currentValues.current.temp = newTemp;

      const currentTime = new Date();
      setTemperatureData((prevData) => {
        const newLabels = [...prevData.labels, currentTime];
        const newValues = [...prevData.values, newTemp];

        if (newLabels.length > 10) {
          newLabels.shift();
          newValues.shift();
        }

        return {
          labels: newLabels,
          values: newValues,
        };
      });
    } catch (error) {
      console.error("Error fetching temperature data:", error);
    }
  };

  // Function to fetch humidity data from the server
  const fetchHumidityData = async () => {
    try {
      const response = await apiClient.get("/device/feeds/humidity");
      if (!response.data.ok) {
        throw new Error("Failed to fetch humidity data");
      }
      const newHum = Math.min(100, Math.max(0, response.data.value));
      setHumidity(newHum);
      currentValues.current.hum = newHum; // Update the current humidity value
    } catch (error) {
      console.error("Error fetching humidity data:", error);
    }
  };

  // Function to fetch light frame value from the server
  const fetchLightFrameValue = async () => {
    try {
      const response = await apiClient.get("/device/feeds/light");
      if (!response.data.ok) {
        throw new Error("Failed to fetch light frame data");
      }
      const newLightFrame = Math.min(100, Math.max(0, response.data.value));
      setLightFrame(newLightFrame);
      currentValues.current.lightframe = newLightFrame; // Update the current light frame value
    } catch (error) {
      console.error("Error fetching light frame data:", error);
    }
  };

  // Chart data
  const chartData = {
    labels: temperatureData.labels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: temperatureData.values,
        borderColor: "#f5e5b3",
        backgroundColor: "rgba(245, 229, 179, 0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          displayFormats: { minute: "HH:mm" },
        },
        ticks: {
          maxTicksLimit: 10,
          source: "data",
        },
      },
      y: {
        beginAtZero: false,
        min: -100,
        max: 100,
        title: {
          display: true,
          text: "Temperature (°C)",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].label);
            return date.toLocaleTimeString();
          },
        },
      },
    },
  };

  // Cleanup chart instance on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="dashboard-page">
      {/* Warning Modal */}
      {showWarning && (
        <div className="dashboard-warning-modal">
          <div className="dashboard-warning-content">
            <h3>Warning!</h3>
            <p>{warningMessage}</p>
            <button onClick={() => setShowWarning(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar activePage="DASHBOARD" />

      {/* Main Content */}
      <main className="dashboard-main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-header-title">Welcome, My Smart Home</h1>
            <p className="dashboard-header-subtitle">
              District 10, HCM city • Partly Cloudy
            </p>
          </div>
          <div className="dashboard-header-right">
            <span className="dashboard-temperature" style={{ temperature }}>
              {temperature.toFixed(1)}°C
            </span>
            <button className="dashboard-add-device-button">
              + NEW DEVICE
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-grid">
            {/* Temperature Frame Section */}
            <div className="dashboard-frame dashboard-temperature-frame">
              <h3 className="dashboard-frame-title">Temperature Frame</h3>
              <div className="dashboard-progress-bar">
                <div
                  className="dashboard-progress-filled"
                  style={{
                    width: `${((temperature + 100) / 200) * 100}%`,
                    backgroundColor: getColor(temperature, "temperature"),
                  }}
                />
              </div>
              <p className="dashboard-frame-value">
                {temperature.toFixed(1)}°C
              </p>
            </div>

            {/* Temperature Chart */}
            <div className="dashboard-frame dashboard-temperature-chart">
              <h3 className="dashboard-frame-title">Temperature</h3>
              <div className="dashboard-chart-container">
                <Line ref={chartRef} data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Humidity */}
            <div className="dashboard-frame dashboard-humidity-frame">
              <h3 className="dashboard-frame-title">Humidity</h3>
              <div className="dashboard-circle-container">
                <svg className="dashboard-circle-progress" viewBox="0 0 36 36">
                  <path
                    className="dashboard-circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="3"
                  />
                  <path
                    className="dashboard-circle-fill"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={getColor(humidity, "humidity")}
                    strokeWidth="3"
                    strokeDasharray={`${humidity}, 100`}
                  />
                </svg>
                <span className="dashboard-circle-value">
                  {humidity.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Motion */}
            <div className="dashboard-frame dashboard-motion-frame">
              <h3 className="dashboard-frame-title">Motion</h3>
              <div className="dashboard-circle-container dashboard-motion-circle">
                <svg className="dashboard-circle-progress" viewBox="0 0 36 36">
                  <path
                    className="dashboard-circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="3"
                  />
                </svg>
                <span className="dashboard-circle-value">-</span>
              </div>
            </div>

            {/* Light Frame */}
            <div className="dashboard-frame dashboard-light-frame">
              <h3 className="dashboard-frame-title">Light Frame</h3>
              <div className="dashboard-circle-container dashboard-light-circle">
                <svg className="dashboard-circle-progress" viewBox="0 0 36 36">
                  <path
                    className="dashboard-circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="3"
                  />
                  <path
                    className="dashboard-circle-fill"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={"#f5e5b3"}
                    strokeWidth="3"
                    strokeDasharray={`${lightframe}, 100`}
                  />
                </svg>
                <span className="dashboard-circle-value">
                  {lightframe.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
