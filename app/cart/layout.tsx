import type { Metadata } from "next";
import ThemeSwitcher from "../components/ThemeSwitcher/ThemeSwitcher";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Securely complete your subscription.",
};

export default function CartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      {children}
      <ThemeSwitcher />
    </main>
  );
}
