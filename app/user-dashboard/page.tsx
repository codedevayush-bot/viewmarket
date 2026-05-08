import { redirect } from "next/navigation";

/**
 * Dashboard root route.
 * Automatically redirects the user to the default 'Console' view.
 */
export default function UserDashboardIndex() {
  redirect("/user-dashboard/console");
}
