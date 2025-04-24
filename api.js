import axios from 'axios';

const API = axios.create({
  baseURL: 'https://fastapi-app-iscc.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all tasks (with optional search)
export const getTasks = async (search = "") => {
  try {
    const response = await API.get(`/tasks?search=${search}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

// Add a new task
export const addTask = async (task) => {
  try {
    const response = await API.post('/tasks', task);
    return response.data;
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

// Update an existing task by ID
export const updateTask = async (id, task) => {
  try {
    const response = await API.put(`/tasks/${id}`, task);
    return response.data;
  } catch (error) {
    console.error("Error updating task:", error);
  }
};

// Delete a task by ID
export const deleteTask = async (id) => {
  try {
    await API.delete(`/tasks/${id}`);
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};

export default API;
