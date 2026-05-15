import { createAsyncThunk } from "@reduxjs/toolkit";
import { chequesApi } from "../api/chequesApi";

// ── Liste paginée ─────────────────────────────────────────────────────────
export const fetchCheques = createAsyncThunk(
  "cheques/fetchCheques",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await chequesApi.getAll(params);
      return response.data; // { success, stats, data, meta }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchbanques = createAsyncThunk(
  "cheques/fetchbanques",
  async (_, { rejectWithValue }) => {
    try {
      const response = await chequesApi.getbanque();
      return response.data; // { success, data }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
// ── Détail ────────────────────────────────────────────────────────────────
export const fetchChequeById = createAsyncThunk(
  "cheques/fetchChequeById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await chequesApi.getById(id);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ── Create ────────────────────────────────────────────────────────────────
export const createCheque = createAsyncThunk(
  "cheques/createCheque",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await chequesApi.create(formData);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ── Update ────────────────────────────────────────────────────────────────
export const updateCheque = createAsyncThunk(
  "cheques/updateCheque",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await chequesApi.update(id, formData);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ── Delete ────────────────────────────────────────────────────────────────
export const deleteCheque = createAsyncThunk(
  "cheques/deleteCheque",
  async (id, { rejectWithValue }) => {
    try {
      await chequesApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ── Actions métier ────────────────────────────────────────────────────────
export const encaisserCheque = createAsyncThunk(
  "cheques/encaisserCheque",
  async (id, { rejectWithValue }) => {
    try {
      const response = await chequesApi.encaisser(id);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const marquerImpayeCheque = createAsyncThunk(
  "cheques/marquerImpayeCheque",
  async (id, { rejectWithValue }) => {
    try {
      const response = await chequesApi.marquerImpaye(id);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const annulerCheque = createAsyncThunk(
  "cheques/annulerCheque",
  async (id, { rejectWithValue }) => {
    try {
      const response = await chequesApi.annuler(id);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchEcheancesProches = createAsyncThunk(
  "cheques/fetchEcheancesProches",
  async (jours = 7, { rejectWithValue }) => {
    try {
      const response = await chequesApi.echeancesProches(jours);
      return response.data; // { success, data, count }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
export const fetchChequesByClient = createAsyncThunk(
  "cheques/fetchChequesByClient",
  async ({ clientId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await chequesApi.getByClient(clientId, params);
      return response.data; // { success, stats, data, meta }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
