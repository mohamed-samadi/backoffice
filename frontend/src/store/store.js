import { configureStore } from "@reduxjs/toolkit";
import categoriesReducer from "../features/categories/slice/categoriesSlice";
import productsReducer from "../features/products/slice/productsSlice";
import fournisseurReducer from "../features/fournisseur/slice/fournisseurSlice";
import tasksReducer from "../features/tasks/slice/tasksSlice";
import documentsReducer from "../features/documents/slice/documentsSlice";
import chequesReducer from "../features/cheques/slice/chequesSlice";
import clientsReducer from "../features/clients/slice/clientsSlice";
import creditsReducer from "../features/credits/slice/creditsSlice";
export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    products: productsReducer,
    fournisseur: fournisseurReducer,
    clients: clientsReducer,
    tasks: tasksReducer,
        cheques:    chequesReducer,
    documents: documentsReducer,
    credits: creditsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore async thunk errors which may contain non-serializable values
        ignoredActions: [
          "categories/fetchCategories/rejected",
          "products/fetchProducts/rejected",

          "tasks/fetchTasks/rejected",

          "documents/fetchDocuments/rejected",
        ],
      },
    }),
});

export default store;
