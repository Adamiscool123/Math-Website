import type { Course, Difficulty, Formula, QuestionInstance, QuestionTemplate, Topic, Unit, VisualAid, WorkedExample } from "@/content/types";

type TopicKind =
  | "expression"
  | "equation"
  | "inequality"
  | "function"
  | "linear"
  | "systems"
  | "polynomial"
  | "quadratic"
  | "radical"
  | "statistics";

type TopicSpec = {
  title: string;
  slug: string;
  kind: TopicKind;
};

type UnitSpec = {
  id: string;
  title: string;
  description: string;
  topics: TopicSpec[];
};

const COURSE_ID = "algebra-1";

const unitSpecs: UnitSpec[] = [
  {
    id: "foundations",
    title: "Foundations",
    description: "Build fluency with expressions, real-number properties, and precise notation.",
    topics: [
      { title: "Order of Operations", slug: "order-of-operations", kind: "expression" },
      { title: "Properties of Real Numbers", slug: "properties-of-real-numbers", kind: "expression" },
      { title: "Evaluating Expressions", slug: "evaluating-expressions", kind: "expression" },
      { title: "Writing Expressions", slug: "writing-expressions", kind: "expression" },
    ],
  },
  {
    id: "linear-equations",
    title: "Linear Equations",
    description: "Solve equations by preserving equality and isolating the variable.",
    topics: [
      { title: "One-Step Equations", slug: "one-step-equations", kind: "equation" },
      { title: "Two-Step Equations", slug: "two-step-equations", kind: "equation" },
      { title: "Multi-Step Equations", slug: "multi-step-equations", kind: "equation" },
      { title: "Equations with Variables on Both Sides", slug: "variables-on-both-sides", kind: "equation" },
      { title: "Literal Equations", slug: "literal-equations", kind: "equation" },
    ],
  },
  {
    id: "inequalities",
    title: "Inequalities",
    description: "Represent and solve one-sided, compound, and absolute-value inequalities.",
    topics: [
      { title: "One-Step Inequalities", slug: "one-step-inequalities", kind: "inequality" },
      { title: "Multi-Step Inequalities", slug: "multi-step-inequalities", kind: "inequality" },
      { title: "Compound Inequalities", slug: "compound-inequalities", kind: "inequality" },
      { title: "Absolute Value Equations and Inequalities", slug: "absolute-value-equations-inequalities", kind: "inequality" },
    ],
  },
  {
    id: "functions-relations",
    title: "Functions and Relations",
    description: "Connect inputs, outputs, notation, graphs, and patterns.",
    topics: [
      { title: "Domain and Range", slug: "domain-range", kind: "function" },
      { title: "Function Notation", slug: "function-notation", kind: "function" },
      { title: "Evaluating Functions", slug: "evaluating-functions", kind: "function" },
      { title: "Linear vs Non-Linear", slug: "linear-vs-nonlinear", kind: "function" },
    ],
  },
  {
    id: "linear-functions",
    title: "Linear Functions",
    description: "Use slope, intercepts, and forms of a line to model constant rate of change.",
    topics: [
      { title: "Slope", slug: "slope", kind: "linear" },
      { title: "Slope-Intercept Form", slug: "slope-intercept-form", kind: "linear" },
      { title: "Standard Form", slug: "standard-form", kind: "linear" },
      { title: "Point-Slope Form", slug: "point-slope-form", kind: "linear" },
      { title: "Graphing Lines", slug: "graphing-lines", kind: "linear" },
      { title: "Parallel and Perpendicular Lines", slug: "parallel-perpendicular-lines", kind: "linear" },
    ],
  },
  {
    id: "systems",
    title: "Systems of Equations",
    description: "Find ordered pairs that satisfy two linear equations at the same time.",
    topics: [
      { title: "Graphing Systems", slug: "systems-graphing", kind: "systems" },
      { title: "Substitution", slug: "substitution", kind: "systems" },
      { title: "Elimination", slug: "elimination", kind: "systems" },
      { title: "Special Cases", slug: "special-cases", kind: "systems" },
      { title: "Systems Word Problems", slug: "systems-word-problems", kind: "systems" },
    ],
  },
  {
    id: "exponents-polynomials",
    title: "Exponents and Polynomials",
    description: "Apply exponent rules, combine polynomial expressions, multiply, and factor.",
    topics: [
      { title: "Exponent Rules", slug: "exponent-rules", kind: "polynomial" },
      { title: "Adding and Subtracting Polynomials", slug: "adding-subtracting-polynomials", kind: "polynomial" },
      { title: "Multiplying Polynomials", slug: "multiplying-polynomials", kind: "polynomial" },
      { title: "Factoring GCF", slug: "factoring-gcf", kind: "polynomial" },
      { title: "Factoring Trinomials", slug: "factoring-trinomials", kind: "polynomial" },
      { title: "Difference of Squares", slug: "difference-of-squares", kind: "polynomial" },
    ],
  },
  {
    id: "quadratics",
    title: "Quadratic Functions",
    description: "Analyze parabolas, equivalent forms, roots, and application problems.",
    topics: [
      { title: "Standard and Vertex Form", slug: "standard-vertex-form", kind: "quadratic" },
      { title: "Graphing Parabolas", slug: "graphing-parabolas", kind: "quadratic" },
      { title: "Solving by Factoring", slug: "solving-by-factoring", kind: "quadratic" },
      { title: "Quadratic Formula", slug: "quadratic-formula", kind: "quadratic" },
      { title: "Discriminant", slug: "discriminant", kind: "quadratic" },
      { title: "Quadratic Word Problems", slug: "quadratic-word-problems", kind: "quadratic" },
    ],
  },
  {
    id: "radicals",
    title: "Radicals and Irrational Numbers",
    description: "Simplify radicals and connect square roots to distance and right triangles.",
    topics: [
      { title: "Simplifying Radicals", slug: "simplifying-radicals", kind: "radical" },
      { title: "Operations with Radicals", slug: "radical-operations", kind: "radical" },
      { title: "Pythagorean Theorem", slug: "pythagorean-theorem", kind: "radical" },
      { title: "Distance Formula", slug: "distance-formula", kind: "radical" },
    ],
  },
  {
    id: "statistics",
    title: "Statistics",
    description: "Summarize data sets and interpret displays, associations, and trend lines.",
    topics: [
      { title: "Mean, Median, Mode, and Range", slug: "mean-median-mode-range", kind: "statistics" },
      { title: "Box Plots", slug: "box-plots", kind: "statistics" },
      { title: "Scatter Plots", slug: "scatter-plots", kind: "statistics" },
      { title: "Line of Best Fit", slug: "line-of-best-fit", kind: "statistics" },
    ],
  },
];

const formulaMap: Record<TopicKind, Formula[]> = {
  expression: [
    { label: "Substitution", latex: "a(b+c)=ab+ac" },
    { label: "Order", latex: "\\text{Parentheses, exponents, multiply/divide, add/subtract}" },
  ],
  equation: [
    { label: "Equality", latex: "a=b \\Rightarrow a+c=b+c" },
    { label: "Linear equation", latex: "ax+b=c" },
  ],
  inequality: [
    { label: "Inequality reversal", latex: "a<b \\Rightarrow -a>-b" },
    { label: "Interval", latex: "x<c \\text{ or } x>c" },
  ],
  function: [
    { label: "Function notation", latex: "f(x)=mx+b" },
    { label: "Domain and range", latex: "x \\mapsto f(x)" },
  ],
  linear: [
    { label: "Slope", latex: "m=\\frac{y_2-y_1}{x_2-x_1}" },
    { label: "Slope-intercept", latex: "y=mx+b" },
  ],
  systems: [
    { label: "Solution", latex: "\\begin{cases} ax+by=c \\\\ dx+ey=f \\end{cases}" },
    { label: "Intersection", latex: "(x,y)" },
  ],
  polynomial: [
    { label: "Product rule", latex: "x^a \\cdot x^b=x^{a+b}" },
    { label: "Trinomial", latex: "x^2+bx+c=(x+r)(x+s)" },
  ],
  quadratic: [
    { label: "Quadratic formula", latex: "x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}" },
    { label: "Vertex form", latex: "y=a(x-h)^2+k" },
  ],
  radical: [
    { label: "Square root", latex: "\\sqrt{ab}=\\sqrt a\\sqrt b" },
    { label: "Distance", latex: "d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}" },
  ],
  statistics: [
    { label: "Mean", latex: "\\bar{x}=\\frac{x_1+x_2+\\cdots+x_n}{n}" },
    { label: "Range", latex: "\\max-\\min" },
  ],
};

const mistakeMap: Record<TopicKind, string[]> = {
  expression: [
    "Evaluating left to right before handling grouping or exponents.",
    "Forgetting to substitute the value everywhere the variable appears.",
    "Dropping negative signs while simplifying.",
  ],
  equation: [
    "Changing only one side of the equation.",
    "Combining unlike terms as if they were like terms.",
    "Stopping before checking the solution in the original equation.",
  ],
  inequality: [
    "Forgetting to reverse the symbol after multiplying or dividing by a negative.",
    "Graphing an open endpoint as closed.",
    "Treating compound inequalities as two unrelated statements.",
  ],
  function: [
    "Confusing an input with its output.",
    "Reading f(3) as multiplication instead of function notation.",
    "Listing range values before evaluating the domain.",
  ],
  linear: [
    "Using rise over run in the wrong order.",
    "Mixing up slope and y-intercept.",
    "Assuming parallel lines have opposite reciprocal slopes.",
  ],
  systems: [
    "Solving one equation but not checking it in the other.",
    "Losing a sign during elimination.",
    "Missing special cases where equations describe the same line or parallel lines.",
  ],
  polynomial: [
    "Adding exponents when terms are added instead of multiplied.",
    "Multiplying only the first terms in a binomial product.",
    "Factoring without checking by expansion.",
  ],
  quadratic: [
    "Using the signs of the factors backwards.",
    "Forgetting both roots when taking a square root.",
    "Reading the discriminant without connecting it to the number of real solutions.",
  ],
  radical: [
    "Taking square roots term by term across addition.",
    "Leaving a perfect square factor inside the radical.",
    "Forgetting that distance is always nonnegative.",
  ],
  statistics: [
    "Using the range when the problem asks for the mean.",
    "Forgetting to order data before finding the median or quartiles.",
    "Treating correlation as proof of cause.",
  ],
};

const visualMap: Record<TopicKind, VisualAid> = {
  expression: {
    title: "Simplification flow",
    body: "Group terms -> substitute values -> apply operation order -> combine like results -> check reasonableness.",
  },
  equation: {
    title: "Balance model",
    body: "Every operation must keep both sides balanced. Undo addition/subtraction first, then multiplication/division.",
  },
  inequality: {
    title: "Number line thinking",
    body: "Open dots exclude endpoints, closed dots include endpoints, and arrows show every value that makes the statement true.",
  },
  function: {
    title: "Input-output machine",
    body: "A function accepts an input x, applies one rule, and produces exactly one output f(x).",
  },
  linear: {
    title: "Rate of change",
    body: "Slope measures vertical change divided by horizontal change. A constant slope creates a straight line.",
  },
  systems: {
    title: "Intersection model",
    body: "A system solution is the point where both equations are true at the same time.",
  },
  polynomial: {
    title: "Area model",
    body: "Products of polynomial terms can be organized as rectangle areas, then combined by like powers.",
  },
  quadratic: {
    title: "Parabola map",
    body: "Roots are x-intercepts, the vertex is the turning point, and the axis of symmetry passes through the vertex.",
  },
  radical: {
    title: "Square factor ladder",
    body: "Break the radicand into the largest perfect-square factor times the leftover factor.",
  },
  statistics: {
    title: "Data summary stack",
    body: "Center describes a typical value, spread describes variation, and displays reveal shape and unusual points.",
  },
};

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nonZero(min: number, max: number) {
  let value = 0;
  while (value === 0) value = rand(min, max);
  return value;
}

function polynomial(ax2: number, bx: number, c: number) {
  const parts = [
    ax2 === 1 ? "x^2" : ax2 === -1 ? "-x^2" : `${ax2}x^2`,
    bx === 0 ? "" : bx > 0 ? `+${bx}x` : `${bx}x`,
    c === 0 ? "" : c > 0 ? `+${c}` : `${c}`,
  ].filter(Boolean);
  return parts.join("");
}

function instance(
  templateId: string,
  difficulty: Difficulty,
  skill: string,
  prompt: string,
  answers: string[],
  hints: string[],
  solution: string[],
  choices?: string[],
): QuestionInstance {
  return {
    id: `${templateId}-${crypto.randomUUID()}`,
    type: choices ? "multiple-choice" : "free-response",
    difficulty,
    skill,
    prompt,
    acceptedAnswers: answers,
    hints,
    solution,
    choices,
  };
}

function choices(answer: string, wrong: string[]) {
  const uniqueChoices: string[] = [];
  const seen = new Set<string>();
  const addChoice = (value: string) => {
    if (seen.has(value)) return;
    seen.add(value);
    uniqueChoices.push(value);
  };

  addChoice(answer);
  wrong.forEach(addChoice);

  const numericAnswer = Number(answer);
  if (Number.isFinite(numericAnswer)) {
    for (const offset of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5]) {
      if (uniqueChoices.length >= 4) break;
      addChoice(String(numericAnswer + offset));
    }
  }

  return uniqueChoices.slice(0, 4).sort(() => Math.random() - 0.5);
}

function buildQuestion(kind: TopicKind, title: string, templateId: string, difficulty: Difficulty, variant: number) {
  const skill = `${title}: ${difficulty}`;
  const scale = difficulty === "easy" ? 5 : difficulty === "medium" ? 9 : 14;

  if (kind === "expression") {
    const a = nonZero(2, scale);
    const b = rand(-scale, scale);
    const x = rand(1, scale);
    const answer = String(a * x + b);
    return instance(
      templateId,
      difficulty,
      skill,
      `Evaluate ${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} when x = ${x}.`,
      [answer],
      ["Substitute the given value for x.", "Multiply before adding or subtracting.", "Keep the sign on the constant."],
      [`Substitute x = ${x}.`, `${a}(${x}) ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${a * x} ${b >= 0 ? "+" : "-"} ${Math.abs(b)}.`, `The value is ${answer}.`],
      variant % 2 === 0 ? choices(answer, [String(Number(answer) + 1), String(Number(answer) - 1), String(a + x + b)]) : undefined,
    );
  }

  if (kind === "equation") {
    const a = nonZero(2, scale);
    const x = rand(-scale, scale);
    const b = rand(-scale, scale);
    const c = a * x + b;
    const sign = b >= 0 ? "+" : "-";
    return instance(
      templateId,
      difficulty,
      skill,
      `Solve for x: ${a}x ${sign} ${Math.abs(b)} = ${c}.`,
      [String(x)],
      ["Undo addition or subtraction first.", "Divide by the coefficient of x.", "Check by substituting into the original equation."],
      [`Subtract ${b} from both sides to get ${a}x = ${a * x}.`, `Divide both sides by ${a}.`, `x = ${x}.`],
    );
  }

  if (kind === "inequality") {
    const a = rand(2, scale);
    const boundary = rand(-scale, scale);
    const b = rand(-scale, scale);
    const c = a * boundary + b;
    const symbol = variant % 2 === 0 ? "<" : ">";
    return instance(
      templateId,
      difficulty,
      skill,
      `Solve: ${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} ${symbol} ${c}.`,
      [`x${symbol}${boundary}`, `${symbol} ${boundary}`],
      ["Isolate the x-term first.", "Divide by the positive coefficient.", "Because the coefficient is positive, the inequality symbol stays the same."],
      [`Subtract ${b} from both sides: ${a}x ${symbol} ${a * boundary}.`, `Divide by ${a}.`, `x ${symbol} ${boundary}.`],
    );
  }

  if (kind === "function") {
    const m = nonZero(-scale, scale);
    const b = rand(-scale, scale);
    const x = rand(-scale, scale);
    const answer = String(m * x + b);
    return instance(
      templateId,
      difficulty,
      skill,
      `If f(x) = ${m}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)}, find f(${x}).`,
      [answer],
      ["Replace x with the input inside the parentheses.", "Multiply before adding the constant.", "The output is the function value."],
      [`f(${x}) = ${m}(${x}) ${b >= 0 ? "+" : "-"} ${Math.abs(b)}.`, `That equals ${m * x} ${b >= 0 ? "+" : "-"} ${Math.abs(b)}.`, `f(${x}) = ${answer}.`],
      variant % 2 === 1 ? choices(answer, [String(Number(answer) + m), String(Number(answer) - b), String(m + x + b)]) : undefined,
    );
  }

  if (kind === "linear") {
    const m = nonZero(-6, 6);
    const b = rand(-scale, scale);
    const x1 = rand(-6, 2);
    const x2 = x1 + rand(1, 6);
    const y1 = m * x1 + b;
    const y2 = m * x2 + b;
    return instance(
      templateId,
      difficulty,
      skill,
      `Find the slope of the line through (${x1}, ${y1}) and (${x2}, ${y2}).`,
      [String(m)],
      ["Use change in y over change in x.", "Subtract the y-values in the same order as the x-values.", "Simplify the ratio."],
      [`m = (${y2} - ${y1}) / (${x2} - ${x1}).`, `m = ${y2 - y1} / ${x2 - x1}.`, `m = ${m}.`],
      variant % 3 === 0 ? choices(String(m), [String(m + 1), String(-m), String(b)]) : undefined,
    );
  }

  if (kind === "systems") {
    const x = rand(-scale, scale);
    const y = rand(-scale, scale);
    const sum = x + y;
    const diff = x - y;
    return instance(
      templateId,
      difficulty,
      skill,
      `Solve the system: x + y = ${sum} and x - y = ${diff}. Give your answer as x,y.`,
      [`${x},${y}`, `(${x},${y})`],
      ["Add the two equations to eliminate y.", "Divide by 2 to find x.", "Substitute x into one equation to find y."],
      [`Add: 2x = ${sum + diff}.`, `x = ${x}.`, `Substitute into x + y = ${sum}: y = ${y}.`, `The solution is (${x}, ${y}).`],
    );
  }

  if (kind === "polynomial") {
    const r = nonZero(-scale, scale);
    const s = nonZero(-scale, scale);
    const bx = r + s;
    const c = r * s;
    const answer = polynomial(1, bx, c);
    return instance(
      templateId,
      difficulty,
      skill,
      `Expand and simplify: (x ${r >= 0 ? "+" : "-"} ${Math.abs(r)})(x ${s >= 0 ? "+" : "-"} ${Math.abs(s)}).`,
      [answer],
      ["Multiply each term in the first binomial by each term in the second.", "Combine the two x-terms.", "Check the constant by multiplying the constants."],
      [`First and outer/inner terms give x^2, ${s}x, ${r}x, and ${c}.`, `Combine ${s}x + ${r}x = ${bx}x.`, `The result is ${answer}.`],
    );
  }

  if (kind === "quadratic") {
    const r1 = rand(-scale, scale);
    const r2 = r1 + rand(1, 6);
    const bx = -(r1 + r2);
    const c = r1 * r2;
    const answer = String(Math.min(r1, r2));
    return instance(
      templateId,
      difficulty,
      skill,
      `The equation x^2 ${bx >= 0 ? "+" : "-"} ${Math.abs(bx)}x ${c >= 0 ? "+" : "-"} ${Math.abs(c)} = 0 has integer roots. Give the smaller root.`,
      [answer],
      ["Think of two numbers that multiply to the constant term.", "Those numbers add to the x-coefficient.", "Set each factor equal to zero."],
      [`The factored form is (x ${-r1 >= 0 ? "+" : "-"} ${Math.abs(r1)})(x ${-r2 >= 0 ? "+" : "-"} ${Math.abs(r2)}) = 0.`, `The roots are ${r1} and ${r2}.`, `The smaller root is ${answer}.`],
    );
  }

  if (kind === "radical") {
    const squareFree = [2, 3, 5, 6, 7][rand(0, 4)];
    const k = rand(2, scale);
    const radicand = k * k * squareFree;
    return instance(
      templateId,
      difficulty,
      skill,
      `sqrt(${radicand}) = a sqrt(${squareFree}). What is a?`,
      [String(k)],
      ["Find the largest perfect-square factor.", `Rewrite ${radicand} as ${k * k} times ${squareFree}.`, "Take the square root of the perfect-square factor."],
      [`${radicand} = ${k * k} * ${squareFree}.`, `sqrt(${k * k}) = ${k}.`, `sqrt(${radicand}) = ${k}sqrt(${squareFree}), so a = ${k}.`],
    );
  }

  const values = [rand(2, scale), rand(2, scale), rand(2, scale), rand(2, scale), rand(2, scale)];
  const total = values.reduce((sum, value) => sum + value, 0);
  const answer = String(total / values.length);
  return instance(
    templateId,
    difficulty,
    skill,
    `Find the mean of this data set: ${values.join(", ")}.`,
    [answer, Number(answer).toFixed(1)],
    ["Add every value.", "Divide the total by the number of values.", "Keep one decimal place if needed."],
    [`The total is ${total}.`, `There are ${values.length} values.`, `Mean = ${total} / ${values.length} = ${answer}.`],
  );
}

function buildTemplates(kind: TopicKind, title: string, slug: string): QuestionTemplate[] {
  const templates: QuestionTemplate[] = [];
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];

  for (const difficulty of difficulties) {
    for (let i = 1; i <= 5; i += 1) {
      const templateId = `${slug}-${difficulty}-${i}`;
      templates.push({
        id: templateId,
        difficulty,
        skill: `${title}: ${difficulty}`,
        generate: () => buildQuestion(kind, title, templateId, difficulty, i),
      });
    }
  }

  return templates;
}

function buildLesson(title: string, kind: TopicKind) {
  const opener: Record<TopicKind, string> = {
    expression: `${title} is about translating a written or symbolic expression into a clean numerical value or equivalent form. The key habit is to move one operation at a time and keep the structure visible until the final simplification.`,
    equation: `${title} focuses on finding the value that makes two expressions equal. Every step should preserve equality, so whatever changes one side must be matched on the other side.`,
    inequality: `${title} extends equation solving to ranges of values. The solution is often a set on a number line, not just one number.`,
    function: `${title} connects inputs to outputs through a rule. The main question is what values can go in and what values come out.`,
    linear: `${title} studies relationships with a constant rate of change. Slope, intercepts, and equivalent equation forms all describe the same line from different angles.`,
    systems: `${title} asks when two relationships are true at the same time. The answer is usually an ordered pair that satisfies both equations.`,
    polynomial: `${title} builds algebraic fluency with powers and products. The reliable strategy is to track like terms and verify by reversing the operation when possible.`,
    quadratic: `${title} studies second-degree relationships. Parabolas, roots, vertex form, and factoring all describe the same curved pattern.`,
    radical: `${title} uses square roots to describe exact lengths and irrational values. Simplifying means pulling out perfect-square factors without changing the value.`,
    statistics: `${title} turns raw data into summaries. The goal is to describe center, spread, shape, and relationships clearly.`,
  };

  return [
    opener[kind],
    "Start by identifying what the problem is asking for, then choose the representation that makes the next step easiest. In Algebra 1, most mistakes come from moving too quickly through signs, order of operations, or notation.",
    "A strong solution has three parts: a setup that matches the problem, organized algebra or arithmetic, and a final answer checked against the original question.",
  ];
}

function buildExamples(title: string, kind: TopicKind): WorkedExample[] {
  const templates = buildTemplates(kind, title, `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-example`);
  return templates.slice(0, 3).map((template, index) => {
    const question = template.generate();
    return {
      title: `Example ${index + 1}`,
      prompt: question.prompt,
      steps: question.solution,
      answer: question.acceptedAnswers[0],
    };
  });
}

function buildTopic(unitId: string, spec: TopicSpec): Topic {
  return {
    courseId: COURSE_ID,
    unitId,
    id: spec.slug,
    slug: spec.slug,
    title: spec.title,
    summary: `Learn, practice, and test ${spec.title.toLowerCase()} with generated Algebra 1 questions.`,
    lesson: buildLesson(spec.title, spec.kind),
    formulas: formulaMap[spec.kind],
    visual: visualMap[spec.kind],
    commonMistakes: mistakeMap[spec.kind],
    examples: buildExamples(spec.title, spec.kind),
    questionTemplates: buildTemplates(spec.kind, spec.title, spec.slug),
  };
}

const units: Unit[] = unitSpecs.map((unit) => ({
  id: unit.id,
  title: unit.title,
  description: unit.description,
  topics: unit.topics.map((topic) => buildTopic(unit.id, topic)),
}));

export const algebra1Course: Course = {
  id: COURSE_ID,
  slug: "algebra-1",
  title: "Algebra 1",
  description: "A complete Algebra 1 course covering foundations, equations, functions, graphing, quadratics, radicals, and statistics.",
  units,
};

export const algebra1Topics = algebra1Course.units.flatMap((unit) => unit.topics);

export function getTopicBySlug(slug: string) {
  return algebra1Topics.find((topic) => topic.slug === slug);
}

export function getUnitForTopic(slug: string) {
  return algebra1Course.units.find((unit) => unit.topics.some((topic) => topic.slug === slug));
}

export function generatePracticeSet(topic: Topic, difficulty: Difficulty, count = 5) {
  return topic.questionTemplates
    .filter((template) => template.difficulty === difficulty)
    .slice(0, count)
    .map((template) => template.generate());
}

export function generateTestSet(topic: Topic, count = 10) {
  const pool = [
    ...topic.questionTemplates.filter((template) => template.difficulty === "easy").slice(0, 3),
    ...topic.questionTemplates.filter((template) => template.difficulty === "medium").slice(0, 4),
    ...topic.questionTemplates.filter((template) => template.difficulty === "hard").slice(0, 3),
  ];

  return pool.slice(0, count).map((template) => template.generate());
}
