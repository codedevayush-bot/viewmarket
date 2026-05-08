import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brokers",
  description: "Connect and manage your broker infrastructure.",
};

export default function BrokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
