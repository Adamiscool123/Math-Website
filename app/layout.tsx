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

  const mathTextScript = String.raw`
    (function () {
      var superscripts = {
        "0": "⁰",
        "1": "¹",
        "2": "²",
        "3": "³",
        "4": "⁴",
        "5": "⁵",
        "6": "⁶",
        "7": "⁷",
        "8": "⁸",
        "9": "⁹",
        "+": "⁺",
        "-": "⁻",
        "(": "⁽",
        ")": "⁾",
        "n": "ⁿ",
        "t": "ᵗ",
        "x": "ˣ",
        " ": ""
      };

      function toSuperscript(value) {
        return String(value).split("").map(function (char) {
          return superscripts[char] || char;
        }).join("");
      }

      function replaceSqrt(text) {
        var output = "";
        var index = 0;
        while (index < text.length) {
          var start = text.indexOf("sqrt(", index);
          if (start === -1) {
            output += text.slice(index);
            break;
          }

          output += text.slice(index, start);
          var depth = 1;
          var cursor = start + 5;
          while (cursor < text.length && depth > 0) {
            if (text[cursor] === "(") depth += 1;
            if (text[cursor] === ")") depth -= 1;
            cursor += 1;
          }

          if (depth !== 0) {
            output += text.slice(start);
            break;
          }

          var inside = text.slice(start + 5, cursor - 1).trim();
          var simple = /^[A-Za-z0-9.]+$/.test(inside);
          output += "√" + (simple ? inside : "(" + inside + ")");
          index = cursor;
        }
        return output;
      }

      function formatMathText(text) {
        if (!text || !/(sqrt\(|\^|\*|<=|>=|!=)/.test(text)) return text;
        var formatted = replaceSqrt(text);
        formatted = formatted.replace(/<=/g, "≤").replace(/>=/g, "≥").replace(/!=/g, "≠");
        formatted = formatted.replace(/\*/g, "·");
        formatted = formatted.replace(/\^\(([^)]{1,24})\)/g, function (_, power) {
          return toSuperscript("(" + power + ")");
        });
        formatted = formatted.replace(/\^(-?\d+)/g, function (_, power) {
          return toSuperscript(power);
        });
        formatted = formatted.replace(/\^([ntx])/g, function (_, power) {
          return toSuperscript(power);
        });
        return formatted;
      }

      function shouldSkip(node) {
        var parent = node.parentElement;
        if (!parent) return true;
        return Boolean(parent.closest("script, style, textarea, input, code, pre, kbd, samp, .katex"));
      }

      function formatTextNodes(root) {
        if (!root) return;
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        var nodes = [];
        var current;
        while ((current = walker.nextNode())) nodes.push(current);
        nodes.forEach(function (node) {
          if (shouldSkip(node)) return;
          var next = formatMathText(node.nodeValue || "");
          if (next !== node.nodeValue) node.nodeValue = next;
        });
      }

      function run() {
        formatTextNodes(document.body);
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run, { once: true });
      } else {
        run();
      }

      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === Node.TEXT_NODE) {
              if (!shouldSkip(node)) {
                var next = formatMathText(node.nodeValue || "");
                if (next !== node.nodeValue) node.nodeValue = next;
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              formatTextNodes(node);
            }
          });
        });
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });
    })();
  `;

  return (
    <html data-font={defaultFont} data-scroll-behavior="smooth" data-theme={defaultTheme} lang="en" suppressHydrationWarning>
      <body>
        <Script dangerouslySetInnerHTML={{ __html: themeScript }} id="matheye-theme-init" strategy="beforeInteractive" />
        <Script dangerouslySetInnerHTML={{ __html: mathTextScript }} id="matheye-math-text-format" strategy="afterInteractive" />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
