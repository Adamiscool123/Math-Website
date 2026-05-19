const superscripts: Record<string, string> = {
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
  a: "ᵃ",
  b: "ᵇ",
  c: "ᶜ",
  d: "ᵈ",
  e: "ᵉ",
  f: "ᶠ",
  g: "ᵍ",
  h: "ʰ",
  i: "ⁱ",
  j: "ʲ",
  k: "ᵏ",
  l: "ˡ",
  m: "ᵐ",
  n: "ⁿ",
  o: "ᵒ",
  p: "ᵖ",
  q: "ᑫ",
  r: "ʳ",
  s: "ˢ",
  t: "ᵗ",
  u: "ᵘ",
  v: "ᵛ",
  w: "ʷ",
  x: "ˣ",
  y: "ʸ",
  z: "ᶻ",
  A: "ᴬ",
  B: "ᴮ",
  D: "ᴰ",
  E: "ᴱ",
  G: "ᴳ",
  H: "ᴴ",
  I: "ᴵ",
  J: "ᴶ",
  K: "ᴷ",
  L: "ᴸ",
  M: "ᴹ",
  N: "ᴺ",
  O: "ᴼ",
  P: "ᴾ",
  R: "ᴿ",
  T: "ᵀ",
  U: "ᵁ",
  V: "ⱽ",
  W: "ᵂ",
  " ": "",
};

function toSuperscript(value: string) {
  return value
    .split("")
    .map((char) => superscripts[char] ?? char)
    .join("");
}

function replaceSqrt(text: string) {
  let output = "";
  let index = 0;

  while (index < text.length) {
    const start = text.indexOf("sqrt(", index);
    if (start === -1) {
      output += text.slice(index);
      break;
    }

    output += text.slice(index, start);
    let depth = 1;
    let cursor = start + 5;

    while (cursor < text.length && depth > 0) {
      if (text[cursor] === "(") depth += 1;
      if (text[cursor] === ")") depth -= 1;
      cursor += 1;
    }

    if (depth !== 0) {
      output += text.slice(start);
      break;
    }

    const inside = text.slice(start + 5, cursor - 1).trim();
    const simple = /^[A-Za-z0-9.]+$/.test(inside);
    output += `√${simple ? inside : `(${inside})`}`;
    index = cursor;
  }

  return output;
}

export function formatMathText(text: string) {
  if (!text || !/(sqrt\(|\^|\*|<=|>=|!=)/.test(text)) return text;

  return replaceSqrt(text)
    .replace(/<=/g, "≤")
    .replace(/>=/g, "≥")
    .replace(/!=/g, "≠")
    .replace(/\*/g, "·")
    .replace(/\^\(([^)]{1,32})\)/g, (_, power: string) => toSuperscript(`(${power})`))
    .replace(/\^(-?\d+)/g, (_, power: string) => toSuperscript(power))
    .replace(/\^([A-Za-z])/g, (_, power: string) => toSuperscript(power));
}
