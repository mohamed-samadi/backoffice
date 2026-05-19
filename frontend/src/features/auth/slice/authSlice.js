import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";

// ── Thunks ────────────────────────────────────────────────────────────────
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      // ✅ Étape 1 : récupérer le cookie CSRF
      await authApi.getCsrfCookie();
      // ✅ Étape 2 : login
      const response = await authApi.login(credentials);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors?.email?.[0] ||
        error.response?.data?.message ||
        "Erreur de connexion."
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.me();
      return response.data.user;
    } catch {
      return rejectWithValue(null);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      await authApi.getCsrfCookie();
      const response = await authApi.register(payload);
      return response.data.user;
    } catch (error) {
      const errors = error.response?.data?.errors;
      return rejectWithValue(
        errors?.email?.[0] ||
        errors?.password?.[0] ||
        errors?.name?.[0] ||
        error.response?.data?.message ||
        "Erreur lors de la creation du compte."
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(payload);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errors ||
        "Erreur lors de la mise a jour du profil."
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:          null,
    isAuthenticated: false,
    isLoading:     false,
    isInitializing:true, // ✅ true au démarrage — attend fetchMe
    error:         null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {

    // ── login ────────────────────────────────────────────────
    builder
      .addCase(login.pending,   (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading      = false;
        state.isAuthenticated= true;
        state.user           = action.payload;
        state.error          = null;
      })
      .addCase(login.rejected,  (state, action) => {
        state.isLoading      = false;
        state.isAuthenticated= false;
        state.user           = null;
        state.error          = action.payload;
      });

    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      });

    // ── logout ───────────────────────────────────────────────
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user           = null;
        state.isAuthenticated= false;
        state.error          = null;
      })
      .addCase(logout.rejected, (state) => {
        // Déconnexion locale même si l'API échoue
        state.user           = null;
        state.isAuthenticated= false;
      });

    // ── fetchMe ──────────────────────────────────────────────
    builder
      .addCase(fetchMe.pending,   (state) => {
        state.isInitializing = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.isAuthenticated= true;
        state.user           = action.payload;
      })
      .addCase(fetchMe.rejected,  (state) => {
        state.isInitializing = false;
        state.isAuthenticated= false;
        state.user           = null;
      });

    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
