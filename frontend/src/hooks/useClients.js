import { useDispatch, useSelector } from "react-redux";
import {
  fetchClients,
  fetchClientById,
  createClient,
  updateClient,
  deleteClient,
  fetchActiveClients,
} from "../features/clients/thunk/clientsThunk";
import {
  selectClientsData,
  selectCurrentClient,
  selectActiveClients,
  selectClientsStats,
  selectClientsPagination,
  selectClientsTotal,
  selectClientsLoading,
  selectClientFetchLoading,
  selectClientFetchOneLoading,
  selectClientCreateLoading,
  selectClientUpdateLoading,
  selectClientDeleteLoading,
  selectClientFetchActiveLoading,
  selectClientsError,
  selectClientsSuccess,
  selectClientsActifs,
  selectClientsInactifs,
} from "../features/clients/selectors/clientsSelectors";
import {
  clearError,
  clearSuccess,
  resetCurrent,
} from "../features/clients/slice/clientsSlice";

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────────────────────
export const useClients = () => {
  const dispatch = useDispatch();

  return {
    // ── Data ────────────────────────────────────────────────────────────
    clients:         useSelector(selectClientsData),
    current:         useSelector(selectCurrentClient),
    activeClients:   useSelector(selectActiveClients),   // pour les <select>
    stats:           useSelector(selectClientsStats),    // { total, actifs, inactifs }
    pagination:      useSelector(selectClientsPagination),
    total:           useSelector(selectClientsTotal),
    error:           useSelector(selectClientsError),
    success:         useSelector(selectClientsSuccess),

    // ── Vues filtrées locales ────────────────────────────────────────────
    clientsActifs:   useSelector(selectClientsActifs),
    clientsInactifs: useSelector(selectClientsInactifs),

    loading:             useSelector(selectClientsLoading),
    fetchLoading:        useSelector(selectClientFetchLoading),
    fetchOneLoading:     useSelector(selectClientFetchOneLoading),
    createLoading:       useSelector(selectClientCreateLoading),
    updateLoading:       useSelector(selectClientUpdateLoading),
    deleteLoading:       useSelector(selectClientDeleteLoading),
    fetchActiveLoading:  useSelector(selectClientFetchActiveLoading),

    fetchClients:       (params)         => dispatch(fetchClients(params)).unwrap(),
    fetchClientById:    (id)             => dispatch(fetchClientById(id)).unwrap(),
    createClient:       (payload)        => dispatch(createClient(payload)).unwrap(),
    updateClient:       (id, payload)    => dispatch(updateClient({ id, payload })).unwrap(),
    deleteClient:       (id)             => dispatch(deleteClient(id)).unwrap(),
    fetchActiveClients: ()               => dispatch(fetchActiveClients()).unwrap(),
    clearError:   () => dispatch(clearError()),
    clearSuccess: () => dispatch(clearSuccess()),
    resetCurrent: () => dispatch(resetCurrent()),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook utilitaire — cherche dans la page courante sans selector paramétré
// ─────────────────────────────────────────────────────────────────────────────
export const useClientById = (id) =>
  useSelector((state) =>
    (state?.clients?.data || []).find((c) => c.id === id) || null
  );