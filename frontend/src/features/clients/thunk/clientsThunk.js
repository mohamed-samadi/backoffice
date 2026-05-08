import {clientsApi} from "../api/clientsApi";
import { createAsyncThunk } from "@reduxjs/toolkit";
export const fetchClients = createAsyncThunk(
    "clients/fetchAll",
    async (params, { rejectWithValue }) => {
        try {
            const response = await clientsApi.getAll(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Erreur réseau");
        }
    }   
);
export const fetchClientById = createAsyncThunk(
    "clients/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await clientsApi.getById(id);
            return response.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || "Erreur réseau");
        }
    }
);
export const createClient = createAsyncThunk(
    "clients/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await clientsApi.create(payload);
            return response.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || "Erreur réseau");
        }
    }
);
export const updateClient = createAsyncThunk(
    "clients/update",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const response = await clientsApi.update(id, payload);
            return response.data;
        }
        catch(error){
            return rejectWithValue(error.response?.data || "Erreur réseau");    
        }       
    }
);
export const deleteClient = createAsyncThunk(
    "clients/delete",
    async (id, { rejectWithValue }) => {
        try {
            await clientsApi.delete(id);
            return id;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || "Erreur réseau");
        }   
    }
);
export const fetchActiveClients = createAsyncThunk(
    "clients/fetchActive",
    async (_, { rejectWithValue }) => {
        try {
            const response = await clientsApi.getActive();
            return response.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || "Erreur réseau");
        }   
    }
);
