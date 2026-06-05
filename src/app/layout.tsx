import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "N.Flying 포카리스트",
  description: "N.Flying 포토카드 컬렉션",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" style={{ height: '100%' }}>
      <body style={{ margin: 0, height: '100%' }}>{children}</body>
    </html>
  );
}
