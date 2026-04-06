import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { ToastProvider } from "@/components/ui/toast-provider";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: {
    default: "TOMSKID · US eSIM",
    template: "%s · TOMSKID",
  },
  description:
    "Order US eSIM plans with clear pricing and manual, trustworthy fulfillment.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </ToastProvider>
      </body>
    </html>
  );
}
