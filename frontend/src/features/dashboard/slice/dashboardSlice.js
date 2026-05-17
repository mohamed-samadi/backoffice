import { createSlice } from "@reduxjs/toolkit";
import { fetchDashboard } from "../thunk/dashboardThunk";

const initialState = {
  data: null,
  loadingStates: {
    fetch: false,
  },
  error: null,
  success: false,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loadingStates.fetch = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loadingStates.fetch = false;
        state.data = action.payload;
        state.success = true;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loadingStates.fetch = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
