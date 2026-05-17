import api from "../../api/api";

export const dashboardApi = {
  getOverview: () => api.get("/dashboard"),
};

export default dashboardApi;
