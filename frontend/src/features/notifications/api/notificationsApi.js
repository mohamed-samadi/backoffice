import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const notificationsApi = {
  getAll:       (params = {}) => api.get("/notifications", { params }),
  getCount:     ()            => api.get("/notifications/count"),
  markAsRead:   (id)          => api.post(`/notifications/${id}/read`),     
  markAllRead:  ()            => api.post("/notifications/read-all"),
  delete:       (id)          => api.delete(`/notifications/${id}`),
  deleteAll:    ()            => api.delete("/notifications"),
};

export default api;