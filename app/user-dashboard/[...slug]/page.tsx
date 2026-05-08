import { notFound } from "next/navigation";
import styles from "../blank-page.module.css";
import { dashboardNavPaths, dashboardNavItems } from "../navigation";
import { Metadata } from "next";

interface PlaceholderPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({
  params,
}: PlaceholderPageProps): Promise<Metadata> {
  const { slug } = await params;
  const href = `/user-dashboard/${slug.join("/")}`;
  const item = dashboardNavItems.find((i) => i.href === href);

  return {
    title: item?.label || "Dashboard",
  };
}

export default async function PlaceholderPage({
  params,
}: PlaceholderPageProps) {
  const { slug } = await params;
  const routeKey = slug.join("/");

  if (!dashboardNavPaths.has(routeKey)) {
    notFound();
  }

  return <div className={styles.blankPage} />;
}
