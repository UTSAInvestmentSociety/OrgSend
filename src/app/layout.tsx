import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrgSend - Student Organization Communications",
  description:
    "Secure email and SMS broadcasting platform for student organizations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
