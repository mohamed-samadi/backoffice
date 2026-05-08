import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import HomePage from "../pages/home/HomePage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import FournisseurPage from "../pages/fournisseurs/FournisseurPage";
import ProductPage from "../pages/products/ProductsPage";

import TasksPage from "../pages/tasks/TasksPage";
import TaskCategoriesPage from "../pages/tasks/TaskCategoriesPage";

import DocumentsPage from "../pages/documents/DocumentsPage";
import DocumentDetailPage from "../pages/documents/DocumentDetailPage";
import ChequesPage from "../pages/cheques/ChequesPage";
const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/fournisseurs" element={<FournisseurPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/cheques" element={<ChequesPage />} />

          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/task-categories" element={<TaskCategoriesPage />} />

          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/document/:id" element={<DocumentDetailPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
