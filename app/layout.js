import React from "react";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} transition-colors duration-300`}>
        {children}
      </body>
    </html>
  );
}
