import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import ThemeSwitcher from "../components/ThemeSwitcher/ThemeSwitcher";

export const metadata: Metadata = {
  title: "View Market — Project management for high-performance teams",
  description:
    "View Market is a better way to build products. Streamline issues, sprints, and product roadmaps.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <ThemeSwitcher />
    </>
  );
}
