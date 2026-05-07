import { memo } from "react";
import Badge from "./Badge";

/**
 * StatusBadge Component
 * Map automatiquement les statuts aux couleurs appropriées
 * @param {string} status - Statut à afficher
 */
const StatusBadge = memo(({ status }) => {
  const map = {
    Active: "green",
    Confirmed: "green",
    Paid: "green",
    Published: "green",
    Cashed: "green",
    Accepted: "teal",
    Pending: "amber",
    Partial: "blue",
    Script: "blue",
    Editing: "purple",
    Recording: "purple",
    Ready: "cyan",
    "Follow-up": "amber",
    Idea: "amber",
    Sent: "blue",
    Draft: "amber",
    Overdue: "red",
    Cancelled: "red",
    Rejected: "red",
    Expired: "red",
    Unpaid: "red",
  };

  const color = map[status] || "blue";
  return <Badge color={color}>{status}</Badge>;
});

StatusBadge.displayName = "StatusBadge";

export default StatusBadge;
