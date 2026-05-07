import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import HomePage from "../pages/home/HomePage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import FournisseurPage from "../pages/fournisseurs/FournisseurPage";
import ProductPage from "../pages/products/ProductsPage";
const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/fournisseurs" element={<FournisseurPage />} />
          <Route path="/products" element={<ProductPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
