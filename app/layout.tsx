import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matheye",
  description: "Interactive Algebra 1 lessons, practice, and tests.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <div className="page-shell">{children}</div>
      </body>
    </html>
  );
}
