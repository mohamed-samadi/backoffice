import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../features/dashboard/thunk/dashboardThunk";
import { clearDashboardError } from "../features/dashboard/slice/dashboardSlice";
import {
  selectDashboardAlerts,
  selectDashboardAnalytics,
  selectDashboardData,
  selectDashboardError,
  selectDashboardFinance,
  selectDashboardLoading,
  selectDashboardRecentDocuments,
  selectDashboardRecentUsers,
  selectDashboardStock,
  selectDashboardSummary,
  selectDashboardTasks,
} from "../features/dashboard/selectors/dashboardSelectors";

export const useDashboard = () => {
  const dispatch = useDispatch();

  return {
    dashboard: useSelector(selectDashboardData),
    summary: useSelector(selectDashboardSummary),
    finance: useSelector(selectDashboardFinance),
    stock: useSelector(selectDashboardStock),
    tasks: useSelector(selectDashboardTasks),
    analytics: useSelector(selectDashboardAnalytics),
    recentDocuments: useSelector(selectDashboardRecentDocuments),
    recentUsers: useSelector(selectDashboardRecentUsers),
    alerts: useSelector(selectDashboardAlerts),
    loading: useSelector(selectDashboardLoading),
    error: useSelector(selectDashboardError),
    fetchDashboard: () => dispatch(fetchDashboard()).unwrap(),
    clearError: () => dispatch(clearDashboardError()),
  };
};
