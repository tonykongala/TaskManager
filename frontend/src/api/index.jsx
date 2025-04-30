import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Reuseable API call to update task
export const updateTask = async (taskId, updates, token) => {
  return await api.put(`/tasks/${taskId}`, updates, {
    headers: {
      Authorization: token
    }
  });
};

export default api;
