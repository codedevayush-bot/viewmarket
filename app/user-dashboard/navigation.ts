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
  items: DashboardNavItem[];
  icon: DashboardIcon;
}

export const dashboardNavSections: DashboardNavSection[] = [
  {
    title: "Overview",
    icon: "console",
    items: [
      { label: "Console", href: "/user-dashboard/console", icon: "console" },
    ],
  },
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
      { label: "Orderbook", href: "/user-dashboard/orderbook", icon: "orders" },
      { label: "Tradebook", href: "/user-dashboard/tradebook", icon: "orders" },
      {
        label: "Positions",
        href: "/user-dashboard/positions",
        icon: "positions",
      },
      {
        label: "Holdings",
        href: "/user-dashboard/holdings",
        icon: "positions",
      },
      {
        label: "Action Center",
        href: "/user-dashboard/action-center",
        icon: "automation",
      },
      {
        label: "PnL Tracker",
        href: "/user-dashboard/pnl-tracker",
        icon: "chart",
      },
    ],
  },
  {
    title: "Automation",
    icon: "automation",
    items: [
      { label: "Charts", href: "/user-dashboard/charts", icon: "chart" },
      {
        label: "Strategy Builder",
        href: "/user-dashboard/strategy-builder",
        icon: "automation",
      },
      {
        label: "Webhook Strategies",
        href: "/user-dashboard/webhook-strategies",
        icon: "automation",
      },
      {
        label: "Chartink Strategies",
        href: "/user-dashboard/chartink-strategies",
        icon: "automation",
      },
      {
        label: "Python Strategies",
        href: "/user-dashboard/python-strategies",
        icon: "automation",
      },
      {
        label: "Flow Builder",
        href: "/user-dashboard/flow-builder",
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
        label: "Option Chain",
        href: "/user-dashboard/option-chain",
        icon: "tools",
      },
      {
        label: "Option Greeks",
        href: "/user-dashboard/option-greeks",
        icon: "tools",
      },
      {
        label: "OI Tracker",
        href: "/user-dashboard/oi-tracker",
        icon: "tools",
      },
      { label: "Max Pain", href: "/user-dashboard/max-pain", icon: "tools" },
      {
        label: "Straddle Chart",
        href: "/user-dashboard/straddle-chart",
        icon: "tools",
      },
      {
        label: "Straddle PnL",
        href: "/user-dashboard/straddle-pnl",
        icon: "tools",
      },
      {
        label: "Vol Surface",
        href: "/user-dashboard/vol-surface",
        icon: "tools",
      },
      {
        label: "GEX Dashboard",
        href: "/user-dashboard/gex-dashboard",
        icon: "tools",
      },
      { label: "IV Smile", href: "/user-dashboard/iv-smile", icon: "tools" },
      {
        label: "OI Profile",
        href: "/user-dashboard/oi-profile",
        icon: "tools",
      },
    ],
  },
  {
    title: "Integrations",
    icon: "integration",
    items: [
      {
        label: "Platforms",
        href: "/user-dashboard/platforms",
        icon: "integration",
      },
      {
        label: "TradingView",
        href: "/user-dashboard/tradingview",
        icon: "integration",
      },
      {
        label: "GoCharting",
        href: "/user-dashboard/gocharting",
        icon: "integration",
      },
      {
        label: "Telegram Bot",
        href: "/user-dashboard/telegram-bot",
        icon: "integration",
      },
    ],
  },
  {
    title: "Data",
    icon: "data",
    items: [
      {
        label: "Master Contract",
        href: "/user-dashboard/master-contract",
        icon: "data",
      },
      {
        label: "Symbol Search",
        href: "/user-dashboard/symbol-search",
        icon: "data",
      },
      { label: "Historify", href: "/user-dashboard/historify", icon: "data" },
    ],
  },
  {
    title: "Sandbox",
    icon: "sandbox",
    items: [
      { label: "Sandbox", href: "/user-dashboard/sandbox", icon: "sandbox" },
      { label: "Analyzer", href: "/user-dashboard/analyzer", icon: "sandbox" },
      {
        label: "Playground",
        href: "/user-dashboard/playground",
        icon: "sandbox",
      },
      {
        label: "WebSocket Test",
        href: "/user-dashboard/websocket-test",
        icon: "sandbox",
      },
    ],
  },
  {
    title: "Monitoring",
    icon: "monitoring",
    items: [
      { label: "Logs", href: "/user-dashboard/logs", icon: "monitoring" },
      {
        label: "Live Logs",
        href: "/user-dashboard/live-logs",
        icon: "monitoring",
      },
      {
        label: "Traffic Monitor",
        href: "/user-dashboard/traffic-monitor",
        icon: "monitoring",
      },
      {
        label: "Latency Monitor",
        href: "/user-dashboard/latency-monitor",
        icon: "monitoring",
      },
      {
        label: "Security Logs",
        href: "/user-dashboard/security-logs",
        icon: "monitoring",
      },
      {
        label: "Health Monitor",
        href: "/user-dashboard/health-monitor",
        icon: "monitoring",
      },
    ],
  },
  {
    title: "Admin",
    icon: "admin",
    items: [
      { label: "Admin", href: "/user-dashboard/admin", icon: "admin" },
      {
        label: "Freeze Quantity",
        href: "/user-dashboard/freeze-quantity",
        icon: "admin",
      },
      {
        label: "Market Holidays",
        href: "/user-dashboard/market-holidays",
        icon: "admin",
      },
      {
        label: "Market Timings",
        href: "/user-dashboard/market-timings",
        icon: "admin",
      },
    ],
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

export const dashboardNavItems = dashboardNavSections.flatMap(
  (section) => section.items,
);

export const dashboardNavPaths = new Set(
  dashboardNavItems.map((item) => item.href.replace("/user-dashboard/", "")),
);
