import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// I updated this to be your PWA controller
export const metadata = {
  title: "Waju AI",
  description: "Ask Anything.",
  manifest: "/manifest.json", 
};

export default function RootLayout({ children }: { children: React.ReactNode })
  return (
    <html lang="en">
      <head>
        {/* This makes the status bar on mobile match your dark theme */}
        <meta name="theme-color" content="#020617" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}