import type { Difficulty, Formula, QuestionInstance, QuestionTemplate, VisualAid } from "@/content/types";

type DeepTopicContent = {
  objectives: string[];
  lesson: string[];
  formulas: Formula[];
  visual: VisualAid;
  commonMistakes: string[];
  masteryChecks: string[];
  questionTemplates: QuestionTemplate[];
};

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nonZero(min: number, max: number) {
  let value = 0;
  while (value === 0) value = rand(min, max);
  return value;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function signed(value: number) {
  return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
}

function q(
  id: string,
  difficulty: Difficulty,
  skill: string,
  prompt: string,
  acceptedAnswers: string[],
  hints: string[],
  solution: string[],
  type: QuestionInstance["type"] = "free-response",
  choices?: string[],
): QuestionInstance {
  return {
    id: `${id}-${crypto.randomUUID()}`,
    type: choices ? "multiple-choice" : type,
    difficulty,
    skill,
    prompt,
    acceptedAnswers,
    hints,
    solution,
    choices,
  };
}

function template(id: string, difficulty: Difficulty, skill: string, generate: () => QuestionInstance): QuestionTemplate {
  return { id, difficulty, skill, generate };
}

function domainRangeTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`domain-range-easy-${index + 1}`, "easy", "Domain and Range: ordered pairs", () => {
      const xs = [rand(-8, -1), rand(0, 5), rand(6, 12)];
      const ys = [rand(-10, -2), rand(-1, 4), rand(5, 12)];
      const pairs = xs.map((x, i) => `(${x}, ${ys[i]})`).join(", ");
      const answer = `{${[...new Set(xs)].join(",")}}`;
      return q(
        `domain-range-easy-${index + 1}`,
        "easy",
        "Domain and Range: ordered pairs",
        `Find the domain of the relation: ${pairs}. Write it as {a,b,c}.`,
        [answer, `{${[...new Set(xs)].join(", ")}}`],
        ["The domain is the set of input values.", "In ordered pairs, inputs are x-values.", "List each x-value once."],
        [`The x-values are ${xs.join(", ")}.`, "Domain means inputs.", `The domain is ${answer}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`domain-range-medium-${index + 1}`, "medium", "Domain and Range: range from ordered pairs", () => {
      const xs = [rand(-7, -2), rand(-1, 4), rand(5, 10)];
      const ys = [rand(-8, -3), rand(-2, 3), rand(4, 10)];
      const pairs = xs.map((x, i) => `(${x}, ${ys[i]})`).join(", ");
      const answer = `{${[...new Set(ys)].join(",")}}`;
      return q(
        `domain-range-medium-${index + 1}`,
        "medium",
        "Domain and Range: range from ordered pairs",
        `Find the range of the relation: ${pairs}. Write it as {a,b,c}.`,
        [answer, `{${[...new Set(ys)].join(", ")}}`],
        ["The range is the set of output values.", "In ordered pairs, outputs are y-values.", "List each y-value once."],
        [`The y-values are ${ys.join(", ")}.`, "Range means outputs.", `The range is ${answer}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`domain-range-hard-${index + 1}`, "hard", "Domain and Range: interval notation", () => {
      const left = rand(-10, -1);
      const right = rand(2, 12);
      const includeLeft = index % 2 === 0;
      const includeRight = index % 3 === 0;
      const answer = `${includeLeft ? "[" : "("}${left},${right}${includeRight ? "]" : ")"}`;
      return q(
        `domain-range-hard-${index + 1}`,
        "hard",
        "Domain and Range: interval notation",
        `A graph covers x-values from ${left} to ${right}. The left endpoint is ${includeLeft ? "included" : "not included"}; the right endpoint is ${includeRight ? "included" : "not included"}. Write the domain in interval notation.`,
        [answer, `${includeLeft ? "[" : "("}${left}, ${right}${includeRight ? "]" : ")"}`],
        ["Use brackets for included endpoints.", "Use parentheses for endpoints not included.", "The smaller x-value goes first."],
        [`Left endpoint: ${includeLeft ? "bracket" : "parenthesis"}.`, `Right endpoint: ${includeRight ? "bracket" : "parenthesis"}.`, `The domain is ${answer}.`],
        "multiple-choice",
        shuffle([answer, `(${left},${right})`, `[${left},${right}]`, `${includeLeft ? "(" : "["}${left},${right}${includeRight ? ")" : "]"}`]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function functionNotationTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`function-notation-easy-${index + 1}`, "easy", "Function Notation: evaluate f(a)", () => {
      const m = nonZero(-6, 6);
      const b = rand(-10, 10);
      const x = rand(-8, 8);
      const answer = m * x + b;
      return q(
        `function-notation-easy-${index + 1}`,
        "easy",
        "Function Notation: evaluate f(a)",
        `If f(x) = ${m}x ${signed(b)}, find f(${x}).`,
        [String(answer)],
        ["f(a) means plug a into the function.", `Replace x with ${x}.`, "Use order of operations after substitution."],
        [`f(${x}) = ${m}(${x}) ${signed(b)}.`, `${m}(${x}) = ${m * x}.`, `f(${x}) = ${answer}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`function-notation-medium-${index + 1}`, "medium", "Function Notation: solve for input", () => {
      const m = nonZero(2, 8);
      const b = rand(-10, 10);
      const x = rand(-8, 8);
      const y = m * x + b;
      return q(
        `function-notation-medium-${index + 1}`,
        "medium",
        "Function Notation: solve for input",
        `If f(x) = ${m}x ${signed(b)}, what input x makes f(x) = ${y}?`,
        [String(x), `x=${x}`],
        ["Set the function rule equal to the output.", "Solve the resulting equation.", "The answer is the input, not the output."],
        [`${m}x ${signed(b)} = ${y}.`, b >= 0 ? `${m}x = ${y - b}.` : `${m}x = ${y + Math.abs(b)}.`, `x = ${x}.`],
        "numeric-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`function-notation-hard-${index + 1}`, "hard", "Function Notation: expressions as inputs", () => {
      const a = rand(2, 5);
      const b = rand(-8, 8);
      return q(
        `function-notation-hard-${index + 1}`,
        "hard",
        "Function Notation: expressions as inputs",
        `If f(x) = ${a}x ${signed(b)}, write f(t + 2) in simplified form.`,
        [`${a}t+${2 * a + b}`, `${a}t ${signed(2 * a + b)}`, `${a}*t+${2 * a + b}`],
        ["Replace x with the entire expression t + 2.", "Distribute the coefficient to both terms.", "Combine constants."],
        [`f(t + 2) = ${a}(t + 2) ${signed(b)}.`, `Distribute: ${a}t + ${2 * a} ${signed(b)}.`, `Simplify: ${a}t ${signed(2 * a + b)}.`],
        "expression-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function evaluatingFunctionsTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`evaluating-functions-easy-${index + 1}`, "easy", "Evaluating Functions: table lookup", () => {
      const x = rand(-6, 6);
      const y = rand(-12, 12);
      const otherX = x + rand(1, 4);
      const otherY = y + rand(1, 5);
      return q(
        `evaluating-functions-easy-${index + 1}`,
        "easy",
        "Evaluating Functions: table lookup",
        `A table includes (${x}, ${y}) and (${otherX}, ${otherY}). What is f(${x})?`,
        [String(y)],
        ["Find the row where the input equals the number inside f( ).", "The output is the y-value paired with that input.", "Do not use the other row."],
        [`The input is ${x}.`, `The pair with input ${x} is (${x}, ${y}).`, `So f(${x}) = ${y}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`evaluating-functions-medium-${index + 1}`, "medium", "Evaluating Functions: quadratic rules", () => {
      const a = rand(1, 4);
      const b = rand(-6, 6);
      const x = rand(-5, 5);
      const answer = a * x * x + b;
      return q(
        `evaluating-functions-medium-${index + 1}`,
        "medium",
        "Evaluating Functions: quadratic rules",
        `If g(x) = ${a}x^2 ${signed(b)}, find g(${x}).`,
        [String(answer)],
        ["Substitute the input for x.", "Square the input before multiplying by the coefficient.", "Then add or subtract the constant."],
        [`g(${x}) = ${a}(${x})^2 ${signed(b)}.`, `(${x})^2 = ${x * x}.`, `g(${x}) = ${answer}.`],
        "numeric-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`evaluating-functions-hard-${index + 1}`, "hard", "Evaluating Functions: compare two functions", () => {
      const m = rand(2, 6);
      const b = rand(-8, 8);
      const x = rand(-5, 5);
      const f = m * x + b;
      const h = x * x + b;
      const correct = f > h ? "f" : f < h ? "h" : "equal";
      return q(
        `evaluating-functions-hard-${index + 1}`,
        "hard",
        "Evaluating Functions: compare two functions",
        `At x = ${x}, which is greater: f(x) = ${m}x ${signed(b)} or h(x) = x^2 ${signed(b)}? Answer f, h, or equal.`,
        [correct],
        ["Evaluate both functions at the same input.", "Compare the two outputs.", "The greater function has the greater output at that x-value."],
        [`f(${x}) = ${m}(${x}) ${signed(b)} = ${f}.`, `h(${x}) = ${x}^2 ${signed(b)} = ${h}.`, `${correct === "equal" ? "The outputs are equal." : `${correct} is greater.`}`],
        "multiple-choice",
        shuffle(["f", "h", "equal", "cannot tell"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function linearVsNonlinearTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`linear-vs-nonlinear-easy-${index + 1}`, "easy", "Linear vs Non-Linear: constant rate", () => {
      const start = rand(-5, 5);
      const rate = nonZero(1, 6);
      const values = [start, start + rate, start + 2 * rate, start + 3 * rate];
      return q(
        `linear-vs-nonlinear-easy-${index + 1}`,
        "easy",
        "Linear vs Non-Linear: constant rate",
        `Classify the output pattern as linear or non-linear: ${values.join(", ")}.`,
        ["linear"],
        ["Check the differences between consecutive outputs.", "A constant difference means linear.", `Each output changes by ${rate}.`],
        [`Differences: ${rate}, ${rate}, ${rate}.`, "The difference is constant.", "The pattern is linear."],
        "multiple-choice",
        shuffle(["linear", "non-linear", "quadratic only", "not a function"]),
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`linear-vs-nonlinear-medium-${index + 1}`, "medium", "Linear vs Non-Linear: changing differences", () => {
      const values = [1, 4, 9, 16].map((v) => v + index);
      return q(
        `linear-vs-nonlinear-medium-${index + 1}`,
        "medium",
        "Linear vs Non-Linear: changing differences",
        `Classify the output pattern as linear or non-linear: ${values.join(", ")}.`,
        ["non-linear", "nonlinear"],
        ["Check first differences.", "A linear pattern has the same change every time.", "These differences change."],
        [`Differences: ${values[1] - values[0]}, ${values[2] - values[1]}, ${values[3] - values[2]}.`, "The differences are not constant.", "The pattern is non-linear."],
        "multiple-choice",
        shuffle(["linear", "non-linear", "constant", "not enough information"]),
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`linear-vs-nonlinear-hard-${index + 1}`, "hard", "Linear vs Non-Linear: equations", () => {
      const linear = index % 2 === 0;
      const m = nonZero(-5, 5);
      const b = rand(-8, 8);
      const prompt = linear ? `y = ${m}x ${signed(b)}` : `y = ${m}x^2 ${signed(b)}`;
      const answer = linear ? "linear" : "non-linear";
      return q(
        `linear-vs-nonlinear-hard-${index + 1}`,
        "hard",
        "Linear vs Non-Linear: equations",
        `Classify the equation as linear or non-linear: ${prompt}.`,
        [answer, answer.replace("-", "")],
        ["Look at the exponent on x.", "Linear equations have x to the first power only.", "Squared variables make the relation non-linear."],
        [`The equation is ${prompt}.`, linear ? "x is only to the first power." : "x is squared.", `So the equation is ${answer}.`],
        "multiple-choice",
        shuffle(["linear", "non-linear", "constant", "not a relation"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

export const functionsRelations: Record<string, DeepTopicContent> = {
  "domain-range": {
    objectives: ["Identify inputs and outputs in relations.", "Find domain and range from ordered pairs, tables, and graphs.", "Use set notation and interval notation correctly.", "Understand endpoint inclusion with brackets and parentheses."],
    lesson: [
      "The domain of a relation is the set of all possible inputs. In ordered pairs, the domain is the set of x-values.",
      "The range is the set of all possible outputs. In ordered pairs, the range is the set of y-values.",
      "When listing domain or range from points, repeat values should be written only once. Sets do not list duplicates.",
      "Graphs can have domains and ranges written as intervals. Brackets mean an endpoint is included; parentheses mean it is not included.",
      "A point uses both coordinates, but domain and range separate the coordinates into input set and output set.",
      "Domain and range are not just vocabulary. They describe where a function is allowed to live and what outputs it can produce.",
    ],
    formulas: [{ label: "Domain", latex: "\\text{domain}=\\{x\\text{-values}\\}" }, { label: "Range", latex: "\\text{range}=\\{y\\text{-values}\\}" }, { label: "Interval endpoints", latex: "[a,b] \\text{ includes endpoints}; \\ (a,b) \\text{ does not}" }],
    visual: { title: "Input-output split", body: "For every point (x, y), send x to the domain list and y to the range list. Then remove duplicates." },
    commonMistakes: ["Mixing up x-values and y-values.", "Listing repeated values multiple times in a set.", "Using brackets when endpoints are not included.", "Reading range left-to-right instead of bottom-to-top on a graph.", "Thinking every domain must be all real numbers."],
    masteryChecks: ["I can find domain from ordered pairs.", "I can find range from ordered pairs.", "I can read intervals from graph endpoints.", "I can explain what inputs and outputs mean."],
    questionTemplates: domainRangeTemplates(),
  },
  "function-notation": {
    objectives: ["Interpret f(x) as output notation, not multiplication.", "Evaluate functions at numbers and expressions.", "Solve for an input when a function output is given.", "Use function notation to describe input-output relationships."],
    lesson: [
      "Function notation is a compact way to name outputs. f(3) means the output of function f when the input is 3.",
      "The expression f(x) does not mean f times x. It means the rule named f is being applied to the input x.",
      "To evaluate f(a), replace every x in the rule with a. Parentheses help protect negative inputs and expression inputs.",
      "Sometimes you are given the output and asked for the input. Then set the function rule equal to the output and solve.",
      "Functions can take expression inputs like t + 2. Replace x with the entire expression and simplify carefully.",
      "This notation matters later because transformations, inverse functions, and calculus all use the same input-output language.",
    ],
    formulas: [{ label: "Evaluate", latex: "f(a)=\\text{rule with } x=a" }, { label: "Solve input", latex: "f(x)=k \\Rightarrow \\text{solve for }x" }, { label: "Expression input", latex: "f(t+2)=\\text{rule with }x=t+2" }],
    visual: { title: "Function machine", body: "Input goes into the rule, the rule processes it, and one output comes out." },
    commonMistakes: ["Treating f(x) as f times x.", "Substituting into only one x when the rule has multiple x's.", "Dropping parentheses around negative inputs.", "Returning the output when the question asks for the input.", "Forgetting to distribute with expression inputs."],
    masteryChecks: ["I can explain what f(3) means.", "I can evaluate f(x) at a number.", "I can solve f(x) = k for x.", "I can evaluate f(t + 2)."],
    questionTemplates: functionNotationTemplates(),
  },
  "evaluating-functions": {
    objectives: ["Evaluate functions from rules, tables, and graphs.", "Substitute inputs carefully into linear and nonlinear rules.", "Compare outputs from two functions at the same input.", "Use function values to answer contextual questions."],
    lesson: [
      "Evaluating a function means finding the output for a given input. The input may come from notation, a table, a graph, or a word problem.",
      "From a table, find the input row first, then read the matching output. Do not choose the closest value unless the problem asks for an estimate.",
      "From a rule, substitute the input into every place the variable appears. Use parentheses, especially for negative numbers.",
      "For quadratic or squared rules, square the input before multiplying by coefficients or adding constants.",
      "Comparing functions means evaluating both at the same input and comparing the outputs.",
      "Evaluation is a foundation skill: later, function composition, transformations, and derivatives all depend on precise input substitution.",
    ],
    formulas: [{ label: "Table evaluation", latex: "x=a \\Rightarrow \\text{read matching }y" }, { label: "Rule evaluation", latex: "g(a)=\\text{substitute }a\\text{ for }x" }, { label: "Compare", latex: "f(a)>g(a) \\text{ if output of }f\\text{ is larger}" }],
    visual: { title: "Same input comparison", body: "When comparing functions, put the same input into both machines, then compare outputs." },
    commonMistakes: ["Using the wrong row in a table.", "Evaluating only part of a function rule.", "Forgetting to square negative inputs with parentheses.", "Comparing equations without calculating outputs.", "Confusing input value with output value."],
    masteryChecks: ["I can evaluate from a table.", "I can evaluate linear and quadratic rules.", "I can compare two function outputs.", "I can explain the difference between input and output."],
    questionTemplates: evaluatingFunctionsTemplates(),
  },
  "linear-vs-nonlinear": {
    objectives: ["Recognize linear relationships by constant rate of change.", "Identify non-linear patterns from changing differences.", "Classify equations as linear or non-linear.", "Connect tables, equations, and graphs to rate of change."],
    lesson: [
      "A linear relationship changes by a constant amount for equal steps in the input. On a graph, this creates a straight line.",
      "A table is linear when first differences in the outputs are constant as x increases by equal steps.",
      "A non-linear relationship does not have a constant rate of change. The graph may curve, bend, or change steepness.",
      "Equations with x only to the first power are often linear. Equations with x squared, x in a denominator, or other nonlinear operations are not linear.",
      "Do not classify a relationship by whether the numbers go up or down. Both linear and non-linear patterns can increase or decrease.",
      "The key question is: does the output change by the same amount each time the input changes by the same amount?",
    ],
    formulas: [{ label: "Constant difference", latex: "\\Delta y \\text{ is constant}" }, { label: "Linear form", latex: "y=mx+b" }, { label: "Nonlinear example", latex: "y=x^2" }],
    visual: { title: "Straight or changing rate", body: "Linear means constant rate and a straight graph. Non-linear means the rate changes." },
    commonMistakes: ["Thinking any increasing pattern is linear.", "Checking only one difference instead of all differences.", "Calling y = x^2 linear because it has x in it.", "Ignoring unequal x-steps in a table.", "Confusing constant output with constant rate."],
    masteryChecks: ["I can test first differences in a table.", "I can classify equations by variable powers.", "I can explain constant rate of change.", "I can tell linear and non-linear graphs apart."],
    questionTemplates: linearVsNonlinearTemplates(),
  },
};
