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
  type: QuestionInstance["type"] = "numeric-input",
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

function numericChoices(answer: number, wrong: number[]) {
  return shuffle([String(answer), ...wrong.map(String)]).slice(0, 4);
}

function template(id: string, difficulty: Difficulty, skill: string, generate: () => QuestionInstance): QuestionTemplate {
  return { id, difficulty, skill, generate };
}

function oneStepEquationTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`one-step-equations-easy-${index + 1}`, "easy", "One-Step Equations: inverse addition and subtraction", () => {
      const x = rand(-12, 12);
      const b = nonZero(-12, 12);
      const c = x + b;
      return q(
        `one-step-equations-easy-${index + 1}`,
        "easy",
        "One-Step Equations: inverse addition and subtraction",
        `Solve for x: x ${signed(b)} = ${c}.`,
        [String(x), `x=${x}`],
        ["Undo the operation next to x.", b > 0 ? `Subtract ${b} from both sides.` : `Add ${Math.abs(b)} to both sides.`, "Check by substituting your answer back into the equation."],
        [`x ${signed(b)} = ${c}.`, b > 0 ? `x = ${c} - ${b}.` : `x = ${c} + ${Math.abs(b)}.`, `x = ${x}.`],
        "numeric-input",
        index % 2 === 0 ? numericChoices(x, [x + b, c, -x]) : undefined,
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`one-step-equations-medium-${index + 1}`, "medium", "One-Step Equations: inverse multiplication and division", () => {
      const a = nonZero(-9, 9);
      const x = rand(-10, 10);
      const c = a * x;
      return q(
        `one-step-equations-medium-${index + 1}`,
        "medium",
        "One-Step Equations: inverse multiplication and division",
        `Solve for x: ${a}x = ${c}.`,
        [String(x), `x=${x}`],
        ["The coefficient is multiplying x.", `Divide both sides by ${a}.`, "Check that the product gives the right side."],
        [`${a}x = ${c}.`, `x = ${c} / ${a}.`, `x = ${x}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`one-step-equations-hard-${index + 1}`, "hard", "One-Step Equations: negative coefficients", () => {
      const a = -rand(2, 12);
      const x = nonZero(-9, 9);
      const c = a * x;
      return q(
        `one-step-equations-hard-${index + 1}`,
        "hard",
        "One-Step Equations: negative coefficients",
        `Solve for x: ${a}x = ${c}.`,
        [String(x), `x=${x}`],
        ["A negative coefficient still means multiplication.", `Divide both sides by ${a}, including the negative sign.`, "A negative divided by a negative becomes positive."],
        [`${a}x = ${c}.`, `x = ${c} / ${a}.`, `x = ${x}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function twoStepEquationTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`two-step-equations-easy-${index + 1}`, "easy", "Two-Step Equations: undo constant then coefficient", () => {
      const a = rand(2, 9);
      const x = rand(-10, 10);
      const b = rand(-12, 12);
      const c = a * x + b;
      return q(
        `two-step-equations-easy-${index + 1}`,
        "easy",
        "Two-Step Equations: undo constant then coefficient",
        `Solve for x: ${a}x ${signed(b)} = ${c}.`,
        [String(x), `x=${x}`],
        ["Undo addition or subtraction first.", `After removing ${b}, divide by ${a}.`, "Check the answer in the original equation."],
        [`${a}x ${signed(b)} = ${c}.`, b >= 0 ? `${a}x = ${c} - ${b} = ${a * x}.` : `${a}x = ${c} + ${Math.abs(b)} = ${a * x}.`, `x = ${a * x} / ${a} = ${x}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`two-step-equations-medium-${index + 1}`, "medium", "Two-Step Equations: negatives and constants", () => {
      const a = nonZero(-9, 9);
      const x = rand(-10, 10);
      const b = nonZero(-15, 15);
      const c = a * x + b;
      return q(
        `two-step-equations-medium-${index + 1}`,
        "medium",
        "Two-Step Equations: negatives and constants",
        `Solve for x: ${a}x ${signed(b)} = ${c}.`,
        [String(x), `x=${x}`],
        ["Keep the sign on the coefficient.", "Move the constant term first.", `Divide by ${a}, not by ${b}.`],
        [`${a}x ${signed(b)} = ${c}.`, b >= 0 ? `${a}x = ${c} - ${b} = ${a * x}.` : `${a}x = ${c} + ${Math.abs(b)} = ${a * x}.`, `x = ${a * x} / ${a} = ${x}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`two-step-equations-hard-${index + 1}`, "hard", "Two-Step Equations: division structures", () => {
      const a = rand(2, 9);
      const x = rand(-10, 10);
      const b = rand(-12, 12);
      const c = x + b;
      const right = c / a;
      return q(
        `two-step-equations-hard-${index + 1}`,
        "hard",
        "Two-Step Equations: division structures",
        `Solve for x: (x ${signed(b)}) / ${a} = ${right}.`,
        [String(x), `x=${x}`],
        ["Clear the division first by multiplying both sides.", `Multiply both sides by ${a}.`, "Then undo the addition or subtraction inside the numerator."],
        [`(x ${signed(b)}) / ${a} = ${right}.`, `x ${signed(b)} = ${right} × ${a} = ${c}.`, b >= 0 ? `x = ${c} - ${b} = ${x}.` : `x = ${c} + ${Math.abs(b)} = ${x}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function multiStepEquationTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`multi-step-equations-easy-${index + 1}`, "easy", "Multi-Step Equations: combine like terms", () => {
      const a = rand(2, 8);
      const b = rand(2, 8);
      const x = rand(-8, 8);
      const c = rand(-10, 10);
      const right = (a + b) * x + c;
      return q(
        `multi-step-equations-easy-${index + 1}`,
        "easy",
        "Multi-Step Equations: combine like terms",
        `Solve for x: ${a}x + ${b}x ${signed(c)} = ${right}.`,
        [String(x), `x=${x}`],
        ["Combine the x terms first.", `${a}x + ${b}x = ${a + b}x.`, "Then solve like a two-step equation."],
        [`${a}x + ${b}x = ${a + b}x.`, `${a + b}x ${signed(c)} = ${right}.`, c >= 0 ? `${a + b}x = ${right} - ${c} = ${(a + b) * x}.` : `${a + b}x = ${right} + ${Math.abs(c)} = ${(a + b) * x}.`, `x = ${x}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`multi-step-equations-medium-${index + 1}`, "medium", "Multi-Step Equations: distributive property", () => {
      const a = rand(2, 6);
      const b = rand(-8, 8);
      const x = rand(-8, 8);
      const c = rand(-12, 12);
      const right = a * (x + b) + c;
      return q(
        `multi-step-equations-medium-${index + 1}`,
        "medium",
        "Multi-Step Equations: distributive property",
        `Solve for x: ${a}(x ${signed(b)}) ${signed(c)} = ${right}.`,
        [String(x), `x=${x}`],
        ["Distribute before moving terms.", `Multiply ${a} by x and by ${b}.`, "Then isolate x."],
        [`${a}(x ${signed(b)}) = ${a}x ${signed(a * b)}.`, `${a}x ${signed(a * b + c)} = ${right}.`, `Move the constant: ${a}x = ${a * x}.`, `x = ${x}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`multi-step-equations-hard-${index + 1}`, "hard", "Multi-Step Equations: distribution and combining", () => {
      const a = rand(2, 5);
      const b = rand(2, 6);
      const x = rand(-8, 8);
      const c = rand(-7, 7);
      const right = a * (x + b) + c * x;
      return q(
        `multi-step-equations-hard-${index + 1}`,
        "hard",
        "Multi-Step Equations: distribution and combining",
        `Solve for x: ${a}(x + ${b}) ${signed(c)}x = ${right}.`,
        [String(x), `x=${x}`],
        ["Distribute first.", "Combine all x terms on the left.", "Then divide by the combined coefficient."],
        [`${a}(x + ${b}) = ${a}x + ${a * b}.`, `${a}x ${signed(c)}x = ${a + c}x.`, `${a + c}x + ${a * b} = ${right}.`, `${a + c}x = ${(a + c) * x}.`, `x = ${x}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function variablesBothSidesTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`variables-both-sides-easy-${index + 1}`, "easy", "Variables on Both Sides: collect variables", () => {
      const x = rand(-8, 8);
      const a = rand(4, 10);
      const c = rand(1, 3);
      const b = rand(-10, 10);
      const d = (a - c) * x + b;
      return q(
        `variables-both-sides-easy-${index + 1}`,
        "easy",
        "Variables on Both Sides: collect variables",
        `Solve for x: ${a}x ${signed(b)} = ${c}x ${signed(d)}.`,
        [String(x), `x=${x}`],
        ["Move the smaller variable term to the other side.", "Then move the constant.", "Divide by the remaining coefficient."],
        [`Subtract ${c}x from both sides: ${a - c}x ${signed(b)} = ${d}.`, b >= 0 ? `${a - c}x = ${d} - ${b} = ${(a - c) * x}.` : `${a - c}x = ${d} + ${Math.abs(b)} = ${(a - c) * x}.`, `x = ${x}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`variables-both-sides-medium-${index + 1}`, "medium", "Variables on Both Sides: negatives and constants", () => {
      const x = rand(-8, 8);
      const a = nonZero(-8, 8);
      let c = nonZero(-8, 8);
      if (a === c) c += 1;
      const b = rand(-12, 12);
      const d = (a - c) * x + b;
      return q(
        `variables-both-sides-medium-${index + 1}`,
        "medium",
        "Variables on Both Sides: negatives and constants",
        `Solve for x: ${a}x ${signed(b)} = ${c}x ${signed(d)}.`,
        [String(x), `x=${x}`],
        ["Choose one side for the variable terms.", "Choose the other side for constants.", "Be careful when subtracting a negative coefficient."],
        [`Subtract ${c}x from both sides: ${a - c}x ${signed(b)} = ${d}.`, b >= 0 ? `${a - c}x = ${d} - ${b} = ${(a - c) * x}.` : `${a - c}x = ${d} + ${Math.abs(b)} = ${(a - c) * x}.`, `x = ${(a - c) * x} / ${a - c} = ${x}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`variables-both-sides-hard-${index + 1}`, "hard", "Variables on Both Sides: no solution and infinitely many", () => {
      const a = rand(2, 8);
      const b = rand(-10, 10);
      const same = index % 2 === 0;
      const d = same ? b : b + rand(1, 5);
      const answer = same ? "infinitely many solutions" : "no solution";
      return q(
        `variables-both-sides-hard-${index + 1}`,
        "hard",
        "Variables on Both Sides: no solution and infinitely many",
        `Classify the equation: ${a}x ${signed(b)} = ${a}x ${signed(d)}.`,
        [answer, same ? "infinite solutions" : "no solution"],
        ["Subtract the same variable term from both sides.", "Look at the constant statement that remains.", "A true statement means infinitely many; a false statement means no solution."],
        [`Subtract ${a}x from both sides.`, `The equation becomes ${b} = ${d}.`, same ? "This is true, so every x works." : "This is false, so no x works.", `The answer is ${answer}.`],
        "multiple-choice",
        shuffle([answer, "one solution", same ? "no solution" : "infinitely many solutions", "x = 0"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function literalEquationTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`literal-equations-easy-${index + 1}`, "easy", "Literal Equations: isolate a variable", () => {
      return q(
        `literal-equations-easy-${index + 1}`,
        "easy",
        "Literal Equations: isolate a variable",
        "Solve for x: ax + b = c.",
        ["x=(c-b)/a", "x = (c - b) / a"],
        ["Treat every other letter like a constant.", "Undo + b by subtracting b.", "Undo multiplication by a by dividing by a."],
        ["ax + b = c.", "ax = c - b.", "x = (c - b) / a."],
        "equation-input",
      );
    }),
  );

  const mediumPrompts = [
    { prompt: "Solve for x: y = mx + b.", answers: ["x=(y-b)/m", "x = (y - b) / m"], steps: ["y = mx + b.", "y - b = mx.", "x = (y - b) / m."] },
    { prompt: "Solve for l: P = 2l + 2w.", answers: ["l=(p-2w)/2", "l = (P - 2w) / 2", "l=(P-2w)/2"], steps: ["P = 2l + 2w.", "P - 2w = 2l.", "l = (P - 2w) / 2."] },
    { prompt: "Solve for w: A = lw.", answers: ["w=a/l", "w=A/l", "w = A / l"], steps: ["A = lw.", "Divide both sides by l.", "w = A / l."] },
    { prompt: "Solve for r: C = 2pi r.", answers: ["r=c/(2pi)", "r=C/(2pi)", "r = C / (2pi)"], steps: ["C = 2pi r.", "Divide both sides by 2pi.", "r = C / (2pi)."] },
    { prompt: "Solve for b: A = bh.", answers: ["b=a/h", "b=A/h", "b = A / h"], steps: ["A = bh.", "Divide both sides by h.", "b = A / h."] },
  ];

  const medium = mediumPrompts.map((item, index) =>
    template(`literal-equations-medium-${index + 1}`, "medium", "Literal Equations: formulas", () =>
      q(
        `literal-equations-medium-${index + 1}`,
        "medium",
        "Literal Equations: formulas",
        item.prompt,
        item.answers,
        ["Identify the target variable.", "Undo operations in reverse order.", "Keep all other letters as constants."],
        item.steps,
        "equation-input",
      ),
    ),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`literal-equations-hard-${index + 1}`, "hard", "Literal Equations: multi-step rearranging", () => {
      const prompts = [
        { prompt: "Solve for h: V = lwh.", answers: ["h=v/(lw)", "h=V/(lw)", "h = V / (lw)"], steps: ["V = lwh.", "lw is multiplying h.", "h = V / (lw)."] },
        { prompt: "Solve for a: S = 2a + b.", answers: ["a=(s-b)/2", "a=(S-b)/2", "a = (S - b) / 2"], steps: ["S = 2a + b.", "S - b = 2a.", "a = (S - b) / 2."] },
        { prompt: "Solve for m: y - b = mx.", answers: ["m=(y-b)/x", "m = (y - b) / x"], steps: ["y - b = mx.", "x is multiplying m.", "m = (y - b) / x."] },
        { prompt: "Solve for t: d = rt.", answers: ["t=d/r", "t = d / r"], steps: ["d = rt.", "r is multiplying t.", "t = d / r."] },
        { prompt: "Solve for F: C = (F - 32)/1.8.", answers: ["F=1.8C+32", "f=1.8c+32", "F = 1.8C + 32"], steps: ["C = (F - 32)/1.8.", "1.8C = F - 32.", "F = 1.8C + 32."] },
      ];
      const item = prompts[index];
      return q(
        `literal-equations-hard-${index + 1}`,
        "hard",
        "Literal Equations: multi-step rearranging",
        item.prompt,
        item.answers,
        ["Focus only on the variable named in the prompt.", "Undo the outermost operation first.", "Keep the final variable by itself."],
        item.steps,
        "equation-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

export const linearEquations: Record<string, DeepTopicContent> = {
  "one-step-equations": {
    objectives: [
      "Solve equations using one inverse operation.",
      "Choose the correct inverse for addition, subtraction, multiplication, or division.",
      "Keep both sides balanced by doing the same operation to each side.",
      "Check a solution by substituting it back into the original equation.",
    ],
    lesson: [
      "A one-step equation can be solved with one inverse operation. The goal is to isolate the variable, which means getting the variable alone on one side of the equals sign.",
      "An equation is like a balanced scale. If you add, subtract, multiply, or divide one side, you must do the same thing to the other side so the equality stays true.",
      "Use inverse operations: addition undoes subtraction, subtraction undoes addition, multiplication undoes division, and division undoes multiplication.",
      "The coefficient is the number multiplying the variable. In 5x = 30, the coefficient is 5, so divide both sides by 5.",
      "Negative coefficients are not special rules; keep the sign attached to the coefficient and divide by the entire signed number.",
      "Always check by putting your answer back into the original equation. If both sides match, the solution works.",
    ],
    formulas: [
      { label: "Addition inverse", latex: "x+a=b \\Rightarrow x=b-a" },
      { label: "Multiplication inverse", latex: "ax=b \\Rightarrow x=\\frac{b}{a}" },
      { label: "Check", latex: "\\text{substitute solution into original equation}" },
    ],
    visual: { title: "Balance scale", body: "Imagine each side of the equation as one side of a scale. Whatever you do to one side must also happen to the other side." },
    commonMistakes: ["Changing only one side of the equation.", "Dividing by the constant instead of the coefficient.", "Dropping the negative sign on a coefficient.", "Stopping without checking the answer.", "Thinking x + 5 = 12 means x = 17 instead of undoing addition."],
    masteryChecks: ["I can identify the operation attached to x.", "I can choose the inverse operation.", "I can solve with negative coefficients.", "I can verify my solution in the original equation."],
    questionTemplates: oneStepEquationTemplates(),
  },
  "two-step-equations": {
    objectives: ["Solve equations with a coefficient and a constant.", "Undo operations in the correct reverse order.", "Handle negative constants and coefficients.", "Check two-step solutions by substitution."],
    lesson: [
      "A two-step equation usually looks like ax + b = c. The variable is affected by two operations: multiplication by a and addition or subtraction by b.",
      "Undo the operation farthest from the variable first. In 3x + 5 = 20, the +5 is outside the multiplication, so subtract 5 before dividing by 3.",
      "Do not divide every term immediately unless the equation is structured for that. First isolate the variable term, then isolate the variable.",
      "A negative constant means the inverse may be addition. A negative coefficient means the final division includes a negative number.",
      "Division structures like (x + 4)/3 = 7 work in the opposite order: clear the division first, then undo the addition inside the numerator.",
      "The check is part of the solution, not an optional extra. Substitute your answer and make sure the original left side equals the right side.",
    ],
    formulas: [
      { label: "Two-step form", latex: "ax+b=c" },
      { label: "Solution pattern", latex: "x=\\frac{c-b}{a}" },
      { label: "Division form", latex: "\\frac{x+b}{a}=c \\Rightarrow x=ac-b" },
    ],
    visual: { title: "Undo stack", body: "Think of operations as layers around x. Remove the outside layer first, then the inside layer." },
    commonMistakes: ["Dividing before removing the constant.", "Forgetting that subtracting a negative means adding.", "Dividing only one term on the right side.", "Losing the negative sign on the coefficient.", "Checking in the simplified equation instead of the original equation."],
    masteryChecks: ["I can solve ax + b = c.", "I can solve with negative constants.", "I can solve equations with a divided expression.", "I can show the check step clearly."],
    questionTemplates: twoStepEquationTemplates(),
  },
  "multi-step-equations": {
    objectives: ["Simplify each side before solving.", "Use distribution when parentheses appear.", "Combine like terms accurately.", "Solve multi-step equations without skipping algebraic structure."],
    lesson: [
      "Multi-step equations require cleanup before the normal solving steps. The cleanup usually means distributing, combining like terms, or both.",
      "Start by simplifying each side separately. Do not move terms across the equals sign until each side is organized.",
      "When parentheses appear, distribute to every term inside. Missing one term is one of the fastest ways to get a wrong answer.",
      "Combine like terms only when the variable parts match. x terms combine with x terms; constants combine with constants.",
      "After simplifying, the equation usually becomes a one-step or two-step equation. At that point, isolate the variable normally.",
      "Good multi-step work is organized vertically. Each line should be equivalent to the previous line and easier to solve.",
    ],
    formulas: [
      { label: "Distribute", latex: "a(x+b)=ax+ab" },
      { label: "Combine like terms", latex: "ax+bx=(a+b)x" },
      { label: "Then solve", latex: "ax+b=c \\Rightarrow ax=c-b" },
    ],
    visual: { title: "Simplify then solve", body: "First clean each side. Then move constants. Then divide by the coefficient. Do not mix all three stages at once." },
    commonMistakes: ["Moving terms before distributing.", "Distributing to only the first term in parentheses.", "Combining unlike terms.", "Skipping lines and losing a sign.", "Dividing before the variable term is isolated."],
    masteryChecks: ["I can distribute accurately.", "I can combine like terms before solving.", "I can turn a messy equation into a simpler one.", "I can keep each algebra line balanced."],
    questionTemplates: multiStepEquationTemplates(),
  },
  "variables-on-both-sides": {
    objectives: ["Solve equations where both sides contain the variable.", "Collect variable terms on one side and constants on the other.", "Recognize one solution, no solution, and infinitely many solutions.", "Explain what a true or false final statement means."],
    lesson: [
      "When variables appear on both sides, your first goal is to choose one side for all variable terms. Subtracting the smaller coefficient often keeps numbers positive, but either direction works if you are consistent.",
      "After collecting variables, collect constants on the other side. Then divide by the remaining coefficient.",
      "Some equations do not end with x = number. If the variable terms cancel, look at the remaining statement.",
      "A true statement like 7 = 7 means every value of x works, so there are infinitely many solutions.",
      "A false statement like 7 = 10 means no value of x can make the equation true, so there is no solution.",
      "The key habit is not panicking when x disappears. The equation is telling you whether the two sides were always the same or never the same.",
    ],
    formulas: [
      { label: "Collect variables", latex: "ax+b=cx+d \\Rightarrow (a-c)x+b=d" },
      { label: "One solution", latex: "kx=m \\Rightarrow x=\\frac{m}{k}" },
      { label: "Special cases", latex: "0=0 \\Rightarrow \\infty \\text{ solutions}, \\quad 0=5 \\Rightarrow \\text{no solution}" },
    ],
    visual: { title: "Variable migration", body: "Move all x-terms to one side and all constants to the other. If x disappears, classify the constant statement." },
    commonMistakes: ["Moving constants and variables in the same step without tracking signs.", "Thinking x disappearing always means no solution.", "Forgetting to change signs when subtracting a term from both sides.", "Stopping at 0 = 0 without saying infinitely many solutions.", "Calling a false statement one solution."],
    masteryChecks: ["I can collect variables from both sides.", "I can solve when coefficients are negative.", "I can identify no solution.", "I can identify infinitely many solutions."],
    questionTemplates: variablesBothSidesTemplates(),
  },
  "literal-equations": {
    objectives: ["Rearrange formulas to solve for a chosen variable.", "Treat non-target variables as constants.", "Use inverse operations with letters instead of only numbers.", "Rewrite common formulas for different variables."],
    lesson: [
      "A literal equation is an equation with multiple variables. Instead of solving for a number, you rearrange the formula to isolate one variable in terms of the others.",
      "The target variable is the variable the problem says to solve for. Every other letter acts like a constant, even though its value is unknown.",
      "Use the same inverse operations as normal equations. If the target variable has +b, subtract b. If it is multiplied by a, divide by a.",
      "Fractions and products should be handled carefully. If the target variable is inside a product like lw, divide by the other factor.",
      "Literal equations are important because science, geometry, and later algebra constantly ask you to rearrange formulas before substituting values.",
      "The final answer should have the target variable alone on one side. It is okay if the other side still contains letters.",
    ],
    formulas: [
      { label: "General linear rearrange", latex: "ax+b=c \\Rightarrow x=\\frac{c-b}{a}" },
      { label: "Slope-intercept rearrange", latex: "y=mx+b \\Rightarrow x=\\frac{y-b}{m}" },
      { label: "Product formula", latex: "A=lw \\Rightarrow w=\\frac{A}{l}" },
    ],
    visual: { title: "Target variable spotlight", body: "Circle the variable you are solving for. Every operation attached to that variable must be undone until the spotlighted variable is alone." },
    commonMistakes: ["Solving for the wrong variable.", "Substituting numbers when the task is only to rearrange.", "Dividing by a term before removing an added term.", "Dropping parentheses around a numerator like y - b.", "Forgetting that other letters are treated like constants."],
    masteryChecks: ["I can identify the target variable.", "I can rearrange ax + b = c.", "I can solve formulas like y = mx + b for another variable.", "I can keep parentheses in fractional answers when needed."],
    questionTemplates: literalEquationTemplates(),
  },
};
