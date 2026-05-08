import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth Error",
  description: "An authentication error occurred.",
};

export default function AuthErrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
