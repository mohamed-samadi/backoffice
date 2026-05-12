// creditsTrunk
import { createAsyncThunk } from "@reduxjs/toolkit";
import { creditsApi } from "../api/creditsApi";

// ─── Liste paginée ────────────────────────────────────────────────────────
export const fetchCredits = createAsyncThunk(
  "credits/fetchCredits",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await creditsApi.getAll(params);
      return response.data; // { success, stats, data, meta }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Détail ───────────────────────────────────────────────────────────────
export const fetchCreditById = createAsyncThunk(
  "credits/fetchCreditById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await creditsApi.getById(id);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Création ─────────────────────────────────────────────────────────────
export const createCredit = createAsyncThunk(
  "credits/createCredit",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await creditsApi.create(payload);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Mise à jour ──────────────────────────────────────────────────────────
export const updateCredit = createAsyncThunk(
  "credits/updateCredit",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await creditsApi.update(id, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Suppression ──────────────────────────────────────────────────────────
export const deleteCredit = createAsyncThunk(
  "credits/deleteCredit",
  async (id, { rejectWithValue }) => {
    try {
      await creditsApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Paiement partiel ─────────────────────────────────────────────────────
export const enregistrerPaiement = createAsyncThunk(
  "credits/enregistrerPaiement",
  async ({ id, montant }, { rejectWithValue }) => {
    try {
      const response = await creditsApi.enregistrerPaiement(id, montant);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Générer numéro (preview) ─────────────────────────────────────────────
export const generateNumeroCredit = createAsyncThunk(
  "credits/generateNumero",
  async (_, { rejectWithValue }) => {
    try {
      const response = await creditsApi.generateNumero();
      return response.data?.numero_credit || "";
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Crédits en retard ────────────────────────────────────────────────────
// ✅ Stocké dans enRetardList — ne touche pas state.data (liste principale)
export const fetchCreditsEnRetard = createAsyncThunk(
  "credits/fetchCreditsEnRetard",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await creditsApi.getEnRetard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);