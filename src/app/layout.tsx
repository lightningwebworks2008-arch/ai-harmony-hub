import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "C1 Chat | Generative UI",
  description: "Generative UI App powered by Thesys C1.",
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
