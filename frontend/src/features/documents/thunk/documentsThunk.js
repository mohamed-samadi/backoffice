import { createAsyncThunk } from "@reduxjs/toolkit";
import { documentsApi } from "../api/documentsApi";

export const fetchDocuments = createAsyncThunk(
  "documents/fetchDocuments",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Ensure page defaults to 1 if not specified
      const requestParams = { ...params };
      if (!requestParams.page) requestParams.page = 1;
      
      const response = await documentsApi.getAll(requestParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchStats = createAsyncThunk(
  "documents/fetchStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await documentsApi.getStats(params);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  "documents/fetchDocumentById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await documentsApi.getById(id);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createDocument = createAsyncThunk(
  "documents/createDocument",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await documentsApi.create(payload);
      const document = response.data?.data || response.data;
      return {
        data: document,
        message: response.data?.message || "Document créé avec succès."
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateDocument = createAsyncThunk(
  "documents/updateDocument",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await documentsApi.update(id, data);
      const document = response.data?.data || response.data;
      return {
        data: document,
        message: response.data?.message || "Document mis à jour avec succès."
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteDocument = createAsyncThunk(
  "documents/deleteDocument",
  async (id, { rejectWithValue }) => {
    try {
      await documentsApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);