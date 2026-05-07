import { createAsyncThunk } from "@reduxjs/toolkit";
import { fournisseurApi } from "../api/fournisseurApi";

// ─── Fetch list (avec pagination/filtres) ────────────────────────────────────
export const fetchFournisseurs = createAsyncThunk(
  "fournisseur/fetchFournisseurs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fournisseurApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Fetch one ───────────────────────────────────────────────────────────────
export const fetchFournisseurById = createAsyncThunk(
  "fournisseur/fetchFournisseurById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fournisseurApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const fetchActiveFournisseurs = createAsyncThunk(
  "fournisseur/fetchActiveFournisseurs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fournisseurApi.getActive();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// ─── Create ──────────────────────────────────────────────────────────────────
// ✅ Après création, le composant doit refetch la liste pour respecter la pagination
export const createFournisseur = createAsyncThunk(
  "fournisseur/createFournisseur",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await fournisseurApi.create(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Update ──────────────────────────────────────────────────────────────────
export const updateFournisseur = createAsyncThunk(
  "fournisseur/updateFournisseur",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await fournisseurApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Delete ──────────────────────────────────────────────────────────────────
export const deleteFournisseur = createAsyncThunk(
  "fournisseur/deleteFournisseur",
  async (id, { rejectWithValue }) => {
    try {
      await fournisseurApi.delete(id);
      return id; // ✅ Retourne l'id pour filtrer dans le slice
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Search (backend) ────────────────────────────────────────────────────────
export const searchFournisseurs = createAsyncThunk(
  "fournisseur/searchFournisseurs",
  async (query, { rejectWithValue }) => {
    try {
      const response = await fournisseurApi.search(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);