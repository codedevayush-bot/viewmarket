import type { Metadata } from "next";
import styles from "./SignIn.module.css";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
