import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Import file provider lu yang sejajar di folder app
import Provider from "./provider"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard Irmala",
  description: "Manajemen Karang Taruna",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* Bungkus aplikasi lu pakai Provider */}
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}