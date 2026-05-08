import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Console",
  description: "ViewMarket system console and overview.",
};

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
