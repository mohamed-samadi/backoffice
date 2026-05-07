import { configureStore } from "@reduxjs/toolkit";
import categoriesReducer from "../features/categories/slice/categoriesSlice";
import productsReducer from "../features/products/slice/productsSlice";
import fournisseurReducer from "../features/fournisseur/slice/fournisseurSlice";
import documentsReducer from "../features/documents/slice/documentsSlice";

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    products: productsReducer,
    fournisseur: fournisseurReducer,
    documents: documentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore async thunk errors which may contain non-serializable values
        ignoredActions: [
          "categories/fetchCategories/rejected",
          "products/fetchProducts/rejected",
          "documents/fetchDocuments/rejected",
        ],
      },
    }),
});

export default store;
