import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://backend-zpc2.onrender.com",
  headers: {
    "Content-Type": "application/json"
  }
});

// Other utility functions (optional)...

export default api;
