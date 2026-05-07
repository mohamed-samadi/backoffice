import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const tasksApi = {
  getAll:       (params = {}) => api.get("/tasks", { params }),
  getById:      (id)          => api.get(`/tasks/${id}`),
  create:       (payload)     => api.post("/tasks", payload),
  update:       (id, payload) => api.put(`/tasks/${id}`, payload),
  delete:       (id)          => api.delete(`/tasks/${id}`),
  updateStatus: (id, status)  => api.patch(`/tasks/${id}/status`, { status }),
  overdue:      (params = {}) => api.get("/tasks/overdue", { params }),
  byCategory:   (catId, params = {}) => api.get(`/tasks/category/${catId}`, { params }),
};

export const taskCategoriesApi = {
  getAll:  (params = {}) => api.get("/task-categories", { params }),
  getById: (id)          => api.get(`/task-categories/${id}`),
  create:  (payload)     => api.post("/task-categories", payload),
  update:  (id, payload) => api.put(`/task-categories/${id}`, payload),
  delete:  (id)          => api.delete(`/task-categories/${id}`),
  active:  ()            => api.get("/task-categories/active"),
};

export default api;