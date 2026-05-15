import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCompanies,
  fetchCompanyById,
    createCompany,
    updateCompany,
    deleteCompany
} from "../thunk/companiesThunk";


const initialState = {
  data: [],
  current: null,    
    loadingStates: {
    fetch: false,
    fetchOne: false,
    create: false,
    update: false,
    delete: false,
    },
    error: null,
    success: false,
};

const companiesSlice = createSlice({
  name: "companies",
  initialState,
    reducers: {
    clearError: (state) => {
      state.error = null;
    }
    ,
    clearSuccess: (state) => {
      state.success = false;    
    },
    resetCurrent: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loadingStates.fetch = true;
        state.error = null;
        })
        .addCase(fetchCompanies.fulfilled, (state, action) => {
            state.loadingStates.fetch = false;
            state.data = action.payload?.data || [];
        }
        )
        .addCase(fetchCompanies.rejected, (state, action) => {
            state.loadingStates.fetch = false;
            state.error = action.payload;
        });
    builder
      .addCase(fetchCompanyById.pending, (state) => {
        state.loadingStates.fetchOne = true;
        state.error = null;
        }
        )
        .addCase(fetchCompanyById.fulfilled, (state, action) => {
            state.loadingStates.fetchOne = false;
            state.current = action.payload || null;
        }
        )
        .addCase(fetchCompanyById.rejected, (state, action) => {
            state.loadingStates.fetchOne = false;
            state.error = action.payload;
        });
    builder
      .addCase(createCompany.pending, (state) => {
        state.loadingStates.create = true;
        state.error = null;
        }
        )
        .addCase(createCompany.fulfilled, (state, action) => {
            state.loadingStates.create = false;
            state.data.push(action.payload);
            state.success = true;
        }
        )
        .addCase(createCompany.rejected, (state, action) => {
            state.loadingStates.create = false;
            state.error = action.payload;
        });
    builder
      .addCase(updateCompany.pending, (state) => {
        state.loadingStates.update = true;
        state.error = null;
        }
        )
        .addCase(updateCompany.fulfilled, (state, action) => {
            state.loadingStates.update = false;
            const index = state.data.findIndex((company) => company.id === action.payload.id);
            if (index !== -1) {
                state.data[index] = action.payload;
            }   
            if (state.current?.id === action.payload.id) {
                state.current = action.payload;
            }   
            state.success = true;
        }   
        )
        .addCase(updateCompany.rejected, (state, action) => {
            state.loadingStates.update = false;
            state.error = action.payload;
        });
    builder
      .addCase(deleteCompany.pending, (state) => {
        state.loadingStates.delete = true;
        state.error = null;
        }
        )
        .addCase(deleteCompany.fulfilled, (state, action) => {
            state.loadingStates.delete = false;
            state.data = state.data.filter((company) => company.id !== action
.payload);
            if (state.current?.id === action.payload) {
                state.current = null;
            }   
            state.success = true;
        }
        )
        .addCase(deleteCompany.rejected, (state, action) => {
            state.loadingStates.delete = false;
            state.error = action.payload;
        });
    },  

});

export const { clearError, clearSuccess, resetCurrent } = companiesSlice.actions;
export default companiesSlice.reducer;