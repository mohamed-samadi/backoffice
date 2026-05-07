import { createAsyncThunk } from "@reduxjs/toolkit";
import { tasksApi, taskCategoriesApi } from "../api/tasksApi";

// ── Tasks ─────────────────────────────────────────────────────────────────
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await tasksApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  "tasks/fetchTaskById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await tasksApi.getById(id);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await tasksApi.create(payload);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await tasksApi.update(id, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id, { rejectWithValue }) => {
    try {
      await tasksApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  "tasks/updateTaskStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await tasksApi.updateStatus(id, status);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOverdueTasks = createAsyncThunk(
  "tasks/fetchOverdueTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await tasksApi.overdue(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ── Task Categories ───────────────────────────────────────────────────────
export const fetchTaskCategories = createAsyncThunk(
  "tasks/fetchTaskCategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskCategoriesApi.getAll(params);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchActiveTaskCategories = createAsyncThunk(
  "tasks/fetchActiveTaskCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await taskCategoriesApi.active();
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createTaskCategory = createAsyncThunk(
  "tasks/createTaskCategory",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await taskCategoriesApi.create(payload);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTaskCategory = createAsyncThunk(
  "tasks/updateTaskCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskCategoriesApi.update(id, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTaskCategory = createAsyncThunk(
  "tasks/deleteTaskCategory",
  async (id, { rejectWithValue }) => {
    try {
      await taskCategoriesApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);