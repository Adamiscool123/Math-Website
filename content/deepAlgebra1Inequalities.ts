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

function flip(symbol: "<" | ">" | "<=" | ">=") {
  if (symbol === "<") return ">";
  if (symbol === ">") return "<";
  if (symbol === "<=") return ">=";
  return "<=";
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

function oneStepInequalityTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`one-step-ineq-easy-${index + 1}`, "easy", "One-Step Inequalities: addition and subtraction", () => {
      const boundary = rand(-12, 12);
      const b = nonZero(-12, 12);
      const symbol = index % 2 === 0 ? "<" : ">";
      const right = boundary + b;
      return q(
        `one-step-ineq-easy-${index + 1}`,
        "easy",
        "One-Step Inequalities: addition and subtraction",
        `Solve: x ${signed(b)} ${symbol} ${right}.`,
        [`x${symbol}${boundary}`, `x ${symbol} ${boundary}`],
        ["Undo the addition or subtraction next to x.", "Adding or subtracting does not flip the inequality symbol.", "Write the answer as a range of x-values."],
        [`x ${signed(b)} ${symbol} ${right}.`, b >= 0 ? `Subtract ${b}: x ${symbol} ${right - b}.` : `Add ${Math.abs(b)}: x ${symbol} ${right + Math.abs(b)}.`, `x ${symbol} ${boundary}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`one-step-ineq-medium-${index + 1}`, "medium", "One-Step Inequalities: multiply and divide", () => {
      const a = rand(2, 12);
      const boundary = rand(-10, 10);
      const symbol = index % 2 === 0 ? "<=" : ">=";
      const right = a * boundary;
      return q(
        `one-step-ineq-medium-${index + 1}`,
        "medium",
        "One-Step Inequalities: multiply and divide",
        `Solve: ${a}x ${symbol} ${right}.`,
        [`x${symbol}${boundary}`, `x ${symbol} ${boundary}`],
        ["The coefficient is positive.", `Divide both sides by ${a}.`, "Positive division keeps the inequality direction the same."],
        [`${a}x ${symbol} ${right}.`, `Divide by ${a}: x ${symbol} ${right / a}.`, `x ${symbol} ${boundary}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`one-step-ineq-hard-${index + 1}`, "hard", "One-Step Inequalities: negative coefficients", () => {
      const a = -rand(2, 12);
      const boundary = rand(-10, 10);
      const originalSymbol = index % 2 === 0 ? "<" : ">";
      const answerSymbol = flip(originalSymbol);
      const right = a * boundary;
      return q(
        `one-step-ineq-hard-${index + 1}`,
        "hard",
        "One-Step Inequalities: negative coefficients",
        `Solve: ${a}x ${originalSymbol} ${right}.`,
        [`x${answerSymbol}${boundary}`, `x ${answerSymbol} ${boundary}`],
        ["The coefficient is negative.", `Divide both sides by ${a}.`, "Dividing by a negative flips the inequality direction."],
        [`${a}x ${originalSymbol} ${right}.`, `Divide by ${a}, so flip ${originalSymbol} to ${answerSymbol}.`, `x ${answerSymbol} ${boundary}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function multiStepInequalityTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`multi-step-ineq-easy-${index + 1}`, "easy", "Multi-Step Inequalities: isolate then divide", () => {
      const a = rand(2, 9);
      const boundary = rand(-10, 10);
      const b = rand(-12, 12);
      const symbol = index % 2 === 0 ? "<" : ">";
      const right = a * boundary + b;
      return q(
        `multi-step-ineq-easy-${index + 1}`,
        "easy",
        "Multi-Step Inequalities: isolate then divide",
        `Solve: ${a}x ${signed(b)} ${symbol} ${right}.`,
        [`x${symbol}${boundary}`, `x ${symbol} ${boundary}`],
        ["Undo the constant first.", `Then divide by ${a}.`, "The coefficient is positive, so do not flip the symbol."],
        [`${a}x ${signed(b)} ${symbol} ${right}.`, b >= 0 ? `${a}x ${symbol} ${right - b}.` : `${a}x ${symbol} ${right + Math.abs(b)}.`, `x ${symbol} ${boundary}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`multi-step-ineq-medium-${index + 1}`, "medium", "Multi-Step Inequalities: negative coefficients", () => {
      const a = -rand(2, 9);
      const boundary = rand(-10, 10);
      const b = rand(-12, 12);
      const originalSymbol = index % 2 === 0 ? "<=" : ">=";
      const answerSymbol = flip(originalSymbol);
      const right = a * boundary + b;
      return q(
        `multi-step-ineq-medium-${index + 1}`,
        "medium",
        "Multi-Step Inequalities: negative coefficients",
        `Solve: ${a}x ${signed(b)} ${originalSymbol} ${right}.`,
        [`x${answerSymbol}${boundary}`, `x ${answerSymbol} ${boundary}`],
        ["Move the constant first.", "The x coefficient is negative.", "When you divide by the negative coefficient, flip the inequality symbol."],
        [`${a}x ${signed(b)} ${originalSymbol} ${right}.`, b >= 0 ? `${a}x ${originalSymbol} ${right - b}.` : `${a}x ${originalSymbol} ${right + Math.abs(b)}.`, `Divide by ${a} and flip: x ${answerSymbol} ${boundary}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`multi-step-ineq-hard-${index + 1}`, "hard", "Multi-Step Inequalities: distribute before solving", () => {
      const a = rand(2, 6);
      const inner = rand(-8, 8);
      const boundary = rand(-8, 8);
      const b = rand(-10, 10);
      const symbol = index % 2 === 0 ? "<" : ">";
      const right = a * (boundary + inner) + b;
      return q(
        `multi-step-ineq-hard-${index + 1}`,
        "hard",
        "Multi-Step Inequalities: distribute before solving",
        `Solve: ${a}(x ${signed(inner)}) ${signed(b)} ${symbol} ${right}.`,
        [`x${symbol}${boundary}`, `x ${symbol} ${boundary}`],
        ["Distribute before moving terms.", "Then isolate the x-term.", "The final division is by a positive number, so the symbol stays the same."],
        [`${a}(x ${signed(inner)}) = ${a}x ${signed(a * inner)}.`, `${a}x ${signed(a * inner + b)} ${symbol} ${right}.`, `Move the constant: ${a}x ${symbol} ${a * boundary}.`, `x ${symbol} ${boundary}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function compoundInequalityTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`compound-ineq-easy-${index + 1}`, "easy", "Compound Inequalities: and statements", () => {
      const low = rand(-12, 0);
      const high = rand(1, 12);
      return q(
        `compound-ineq-easy-${index + 1}`,
        "easy",
        "Compound Inequalities: and statements",
        `Write the compound inequality for all numbers greater than ${low} and less than ${high}.`,
        [`${low}<x<${high}`, `${low} < x < ${high}`],
        ["Greater than the low number means x is to its right.", "Less than the high number means x is to its left.", "An and statement puts x between two numbers."],
        [`x must be greater than ${low}: x > ${low}.`, `x must be less than ${high}: x < ${high}.`, `Together: ${low} < x < ${high}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`compound-ineq-medium-${index + 1}`, "medium", "Compound Inequalities: solve between", () => {
      const low = rand(-10, -1);
      const high = rand(1, 10);
      const add = rand(-8, 8);
      return q(
        `compound-ineq-medium-${index + 1}`,
        "medium",
        "Compound Inequalities: solve between",
        `Solve: ${low + add} < x ${signed(add)} < ${high + add}.`,
        [`${low}<x<${high}`, `${low} < x < ${high}`],
        ["Undo the same operation on all three parts.", add >= 0 ? `Subtract ${add} from every part.` : `Add ${Math.abs(add)} to every part.`, "Keep x in the middle."],
        [`${low + add} < x ${signed(add)} < ${high + add}.`, add >= 0 ? `Subtract ${add}: ${low} < x < ${high}.` : `Add ${Math.abs(add)}: ${low} < x < ${high}.`, `The solution is ${low} < x < ${high}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`compound-ineq-hard-${index + 1}`, "hard", "Compound Inequalities: or statements", () => {
      const left = rand(-12, -2);
      const right = rand(2, 12);
      return q(
        `compound-ineq-hard-${index + 1}`,
        "hard",
        "Compound Inequalities: or statements",
        `Which compound inequality represents numbers less than ${left} or greater than ${right}?`,
        [`x<${left} or x>${right}`, `x < ${left} or x > ${right}`],
        ["Or means two separate regions.", "Less than points left on a number line.", "Greater than points right on a number line."],
        [`Numbers less than ${left}: x < ${left}.`, `Numbers greater than ${right}: x > ${right}.`, `Together: x < ${left} or x > ${right}.`],
        "multiple-choice",
        shuffle([`x < ${left} or x > ${right}`, `${left} < x < ${right}`, `x > ${left} and x < ${right}`, `x < ${right} or x > ${left}`]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function absoluteValueInequalityTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`absolute-value-easy-${index + 1}`, "easy", "Absolute Value: distance equations", () => {
      const center = rand(-8, 8);
      const radius = rand(2, 10);
      return q(
        `absolute-value-easy-${index + 1}`,
        "easy",
        "Absolute Value: distance equations",
        `Solve: |x ${signed(-center)}| = ${radius}. Give both solutions as smaller,larger.`,
        [`${center - radius},${center + radius}`, `(${center - radius},${center + radius})`],
        ["Absolute value measures distance from the center.", `The center is ${center}.`, `Move ${radius} units left and right from the center.`],
        [`x is ${radius} units from ${center}.`, `Left solution: ${center} - ${radius} = ${center - radius}.`, `Right solution: ${center} + ${radius} = ${center + radius}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`absolute-value-medium-${index + 1}`, "medium", "Absolute Value Inequalities: less than means between", () => {
      const center = rand(-8, 8);
      const radius = rand(2, 10);
      return q(
        `absolute-value-medium-${index + 1}`,
        "medium",
        "Absolute Value Inequalities: less than means between",
        `Solve: |x ${signed(-center)}| < ${radius}.`,
        [`${center - radius}<x<${center + radius}`, `${center - radius} < x < ${center + radius}`],
        ["Less than means the distance is inside the radius.", `The center is ${center}.`, `The endpoints are ${center - radius} and ${center + radius}.`],
        [`x is less than ${radius} units from ${center}.`, `The endpoints are ${center} - ${radius} = ${center - radius} and ${center} + ${radius} = ${center + radius}.`, `The solution is ${center - radius} < x < ${center + radius}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`absolute-value-hard-${index + 1}`, "hard", "Absolute Value Inequalities: greater than means outside", () => {
      const center = rand(-8, 8);
      const radius = rand(2, 10);
      return q(
        `absolute-value-hard-${index + 1}`,
        "hard",
        "Absolute Value Inequalities: greater than means outside",
        `Solve: |x ${signed(-center)}| > ${radius}.`,
        [`x<${center - radius} or x>${center + radius}`, `x < ${center - radius} or x > ${center + radius}`],
        ["Greater than means the distance is outside the radius.", "Write two separate inequalities joined by or.", `Use endpoints ${center - radius} and ${center + radius}.`],
        [`x is more than ${radius} units from ${center}.`, `The boundary points are ${center - radius} and ${center + radius}.`, `The solution is x < ${center - radius} or x > ${center + radius}.`],
        "multiple-choice",
        shuffle([`x < ${center - radius} or x > ${center + radius}`, `${center - radius} < x < ${center + radius}`, `x > ${center - radius} and x < ${center + radius}`, `x = ${center - radius}, ${center + radius}`]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

export const inequalities: Record<string, DeepTopicContent> = {
  "one-step-inequalities": {
    objectives: ["Solve one-step inequalities with inverse operations.", "Know when the inequality symbol stays the same.", "Know when the inequality symbol reverses.", "Write answers as solution sets, not single numbers."],
    lesson: [
      "An inequality compares two expressions using symbols like <, >, <=, or >=. The solution is usually a range of values, not just one number.",
      "Solving one-step inequalities is almost the same as solving one-step equations. Use inverse operations to isolate the variable.",
      "Adding or subtracting the same number on both sides does not change the inequality direction.",
      "Multiplying or dividing by a positive number also keeps the inequality direction the same.",
      "Multiplying or dividing by a negative number reverses the symbol. This happens because the order of numbers flips when signs change.",
      "A strong answer includes the inequality and, when needed, a number-line interpretation with open or closed endpoints.",
    ],
    formulas: [
      { label: "Positive division", latex: "ax<b, a>0 \\Rightarrow x<\\frac{b}{a}" },
      { label: "Negative division", latex: "ax<b, a<0 \\Rightarrow x>\\frac{b}{a}" },
      { label: "Endpoint symbols", latex: "<,> \\text{ open}; \\quad \\le,\\ge \\text{ closed}" },
    ],
    visual: { title: "Number line solution", body: "Open circles mean the endpoint is not included. Closed circles mean it is included. The arrow shows every value that works." },
    commonMistakes: ["Forgetting to reverse the symbol when dividing by a negative.", "Writing only the boundary number instead of the full inequality.", "Using a closed endpoint for < or >.", "Using an open endpoint for <= or >=.", "Checking only one value and assuming the whole range works."],
    masteryChecks: ["I can isolate x in one step.", "I can flip the symbol when dividing by a negative.", "I can graph open and closed endpoints.", "I can test a value from my solution set."],
    questionTemplates: oneStepInequalityTemplates(),
  },
  "multi-step-inequalities": {
    objectives: ["Solve inequalities with constants and coefficients.", "Simplify before isolating the variable.", "Reverse the inequality when dividing by a negative coefficient.", "Represent solution sets correctly."],
    lesson: [
      "Multi-step inequalities combine the solving habits from equations with the symbol rules from inequalities.",
      "Start by simplifying each side if needed. Distribute and combine like terms before moving pieces around.",
      "Move constants away from the variable term first, then divide by the coefficient of the variable.",
      "The biggest difference from equations is the negative multiplication or division rule. If the final division is by a negative, reverse the inequality symbol.",
      "Do not flip the symbol just because there is a negative number somewhere. Flip only when you multiply or divide both sides by a negative.",
      "After solving, pick a test value from the solution side and check it in the original inequality.",
    ],
    formulas: [
      { label: "Two-step inequality", latex: "ax+b<c \\Rightarrow ax<c-b" },
      { label: "Flip rule", latex: "\\frac{ax}{a} \\text{ flips if } a<0" },
      { label: "Distribute first", latex: "a(x+b)+c<d" },
    ],
    visual: { title: "Equation habits plus flip rule", body: "Solve like an equation until the last division. Before dividing, ask: is the number negative? If yes, flip the sign." },
    commonMistakes: ["Flipping the sign after adding or subtracting.", "Not flipping after dividing by a negative.", "Distributing to only one term.", "Solving the boundary correctly but graphing the wrong direction.", "Testing the endpoint instead of a value inside the solution region."],
    masteryChecks: ["I can solve ax + b < c.", "I can solve after distributing.", "I can decide exactly when the symbol flips.", "I can verify the answer with a test value."],
    questionTemplates: multiStepInequalityTemplates(),
  },
  "compound-inequalities": {
    objectives: ["Solve and graph compound inequalities.", "Distinguish and statements from or statements.", "Solve three-part inequalities by changing all parts equally.", "Translate between words, symbols, and number-line regions."],
    lesson: [
      "A compound inequality combines two inequalities. It describes either the overlap between conditions or the union of two separate regions.",
      "And statements mean both conditions must be true at the same time. These often create a middle interval like 2 < x < 7.",
      "Or statements mean either condition can be true. These often create two separate rays, like x < -3 or x > 5.",
      "For three-part inequalities, whatever operation you do must be done to all three parts so the middle expression stays balanced between the two boundaries.",
      "When graphing, and usually shades between endpoints. Or usually shades away from the middle in two directions.",
      "Language matters. 'Between' often means and. 'Less than ... or greater than ...' means two outside regions.",
    ],
    formulas: [
      { label: "And interval", latex: "a<x<b" },
      { label: "Or regions", latex: "x<a \\text{ or } x>b" },
      { label: "Three-part solving", latex: "a<x+c<b \\Rightarrow a-c<x<b-c" },
    ],
    visual: { title: "Inside or outside", body: "And usually means inside the endpoints. Or usually means outside the endpoints. Draw the number line before finalizing." },
    commonMistakes: ["Confusing and with or.", "Only changing the middle part of a three-part inequality.", "Graphing an or statement as one connected interval.", "Putting the smaller endpoint on the right side.", "Using endpoint circles that do not match the inequality symbols."],
    masteryChecks: ["I can solve a three-part inequality.", "I can identify and versus or from wording.", "I can graph compound inequalities.", "I can write compound inequalities from number-line descriptions."],
    questionTemplates: compoundInequalityTemplates(),
  },
  "absolute-value-equations-inequalities": {
    objectives: ["Interpret absolute value as distance.", "Solve absolute value equations with two solutions.", "Solve less-than absolute value inequalities as between statements.", "Solve greater-than absolute value inequalities as or statements."],
    lesson: [
      "Absolute value measures distance from zero, and distance is never negative. In equations like |x - 3| = 5, x is 5 units away from 3.",
      "Absolute value equations usually split into two cases because a number can be the same distance to the left or to the right of the center.",
      "Less-than absolute value inequalities mean close to the center. The solution is usually between two endpoints.",
      "Greater-than absolute value inequalities mean far from the center. The solution is usually outside two endpoints and uses or.",
      "Before splitting cases, isolate the absolute value expression if there is a coefficient or constant outside it.",
      "If an absolute value expression equals a negative number, there is no solution because distance cannot be negative.",
    ],
    formulas: [
      { label: "Distance equation", latex: "|x-a|=r \\Rightarrow x=a-r \\text{ or } x=a+r" },
      { label: "Less than", latex: "|x-a|<r \\Rightarrow a-r<x<a+r" },
      { label: "Greater than", latex: "|x-a|>r \\Rightarrow x<a-r \\text{ or } x>a+r" },
    ],
    visual: { title: "Distance from center", body: "Mark the center first. Then count the radius left and right. Less than shades inside; greater than shades outside." },
    commonMistakes: ["Forgetting the second solution to an absolute value equation.", "Using and for a greater-than absolute value inequality.", "Using or for a less-than absolute value inequality.", "Not isolating the absolute value first.", "Trying to make an absolute value equal a negative distance."],
    masteryChecks: ["I can identify the center and radius.", "I can solve absolute value equations with two answers.", "I can write less-than answers as between statements.", "I can write greater-than answers as or statements."],
    questionTemplates: absoluteValueInequalityTemplates(),
  },
};
