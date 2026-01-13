import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A1 Oracle Hub - ビジネスを自動化するAI司令室",
  description: "AI軍師があなたの壁打ち相手になり、SNS投稿から競合分析、タスク管理まで全てをサポート。起業家のための究極のオールインワンツール。",
  keywords: ["AI", "ビジネス自動化", "SNS", "起業家", "コーチ", "コンサルタント"],
  authors: [{ name: "A1 Oracle Hub" }],
  openGraph: {
    title: "A1 Oracle Hub - ビジネスを自動化するAI司令室",
    description: "思考OSを診断し、ビジネスを自動化する究極のAIツール",
    url: "https://brain-hub.pro",
    siteName: "A1 Oracle Hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "A1 Oracle Hub",
    description: "思考OSを診断し、ビジネスを自動化する究極のAIツール",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
