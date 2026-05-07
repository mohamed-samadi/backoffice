import { configureStore } from "@reduxjs/toolkit";
import categoriesReducer from "../features/categories/slice/categoriesSlice";
import productsReducer from "../features/products/slice/productsSlice";
import fournisseurReducer from "../features/fournisseur/slice/fournisseurSlice";
import tasksReducer from "../features/tasks/slice/tasksSlice";
export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    products: productsReducer,
    fournisseur: fournisseurReducer,
     tasks:      tasksReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore async thunk errors which may contain non-serializable values
        ignoredActions: [
          "categories/fetchCategories/rejected",
          "products/fetchProducts/rejected",
          "tasks/fetchTasks/rejected",
        ],
      },
    }),
});

export default store;
