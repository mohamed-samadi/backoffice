import { createAsyncThunk } from "@reduxjs/toolkit";
import { categoriesApi } from "../api/categoriesApi";

// ─── Liste paginée (inclut search via params) ─────────────────────────────
// ✅ searchCategories supprimé — la recherche passe par fetchCategories({ search: query })
//    Le controller n'a pas de route /search séparée
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await categoriesApi.getAll(params);
      return response.data; // { success, data, meta, stats }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Détail d'une catégorie ───────────────────────────────────────────────
export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await categoriesApi.getById(id);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── CRUD ─────────────────────────────────────────────────────────────────
export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await categoriesApi.create(payload);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await categoriesApi.update(id, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await categoriesApi.delete(id);
      return id; // retourne l'id pour filtrer dans le slice
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Liste active légère (dropdowns) ─────────────────────────────────────
// ✅ Stocké dans activeList — ne touche pas state.data (liste paginée)
export const fetchActiveCategories = createAsyncThunk(
  "categories/fetchActiveCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoriesApi.getActive();
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Liste active avec products_count (dashboard) ────────────────────────
// ✅ Stocké dans activeWithCount — ne touche pas state.data
export const fetchCategoriesWithProductCount = createAsyncThunk(
  "categories/fetchCategoriesWithProductCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoriesApi.withProductCount();
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Bulk update statut ───────────────────────────────────────────────────
export const bulkUpdateCategoryStatus = createAsyncThunk(
  "categories/bulkUpdateStatus",
  async ({ ids, isActive }, { rejectWithValue }) => {
    try {
      const response = await categoriesApi.bulkUpdateStatus(ids, isActive);
      // On retourne ids + isActive pour mettre à jour le slice localement
      return { ids, isActive, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);