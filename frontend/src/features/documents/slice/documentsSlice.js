import { createSlice } from "@reduxjs/toolkit";
import {
  fetchDocuments,
  fetchStats,
  fetchDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../thunk/documentsThunk";

const initialState = {
  data: [],
  current: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  },
  stats: {
    total: 0,
    factures: 0,
    devis: 0,
    bon_livraison: 0,
    payes: 0,
    impayes: 0,
    total_ttc: 0,
    reste_a_payer: 0,
  },
  loadingStates: {
    fetch: false,
    fetchStats: false,
    fetchOne: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
  success: false,
};

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetCurrent: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loadingStates.fetch = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loadingStates.fetch = false;
        state.data = action.payload?.data || [];
        if (action.payload?.meta) {
          state.pagination = {
            currentPage: action.payload.meta.current_page || 1,
            lastPage: action.payload.meta.last_page || 1,
            total: action.payload.meta.total || 0,
            perPage: action.payload.meta.per_page || 10,
          };
        }
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loadingStates.fetch = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchStats.pending, (state) => {
        state.loadingStates.fetchStats = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loadingStates.fetchStats = false;
        state.stats = action.payload || state.stats;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loadingStates.fetchStats = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchDocumentById.pending, (state) => {
        state.loadingStates.fetchOne = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loadingStates.fetchOne = false;
        state.current = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loadingStates.fetchOne = false;
        state.error = action.payload;
      });

    builder
      .addCase(createDocument.pending, (state) => {
        state.loadingStates.create = true;
        state.error = null;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.loadingStates.create = false;
        if (action.payload?.id) {
          state.data.unshift(action.payload);
        }
        state.success = true;
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.loadingStates.create = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateDocument.pending, (state) => {
        state.loadingStates.update = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loadingStates.update = false;
        const index = state.data.findIndex((document) => document.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.current = action.payload;
        state.success = true;
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loadingStates.update = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteDocument.pending, (state) => {
        state.loadingStates.delete = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loadingStates.delete = false;
        state.data = state.data.filter((document) => document.id !== action.payload);
        state.success = true;
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loadingStates.delete = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetCurrent } = documentsSlice.actions;
export default documentsSlice.reducer;