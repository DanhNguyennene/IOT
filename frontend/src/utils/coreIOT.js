import axios from "axios";

// Configuration constants
const URL_LOGIN = "your-login-endpoint-here";
const URL_GET_DATA = "your-data-endpoint-here"; // Should include {device} and {device_id} placeholders
const USERNAME = "khoa.nguyen04012004@hcmut.edu.vn";
const PASSWORD = "your-password";
const DEVICE = "your-device";
const DEVICE_ID = "your-device-id";

/**
 * Fetch telemetry data from the external API using JWT token
 * @returns {Promise<Object>} Telemetry data
 */
export const getData = async () => {
  try {
    // Step 1: Login to get the JWT token
    const loginResponse = await axios.post(URL_LOGIN, {
      username: USERNAME,
      password: PASSWORD,
    });

    const jwtToken = loginResponse.data.token;

    if (!jwtToken) {
      throw new Error("Token not found in login response");
    }

    // Step 2: Use the JWT token to fetch telemetry data
    const headers = {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    };

    // Replace placeholders in URL
    const url = URL_GET_DATA.replace("{device}", DEVICE).replace(
      "{device_id}",
      DEVICE_ID
    );

    const dataResponse = await axios.get(url, { headers });

    // Return the telemetry data
    return dataResponse.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(
        `Failed to fetch data: ${error.response.status} - ${
          error.response.data.message || error.response.statusText
        }`
      );
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("Failed to fetch data: No response from server");
    } else {
      // Something else happened
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
};

// Alternative implementation with better error handling and retry logic
export const getDataWithRetry = async (maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await getData();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Usage example for React component or Express.js route
export const handleGetData = async (req, res) => {
  try {
    const data = await getData();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch data",
      message: error.message,
    });
  }
};

// React hook usage example
export const useApiData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
};
