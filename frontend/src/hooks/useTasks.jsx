import { useDispatch, useSelector } from "react-redux";
import {
  fetchTasks, fetchTaskById, createTask, updateTask, deleteTask,
  updateTaskStatus, fetchOverdueTasks,
  fetchTaskCategories, fetchActiveTaskCategories,
  createTaskCategory, updateTaskCategory, deleteTaskCategory,
} from "../features/tasks/thunk/tasksThunk";
import {
  selectTasksData, selectCurrentTask, selectOverdueTasks, selectOverdueTasksMeta,
  selectTasksStats, selectTasksPagination, selectTasksTotal,
  selectTasksLoading, selectTaskFetchLoading, selectTaskCreateLoading,
  selectTaskUpdateLoading, selectTaskDeleteLoading, selectTaskUpdateStatusLoading,
  selectTaskFetchOverdueLoading, selectTaskCategoryFetchLoading,
  selectTaskCategoryCreateLoading, selectTaskCategoryUpdateLoading,
  selectTaskCategoryDeleteLoading,
  selectTasksError, selectTasksSuccess,
  selectTaskCategories, selectActiveTaskCategories,
} from "../features/tasks/selectors/tasksSelectors";
import { clearError, clearSuccess, resetCurrent, resetOverdue } from "../features/tasks/slice/tasksSlice";

export const useTasks = () => {
  const dispatch = useDispatch();

  return {
    // ── Data ────────────────────────────────────────────────────────────
    tasks:              useSelector(selectTasksData),
    current:            useSelector(selectCurrentTask),
    overdueTasks:       useSelector(selectOverdueTasks),
    overdueTasksMeta:   useSelector(selectOverdueTasksMeta),
    stats:              useSelector(selectTasksStats),
    pagination:         useSelector(selectTasksPagination),
    total:              useSelector(selectTasksTotal),
    categories:         useSelector(selectTaskCategories),
    activeCategories:   useSelector(selectActiveTaskCategories),
    error:              useSelector(selectTasksError),
    success:            useSelector(selectTasksSuccess),

    // ── Loading ──────────────────────────────────────────────────────────
    loading:                    useSelector(selectTasksLoading),
    fetchLoading:               useSelector(selectTaskFetchLoading),
    createLoading:              useSelector(selectTaskCreateLoading),
    updateLoading:              useSelector(selectTaskUpdateLoading),
    deleteLoading:              useSelector(selectTaskDeleteLoading),
    updateStatusLoading:        useSelector(selectTaskUpdateStatusLoading),
    fetchOverdueLoading:        useSelector(selectTaskFetchOverdueLoading),
    fetchCategoriesLoading:     useSelector(selectTaskCategoryFetchLoading),
    createCategoryLoading:      useSelector(selectTaskCategoryCreateLoading),
    updateCategoryLoading:      useSelector(selectTaskCategoryUpdateLoading),
    deleteCategoryLoading:      useSelector(selectTaskCategoryDeleteLoading),

    // ── Actions tasks ────────────────────────────────────────────────────
    fetchTasks:         (params)          => dispatch(fetchTasks(params)).unwrap(),
    fetchTaskById:      (id)              => dispatch(fetchTaskById(id)).unwrap(),
    createTask:         (payload)         => dispatch(createTask(payload)).unwrap(),
    updateTask:         (id, data)        => dispatch(updateTask({ id, data })).unwrap(),
    deleteTask:         (id)              => dispatch(deleteTask(id)).unwrap(),
    updateTaskStatus:   (id, status)      => dispatch(updateTaskStatus({ id, status })).unwrap(),
    fetchOverdueTasks:  (params)          => dispatch(fetchOverdueTasks(params)).unwrap(),

    // ── Actions categories ───────────────────────────────────────────────
    fetchTaskCategories:        (params)  => dispatch(fetchTaskCategories(params)).unwrap(),
    fetchActiveTaskCategories:  ()        => dispatch(fetchActiveTaskCategories()).unwrap(),
    createTaskCategory:         (payload) => dispatch(createTaskCategory(payload)).unwrap(),
    updateTaskCategory:         (id, data)=> dispatch(updateTaskCategory({ id, data })).unwrap(),
    deleteTaskCategory:         (id)      => dispatch(deleteTaskCategory(id)).unwrap(),

    // ── Reset ────────────────────────────────────────────────────────────
    clearError:     () => dispatch(clearError()),
    clearSuccess:   () => dispatch(clearSuccess()),
    resetCurrent:   () => dispatch(resetCurrent()),
    resetOverdue:   () => dispatch(resetOverdue()),
  };
};