export type DashboardIcon =
  | "console"
  | "broker"
  | "copy"
  | "orders"
  | "positions"
  | "chart"
  | "automation"
  | "tools"
  | "integration"
  | "data"
  | "sandbox"
  | "monitoring"
  | "admin"
  | "support"
  | "settings";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: DashboardIcon;
}

export interface DashboardNavSection {
  title: string;
  icon: DashboardIcon;
  items: DashboardNavItem[];
}

export type DashboardNavEntry = DashboardNavSection | DashboardNavItem;

export const dashboardNav: DashboardNavEntry[] = [
  { label: "Console", href: "/user-dashboard/console", icon: "console" },
  {
    title: "Connection",
    icon: "broker",
    items: [
      { label: "Broker", href: "/user-dashboard/broker", icon: "broker" },
      {
        label: "Copy Trading",
        href: "/user-dashboard/copy-trading",
        icon: "copy",
      },
    ],
  },
  {
    title: "Trading",
    icon: "orders",
    items: [
      {
        label: "Action Center",
        href: "/user-dashboard/action-center",
        icon: "automation",
      },
      { label: "Tradebook", href: "/user-dashboard/tradebook", icon: "orders" },
    ],
  },
  {
    title: "Automation",
    icon: "automation",
    items: [
      { label: "Charts", href: "/user-dashboard/charts", icon: "chart" },
      {
        label: "Strategy Studio",
        href: "/user-dashboard/strategy-studio",
        icon: "automation",
      },
    ],
  },
  {
    title: "Market Tools",
    icon: "tools",
    items: [
      {
        label: "Strategy Portfolio",
        href: "/user-dashboard/strategy-portfolio",
        icon: "tools",
      },
      {
        label: "Options Lab",
        href: "/user-dashboard/options-lab",
        icon: "tools",
      },
    ],
  },
  {
    label: "Integrations Hub",
    href: "/user-dashboard/integrations-hub",
    icon: "integration",
  },
  { label: "Data Hub", href: "/user-dashboard/data-hub", icon: "data" },
  {
    label: "Sandbox Lab",
    href: "/user-dashboard/sandbox-lab",
    icon: "sandbox",
  },
  {
    label: "Observability Hub",
    href: "/user-dashboard/observability-hub",
    icon: "monitoring",
  },
  {
    label: "Admin Center",
    href: "/user-dashboard/admin-center",
    icon: "admin",
  },
  {
    title: "Support",
    icon: "support",
    items: [
      {
        label: "Email Us",
        href: "/user-dashboard/support/email",
        icon: "support",
      },
      {
        label: "Raise a Ticket",
        href: "/user-dashboard/support/raise-ticket",
        icon: "support",
      },
      {
        label: "My Tickets",
        href: "/user-dashboard/support/my-tickets",
        icon: "support",
      },
      {
        label: "Get a Call",
        href: "/user-dashboard/support/get-call",
        icon: "support",
      },
      { label: "FAQ", href: "/user-dashboard/support/faq", icon: "support" },
    ],
  },
  {
    title: "Settings",
    icon: "settings",
    items: [
      { label: "Profile", href: "/user-dashboard/profile", icon: "settings" },
      { label: "API Key", href: "/user-dashboard/api-key", icon: "settings" },
    ],
  },
];

export const dashboardNavItems = dashboardNav
  .filter((item): item is DashboardNavItem => !("items" in item))
  .concat(
    dashboardNav
      .filter((item): item is DashboardNavSection => "items" in item)
      .flatMap((section) => section.items),
  );

export const dashboardNavPaths = new Set(
  dashboardNavItems.map((item) => item.href.replace("/user-dashboard/", "")),
);
