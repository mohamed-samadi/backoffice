import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications, fetchNotificationsCount,
  markNotificationAsRead, markAllNotificationsAsRead,
  deleteNotification, deleteAllNotifications,
} from "../features/notifications/thunk/notificationsThunk";
import {
  selectNotificationsData, selectNonLuesCount, selectHasUnread,
  selectNotificationsPagination,
  selectUnreadNotifications, selectReadNotifications,
  selectNotifFetchLoading, selectNotifMarkReadLoading,
  selectNotifMarkAllLoading, selectNotifDeleteLoading,
  selectNotifDeleteAllLoading, selectNotificationsLoading,
  selectNotificationsError, selectNotificationsSuccess,
} from "../features/notifications/selectors/notificationsSelectors";
import { clearError, clearSuccess } from "../features/notifications/slice/notificationsSlice";

export const useNotifications = () => {
  const dispatch = useDispatch();

  return {
    // ── Data ──────────────────────────────────────────────────────────
    notifications:      useSelector(selectNotificationsData),
    nonLuesCount:       useSelector(selectNonLuesCount),
    hasUnread:          useSelector(selectHasUnread),
    pagination:         useSelector(selectNotificationsPagination),
    unread:             useSelector(selectUnreadNotifications),
    read:               useSelector(selectReadNotifications),
    error:              useSelector(selectNotificationsError),
    success:            useSelector(selectNotificationsSuccess),

    // ── Loading ────────────────────────────────────────────────────────
    loading:            useSelector(selectNotificationsLoading),
    fetchLoading:       useSelector(selectNotifFetchLoading),
    markReadLoading:    useSelector(selectNotifMarkReadLoading),
    markAllLoading:     useSelector(selectNotifMarkAllLoading),
    deleteLoading:      useSelector(selectNotifDeleteLoading),
    deleteAllLoading:   useSelector(selectNotifDeleteAllLoading),

    // ── Actions ────────────────────────────────────────────────────────
    fetchNotifications:           (params) => dispatch(fetchNotifications(params)).unwrap(),
    fetchNotificationsCount:      ()       => dispatch(fetchNotificationsCount()).unwrap(),
    markNotificationAsRead:       (id)     => dispatch(markNotificationAsRead(id)).unwrap(),
    markAllNotificationsAsRead:   ()       => dispatch(markAllNotificationsAsRead()).unwrap(),
    deleteNotification:           (id)     => dispatch(deleteNotification(id)).unwrap(),
    deleteAllNotifications:       ()       => dispatch(deleteAllNotifications()).unwrap(),

    // ── Reset ──────────────────────────────────────────────────────────
    clearError:   () => dispatch(clearError()),
    clearSuccess: () => dispatch(clearSuccess()),
  };
};