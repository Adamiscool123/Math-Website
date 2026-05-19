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

function rootAnswers(r1: number, r2: number) {
  const a = Math.min(r1, r2);
  const b = Math.max(r1, r2);
  return [`${a},${b}`, `${a}, ${b}`, `x=${a},x=${b}`, `x = ${a}, x = ${b}`, `${b},${a}`, `${b}, ${a}`];
}

function standardVertexTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`standard-vertex-easy-${index + 1}`, "easy", "Quadratics: identify coefficients", () => {
      const a = nonZero(-4, 4);
      const b = rand(-8, 8);
      const c = rand(-10, 10);
      return q(
        `standard-vertex-easy-${index + 1}`,
        "easy",
        "Quadratics: identify coefficients",
        `For f(x) = ${a}x^2 ${signed(b)}x ${signed(c)}, what is a?`,
        [String(a)],
        ["Standard form is ax^2 + bx + c.", "a is the coefficient of x^2.", "Keep the sign attached to the coefficient."],
        [`Compare f(x) = ${a}x^2 ${signed(b)}x ${signed(c)} with ax^2 + bx + c.`, `The coefficient of x^2 is ${a}.`, `So a = ${a}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`standard-vertex-medium-${index + 1}`, "medium", "Quadratics: vertex form features", () => {
      const h = rand(-6, 6);
      const k = rand(-8, 8);
      const a = index % 2 === 0 ? 1 : -1;
      return q(
        `standard-vertex-medium-${index + 1}`,
        "medium",
        "Quadratics: vertex form features",
        `For f(x) = ${a === 1 ? "" : "-"}(x ${signed(-h)})^2 ${signed(k)}, what is the vertex?`,
        [`(${h},${k})`, `(${h}, ${k})`],
        ["Vertex form is a(x - h)^2 + k.", "The sign inside parentheses is opposite of h.", "The outside constant is k."],
        [`Compare with a(x - h)^2 + k.`, `Here h = ${h} and k = ${k}.`, `The vertex is (${h}, ${k}).`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`standard-vertex-hard-${index + 1}`, "hard", "Quadratics: convert vertex form to standard form", () => {
      const h = rand(-5, 5);
      const k = rand(-8, 8);
      const b = -2 * h;
      const c = h * h + k;
      const answer = `x^2${signed(b)}x${signed(c)}`;
      return q(
        `standard-vertex-hard-${index + 1}`,
        "hard",
        "Quadratics: convert vertex form to standard form",
        `Expand (x ${signed(-h)})^2 ${signed(k)} into standard form.`,
        [answer, `1x^2${signed(b)}x${signed(c)}`],
        ["Square the binomial first.", "Then combine the constant term with k.", "Standard form is ax^2 + bx + c."],
        [`(x ${signed(-h)})^2 = x^2 ${signed(b)}x + ${h * h}.`, `Add ${k}: ${h * h} ${signed(k)} = ${c}.`, `Standard form is ${answer}.`],
        "expression-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function graphingParabolasTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`graphing-parabolas-easy-${index + 1}`, "easy", "Graphing Parabolas: opens up or down", () => {
      const a = index % 2 === 0 ? rand(1, 5) : -rand(1, 5);
      const answer = a > 0 ? "up" : "down";
      return q(
        `graphing-parabolas-easy-${index + 1}`,
        "easy",
        "Graphing Parabolas: opens up or down",
        `Does y = ${a}x^2 open up or down?`,
        [answer],
        ["Look at the sign of a.", "Positive a opens upward.", "Negative a opens downward."],
        [`The coefficient a is ${a}.`, a > 0 ? "a is positive." : "a is negative.", `The parabola opens ${answer}.`],
        "multiple-choice",
        shuffle(["up", "down", "left", "right"]),
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`graphing-parabolas-medium-${index + 1}`, "medium", "Graphing Parabolas: axis of symmetry", () => {
      const h = rand(-6, 6);
      const k = rand(-8, 8);
      return q(
        `graphing-parabolas-medium-${index + 1}`,
        "medium",
        "Graphing Parabolas: axis of symmetry",
        `For y = (x ${signed(-h)})^2 ${signed(k)}, what is the axis of symmetry?`,
        [`x=${h}`, `x = ${h}`],
        ["The axis of symmetry goes through the vertex.", "In vertex form, the vertex x-coordinate is h.", "The axis is written as x = h."],
        [`The vertex is (${h}, ${k}).`, `The vertical line through the vertex is x = ${h}.`, `Axis of symmetry: x = ${h}.`],
        "equation-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`graphing-parabolas-hard-${index + 1}`, "hard", "Graphing Parabolas: find vertex from standard form", () => {
      const h = rand(-5, 5);
      const k = rand(-8, 8);
      const b = -2 * h;
      const c = h * h + k;
      return q(
        `graphing-parabolas-hard-${index + 1}`,
        "hard",
        "Graphing Parabolas: find vertex from standard form",
        `Find the vertex of y = x^2 ${signed(b)}x ${signed(c)}.`,
        [`(${h},${k})`, `(${h}, ${k})`],
        ["Use x = -b/(2a) to find the vertex x-coordinate.", "Then substitute that x-value into the quadratic.", "The result is the vertex."],
        [`Here a = 1 and b = ${b}.`, `x = -(${b}) / 2 = ${h}.`, `y = ${h}^2 ${signed(b)}(${h}) ${signed(c)} = ${k}.`, `Vertex: (${h}, ${k}).`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function factoringSolveTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`solving-factoring-easy-${index + 1}`, "easy", "Solving Quadratics by Factoring: zero product property", () => {
      const r1 = rand(-8, -1);
      const r2 = rand(1, 8);
      const b = -(r1 + r2);
      const c = r1 * r2;
      return q(
        `solving-factoring-easy-${index + 1}`,
        "easy",
        "Solving Quadratics by Factoring: zero product property",
        `Solve x^2 ${signed(b)}x ${signed(c)} = 0. Give answers as smaller,larger.`,
        rootAnswers(r1, r2),
        ["Factor the quadratic.", "Use the zero product property.", "Set each factor equal to zero."],
        [`The factors are (x ${signed(-r1)})(x ${signed(-r2)}).`, `Set x ${signed(-r1)} = 0 and x ${signed(-r2)} = 0.`, `The solutions are x = ${r1} and x = ${r2}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`solving-factoring-medium-${index + 1}`, "medium", "Solving Quadratics by Factoring: common binomials", () => {
      const r1 = rand(1, 8);
      const r2 = rand(1, 8);
      const b = r1 + r2;
      const c = r1 * r2;
      return q(
        `solving-factoring-medium-${index + 1}`,
        "medium",
        "Solving Quadratics by Factoring: common binomials",
        `Solve x^2 + ${b}x + ${c} = 0. Give answers as smaller,larger.`,
        rootAnswers(-r1, -r2),
        ["Find two numbers that multiply to c and add to b.", `${r1} and ${r2} work.`, "Then set each factor equal to zero."],
        [`x^2 + ${b}x + ${c} = (x + ${r1})(x + ${r2}).`, `x + ${r1} = 0 or x + ${r2} = 0.`, `The solutions are x = ${-r1} and x = ${-r2}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`solving-factoring-hard-${index + 1}`, "hard", "Solving Quadratics by Factoring: GCF first", () => {
      const r = rand(2, 9);
      const g = rand(2, 6);
      return q(
        `solving-factoring-hard-${index + 1}`,
        "hard",
        "Solving Quadratics by Factoring: GCF first",
        `Solve ${g}x^2 - ${g * r}x = 0. Give answers as smaller,larger.`,
        rootAnswers(0, r),
        ["Factor out the GCF first.", "One factor is x.", "Use the zero product property."],
        [`${g}x^2 - ${g * r}x = ${g}x(x - ${r}).`, `Set ${g}x = 0 or x - ${r} = 0.`, `The solutions are x = 0 and x = ${r}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function quadraticFormulaTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`quadratic-formula-easy-${index + 1}`, "easy", "Quadratic Formula: identify a b c", () => {
      const a = rand(1, 5);
      const b = rand(-9, 9);
      const c = rand(-10, 10);
      return q(
        `quadratic-formula-easy-${index + 1}`,
        "easy",
        "Quadratic Formula: identify a b c",
        `For ${a}x^2 ${signed(b)}x ${signed(c)} = 0, what is b?`,
        [String(b)],
        ["Write the equation in ax^2 + bx + c = 0 form.", "b is the coefficient of x.", "Keep the sign attached."],
        [`Standard form is ax^2 + bx + c = 0.`, `The x coefficient is ${b}.`, `So b = ${b}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`quadratic-formula-medium-${index + 1}`, "medium", "Quadratic Formula: solve simple roots", () => {
      const r1 = rand(-6, -1);
      const r2 = rand(1, 6);
      const b = -(r1 + r2);
      const c = r1 * r2;
      return q(
        `quadratic-formula-medium-${index + 1}`,
        "medium",
        "Quadratic Formula: solve simple roots",
        `Use the quadratic formula to solve x^2 ${signed(b)}x ${signed(c)} = 0. Give answers as smaller,larger.`,
        rootAnswers(r1, r2),
        ["Use a = 1, b from the x coefficient, and c from the constant.", "Compute the discriminant b^2 - 4ac.", "Use both plus and minus square-root cases."],
        [`a = 1, b = ${b}, c = ${c}.`, `Discriminant: ${b}^2 - 4(1)(${c}) = ${(r2 - r1) ** 2}.`, `The formula gives x = ${r1} and x = ${r2}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`quadratic-formula-hard-${index + 1}`, "hard", "Quadratic Formula: choose best method", () => {
      const a = rand(2, 5);
      const b = rand(-9, 9);
      const c = rand(-10, 10);
      return q(
        `quadratic-formula-hard-${index + 1}`,
        "hard",
        "Quadratic Formula: choose best method",
        `Which method always works for solving ${a}x^2 ${signed(b)}x ${signed(c)} = 0?`,
        ["quadratic formula"],
        ["Factoring does not always work nicely.", "Graphing may be approximate.", "The quadratic formula works for any quadratic equation."],
        ["The quadratic formula applies to every equation in ax^2 + bx + c = 0 form.", "It can handle factorable and non-factorable quadratics.", "So the always-working method is the quadratic formula."],
        "multiple-choice",
        shuffle(["quadratic formula", "factoring only", "mental math only", "linear slope formula"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function discriminantTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`discriminant-easy-${index + 1}`, "easy", "Discriminant: calculate value", () => {
      const a = rand(1, 4);
      const b = rand(3, 12);
      const c = rand(-5, 5);
      const d = b * b - 4 * a * c;
      return q(
        `discriminant-easy-${index + 1}`,
        "easy",
        "Discriminant: calculate value",
        `Find the discriminant of ${a}x^2 + ${b}x ${signed(c)} = 0.`,
        [String(d)],
        ["The discriminant is b^2 - 4ac.", `Here a = ${a}, b = ${b}, and c = ${c}.`, "Substitute carefully."],
        [`D = b^2 - 4ac.`, `D = ${b}^2 - 4(${a})(${c}).`, `D = ${d}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`discriminant-medium-${index + 1}`, "medium", "Discriminant: number of real solutions", () => {
      const d = [25, 0, -9, 16, -4][index];
      const answer = d > 0 ? "two real solutions" : d === 0 ? "one real solution" : "no real solutions";
      return q(
        `discriminant-medium-${index + 1}`,
        "medium",
        "Discriminant: number of real solutions",
        `If a quadratic has discriminant ${d}, how many real solutions does it have?`,
        [answer, d > 0 ? "two" : d === 0 ? "one" : "none"],
        ["Positive discriminant means two real solutions.", "Zero discriminant means one repeated real solution.", "Negative discriminant means no real solutions."],
        [d > 0 ? "The discriminant is positive." : d === 0 ? "The discriminant equals zero." : "The discriminant is negative.", `Therefore the quadratic has ${answer}.`, "This tells solution count before solving."],
        "multiple-choice",
        shuffle(["two real solutions", "one real solution", "no real solutions", "infinitely many solutions"]),
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`discriminant-hard-${index + 1}`, "hard", "Discriminant: classify graph intersections", () => {
      const d = [36, 0, -16, 49, -1][index];
      const answer = d > 0 ? "crosses the x-axis twice" : d === 0 ? "touches the x-axis once" : "does not cross the x-axis";
      return q(
        `discriminant-hard-${index + 1}`,
        "hard",
        "Discriminant: classify graph intersections",
        `A quadratic has discriminant ${d}. What does its graph do with the x-axis?`,
        [answer],
        ["The x-intercepts are the real solutions.", "Use the sign of the discriminant.", "Translate solution count into graph behavior."],
        [d > 0 ? "Positive discriminant means two real roots." : d === 0 ? "Zero discriminant means one repeated root." : "Negative discriminant means no real roots.", `So the graph ${answer}.`, "This describes the x-intercepts."],
        "multiple-choice",
        shuffle(["crosses the x-axis twice", "touches the x-axis once", "does not cross the x-axis", "is a vertical line"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function wordProblemTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`quadratic-word-easy-${index + 1}`, "easy", "Quadratic Word Problems: maximum height from vertex", () => {
      const h = rand(2, 8);
      const k = rand(10, 80);
      return q(
        `quadratic-word-easy-${index + 1}`,
        "easy",
        "Quadratic Word Problems: maximum height from vertex",
        `A ball's height is h(t) = -(t - ${h})^2 + ${k}. What is the maximum height?`,
        [String(k)],
        ["The equation is in vertex form.", "Because a is negative, the vertex is a maximum.", "The y-coordinate of the vertex is the maximum height."],
        [`The vertex is (${h}, ${k}).`, "The parabola opens down, so the vertex is the highest point.", `Maximum height is ${k}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`quadratic-word-medium-${index + 1}`, "medium", "Quadratic Word Problems: time at ground", () => {
      const r = rand(2, 9);
      return q(
        `quadratic-word-medium-${index + 1}`,
        "medium",
        "Quadratic Word Problems: time at ground",
        `A toy rocket's height is h(t) = -t^2 + ${r * r}. When does it hit the ground?`,
        [String(r), `t=${r}`],
        ["Ground height means h(t) = 0.", "Set the quadratic equal to zero.", "Use the positive time answer."],
        [`Set -t^2 + ${r * r} = 0.`, `t^2 = ${r * r}.`, `t = ${r} seconds because time is positive.`],
        "numeric-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`quadratic-word-hard-${index + 1}`, "hard", "Quadratic Word Problems: area model", () => {
      const width = rand(3, 10);
      const length = width + rand(2, 8);
      const perimeter = 2 * width + 2 * length;
      const area = width * length;
      return q(
        `quadratic-word-hard-${index + 1}`,
        "hard",
        "Quadratic Word Problems: area model",
        `A rectangle has area ${area}. Its length is ${length - width} more than its width. What is the width?`,
        [String(width)],
        ["Let w be the width.", `Then the length is w + ${length - width}.`, "Set up area = width times length."],
        [`Let width be w and length be w + ${length - width}.`, `w(w + ${length - width}) = ${area}.`, `w = ${width} gives length ${length}, and ${width} · ${length} = ${area}.`],
        "numeric-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

export const quadraticFunctions: Record<string, DeepTopicContent> = {
  "standard-vertex-form": {
    objectives: ["Identify a, b, and c in standard form.", "Identify vertex, stretch, and opening direction from vertex form.", "Convert simple vertex form to standard form.", "Explain what each quadratic form reveals."],
    lesson: ["Quadratics can be written in different forms, and each form makes different features easier to see.", "Standard form is ax^2 + bx + c. It makes the y-intercept and coefficients easy to identify.", "Vertex form is a(x - h)^2 + k. It makes the vertex (h, k) and opening direction easy to see.", "The sign of a controls whether the parabola opens upward or downward. The size of a controls vertical stretch or compression.", "Converting vertex form to standard form means expanding the squared binomial and combining like terms.", "Strong quadratic work means choosing the form that gives the feature you need fastest."],
    formulas: [{ label: "Standard form", latex: "f(x)=ax^2+bx+c" }, { label: "Vertex form", latex: "f(x)=a(x-h)^2+k" }, { label: "Vertex", latex: "(h,k)" }],
    visual: { title: "Form tells feature", body: "Standard form shows coefficients and y-intercept. Vertex form shows the turning point immediately." },
    commonMistakes: ["Thinking the sign inside parentheses gives h directly instead of oppositely.", "Forgetting to square the whole binomial when expanding.", "Confusing c with the vertex y-value.", "Ignoring the sign of a.", "Calling every quadratic form vertex form."],
    masteryChecks: ["I can identify standard form.", "I can identify vertex form.", "I can find a vertex from vertex form.", "I can expand simple vertex form."],
    questionTemplates: standardVertexTemplates(),
  },
  "graphing-parabolas": {
    objectives: ["Determine whether a parabola opens up or down.", "Find vertex and axis of symmetry.", "Use symmetric points to graph a parabola.", "Connect roots and intercepts to the graph."],
    lesson: ["A quadratic graph is a parabola. It has a turning point called the vertex.", "If a is positive, the parabola opens upward and the vertex is a minimum. If a is negative, it opens downward and the vertex is a maximum.", "The axis of symmetry is a vertical line through the vertex. It has equation x = h or x = -b/(2a).", "Points on a parabola are symmetric across the axis of symmetry.", "The y-intercept occurs when x = 0. The x-intercepts are the solutions to the quadratic equation.", "Graphing well means using the vertex, axis, opening direction, and a few accurate points together."],
    formulas: [{ label: "Axis from standard form", latex: "x=-\\frac{b}{2a}" }, { label: "Vertex form axis", latex: "x=h" }, { label: "Opening", latex: "a>0 \\text{ up}, \\quad a<0 \\text{ down}" }],
    visual: { title: "Mirror around the axis", body: "Find the vertex, draw the vertical axis, then plot matching points the same distance left and right." },
    commonMistakes: ["Using y = h for the axis instead of x = h.", "Forgetting that negative a opens downward.", "Plotting asymmetric points by mistake.", "Confusing vertex with x-intercept.", "Finding x = -b/2a but not substituting to find y."],
    masteryChecks: ["I can find opening direction.", "I can find the axis of symmetry.", "I can find a vertex from standard form.", "I can explain graph symmetry."],
    questionTemplates: graphingParabolasTemplates(),
  },
  "solving-by-factoring": {
    objectives: ["Set a quadratic equation equal to zero before factoring.", "Factor quadratics to find roots.", "Use the zero product property.", "Interpret roots as x-intercepts."],
    lesson: ["Solving by factoring works when a quadratic equation can be rewritten as a product equal to zero.", "The zero product property says if AB = 0, then A = 0 or B = 0.", "Before factoring, make sure one side of the equation is zero. If not, move all terms to one side first.", "After factoring, set each factor equal to zero and solve the resulting linear equations.", "The solutions are roots, zeros, or x-intercepts depending on the context.", "Factoring is fast when the quadratic has clean integer factors, but not every quadratic factors nicely."],
    formulas: [{ label: "Zero product property", latex: "AB=0 \\Rightarrow A=0 \\text{ or } B=0" }, { label: "Factored form", latex: "a(x-r_1)(x-r_2)=0" }, { label: "Roots", latex: "x=r_1, r_2" }],
    visual: { title: "Factors become solutions", body: "Once the product equals zero, each factor gets its own small equation." },
    commonMistakes: ["Factoring before setting the equation equal to zero.", "Factoring correctly but forgetting to solve each factor.", "Reporting factors instead of roots.", "Dropping the root x = 0 after factoring out x.", "Not checking signs in binomial factors."],
    masteryChecks: ["I can factor simple quadratics.", "I can use the zero product property.", "I can solve quadratics with a GCF.", "I can connect roots to x-intercepts."],
    questionTemplates: factoringSolveTemplates(),
  },
  "quadratic-formula": {
    objectives: ["Identify a, b, and c before using the formula.", "Apply the quadratic formula accurately.", "Use both plus and minus cases.", "Know why the formula works even when factoring is hard."],
    lesson: ["The quadratic formula solves any quadratic equation in ax^2 + bx + c = 0 form.", "Before using the formula, move all terms to one side so the equation equals zero.", "The values a, b, and c must include their signs. A sign mistake changes the entire answer.", "The plus-minus symbol means there are usually two possible solutions.", "The square root part, b^2 - 4ac, controls how many real solutions appear.", "The formula is slower than factoring for easy problems, but it is more reliable when factoring is not obvious."],
    formulas: [{ label: "Quadratic formula", latex: "x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}" }, { label: "Standard form", latex: "ax^2+bx+c=0" }, { label: "Discriminant", latex: "b^2-4ac" }],
    visual: { title: "Formula checklist", body: "Standard form first. Identify a, b, c with signs. Substitute carefully. Simplify the discriminant. Split plus and minus." },
    commonMistakes: ["Using the formula before setting the equation equal to zero.", "Dropping the negative sign in -b.", "Forgetting the plus-minus case.", "Putting 2a only under the square root part.", "Misidentifying b when the x coefficient is negative."],
    masteryChecks: ["I can identify a, b, c.", "I can substitute into the formula.", "I can simplify clean-root examples.", "I can explain when the formula is useful."],
    questionTemplates: quadraticFormulaTemplates(),
  },
  discriminant: {
    objectives: ["Calculate the discriminant b^2 - 4ac.", "Use the discriminant to predict solution count.", "Connect discriminant sign to x-intercepts.", "Classify quadratics before solving fully."],
    lesson: ["The discriminant is the expression inside the square root of the quadratic formula: b^2 - 4ac.", "A positive discriminant means two real solutions because the square root creates two different values.", "A zero discriminant means one real repeated solution because plus and minus zero give the same answer.", "A negative discriminant means no real solutions because real numbers do not square to negative values.", "Graphically, real solutions are x-intercepts. So the discriminant predicts how the parabola interacts with the x-axis.", "The discriminant helps you know what kind of answer to expect before doing all the solving."],
    formulas: [{ label: "Discriminant", latex: "D=b^2-4ac" }, { label: "Positive", latex: "D>0 \\Rightarrow 2 \\text{ real solutions}" }, { label: "Zero or negative", latex: "D=0 \\Rightarrow 1, \\quad D<0 \\Rightarrow 0 \\text{ real solutions}" }],
    visual: { title: "Roots predictor", body: "Positive: crosses twice. Zero: touches once. Negative: misses the x-axis." },
    commonMistakes: ["Thinking the discriminant is the whole quadratic formula.", "Forgetting to square b before subtracting 4ac.", "Dropping a negative c inside -4ac.", "Saying negative discriminant means no solutions at all instead of no real solutions.", "Confusing one repeated solution with two solutions."],
    masteryChecks: ["I can calculate D.", "I can classify solution count from D.", "I can describe graph behavior from D.", "I can use D before deciding how to solve."],
    questionTemplates: discriminantTemplates(),
  },
  "quadratic-word-problems": {
    objectives: ["Model maximum and minimum situations with quadratics.", "Interpret vertex values in context.", "Solve quadratic equations from story situations.", "Reject unreasonable answers based on units and context."],
    lesson: ["Quadratic word problems appear when a quantity changes with a squared relationship, often in area or projectile motion.", "For projectile problems, the vertex often represents maximum height.", "When an object hits the ground, height equals zero. That means solve the quadratic equation h(t) = 0.", "For area problems, expressions like width times length often create quadratics.", "Always define variables and units before solving. The algebra answer must make sense in the story.", "In real contexts, negative time, negative length, or negative number of objects usually must be rejected."],
    formulas: [{ label: "Vertex meaning", latex: "h(t)=a(t-h)^2+k \\Rightarrow \\text{max/min}=k" }, { label: "Ground hit", latex: "h(t)=0" }, { label: "Area", latex: "A=lw" }],
    visual: { title: "Question asks feature", body: "Maximum/minimum asks for vertex. Ground or zero asks for roots. Area setup asks for product expressions." },
    commonMistakes: ["Solving for roots when the question asks maximum height.", "Using the negative time answer in a real situation.", "Not setting height equal to zero for ground problems.", "Mixing up width and length.", "Forgetting units in the final answer."],
    masteryChecks: ["I can identify whether a problem asks for vertex or roots.", "I can interpret maximum height.", "I can solve simple ground-hit problems.", "I can set up area equations."],
    questionTemplates: wordProblemTemplates(),
  },
};
