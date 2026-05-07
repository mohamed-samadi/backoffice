import { createSlice } from "@reduxjs/toolkit";
import {
  fetchTasks, fetchTaskById, createTask, updateTask,
  deleteTask, updateTaskStatus, fetchOverdueTasks,
  fetchTaskCategories, fetchActiveTaskCategories,
  createTaskCategory, updateTaskCategory, deleteTaskCategory,
} from "../thunk/tasksThunk";

const initialState = {
  // ── Tasks ────────────────────────────────────────────────────────────
  data: [],
  meta: { current_page: 1, last_page: 1, total: 0, per_page: 10 },
  stats: { total: 0, todo: 0, in_progress: 0, completed: 0, urgent: 0, overdue: 0 },
  current: null,
  overdueTasks: [],
  overdueTasksMeta: null,

  // ── Task Categories ───────────────────────────────────────────────────
  categories: [],         // liste complète (TaskCategoriesPage)
  activeCategories: [],   // liste légère pour selects

  loadingStates: {
    fetch: false,
    fetchOne: false,
    create: false,
    update: false,
    delete: false,
    updateStatus: false,
    fetchOverdue: false,
    fetchCategories: false,
    fetchActiveCategories: false,
    createCategory: false,
    updateCategory: false,
    deleteCategory: false,
  },

  error: null,
  success: false,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearError:        (state) => { state.error = null; },
    clearSuccess:      (state) => { state.success = false; },
    resetCurrent:      (state) => { state.current = null; },
    resetOverdue:      (state) => { state.overdueTasks = []; state.overdueTasksMeta = null; },
  },
  extraReducers: (builder) => {

    // ── fetchTasks ────────────────────────────────────────────────────
    builder
      .addCase(fetchTasks.pending,    (state) => { state.loadingStates.fetch = true;  state.error = null; })
      .addCase(fetchTasks.fulfilled,  (state, action) => {
        state.loadingStates.fetch = false;
        state.data  = action.payload?.data  || [];
        if (action.payload?.meta)  state.meta  = action.payload.meta;
        if (action.payload?.stats) state.stats = action.payload.stats;
      })
      .addCase(fetchTasks.rejected,   (state, action) => { state.loadingStates.fetch = false; state.error = action.payload; });

    // ── fetchTaskById ─────────────────────────────────────────────────
    builder
      .addCase(fetchTaskById.pending,   (state) => { state.loadingStates.fetchOne = true;  state.error = null; })
      .addCase(fetchTaskById.fulfilled, (state, action) => { state.loadingStates.fetchOne = false; state.current = action.payload; })
      .addCase(fetchTaskById.rejected,  (state, action) => { state.loadingStates.fetchOne = false; state.error = action.payload; });

    // ── createTask ────────────────────────────────────────────────────
    builder
      .addCase(createTask.pending,   (state) => { state.loadingStates.create = true; state.error = null; })
      .addCase(createTask.fulfilled, (state) => {
        state.loadingStates.create = false;
        state.meta.total += 1;
        state.stats.total += 1;
        state.stats.todo  += 1;
        state.success = true;
      })
      .addCase(createTask.rejected,  (state, action) => { state.loadingStates.create = false; state.error = action.payload; });

    // ── updateTask ────────────────────────────────────────────────────
    builder
      .addCase(updateTask.pending,   (state) => { state.loadingStates.update = true; state.error = null; })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loadingStates.update = false;
        const index = state.data.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.data[index] = action.payload;
        state.current = action.payload;
        state.success = true;
      })
      .addCase(updateTask.rejected,  (state, action) => { state.loadingStates.update = false; state.error = action.payload; });

    // ── deleteTask ────────────────────────────────────────────────────
    builder
      .addCase(deleteTask.pending,   (state) => { state.loadingStates.delete = true; state.error = null; })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loadingStates.delete = false;
        const removed = state.data.find((t) => t.id === action.payload);
        state.data = state.data.filter((t) => t.id !== action.payload);
        state.meta.total = Math.max(0, state.meta.total - 1);
        if (removed) {
          state.stats.total = Math.max(0, state.stats.total - 1);
          if (removed.status === 'todo')        state.stats.todo        = Math.max(0, state.stats.todo - 1);
          if (removed.status === 'in_progress') state.stats.in_progress = Math.max(0, state.stats.in_progress - 1);
          if (removed.status === 'completed')   state.stats.completed   = Math.max(0, state.stats.completed - 1);
        }
        state.success = true;
      })
      .addCase(deleteTask.rejected,  (state, action) => { state.loadingStates.delete = false; state.error = action.payload; });

    // ── updateTaskStatus ──────────────────────────────────────────────
    builder
      .addCase(updateTaskStatus.pending,   (state) => { state.loadingStates.updateStatus = true; state.error = null; })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loadingStates.updateStatus = false;
        const index = state.data.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.data[index] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
        state.success = true;
      })
      .addCase(updateTaskStatus.rejected,  (state, action) => { state.loadingStates.updateStatus = false; state.error = action.payload; });

    // ── fetchOverdueTasks ─────────────────────────────────────────────
    builder
      .addCase(fetchOverdueTasks.pending,   (state) => { state.loadingStates.fetchOverdue = true; state.error = null; })
      .addCase(fetchOverdueTasks.fulfilled, (state, action) => {
        state.loadingStates.fetchOverdue = false;
        state.overdueTasks    = action.payload?.data || [];
        state.overdueTasksMeta = action.payload?.meta || null;
      })
      .addCase(fetchOverdueTasks.rejected,  (state, action) => { state.loadingStates.fetchOverdue = false; state.error = action.payload; });

    // ── fetchTaskCategories ───────────────────────────────────────────
    builder
      .addCase(fetchTaskCategories.pending,   (state) => { state.loadingStates.fetchCategories = true; state.error = null; })
      .addCase(fetchTaskCategories.fulfilled, (state, action) => {
        state.loadingStates.fetchCategories = false;
        state.categories = action.payload || [];
      })
      .addCase(fetchTaskCategories.rejected,  (state, action) => { state.loadingStates.fetchCategories = false; state.error = action.payload; });

    // ── fetchActiveTaskCategories ─────────────────────────────────────
    builder
      .addCase(fetchActiveTaskCategories.pending,   (state) => { state.loadingStates.fetchActiveCategories = true; })
      .addCase(fetchActiveTaskCategories.fulfilled, (state, action) => {
        state.loadingStates.fetchActiveCategories = false;
        state.activeCategories = action.payload || [];
      })
      .addCase(fetchActiveTaskCategories.rejected,  (state, action) => { state.loadingStates.fetchActiveCategories = false; state.error = action.payload; });

    // ── createTaskCategory ────────────────────────────────────────────
    builder
      .addCase(createTaskCategory.pending,   (state) => { state.loadingStates.createCategory = true; state.error = null; })
      .addCase(createTaskCategory.fulfilled, (state, action) => {
        state.loadingStates.createCategory = false;
        state.categories.push(action.payload);
        state.success = true;
      })
      .addCase(createTaskCategory.rejected,  (state, action) => { state.loadingStates.createCategory = false; state.error = action.payload; });

    // ── updateTaskCategory ────────────────────────────────────────────
    builder
      .addCase(updateTaskCategory.pending,   (state) => { state.loadingStates.updateCategory = true; state.error = null; })
      .addCase(updateTaskCategory.fulfilled, (state, action) => {
        state.loadingStates.updateCategory = false;
        const index = state.categories.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.categories[index] = action.payload;
        state.success = true;
      })
      .addCase(updateTaskCategory.rejected,  (state, action) => { state.loadingStates.updateCategory = false; state.error = action.payload; });

    // ── deleteTaskCategory ────────────────────────────────────────────
    builder
      .addCase(deleteTaskCategory.pending,   (state) => { state.loadingStates.deleteCategory = true; state.error = null; })
      .addCase(deleteTaskCategory.fulfilled, (state, action) => {
        state.loadingStates.deleteCategory = false;
        state.categories = state.categories.filter((c) => c.id !== action.payload);
        state.success = true;
      })
      .addCase(deleteTaskCategory.rejected,  (state, action) => { state.loadingStates.deleteCategory = false; state.error = action.payload; });
  },
});

export const { clearError, clearSuccess, resetCurrent, resetOverdue } = tasksSlice.actions;
export default tasksSlice.reducer;