import { createSlice } from "@reduxjs/toolkit"; // Correction: import { createSlice }
import {
  fetchClients,
  fetchClientById,
  createClient,
  updateClient,
  deleteClient,
  fetchActiveClients,
} from "../thunk/clientsThunk";

const initialState = {
    data: [],
    current: null,
    activeClients: [],
    meta: { current_page: 1, last_page: 1, total: 0, per_page: 10 },
    loadingStates: {
        fetch: false,
        fetchOne: false,
        create: false,
        update: false,
        delete: false,
        fetchActive: false,
    },
    error: null,
    success: false,
};

const clientsSlice = createSlice({
    name: "clients",
    initialState,
    reducers: {
        clearError: (state) => { state.error = null; },
        clearSuccess: (state) => { state.success = false; },
        resetCurrent: (state) => { state.current = null; },
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch all ---
            .addCase(fetchClients.pending, (state) => {
                state.loadingStates.fetch = true;   
                state.error = null;
            })
            .addCase(fetchClients.fulfilled, (state, action) => {
                state.loadingStates.fetch = false;
                state.data = action.payload.data || [];
                state.meta = action.payload.meta || initialState.meta;
            })
            .addCase(fetchClients.rejected, (state, action) => {
                state.loadingStates.fetch = false;
                state.error = action.payload || action.error.message;
            })

            // --- Fetch Active ---
            .addCase(fetchActiveClients.pending, (state) => {
                state.loadingStates.fetchActive = true; 
                state.error = null;
            })
            .addCase(fetchActiveClients.fulfilled, (state, action) => {
                state.loadingStates.fetchActive = false;
                state.activeClients = action.payload.data || [];
            })
            .addCase(fetchActiveClients.rejected, (state, action) => {
                state.loadingStates.fetchActive = false;
                state.error = action.payload || action.error.message;
            })

            // --- Fetch by ID ---
            .addCase(fetchClientById.pending, (state) => {
                state.loadingStates.fetchOne = true;
                state.error = null;
            })
            .addCase(fetchClientById.fulfilled, (state, action) => {
                state.loadingStates.fetchOne = false;
                state.current = action.payload.data || action.payload;
            })
            .addCase(fetchClientById.rejected, (state, action) => {
                state.loadingStates.fetchOne = false;
                state.error = action.payload || action.error.message;
            })

            // --- Create ---
            .addCase(createClient.pending, (state) => {
                state.loadingStates.create = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createClient.fulfilled, (state, action) => {
                state.loadingStates.create = false;
                // On ajoute le nouveau client au début de la liste
                state.data.unshift(action.payload.data || action.payload);
                state.success = true;
            })
            .addCase(createClient.rejected, (state, action) => {
                state.loadingStates.create = false;
                state.error = action.payload || action.error.message;
            })

            // --- Update ---
            .addCase(updateClient.pending, (state) => {
                state.loadingStates.update = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateClient.fulfilled, (state, action) => {
                state.loadingStates.update = false;
                const updatedClient = action.payload.data || action.payload;
                // Mise à jour dans la liste data
                const index = state.data.findIndex(c => c.id === updatedClient.id);
                if (index !== -1) {
                    state.data[index] = updatedClient;
                }
                // Mise à jour du client actuel s'il est chargé
                state.current = updatedClient;
                state.success = true;
            })
            .addCase(updateClient.rejected, (state, action) => {
                state.loadingStates.update = false;
                state.error = action.payload || action.error.message;
            })

            // --- Delete ---
            .addCase(deleteClient.pending, (state) => {
                state.loadingStates.delete = true;
                state.error = null;
            })
            .addCase(deleteClient.fulfilled, (state, action) => {
                state.loadingStates.delete = false;
                // On filtre pour retirer le client supprimé (l'id est retourné par le thunk)
                state.data = state.data.filter(c => c.id !== action.payload);
                state.success = true;
            })
            .addCase(deleteClient.rejected, (state, action) => {
                state.loadingStates.delete = false;
                state.error = action.payload || action.error.message;
            });
    }
});

export const { clearError, clearSuccess, resetCurrent } = clientsSlice.actions;
export default clientsSlice.reducer;