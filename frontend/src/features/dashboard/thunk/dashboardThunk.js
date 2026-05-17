import { createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardApi } from "../api/dashboardApi";

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getOverview();
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
