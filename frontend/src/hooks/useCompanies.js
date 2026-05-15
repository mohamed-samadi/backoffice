import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompanies,
  fetchCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../features/companies/thunk/companiesThunk";
import {
  selectCompaniesData,
  selectCurrentCompany,
  selectCompaniesError,
  selectCompaniesSuccess,
} from "../features/companies/selectors/companiesSelectors";
import {
  clearError,
  clearSuccess,
  resetCurrent,
} from "../features/companies/slice/companiesSlice";

export const useCompanies = () => {
  const dispatch = useDispatch();

  const companies = useSelector(selectCompaniesData);
  const current = useSelector(selectCurrentCompany);
  const error = useSelector(selectCompaniesError);
  const success = useSelector(selectCompaniesSuccess);

  const fetchCompaniesAction = useCallback(
    (params) => dispatch(fetchCompanies(params)).unwrap(),
    [dispatch]
  );

  const fetchCompanyByIdAction = useCallback(
    (id) => dispatch(fetchCompanyById(id)).unwrap(),
    [dispatch]
  );

  const createCompanyAction = useCallback(
    (payload) => dispatch(createCompany(payload)).unwrap(),
    [dispatch]
  );

  const updateCompanyAction = useCallback(
    (id, data) => dispatch(updateCompany({ id, payload: data })).unwrap(),
    [dispatch]
  );

  const deleteCompanyAction = useCallback(
    (id) => dispatch(deleteCompany(id)).unwrap(),
    [dispatch]
  );

  const clearErrorAction = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  const clearSuccessAction = useCallback(
    () => dispatch(clearSuccess()),
    [dispatch]
  );

  const resetCurrentAction = useCallback(
    () => dispatch(resetCurrent()),
    [dispatch]
  );

  return {
    companies,
    current,
    error,
    success,
    fetchCompanies: fetchCompaniesAction,
    fetchCompanyById: fetchCompanyByIdAction,
    createCompany: createCompanyAction,
    updateCompany: updateCompanyAction,
    deleteCompany: deleteCompanyAction,
    clearError: clearErrorAction,
    clearSuccess: clearSuccessAction,
    resetCurrent: resetCurrentAction,
  };
};
