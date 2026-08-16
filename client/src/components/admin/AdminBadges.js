// AdminBadges — single source of truth for the colored chip classes used on
// every admin screen (overview, users, restaurants), so the same role/status
// always renders with the same palette everywhere: pending/review = warning,
// active/approved/open = success, destructive (blocked/suspended/rejected) =
// error, everything neutral = muted.

const FALLBACK = "border-border bg-muted/15 text-muted";

export const USER_ROLE_BADGE_CLASSES = {
  CUSTOMER: "border-primary/20 bg-primary/10 text-primary-dark",
  OWNER: "border-warning/25 bg-warning/15 text-warning",
  DRIVER: "border-success/25 bg-success/15 text-success",
  ADMIN: "border-error/25 bg-error/15 text-error",
};

export function userRoleBadge(role) {
  return USER_ROLE_BADGE_CLASSES[role] ?? FALLBACK;
}

export const DRIVER_STATUS_BADGE_CLASSES = {
  PENDING: "border-warning/25 bg-warning/15 text-warning",
  APPROVED: "border-success/25 bg-success/15 text-success",
  REJECTED: "border-error/25 bg-error/15 text-error",
};

export function driverStatusBadge(status) {
  return DRIVER_STATUS_BADGE_CLASSES[status] ?? FALLBACK;
}

export const RESTAURANT_STATUS_BADGE_CLASSES = {
  PENDING: "border-warning/25 bg-warning/15 text-warning",
  OPEN: "border-success/25 bg-success/15 text-success",
  CLOSED: FALLBACK,
  SUSPENDED: "border-error/25 bg-error/15 text-error",
  REJECTED: "border-error/25 bg-error/15 text-error",
};

export function restaurantStatusBadge(status) {
  return RESTAURANT_STATUS_BADGE_CLASSES[status] ?? FALLBACK;
}
