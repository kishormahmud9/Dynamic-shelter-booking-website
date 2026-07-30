import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import LayoutWrapper from "@/components/LayoutWrapper/LayoutWrapper";
import Provider from "@/components/Provider/Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Affordable Shared Housing for You",
  description: "Providing safe, affordable shared housing that supports veterans, the homeless, and individuals in need by offering stability, dignity, and a sense of community."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutWrapper>
          <Provider>
            {children}
          </Provider>
        </LayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
