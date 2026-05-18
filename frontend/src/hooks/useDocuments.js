import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDocuments,
  fetchStats,
  fetchGlobalStats,
  fetchDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../features/documents/thunk/documentsThunk";
import {
  selectDocumentsData,
  selectCurrentDocument,
  selectDocumentsStats,
  selectDocumentsGlobalStats,
  selectDocumentsTotal,
  selectDocumentsLoading,
  selectDocumentFetchLoading,
  selectDocumentFetchStatsLoading,
  selectDocumentFetchGlobalStatsLoading,
  selectDocumentFetchOneLoading,
  selectDocumentCreateLoading,
  selectDocumentUpdateLoading,
  selectDocumentDeleteLoading,
  selectDocumentsError,
  selectDocumentsSuccess,
  selectCurrentPage,
  selectLastPage,
  selectTotalDocuments,
  selectPerPage,
} from "../features/documents/selectors/documentsSelectors";
import {
  clearError,
  clearSuccess,
  resetCurrent,
} from "../features/documents/slice/documentsSlice";

export const useDocuments = () => {
  const dispatch = useDispatch();

  const documents = useSelector(selectDocumentsData);
  const current = useSelector(selectCurrentDocument);
  const stats = useSelector(selectDocumentsStats);
  const globalStats = useSelector(selectDocumentsGlobalStats);
  const total = useSelector(selectDocumentsTotal);
  const error = useSelector(selectDocumentsError);
  const success = useSelector(selectDocumentsSuccess);
  const currentPage = useSelector(selectCurrentPage);
  const lastPage = useSelector(selectLastPage);
  const totalDocuments = useSelector(selectTotalDocuments);
  const perPage = useSelector(selectPerPage);

  const loading = useSelector(selectDocumentsLoading);
  const fetchLoading = useSelector(selectDocumentFetchLoading);
  const fetchStatsLoading = useSelector(selectDocumentFetchStatsLoading);
  const fetchGlobalStatsLoading = useSelector(selectDocumentFetchGlobalStatsLoading);
  const fetchOneLoading = useSelector(selectDocumentFetchOneLoading);
  const createLoading = useSelector(selectDocumentCreateLoading);
  const updateLoading = useSelector(selectDocumentUpdateLoading);
  const deleteLoading = useSelector(selectDocumentDeleteLoading);

  const fetchDocumentsAction = useCallback(
    (params) => dispatch(fetchDocuments(params)).unwrap(),
    [dispatch]
  );
  const fetchStatsAction = useCallback(
    (params) => dispatch(fetchStats(params)).unwrap(),
    [dispatch]
  );
  const fetchGlobalStatsAction = useCallback(
    () => dispatch(fetchGlobalStats()).unwrap(),
    [dispatch]
  );
  const fetchDocumentByIdAction = useCallback(
    (id) => dispatch(fetchDocumentById(id)).unwrap(),
    [dispatch]
  );
  const createDocumentAction = useCallback(
    (payload) => dispatch(createDocument(payload)).unwrap(),
    [dispatch]
  );
  const updateDocumentAction = useCallback(
    (id, data) => dispatch(updateDocument({ id, data })).unwrap(),
    [dispatch]
  );
  const deleteDocumentAction = useCallback(
    (id) => dispatch(deleteDocument(id)).unwrap(),
    [dispatch]
  );
  const clearErrorAction = useCallback(() => dispatch(clearError()), [dispatch]);
  const clearSuccessAction = useCallback(() => dispatch(clearSuccess()), [dispatch]);
  const resetCurrentAction = useCallback(() => dispatch(resetCurrent()), [dispatch]);

  return {
    documents,
    current,
    stats,
    globalStats,
    total,
    error,
    success,
    currentPage,
    lastPage,
    totalDocuments,
    perPage,
    loading,
    fetchLoading,
    fetchStatsLoading,
    fetchGlobalStatsLoading,
    fetchOneLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    fetchDocuments: fetchDocumentsAction,
    fetchStats: fetchStatsAction,
    fetchGlobalStats: fetchGlobalStatsAction,
    fetchDocumentById: fetchDocumentByIdAction,
    createDocument: createDocumentAction,
    updateDocument: updateDocumentAction,
    deleteDocument: deleteDocumentAction,
    clearError: clearErrorAction,
    clearSuccess: clearSuccessAction,
    resetCurrent: resetCurrentAction,
  };
};

export const useDocumentById = (id) =>
  useSelector((state) =>
    (state?.documents?.data || []).find((document) => document.id === id) || null
  );
