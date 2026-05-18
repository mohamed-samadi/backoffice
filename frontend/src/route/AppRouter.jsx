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
import ClientsPage from "../pages/clients/ClientsPage";
import CreditsPage from "../pages/credits/CreditsPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import CompanyPage from "../pages/companies/CompanyPage";
import AuthGuard from "./AuthGuard";
import LoginPage from "../pages/login/LoginPage.jsx";
const AppRouter = () => {
  return (
    <Router>
      <Routes>
         <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<HomePage />} />

          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/fournisseurs" element={<FournisseurPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/cheques" element={<ChequesPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/task-categories" element={<TaskCategoriesPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/new" element={<DocumentDetailPage mode="create" />} />
          <Route path="/documents/:id/edit" element={<DocumentDetailPage mode="edit" />} />
          <Route path="/documents/:id" element={<DocumentDetailPage mode="view" />} />
          <Route path="/document/:id" element={<DocumentDetailPage mode="view" />} />
          <Route path="/companies" element={<CompanyPage />} />
        </Route>
          </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
