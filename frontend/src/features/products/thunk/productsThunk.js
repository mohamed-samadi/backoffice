import { createAsyncThunk } from "@reduxjs/toolkit";
import { productsApi } from "../api/productsApi";

// ── Liste paginée (search, filtres, pagination) ───────────────────────────
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productsApi.getAll(params);
      return response.data; // { success, data, meta, stats }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ── Détail d'un produit ───────────────────────────────────────────────────
export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await productsApi.getById(id);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ── CRUD ──────────────────────────────────────────────────────────────────
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await productsApi.create(formData);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await productsApi.update(id, formData);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await productsApi.delete(id);
      return id; // retourne l'id pour filtrer dans le slice
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ── Routes spéciales ──────────────────────────────────────────────────────
// Stocké dans byCategory — ne touche pas state.data
export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchProductsByCategory",
  async ({ categoryId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await productsApi.byCategory(categoryId, params);
      return response.data; // { success, data, meta }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Stocké dans byFournisseur — ne touche pas state.data
export const fetchProductsByFournisseur = createAsyncThunk(
  "products/fetchProductsByFournisseur",
  async ({ fournisseurId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await productsApi.byFournisseur(fournisseurId, params);
      return response.data; // { success, data, meta }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Stocké dans lowStock — ne touche pas state.data
export const fetchLowStockProducts = createAsyncThunk(
  "products/fetchLowStockProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productsApi.lowStock(params);
      return response.data; // { success, threshold, data, meta }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);