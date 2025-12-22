import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "Dashboard Preview | Getflowetic",
  description: "Preview and review an auto-generated dashboard from your webhook data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
