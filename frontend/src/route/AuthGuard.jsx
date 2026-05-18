import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { fetchMe } from "../features/auth/slice/authSlice";

export default function AuthGuard() {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitializing } = useSelector((s) => s.auth);

  // ✅ Vérifie si l'utilisateur est connecté au chargement
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  // ✅ Affiche un loader pendant la vérification
  if (isInitializing) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#0a0b0f", color: "#64748b",
        fontSize: "14px", gap: "12px",
      }}>
        <div style={{
          width: 24, height: 24,
          border: "2px solid #1e2230", borderTopColor: "#4f7fff",
          borderRadius: "50%", animation: "spin .8s linear infinite",
        }} />
        Chargement…
      </div>
    );
  }

  // ✅ Redirige vers login si non connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}