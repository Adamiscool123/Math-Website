import type { Metadata } from "next";
import Script from "next/script";
import { defaultFont, defaultTheme, FONT_STORAGE_KEY, fontOptions, THEME_STORAGE_KEY, themeOptions } from "@/lib/theme";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matheye",
  description: "Interactive Algebra 1 lessons, practice, and tests.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `
    try {
      var theme = localStorage.getItem("${THEME_STORAGE_KEY}") || "${defaultTheme}";
      var font = localStorage.getItem("${FONT_STORAGE_KEY}") || "${defaultFont}";
      if (!${JSON.stringify(themeOptions.map((theme) => theme.id))}.includes(theme)) theme = "${defaultTheme}";
      if (!${JSON.stringify(fontOptions.map((font) => font.id))}.includes(font)) font = "${defaultFont}";
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.font = font;
    } catch (_) {
      document.documentElement.dataset.theme = "${defaultTheme}";
      document.documentElement.dataset.font = "${defaultFont}";
    }
  `;

  return (
    <html data-font={defaultFont} data-scroll-behavior="smooth" data-theme={defaultTheme} lang="en" suppressHydrationWarning>
      <body>
        <Script dangerouslySetInnerHTML={{ __html: themeScript }} id="matheye-theme-init" strategy="beforeInteractive" />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
