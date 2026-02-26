import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DevToolbar from "@/components/DevToolbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QQX | Flotten-Architektur",
  description: "Enterprise-Lösungen für Logistik und Flottenmanagement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            })();
          `
        }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <DevToolbar />
      </body>
    </html>
  );
}
