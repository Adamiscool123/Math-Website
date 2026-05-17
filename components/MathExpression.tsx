import katex from "katex";

type Props = {
  value: string;
  block?: boolean;
};

export function MathExpression({ value, block = false }: Props) {
  const html = katex.renderToString(value, {
    displayMode: block,
    throwOnError: false,
    strict: false,
  });

  const Tag = block ? "div" : "span";
  return <Tag dangerouslySetInnerHTML={{ __html: html }} />;
}
