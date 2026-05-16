import { createSlice } from "@reduxjs/toolkit";
import {
  fetchNotifications, fetchNotificationsCount,
  markNotificationAsRead, markAllNotificationsAsRead,
  deleteNotification, deleteAllNotifications,
} from "../thunk/notificationsThunk";

const initialState = {
  data:          [],
  meta:          { current_page: 1, last_page: 1, total: 0, per_page: 20 },
  nonLuesCount:  0,

  loadingStates: {
    fetch:          false,
    fetchCount:     false,
    markRead:       false,
    markAllRead:    false,
    delete:         false,
    deleteAll:      false,
  },

  error:   null,
  success: false,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearError:   (state) => { state.error   = null;  },
    clearSuccess: (state) => { state.success = false; },
  },
  extraReducers: (builder) => {

    // ── fetchNotifications ────────────────────────────────────────────
    builder
      .addCase(fetchNotifications.pending,   (state) => {
        state.loadingStates.fetch = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loadingStates.fetch = false;
        state.data           = action.payload?.data            || [];
        state.nonLuesCount   = action.payload?.non_lues_count  ?? state.nonLuesCount;
        if (action.payload?.meta) state.meta = action.payload.meta;
      })
      .addCase(fetchNotifications.rejected,  (state, action) => {
        state.loadingStates.fetch = false;
        state.error = action.payload;
      });

    // ── fetchNotificationsCount ───────────────────────────────────────
    builder
      .addCase(fetchNotificationsCount.pending,   (state) => {
        state.loadingStates.fetchCount = true;
      })
      .addCase(fetchNotificationsCount.fulfilled, (state, action) => {
        state.loadingStates.fetchCount = false;
        state.nonLuesCount = action.payload?.non_lues_count ?? 0;
      })
      .addCase(fetchNotificationsCount.rejected,  (state) => {
        state.loadingStates.fetchCount = false;
      });

    // ── markNotificationAsRead ────────────────────────────────────────
    builder
      .addCase(markNotificationAsRead.pending,   (state) => {
        state.loadingStates.markRead = true;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loadingStates.markRead = false;
        const notif = state.data.find((n) => n.id === action.payload);
        if (notif && !notif.lu) {
          notif.lu = true;
          state.nonLuesCount = Math.max(0, state.nonLuesCount - 1);
        }
        state.success = true;
      })
      .addCase(markNotificationAsRead.rejected,  (state, action) => {
        state.loadingStates.markRead = false;
        state.error = action.payload;
      });

    // ── markAllNotificationsAsRead ────────────────────────────────────
    builder
      .addCase(markAllNotificationsAsRead.pending,   (state) => {
        state.loadingStates.markAllRead = true;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.loadingStates.markAllRead = false;
        state.data         = state.data.map((n) => ({ ...n, lu: true }));
        state.nonLuesCount = 0;
        state.success      = true;
      })
      .addCase(markAllNotificationsAsRead.rejected,  (state, action) => {
        state.loadingStates.markAllRead = false;
        state.error = action.payload;
      });

    // ── deleteNotification ────────────────────────────────────────────
    builder
      .addCase(deleteNotification.pending,   (state) => {
        state.loadingStates.delete = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loadingStates.delete = false;
        const removed = state.data.find((n) => n.id === action.payload);
        state.data       = state.data.filter((n) => n.id !== action.payload);
        state.meta.total = Math.max(0, state.meta.total - 1);
        if (removed && !removed.lu) {
          state.nonLuesCount = Math.max(0, state.nonLuesCount - 1);
        }
        state.success = true;
      })
      .addCase(deleteNotification.rejected,  (state, action) => {
        state.loadingStates.delete = false;
        state.error = action.payload;
      });

    // ── deleteAllNotifications ────────────────────────────────────────
    builder
      .addCase(deleteAllNotifications.pending,   (state) => {
        state.loadingStates.deleteAll = true;
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.loadingStates.deleteAll = false;
        state.data         = [];
        state.meta.total   = 0;
        state.nonLuesCount = 0;
        state.success      = true;
      })
      .addCase(deleteAllNotifications.rejected,  (state, action) => {
        state.loadingStates.deleteAll = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = notificationsSlice.actions;
export default notificationsSlice.reducer;