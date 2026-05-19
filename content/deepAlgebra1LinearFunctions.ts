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

function lineEquation(m: number, b: number) {
  if (m === 1) return `y=x${signed(b)}`;
  if (m === -1) return `y=-x${signed(b)}`;
  return `y=${m}x${signed(b)}`;
}

function lineEquationPretty(m: number, b: number) {
  if (m === 1) return `y = x ${signed(b)}`;
  if (m === -1) return `y = -x ${signed(b)}`;
  return `y = ${m}x ${signed(b)}`;
}

function slopeTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`slope-easy-${index + 1}`, "easy", "Slope: rise over run from two points", () => {
      const x1 = rand(-6, 2);
      const x2 = x1 + rand(1, 6);
      const m = nonZero(-5, 5);
      const y1 = rand(-8, 8);
      const y2 = y1 + m * (x2 - x1);
      return q(
        `slope-easy-${index + 1}`,
        "easy",
        "Slope: rise over run from two points",
        `Find the slope through (${x1}, ${y1}) and (${x2}, ${y2}).`,
        [String(m)],
        ["Slope is change in y divided by change in x.", "Subtract the y-values and x-values in the same order.", "Simplify the ratio."],
        [`Change in y: ${y2} - ${y1} = ${y2 - y1}.`, `Change in x: ${x2} - ${x1} = ${x2 - x1}.`, `Slope = ${(y2 - y1)} / ${(x2 - x1)} = ${m}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`slope-medium-${index + 1}`, "medium", "Slope: classify from points", () => {
      const type = ["positive", "negative", "zero", "undefined"][index % 4];
      let p1 = "";
      let p2 = "";
      if (type === "positive") {
        const x = rand(-5, 0); const y = rand(-5, 0); p1 = `(${x}, ${y})`; p2 = `(${x + 4}, ${y + 8})`;
      } else if (type === "negative") {
        const x = rand(-5, 0); const y = rand(2, 8); p1 = `(${x}, ${y})`; p2 = `(${x + 4}, ${y - 8})`;
      } else if (type === "zero") {
        const x = rand(-5, 0); const y = rand(-8, 8); p1 = `(${x}, ${y})`; p2 = `(${x + 5}, ${y})`;
      } else {
        const x = rand(-5, 5); const y = rand(-8, -1); p1 = `(${x}, ${y})`; p2 = `(${x}, ${y + 7})`;
      }
      return q(
        `slope-medium-${index + 1}`,
        "medium",
        "Slope: classify from points",
        `Classify the slope through ${p1} and ${p2} as positive, negative, zero, or undefined.`,
        [type],
        ["Look at how the line moves from left to right.", "Horizontal lines have zero slope; vertical lines have undefined slope.", "Rising means positive; falling means negative."],
        [`The points are ${p1} and ${p2}.`, type === "zero" ? "The y-values are the same, so the line is horizontal." : type === "undefined" ? "The x-values are the same, so the line is vertical." : `The line ${type === "positive" ? "rises" : "falls"} from left to right.`, `The slope is ${type}.`],
        "multiple-choice",
        shuffle(["positive", "negative", "zero", "undefined"]),
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`slope-hard-${index + 1}`, "hard", "Slope: rate of change in context", () => {
      const start = rand(10, 50);
      const rate = rand(3, 12);
      const x1 = rand(1, 4);
      const x2 = x1 + rand(2, 6);
      const y1 = start + rate * x1;
      const y2 = start + rate * x2;
      return q(
        `slope-hard-${index + 1}`,
        "hard",
        "Slope: rate of change in context",
        `A plan costs $${y1} after ${x1} months and $${y2} after ${x2} months. What is the monthly rate of change?`,
        [String(rate)],
        ["Rate of change is slope.", "Divide change in cost by change in months.", "Include the idea of dollars per month."],
        [`Change in cost: ${y2} - ${y1} = ${y2 - y1}.`, `Change in months: ${x2} - ${x1} = ${x2 - x1}.`, `Rate = ${(y2 - y1)} / ${(x2 - x1)} = ${rate} dollars per month.`],
        "numeric-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function slopeInterceptTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`slope-intercept-easy-${index + 1}`, "easy", "Slope-Intercept Form: identify slope and intercept", () => {
      const m = nonZero(-6, 6);
      const b = rand(-8, 8);
      return q(
        `slope-intercept-easy-${index + 1}`,
        "easy",
        "Slope-Intercept Form: identify slope and intercept",
        `For ${lineEquationPretty(m, b)}, what is the slope?`,
        [String(m)],
        ["Slope-intercept form is y = mx + b.", "The coefficient of x is the slope.", "The constant is the y-intercept."],
        [`Compare ${lineEquationPretty(m, b)} with y = mx + b.`, `The coefficient of x is ${m}.`, `The slope is ${m}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`slope-intercept-medium-${index + 1}`, "medium", "Slope-Intercept Form: write from slope and intercept", () => {
      const m = nonZero(-5, 5);
      const b = rand(-8, 8);
      const answer = lineEquation(m, b);
      return q(
        `slope-intercept-medium-${index + 1}`,
        "medium",
        "Slope-Intercept Form: write from slope and intercept",
        `Write the equation of a line with slope ${m} and y-intercept ${b}.`,
        [answer, lineEquationPretty(m, b)],
        ["Use y = mx + b.", `Replace m with ${m}.`, `Replace b with ${b}.`],
        [`Start with y = mx + b.`, `Substitute m = ${m} and b = ${b}.`, `The equation is ${lineEquationPretty(m, b)}.`],
        "equation-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`slope-intercept-hard-${index + 1}`, "hard", "Slope-Intercept Form: write from two points", () => {
      const m = nonZero(-5, 5);
      const b = rand(-8, 8);
      const x1 = rand(-4, 4);
      const x2 = x1 + rand(1, 5);
      const y1 = m * x1 + b;
      const y2 = m * x2 + b;
      return q(
        `slope-intercept-hard-${index + 1}`,
        "hard",
        "Slope-Intercept Form: write from two points",
        `Write the equation in slope-intercept form through (${x1}, ${y1}) and (${x2}, ${y2}).`,
        [lineEquation(m, b), lineEquationPretty(m, b)],
        ["Find the slope first.", "Use y = mx + b with one point to solve for b.", "Write the final equation as y = mx + b."],
        [`Slope = (${y2} - ${y1}) / (${x2} - ${x1}) = ${m}.`, `Use ${y1} = ${m}(${x1}) + b, so b = ${b}.`, `The equation is ${lineEquationPretty(m, b)}.`],
        "equation-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function standardFormTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`standard-form-easy-${index + 1}`, "easy", "Standard Form: identify coefficients", () => {
      const a = rand(2, 9);
      const b = rand(2, 9);
      const c = rand(10, 40);
      return q(
        `standard-form-easy-${index + 1}`,
        "easy",
        "Standard Form: identify coefficients",
        `In the standard form equation ${a}x + ${b}y = ${c}, what is A?`,
        [String(a)],
        ["Standard form is Ax + By = C.", "A is the coefficient of x.", "Read the number in front of x."],
        [`Standard form is Ax + By = C.`, `In ${a}x + ${b}y = ${c}, the coefficient of x is ${a}.`, `A = ${a}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`standard-form-medium-${index + 1}`, "medium", "Standard Form: convert from slope-intercept", () => {
      const m = rand(2, 7);
      const b = rand(-8, 8);
      const c = b;
      return q(
        `standard-form-medium-${index + 1}`,
        "medium",
        "Standard Form: convert from slope-intercept",
        `Convert y = ${m}x ${signed(b)} to standard form Ax + By = C with A positive.`,
        [`${m}x-y=${-b}`, `${m}x - y = ${-b}`],
        ["Move the x-term to the left side.", "Keep A positive.", "Standard form has x and y on the left and the constant on the right."],
        [`y = ${m}x ${signed(b)}.`, `Subtract ${m}x from both sides: -${m}x + y = ${b}.`, `Multiply by -1: ${m}x - y = ${-b}.`],
        "equation-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`standard-form-hard-${index + 1}`, "hard", "Standard Form: intercepts", () => {
      const xInt = rand(2, 10);
      const yInt = rand(2, 10);
      const a = yInt;
      const b = xInt;
      const c = xInt * yInt;
      return q(
        `standard-form-hard-${index + 1}`,
        "hard",
        "Standard Form: intercepts",
        `For ${a}x + ${b}y = ${c}, what is the x-intercept?`,
        [String(xInt), `(${xInt},0)`, `(${xInt}, 0)`],
        ["At the x-intercept, y = 0.", "Substitute y = 0 into the equation.", "Solve for x."],
        [`Set y = 0: ${a}x + ${b}(0) = ${c}.`, `${a}x = ${c}.`, `x = ${xInt}, so the x-intercept is (${xInt}, 0).`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function pointSlopeTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`point-slope-easy-${index + 1}`, "easy", "Point-Slope Form: identify point and slope", () => {
      const m = nonZero(-6, 6);
      const x1 = rand(-6, 6);
      const y1 = rand(-6, 6);
      return q(
        `point-slope-easy-${index + 1}`,
        "easy",
        "Point-Slope Form: identify point and slope",
        `In y - ${y1} = ${m}(x - ${x1}), what is the slope?`,
        [String(m)],
        ["Point-slope form is y - y1 = m(x - x1).", "The number multiplying the parentheses is m.", "m is the slope."],
        [`Compare with y - y1 = m(x - x1).`, `m = ${m}.`, `The slope is ${m}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`point-slope-medium-${index + 1}`, "medium", "Point-Slope Form: write equation from point and slope", () => {
      const m = nonZero(-5, 5);
      const x1 = rand(-6, 6);
      const y1 = rand(-6, 6);
      return q(
        `point-slope-medium-${index + 1}`,
        "medium",
        "Point-Slope Form: write equation from point and slope",
        `Write a point-slope equation for a line through (${x1}, ${y1}) with slope ${m}.`,
        [`y-${y1}=${m}(x-${x1})`, `y - ${y1} = ${m}(x - ${x1})`],
        ["Use y - y1 = m(x - x1).", `Use (${x1}, ${y1}) for (x1, y1).`, `Use slope ${m}.`],
        [`Start with y - y1 = m(x - x1).`, `Substitute x1 = ${x1}, y1 = ${y1}, and m = ${m}.`, `y - ${y1} = ${m}(x - ${x1}).`],
        "equation-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`point-slope-hard-${index + 1}`, "hard", "Point-Slope Form: from two points", () => {
      const m = nonZero(-5, 5);
      const x1 = rand(-5, 5);
      const y1 = rand(-5, 5);
      const x2 = x1 + rand(1, 5);
      const y2 = y1 + m * (x2 - x1);
      return q(
        `point-slope-hard-${index + 1}`,
        "hard",
        "Point-Slope Form: from two points",
        `Write a point-slope equation through (${x1}, ${y1}) and (${x2}, ${y2}) using the first point.`,
        [`y-${y1}=${m}(x-${x1})`, `y - ${y1} = ${m}(x - ${x1})`],
        ["Find the slope from the two points.", "Use the first point in point-slope form.", "Do not convert unless asked."],
        [`Slope = (${y2} - ${y1}) / (${x2} - ${x1}) = ${m}.`, `Use y - y1 = m(x - x1).`, `y - ${y1} = ${m}(x - ${x1}).`],
        "equation-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function graphingLinesTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`graphing-lines-easy-${index + 1}`, "easy", "Graphing Lines: y-intercept", () => {
      const m = nonZero(-5, 5);
      const b = rand(-8, 8);
      return q(
        `graphing-lines-easy-${index + 1}`,
        "easy",
        "Graphing Lines: y-intercept",
        `For ${lineEquationPretty(m, b)}, what point is the y-intercept?`,
        [`(0,${b})`, `(0, ${b})`],
        ["The y-intercept happens when x = 0.", "In y = mx + b, b is the y-intercept value.", "Write it as an ordered pair."],
        [`b = ${b}.`, `The y-intercept is where x = 0.`, `The point is (0, ${b}).`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`graphing-lines-medium-${index + 1}`, "medium", "Graphing Lines: generate points", () => {
      const m = nonZero(-4, 4);
      const b = rand(-6, 6);
      const x = rand(-3, 3);
      const y = m * x + b;
      return q(
        `graphing-lines-medium-${index + 1}`,
        "medium",
        "Graphing Lines: generate points",
        `For ${lineEquationPretty(m, b)}, what is y when x = ${x}?`,
        [String(y), `(${x},${y})`, `(${x}, ${y})`],
        ["Substitute the x-value into the equation.", "Calculate the y-value.", "That gives a point on the line."],
        [`y = ${m}(${x}) ${signed(b)}.`, `y = ${m * x} ${signed(b)}.`, `y = ${y}, so (${x}, ${y}) is on the line.`],
        "numeric-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`graphing-lines-hard-${index + 1}`, "hard", "Graphing Lines: choose graphing method", () => {
      const m = nonZero(-5, 5);
      const b = rand(-8, 8);
      return q(
        `graphing-lines-hard-${index + 1}`,
        "hard",
        "Graphing Lines: choose graphing method",
        `Which steps correctly graph ${lineEquationPretty(m, b)}?`,
        [`plot (0, ${b}), then use slope ${m}`],
        ["Start at the y-intercept.", "Slope tells rise over run from that point.", "Do not start at the slope."],
        [`The y-intercept is (0, ${b}).`, `The slope is ${m}.`, `Plot (0, ${b}), then use slope ${m} to find another point.`],
        "multiple-choice",
        shuffle([`plot (0, ${b}), then use slope ${m}`, `plot (${m}, 0), then use intercept ${b}`, `plot (0, ${m}), then move ${b}`, "pick any two points without using the equation"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function parallelPerpendicularTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`parallel-perp-easy-${index + 1}`, "easy", "Parallel Lines: same slope", () => {
      const m = nonZero(-6, 6);
      const b = rand(-8, 8);
      return q(
        `parallel-perp-easy-${index + 1}`,
        "easy",
        "Parallel Lines: same slope",
        `What is the slope of a line parallel to ${lineEquationPretty(m, b)}?`,
        [String(m)],
        ["Parallel lines have the same slope.", "Find the slope of the given line.", "Use that same slope."],
        [`The given line is in y = mx + b form.`, `Its slope is ${m}.`, `A parallel line also has slope ${m}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`parallel-perp-medium-${index + 1}`, "medium", "Perpendicular Lines: opposite reciprocal slope", () => {
      const m = [2, 3, 4, 5, -2][index];
      const b = rand(-8, 8);
      const answer = String(-1 / m);
      const frac = m > 0 ? `-1/${m}` : `1/${Math.abs(m)}`;
      return q(
        `parallel-perp-medium-${index + 1}`,
        "medium",
        "Perpendicular Lines: opposite reciprocal slope",
        `What is the slope of a line perpendicular to ${lineEquationPretty(m, b)}?`,
        [answer, frac],
        ["Perpendicular slopes are opposite reciprocals.", "Flip the slope fraction.", "Change the sign."],
        [`The given slope is ${m}.`, `The reciprocal is 1/${Math.abs(m)}.`, `Change the sign: ${frac}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`parallel-perp-hard-${index + 1}`, "hard", "Parallel and Perpendicular Lines: classify slopes", () => {
      const m1 = index % 2 === 0 ? 3 : 4;
      const m2 = index % 3 === 0 ? m1 : -1 / m1;
      const answer = m2 === m1 ? "parallel" : "perpendicular";
      return q(
        `parallel-perp-hard-${index + 1}`,
        "hard",
        "Parallel and Perpendicular Lines: classify slopes",
        `Classify lines with slopes ${m1} and ${m2}: parallel, perpendicular, or neither.`,
        [answer],
        ["Compare the slopes.", "Same slopes mean parallel.", "Opposite reciprocal slopes mean perpendicular."],
        [`Slope 1 is ${m1}.`, `Slope 2 is ${m2}.`, `The lines are ${answer}.`],
        "multiple-choice",
        shuffle(["parallel", "perpendicular", "neither", "same line"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

export const linearFunctions: Record<string, DeepTopicContent> = {
  slope: {
    objectives: ["Calculate slope from two points.", "Interpret slope as rate of change.", "Classify positive, negative, zero, and undefined slopes.", "Use slope to describe how a line changes."],
    lesson: ["Slope measures steepness and direction. It tells how much y changes when x changes by 1.", "The formula is change in y divided by change in x. Use the same order for both subtractions.", "Positive slope rises from left to right. Negative slope falls from left to right.", "Zero slope is horizontal because y does not change. Undefined slope is vertical because x does not change.", "In real-world contexts, slope is a rate, like dollars per month or miles per hour.", "A correct slope answer should match the direction and scale of the situation."],
    formulas: [{ label: "Slope", latex: "m=\\frac{y_2-y_1}{x_2-x_1}" }, { label: "Rate of change", latex: "m=\\frac{\\Delta y}{\\Delta x}" }, { label: "Special slopes", latex: "\\text{horizontal}=0, \\quad \\text{vertical}=\\text{undefined}" }],
    visual: { title: "Rise over run", body: "Count vertical change first, then horizontal change. Up/right is positive; down/right is negative." },
    commonMistakes: ["Subtracting x-values and y-values in different orders.", "Putting run over rise.", "Calling vertical slope zero.", "Ignoring units in rate-of-change problems.", "Forgetting that negative slope falls from left to right."],
    masteryChecks: ["I can compute slope from two points.", "I can classify special slopes.", "I can interpret slope in context.", "I can connect slope to graph direction."],
    questionTemplates: slopeTemplates(),
  },
  "slope-intercept-form": {
    objectives: ["Use y = mx + b to identify slope and intercept.", "Write equations from slope and y-intercept.", "Write equations from two points.", "Interpret m and b in contexts."],
    lesson: ["Slope-intercept form is y = mx + b. It is one of the fastest forms for graphing and interpreting a line.", "The m-value is the slope. It tells the rate of change.", "The b-value is the y-intercept. It tells where the line crosses the y-axis.", "To write a line from slope and intercept, substitute directly into y = mx + b.", "To write a line from two points, first calculate slope, then use one point to solve for b.", "This form is especially useful for real-world starting value plus constant rate problems."],
    formulas: [{ label: "Slope-intercept", latex: "y=mx+b" }, { label: "Slope", latex: "m=\\frac{y_2-y_1}{x_2-x_1}" }, { label: "Intercept", latex: "b=\\text{value of }y\\text{ when }x=0" }],
    visual: { title: "Start and step", body: "Start at b on the y-axis. Then use slope as rise over run to find more points." },
    commonMistakes: ["Mixing up slope and y-intercept.", "Using the x-intercept as b.", "Forgetting the sign of b.", "Finding slope correctly but not solving for b.", "Writing only m and b instead of a full equation."],
    masteryChecks: ["I can identify m and b.", "I can write y = mx + b from given values.", "I can write a line from two points.", "I can explain what m and b mean."],
    questionTemplates: slopeInterceptTemplates(),
  },
  "standard-form": {
    objectives: ["Recognize standard form Ax + By = C.", "Convert slope-intercept form to standard form.", "Find intercepts from standard form.", "Use standard form to represent linear constraints."],
    lesson: ["Standard form writes a line as Ax + By = C. Both variable terms are on the left and the constant is on the right.", "Many classes require A to be positive and A, B, and C to be integers.", "To convert from y = mx + b, move the x-term to the left side and adjust signs so A is positive.", "Standard form is useful for finding intercepts quickly.", "To find the x-intercept, set y = 0. To find the y-intercept, set x = 0.", "Standard form also appears in systems of equations and constraint problems."],
    formulas: [{ label: "Standard form", latex: "Ax+By=C" }, { label: "x-intercept", latex: "y=0" }, { label: "y-intercept", latex: "x=0" }],
    visual: { title: "Intercept shortcut", body: "Cover y to find the x-intercept. Cover x to find the y-intercept." },
    commonMistakes: ["Leaving y alone on one side and calling it standard form.", "Using a negative A when the class expects A positive.", "Forgetting to multiply every term when clearing fractions.", "Setting the wrong variable to zero for intercepts.", "Changing the equation by moving terms without changing signs."],
    masteryChecks: ["I can identify A, B, and C.", "I can convert to standard form.", "I can find x- and y-intercepts.", "I can keep equivalent equations balanced."],
    questionTemplates: standardFormTemplates(),
  },
  "point-slope-form": {
    objectives: ["Use point-slope form to write line equations.", "Identify the point and slope from point-slope form.", "Write a line from a point and slope.", "Write a line from two points using point-slope form."],
    lesson: ["Point-slope form is y - y1 = m(x - x1). It is useful when you know a point and the slope.", "The point is (x1, y1), and the slope is m.", "This form is often faster than slope-intercept form because you do not need to solve for b first.", "Signs can be tricky: using a negative coordinate inside x - x1 creates x + a.", "From two points, calculate slope first, then choose one point for the formula.", "Point-slope form connects directly to future math because it describes a line from a local point and rate of change."],
    formulas: [{ label: "Point-slope", latex: "y-y_1=m(x-x_1)" }, { label: "From point", latex: " (x_1,y_1)" }, { label: "Slope", latex: "m" }],
    visual: { title: "Anchor and direction", body: "The point anchors the line. The slope tells which direction to move from that anchor." },
    commonMistakes: ["Using x + x1 instead of x - x1 without considering signs.", "Putting the y-coordinate inside the x parentheses.", "Finding slope but not using the point.", "Converting to slope-intercept when point-slope was requested.", "Dropping parentheses around x - x1."],
    masteryChecks: ["I can identify m and the point.", "I can write point-slope form from a point and slope.", "I can write point-slope form from two points.", "I can handle negative coordinates correctly."],
    questionTemplates: pointSlopeTemplates(),
  },
  "graphing-lines": {
    objectives: ["Graph lines using slope and intercept.", "Generate points from a linear equation.", "Use y-intercept as a starting point.", "Connect equations, tables, and graphs."],
    lesson: ["Graphing a line means showing all points that satisfy its equation.", "In y = mx + b, the y-intercept b gives an easy starting point: (0, b).", "The slope tells how to move from one point to another using rise over run.", "You can also graph by making a table: choose x-values, calculate y-values, and plot the points.", "Two correct points are enough to draw a line, but checking a third point can catch mistakes.", "A graph should match the equation's slope direction and y-intercept."],
    formulas: [{ label: "Line form", latex: "y=mx+b" }, { label: "Point from input", latex: "x=a \\Rightarrow y=ma+b" }, { label: "Slope movement", latex: "m=\\frac{rise}{run}" }],
    visual: { title: "Plot, step, draw", body: "Plot the y-intercept, use slope to step to another point, then draw the line through both points." },
    commonMistakes: ["Starting at the slope instead of the y-intercept.", "Using run over rise.", "Moving the wrong direction for negative slope.", "Plotting only one point.", "Drawing a line that does not cross the y-axis at b."],
    masteryChecks: ["I can identify and plot the y-intercept.", "I can use slope to find another point.", "I can generate points from an equation.", "I can check whether a graph matches an equation."],
    questionTemplates: graphingLinesTemplates(),
  },
  "parallel-perpendicular-lines": {
    objectives: ["Identify parallel lines by equal slopes.", "Identify perpendicular lines by opposite reciprocal slopes.", "Write slopes for parallel and perpendicular lines.", "Classify relationships between lines from slopes."],
    lesson: ["Parallel lines have the same slope and never meet if they are distinct lines.", "Perpendicular lines meet at a right angle. Their slopes are opposite reciprocals.", "The opposite reciprocal of 3 is -1/3. The opposite reciprocal of -2 is 1/2.", "Horizontal and vertical lines are perpendicular to each other, even though vertical slope is undefined.", "To classify two lines, compare their slopes first, not their intercepts.", "This skill is important in geometry, coordinate proofs, and writing equations of related lines."],
    formulas: [{ label: "Parallel", latex: "m_1=m_2" }, { label: "Perpendicular", latex: "m_1m_2=-1" }, { label: "Opposite reciprocal", latex: "m \\Rightarrow -\\frac{1}{m}" }],
    visual: { title: "Same or right-angle", body: "Same slope means parallel. Slopes that multiply to -1 mean perpendicular." },
    commonMistakes: ["Using opposite signs only instead of opposite reciprocals.", "Thinking different y-intercepts mean perpendicular.", "Forgetting that parallel lines have equal slopes.", "Treating vertical slope as zero.", "Comparing equations before putting them into slope-intercept form."],
    masteryChecks: ["I can find a parallel slope.", "I can find a perpendicular slope.", "I can classify two slopes.", "I can explain why same slope does not mean same line automatically."],
    questionTemplates: parallelPerpendicularTemplates(),
  },
};
