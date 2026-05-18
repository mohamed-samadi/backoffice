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

  const normalizeCompaniesList = (payload) => {
    const hasDataKey = payload && Object.prototype.hasOwnProperty.call(payload, "data");
    const data = hasDataKey ? payload.data : payload ?? [];

    if (Array.isArray(data)) {
      return data;
    }

    return data ? [data] : [];
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
          state.data = normalizeCompaniesList(action.payload);
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
          const company = action.payload?.data ?? action.payload;

          if (Array.isArray(state.data)) {
            state.data.push(company);
          } else {
            state.data = company ? [company] : [];
          }

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
          const company = action.payload?.data ?? action.payload;
          const companies = Array.isArray(state.data) ? state.data : normalizeCompaniesList(state.data);
          const index = companies.findIndex((item) => item.id === company?.id);

          if (index !== -1) {
            companies[index] = company;
          } else if (company) {
            companies.push(company);
            }   
          state.data = companies;

            if (state.current?.id === company?.id) {
            state.current = company;
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
          const companyId = action.payload?.data?.id ?? action.payload;
          const companies = Array.isArray(state.data) ? state.data : normalizeCompaniesList(state.data);
          state.data = companies.filter((company) => company.id !== companyId);
            if (state.current?.id === companyId) {
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