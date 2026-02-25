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
    <html lang="de" className="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
        <DevToolbar />
      </body>
    </html>
  );
}
