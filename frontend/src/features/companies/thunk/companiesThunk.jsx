import { createAsyncThunk } from "@reduxjs/toolkit";
import {companiesApi} from "../api/companiesApi";

// ── Liste paginée ─────────────────────────────────────────────────────────
export const fetchCompanies = createAsyncThunk(
  "companies/fetchCompanies",
    async (params = {}, { rejectWithValue }) => {
    try {
      const response = await companiesApi.getAll(params);
      return response.data; // { success, stats, data, meta }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }   
    }   
);

// ── Détail ────────────────────────────────────────────────────────────────

export const fetchCompanyById = createAsyncThunk(
  "companies/fetchCompanyById",
  async (id, { rejectWithValue }) => {  
    try {
      const response = await companiesApi.getById(id);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }   
    }
);

// ── Create ────────────────────────────────────────────────────────────────
export const createCompany = createAsyncThunk(
  "companies/createCompany",
  async (payload, { rejectWithValue }) => { 
    try {
      const response = await companiesApi.create(payload);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }       

    }   
);

// ── Update ────────────────────────────────────────────────────────────────
export const updateCompany = createAsyncThunk(
  "companies/updateCompany",
    async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await companiesApi.update(id, payload);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }   
    }
);

// ── Delete ────────────────────────────────────────────────────────────────
export const deleteCompany = createAsyncThunk(
  "companies/deleteCompany",
  async (id, { rejectWithValue }) => {
    try {
      const response = await companiesApi.delete(id);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
    }
);