"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "./Sidebar.module.css";
import {
  type DashboardIcon,
  type DashboardNavSection,
  dashboardNav,
} from "../../user-dashboard/navigation";

function SidebarIcon({
  icon,
  className,
}: {
  icon: DashboardIcon;
  className?: string;
}) {
  const iconClass = className || styles.navIcon;
  switch (icon) {
    case "console":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
      );
    case "broker":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      );
    case "copy":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      );
    case "orders":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      );
    case "positions":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18"></path>
          <path d="m19 9-5 5-4-4-3 3"></path>
        </svg>
      );
    case "chart":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      );
    case "automation":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v4m0 12v4M4.22 4.22l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.22 19.78l2.83-2.83m8.48-8.48l2.83-2.83"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      );
    case "tools":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2 2 0 1 1-2.83-2.83l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"></path>
        </svg>
      );
    case "integration":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 3h5v5"></path>
          <path d="M8 21H3v-5"></path>
          <path d="M21 3 14 10"></path>
          <path d="m3 21 7-7"></path>
          <path d="M14 14h7v7"></path>
          <path d="M3 3h7v7"></path>
        </svg>
      );
    case "data":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"></path>
          <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"></path>
        </svg>
      );
    case "sandbox":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 2v7.31"></path>
          <path d="M14 9.3V1.99"></path>
          <path d="M8.5 2h7"></path>
          <path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path>
        </svg>
      );
    case "monitoring":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      );
    case "admin":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-1.94 1.5l-.17.69a2 2 0 0 1-1.48 1.45l-.7.18a2 2 0 0 0-1.5 1.94v.44a2 2 0 0 1-.59 1.42l-.5.5a2 2 0 0 0 0 2.83l.5.5a2 2 0 0 1 .59 1.42v.44a2 2 0 0 0 1.5 1.94l.69.17a2 2 0 0 1 1.45 1.48l.18.7a2 2 0 0 0 1.94 1.5h.44a2 2 0 0 0 1.94-1.5l.17-.69a2 2 0 0 1 1.48-1.45l.7-.18a2 2 0 0 0 1.5-1.94v-.44a2 2 0 0 1 .59-1.42l.5-.5a2 2 0 0 0 0-2.83l.5.5a2 2 0 0 1 .59 1.42v.44a2 2 0 0 0 1.5 1.94l.69.17a2 2 0 0 1 1.45 1.48l.18.7a2 2 0 0 1 1.45 1.48l.18-.7A2 2 0 0 0 12.22 2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      );
    case "support":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      );
    case "settings":
      return (
        <svg
          className={iconClass}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      );
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const isChartsPage = pathname === "/user-dashboard/charts";
  const [isCollapsed, setIsCollapsed] = useState(isChartsPage);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(
      dashboardNav
        .filter((item): item is DashboardNavSection => "title" in item)
        .map((s) => s.title)
        .concat(["Support"]),
    ),
  );
  const { data: session, status } = useSession();

  // Re-sync collapse state when navigating between charts and other pages
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsCollapsed(isChartsPage);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, isChartsPage]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const handleMouseEnter = () => {
    if (isChartsPage) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (isChartsPage) {
      setIsCollapsed(true);
    }
  };

  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return session?.user?.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""} ${isChartsPage ? styles.chartsPage : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.inner}>
        {/* Top Header */}
        <div className={styles.header}>
          <div className={styles.workspaceInfo}>
            {status === "loading" ? (
              <div className={styles.avatarSkeleton} />
            ) : session?.user?.image ? (
              <div className={styles.avatar}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className={styles.avatarImage}
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className={styles.avatar}>
                <div className={styles.avatarFallback}>{getUserInitials()}</div>
              </div>
            )}
            <span className={styles.workspaceName}>
              {session?.user?.name || session?.user?.email || "User"}
            </span>
            <svg
              className={styles.chevronIcon}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div className={styles.headerActions}>
            {!isCollapsed && (
              <button className={styles.actionButton}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            )}
            <button
              className={styles.actionButton}
              onClick={toggleCollapse}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <path d="m13 15 3-3-3-3"></path>
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                  <path d="m11 15-3-3 3-3"></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className={styles.scrollArea}>
          {dashboardNav.map((item) => {
            if ("title" in item) {
              const isExpanded = expandedSections.has(item.title);
              return (
                <div key={item.title} className={styles.section}>
                  <div
                    className={styles.sectionHeader}
                    onClick={() => toggleSection(item.title)}
                  >
                    <div className={styles.sectionTitleContent}>
                      <SidebarIcon
                        icon={item.icon}
                        className={styles.sectionIcon}
                      />
                      <span>{item.title}</span>
                    </div>
                    <svg
                      className={`${styles.chevronIcon} ${!isExpanded ? styles.rotated : ""}`}
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  {(isExpanded || isCollapsed) &&
                    item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`${styles.navItem} ${pathname === subItem.href ? styles.active : ""}`}
                      >
                        <div className={styles.navItemContent}>
                          <SidebarIcon icon={subItem.icon} />
                          <span>{subItem.label}</span>
                        </div>
                      </Link>
                    ))}
                </div>
              );
            } else {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
                >
                  <div className={styles.navItemContent}>
                    <SidebarIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            }
          })}
        </div>
      </div>
    </aside>
  );
}
