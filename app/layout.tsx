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
        "=": "⁼",
        "(": "⁽",
        ")": "⁾",
        "a": "ᵃ",
        "b": "ᵇ",
        "c": "ᶜ",
        "d": "ᵈ",
        "e": "ᵉ",
        "f": "ᶠ",
        "g": "ᵍ",
        "h": "ʰ",
        "i": "ⁱ",
        "j": "ʲ",
        "k": "ᵏ",
        "l": "ˡ",
        "m": "ᵐ",
        "n": "ⁿ",
        "o": "ᵒ",
        "p": "ᵖ",
        "q": "ᑫ",
        "r": "ʳ",
        "s": "ˢ",
        "t": "ᵗ",
        "u": "ᵘ",
        "v": "ᵛ",
        "w": "ʷ",
        "x": "ˣ",
        "y": "ʸ",
        "z": "ᶻ",
        "A": "ᴬ",
        "B": "ᴮ",
        "D": "ᴰ",
        "E": "ᴱ",
        "G": "ᴳ",
        "H": "ᴴ",
        "I": "ᴵ",
        "J": "ᴶ",
        "K": "ᴷ",
        "L": "ᴸ",
        "M": "ᴹ",
        "N": "ᴺ",
        "O": "ᴼ",
        "P": "ᴾ",
        "R": "ᴿ",
        "T": "ᵀ",
        "U": "ᵁ",
        "V": "ⱽ",
        "W": "ᵂ",
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
        formatted = formatted.replace(/\^\(([^)]{1,32})\)/g, function (_, power) {
          return toSuperscript("(" + power + ")");
        });
        formatted = formatted.replace(/\^(-?\d+)/g, function (_, power) {
          return toSuperscript(power);
        });
        formatted = formatted.replace(/\^([A-Za-z])/g, function (_, power) {
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

  const lessonVisualScript = String.raw`
    (function () {
      var skipTitles = ["what you will master", "concept", "key formulas", "common mistakes", "worked examples", "ready for the test when...", "progress", "question bank", "practice", "test", "what to review", "ready?"];

      function addStyles() {
        if (document.getElementById("matheye-lesson-visual-styles")) return;
        var style = document.createElement("style");
        style.id = "matheye-lesson-visual-styles";
        style.textContent = "\
          .lesson-visual{margin-top:18px;border:1px solid var(--border-soft);border-radius:18px;background:linear-gradient(135deg,var(--surface-low),var(--panel-2));padding:16px;overflow:hidden;}\
          .lesson-visual-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;}\
          .lesson-visual-label{font-size:.78rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);font-weight:800;}\
          .lesson-visual-chip{border:1px solid var(--border-soft);background:var(--surface-mid);color:var(--ink);border-radius:999px;padding:7px 10px;font-size:.82rem;font-weight:800;}\
          .lesson-visual button{border:1px solid var(--border-soft);background:var(--surface-mid);color:var(--ink);border-radius:999px;padding:7px 10px;font-weight:800;}\
          .lesson-visual svg{width:100%;height:auto;display:block;}\
          .visual-muted{fill:var(--muted);font-size:12px;font-weight:700;}\
          .visual-ink{fill:var(--ink);font-size:13px;font-weight:900;}\
          .visual-line{stroke:var(--line);stroke-width:2;}\
          .visual-blue{stroke:var(--blue);fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;}\
          .visual-teal{stroke:var(--teal);fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;}\
          .visual-amber{stroke:var(--amber);fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;}\
          .visual-fill-blue{fill:color-mix(in srgb,var(--blue) 26%,transparent);stroke:var(--blue);stroke-width:2;}\
          .visual-fill-teal{fill:color-mix(in srgb,var(--teal) 26%,transparent);stroke:var(--teal);stroke-width:2;}\
          .visual-fill-amber{fill:color-mix(in srgb,var(--amber) 28%,transparent);stroke:var(--amber);stroke-width:2;}\
          .visual-dot{fill:var(--teal);stroke:var(--ink);stroke-width:2;}\
          @media(max-width:640px){.lesson-visual{padding:12px;border-radius:14px}.lesson-visual-top{align-items:flex-start;flex-direction:column}.lesson-visual svg{min-height:190px}}\
        ";
        document.head.appendChild(style);
      }

      function svg(inner) {
        return '<svg viewBox="0 0 420 220" role="img" aria-label="Lesson visual" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
      }

      function grid() {
        var lines = '';
        for (var x = 40; x <= 380; x += 34) lines += '<line class="visual-line" opacity=".35" x1="' + x + '" y1="24" x2="' + x + '" y2="190"/>';
        for (var y = 36; y <= 190; y += 22) lines += '<line class="visual-line" opacity=".35" x1="36" y1="' + y + '" x2="388" y2="' + y + '"/>';
        lines += '<line class="visual-line" x1="36" y1="112" x2="388" y2="112"/><line class="visual-line" x1="210" y1="24" x2="210" y2="190"/>';
        return lines;
      }

      function numberLine(seed) {
        var closed = seed % 2 === 0;
        return svg('<line class="visual-line" x1="45" y1="110" x2="375" y2="110"/><path class="visual-teal" d="M210 110 H360"/><polygon fill="var(--teal)" points="375,110 358,100 358,120"/>' +
          [-4,-3,-2,-1,0,1,2,3,4].map(function(n,i){var x=45+i*41;return '<line class="visual-line" x1="'+x+'" y1="100" x2="'+x+'" y2="120"/><text class="visual-muted" x="'+(x-5)+'" y="145">'+n+'</text>';}).join('') +
          '<circle cx="210" cy="110" r="10" fill="' + (closed ? 'var(--teal)' : 'var(--panel)') + '" stroke="var(--teal)" stroke-width="4"/><text class="visual-ink" x="132" y="64">Solution set</text><text class="visual-muted" x="132" y="84">endpoint + shaded direction</text>');
      }

      function lineGraph(seed) {
        var second = seed % 2 === 0;
        return svg(grid() + '<path class="visual-blue" d="M52 164 L368 54"/><path class="visual-amber" d="M52 ' + (second ? '62' : '72') + ' L368 ' + (second ? '170' : '160') + '"/><circle class="visual-dot" cx="210" cy="110" r="7"/><text class="visual-ink" x="224" y="104">intersection</text><text class="visual-muted" x="58" y="202">lines, slope, intercepts, systems</text>');
      }

      function functionMachine() {
        return svg('<rect class="visual-fill-blue" x="45" y="82" width="86" height="56" rx="16"/><text class="visual-ink" x="72" y="116">input</text><path class="visual-blue" d="M142 110 H185"/><polygon fill="var(--blue)" points="188,110 174,101 174,119"/><rect class="visual-fill-teal" x="190" y="58" width="112" height="104" rx="22"/><text class="visual-ink" x="224" y="102">f(x)</text><text class="visual-muted" x="211" y="126">rule</text><path class="visual-teal" d="M304 110 H352"/><polygon fill="var(--teal)" points="365,110 349,101 349,119"/><rect class="visual-fill-amber" x="334" y="82" width="58" height="56" rx="16"/><text class="visual-ink" x="344" y="116">output</text>');
      }

      function parabola(seed) {
        var down = seed % 2 === 1;
        var path = down ? 'M70 72 Q210 186 350 72' : 'M70 176 Q210 38 350 176';
        var vy = down ? 186 : 38;
        return svg(grid() + '<path class="visual-teal" d="' + path + '"/><line class="visual-amber" x1="210" y1="26" x2="210" y2="192" stroke-dasharray="7 7"/><circle class="visual-dot" cx="210" cy="' + vy + '" r="7"/><text class="visual-ink" x="225" y="' + (down ? 178 : 45) + '">vertex</text><text class="visual-muted" x="238" y="70">axis of symmetry</text>');
      }

      function radicalTriangle() {
        return svg('<polygon class="visual-fill-blue" points="95,162 285,162 285,62"/><line class="visual-teal" x1="95" y1="162" x2="285" y2="62"/><rect x="265" y="142" width="20" height="20" fill="none" stroke="var(--ink)" stroke-width="2"/><text class="visual-ink" x="178" y="184">a</text><text class="visual-ink" x="296" y="114">b</text><text class="visual-ink" x="182" y="96">c = √(a² + b²)</text><text class="visual-muted" x="84" y="42">right triangle / radical distance</text>');
      }

      function exponential(seed) {
        var decay = seed % 2 === 1;
        var path = decay ? 'M56 52 C142 74 214 108 362 176' : 'M56 176 C142 160 230 118 362 45';
        return svg(grid() + '<path class="visual-teal" d="' + path + '"/><path class="visual-amber" opacity=".75" d="M56 170 L362 62" stroke-dasharray="8 8"/><text class="visual-ink" x="58" y="38">exponential</text><text class="visual-muted" x="254" y="202">multiply each step</text>');
      }

      function boxPlot() {
        return svg('<line class="visual-line" x1="52" y1="112" x2="368" y2="112"/><line class="visual-blue" x1="82" y1="112" x2="140" y2="112"/><rect class="visual-fill-teal" x="140" y="78" width="138" height="68" rx="10"/><line class="visual-amber" x1="210" y1="78" x2="210" y2="146"/><line class="visual-blue" x1="278" y1="112" x2="338" y2="112"/><line class="visual-line" x1="82" y1="88" x2="82" y2="136"/><line class="visual-line" x1="338" y1="88" x2="338" y2="136"/><text class="visual-muted" x="70" y="168">min</text><text class="visual-muted" x="132" y="168">Q1</text><text class="visual-muted" x="190" y="168">median</text><text class="visual-muted" x="268" y="168">Q3</text><text class="visual-muted" x="324" y="168">max</text>');
      }

      function scatter() {
        return svg(grid() + '<path class="visual-amber" d="M70 164 L350 58"/><circle class="visual-dot" cx="82" cy="160" r="5"/><circle class="visual-dot" cx="126" cy="140" r="5"/><circle class="visual-dot" cx="158" cy="132" r="5"/><circle class="visual-dot" cx="206" cy="106" r="5"/><circle class="visual-dot" cx="246" cy="92" r="5"/><circle class="visual-dot" cx="296" cy="78" r="5"/><circle class="visual-dot" cx="338" cy="56" r="5"/><text class="visual-ink" x="64" y="42">trend line</text><text class="visual-muted" x="248" y="202">association + prediction</text>');
      }

      function polynomialTiles() {
        return svg('<rect class="visual-fill-blue" x="54" y="54" width="76" height="76" rx="10"/><text class="visual-ink" x="78" y="98">x²</text><rect class="visual-fill-teal" x="150" y="54" width="34" height="76" rx="8"/><rect class="visual-fill-teal" x="194" y="54" width="34" height="76" rx="8"/><text class="visual-ink" x="160" y="154">x</text><text class="visual-ink" x="204" y="154">x</text><rect class="visual-fill-amber" x="258" y="64" width="28" height="28" rx="6"/><rect class="visual-fill-amber" x="294" y="64" width="28" height="28" rx="6"/><rect class="visual-fill-amber" x="330" y="64" width="28" height="28" rx="6"/><text class="visual-muted" x="58" y="192">polynomial pieces: x², x, constants</text>');
      }

      function statsBars() {
        return svg('<rect class="visual-fill-blue" x="76" y="128" width="36" height="44"/><rect class="visual-fill-teal" x="132" y="88" width="36" height="84"/><rect class="visual-fill-amber" x="188" y="58" width="36" height="114"/><rect class="visual-fill-teal" x="244" y="98" width="36" height="74"/><rect class="visual-fill-blue" x="300" y="140" width="36" height="32"/><line class="visual-amber" x1="58" y1="104" x2="356" y2="104" stroke-dasharray="8 8"/><text class="visual-ink" x="64" y="94">mean</text><text class="visual-muted" x="74" y="198">center, spread, outliers</text>');
      }

      function fallback() {
        return svg('<circle class="visual-fill-blue" cx="110" cy="110" r="36"/><circle class="visual-fill-teal" cx="210" cy="110" r="36"/><circle class="visual-fill-amber" cx="310" cy="110" r="36"/><path class="visual-blue" d="M146 110 H174"/><path class="visual-teal" d="M246 110 H274"/><text class="visual-ink" x="83" y="115">idea</text><text class="visual-ink" x="187" y="115">rule</text><text class="visual-ink" x="286" y="115">apply</text>');
      }

      function visualKind(text) {
        var t = text.toLowerCase();
        if (/box|quartile|iqr|five-number/.test(t)) return "box";
        if (/scatter|association|correlation|line of best fit|trend/.test(t)) return "scatter";
        if (/parabola|vertex|quadratic|axis of symmetry/.test(t)) return "parabola";
        if (/radical|square root|pythagorean|right triangle|distance/.test(t)) return "radical";
        if (/exponential|growth|decay|sequence|ratio|recursive/.test(t)) return "exponential";
        if (/number line|inequality|endpoint|interval|solution set|inside|outside/.test(t)) return "number";
        if (/function machine|input|output|domain|range|function notation/.test(t)) return "function";
        if (/polynomial|factor|trinomial|binomial|exponent|power/.test(t)) return "poly";
        if (/mean|median|mode|range|data|spread|outlier/.test(t)) return "stats";
        if (/line|slope|intercept|graph|coordinate|system/.test(t)) return "line";
        return "fallback";
      }

      function draw(kind, seed) {
        if (kind === "number") return numberLine(seed);
        if (kind === "line") return lineGraph(seed);
        if (kind === "function") return functionMachine(seed);
        if (kind === "parabola") return parabola(seed);
        if (kind === "radical") return radicalTriangle(seed);
        if (kind === "exponential") return exponential(seed);
        if (kind === "box") return boxPlot(seed);
        if (kind === "scatter") return scatter(seed);
        if (kind === "poly") return polynomialTiles(seed);
        if (kind === "stats") return statsBars(seed);
        return fallback(seed);
      }

      function renderVisual(kind, seed) {
        return '<div class="lesson-visual" data-kind="' + kind + '" data-seed="' + seed + '"><div class="lesson-visual-top"><span class="lesson-visual-label">Visual model</span><button type="button" data-visual-refresh>Change example</button></div><div data-visual-canvas>' + draw(kind, seed) + '</div></div>';
      }

      function enhance() {
        addStyles();
        var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
        panels.forEach(function(panel) {
          if (panel.dataset.visualEnhanced === "true") return;
          var h2 = panel.querySelector(":scope > h2");
          var p = panel.querySelector(":scope > p");
          if (!h2 || !p) return;
          var title = (h2.textContent || "").trim();
          var lowered = title.toLowerCase();
          if (skipTitles.indexOf(lowered) !== -1) return;
          var body = (p.textContent || "").trim();
          var kind = visualKind(title + " " + body);
          panel.dataset.visualEnhanced = "true";
          p.insertAdjacentHTML("afterend", renderVisual(kind, Math.floor(Math.random() * 1000)));
        });
      }

      document.addEventListener("click", function(event) {
        var button = event.target && event.target.closest ? event.target.closest("[data-visual-refresh]") : null;
        if (!button) return;
        var visual = button.closest(".lesson-visual");
        var canvas = visual && visual.querySelector("[data-visual-canvas]");
        if (!visual || !canvas) return;
        var kind = visual.getAttribute("data-kind") || "fallback";
        var seed = Number(visual.getAttribute("data-seed") || "0") + 1;
        visual.setAttribute("data-seed", String(seed));
        canvas.innerHTML = draw(kind, seed);
      });

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", enhance, { once: true });
      } else {
        enhance();
      }

      var observer = new MutationObserver(function() { enhance(); });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    })();
  `;

  return (
    <html data-font={defaultFont} data-scroll-behavior="smooth" data-theme={defaultTheme} lang="en" suppressHydrationWarning>
      <body>
        <Script dangerouslySetInnerHTML={{ __html: themeScript }} id="matheye-theme-init" strategy="beforeInteractive" />
        <Script dangerouslySetInnerHTML={{ __html: mathTextScript }} id="matheye-math-text-format" strategy="afterInteractive" />
        <Script dangerouslySetInnerHTML={{ __html: lessonVisualScript }} id="matheye-lesson-visuals" strategy="afterInteractive" />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
