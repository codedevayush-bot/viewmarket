import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copy Trading",
  description: "Advanced multi-broker copy trading infrastructure.",
};

export default function CopyTradingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
