import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "핏코 재무 관리",
  description: "청창사 사업비 관리 및 재무 자동화 SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
