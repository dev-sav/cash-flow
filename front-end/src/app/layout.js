"use client";

import { Geist, Geist_Mono, Tienne } from "next/font/google";
import "./globals.css";
import { Provider } from "react-redux";
import store from "../../store"; // Import your Redux store

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <Provider store={store}>{children}</Provider>
      </body>
    </html>
  );
}
