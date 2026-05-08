import { Metadata } from "next";
import ChartsClient from "./ChartsClient";

export const metadata: Metadata = {
  title: "Charts",
  description:
    "View and analyze market charts with TradingView Lightweight Charts.",
};

export default function ChartsPage() {
  return <ChartsClient />;
}
