import React from "react";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata = {
  title: 'OSINT Tools',
  description: 'A curated collection of open source intelligence tools and resources',
  keywords: [
    'OSINT tools',
    'open source intelligence',
    'intelligence tools',
    'resources',
    'search tools',
    'cybersecurity resources',
    'digital investigation'
  ],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
  creator: 'Priyanshu Gupta',
  alternates: {
    canonical: 'https://osint.zone.id',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} transition-colors duration-300`}>
        {children}
      </body>
    </html>
  );
}