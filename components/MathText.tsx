import { formatMathText } from "@/lib/mathText";

export function MathText({ value }: { value: string }) {
  return <>{formatMathText(value)}</>;
}
