import "../styles/global.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Nomad Nexus",
  description:
    "Turn your travel photos into an interactive 3D globe and a shareable video recap. Photos never leave your device.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
