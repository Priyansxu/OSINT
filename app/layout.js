import React from "react";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata = {
  title: 'OSINT Tools',
  description: 'A curated collection of open source intelligence tools and resources',
  keywords: [
  'OSINT tools',
  'free OSINT tools',
  'open source intelligence',
  'cyber threat intelligence tools',
  'digital forensics tools',
  'OSINT resources',
  'domain lookup tools',
  'best OSINT tools',
  'online investigation tools',
  'social media monitoring tools',
  'top OSINT platforms',
  'OSINT tools for cybersecurity',
  'people search tools',
  'public data search tools',
  'free online search tools',
  'OSINT investigation software',
  'SOCMINT tools'
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