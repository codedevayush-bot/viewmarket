export type AdminIcon =
  | "console"
  | "users"
  | "brokers"
  | "settings"
  | "support";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: AdminIcon;
}

export interface AdminNavSection {
  title: string;
  icon: AdminIcon;
  items: AdminNavItem[];
}

export const adminNavSections: AdminNavSection[] = [
  {
    title: "Overview",
    icon: "console",
    items: [
      {
        label: "Console",
        href: "/admin",
        icon: "console",
      },
    ],
  },
  {
    title: "Management",
    icon: "users",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: "users",
      },
      {
        label: "Brokers",
        href: "/admin/brokers",
        icon: "brokers",
      },
    ],
  },
  {
    title: "System",
    icon: "settings",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: "settings",
      },
    ],
  },
  {
    title: "Support",
    icon: "support",
    items: [
      {
        label: "Tickets",
        href: "/admin/tickets",
        icon: "support",
      },
    ],
  },
];
