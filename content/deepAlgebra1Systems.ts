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

function pointAnswers(x: number, y: number) {
  return [`(${x},${y})`, `(${x}, ${y})`, `x=${x},y=${y}`, `x = ${x}, y = ${y}`];
}

function line(m: number, b: number) {
  if (m === 1) return `y = x ${signed(b)}`;
  if (m === -1) return `y = -x ${signed(b)}`;
  return `y = ${m}x ${signed(b)}`;
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

function graphingSystemsTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`systems-graphing-easy-${index + 1}`, "easy", "Graphing Systems: identify intersection", () => {
      const x = rand(-5, 5);
      const y = rand(-5, 5);
      const m1 = nonZero(-4, 4);
      let m2 = nonZero(-4, 4);
      if (m2 === m1) m2 += 1;
      const b1 = y - m1 * x;
      const b2 = y - m2 * x;
      return q(
        `systems-graphing-easy-${index + 1}`,
        "easy",
        "Graphing Systems: identify intersection",
        `Solve the system by finding the intersection: ${line(m1, b1)} and ${line(m2, b2)}.`,
        pointAnswers(x, y),
        ["The solution is where the two lines cross.", "The same ordered pair must satisfy both equations.", "Substitute the intersection point to check both equations."],
        [`The lines were built to meet at (${x}, ${y}).`, `${y} = ${m1}(${x}) ${signed(b1)} and ${y} = ${m2}(${x}) ${signed(b2)}.`, `The solution is (${x}, ${y}).`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`systems-graphing-medium-${index + 1}`, "medium", "Graphing Systems: verify a solution", () => {
      const x = rand(-4, 4);
      const y = rand(-4, 4);
      const m1 = nonZero(-5, 5);
      let m2 = nonZero(-5, 5);
      if (m2 === m1) m2 += 2;
      const b1 = y - m1 * x;
      const b2 = y - m2 * x;
      return q(
        `systems-graphing-medium-${index + 1}`,
        "medium",
        "Graphing Systems: verify a solution",
        `Does (${x}, ${y}) solve the system ${line(m1, b1)} and ${line(m2, b2)}? Answer yes or no.`,
        ["yes"],
        ["A system solution must work in both equations.", "Substitute x and y into the first equation.", "Then check the second equation."],
        [`First equation: ${y} = ${m1}(${x}) ${signed(b1)} is true.`, `Second equation: ${y} = ${m2}(${x}) ${signed(b2)} is true.`, "So the point solves the system."],
        "multiple-choice",
        shuffle(["yes", "no", "only the first equation", "only the second equation"]),
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`systems-graphing-hard-${index + 1}`, "hard", "Graphing Systems: choose method from line behavior", () => {
      const x = rand(-5, 5);
      const y = rand(-5, 5);
      const m1 = nonZero(-4, 4);
      let m2 = nonZero(-4, 4);
      if (m2 === m1) m2 += 1;
      const b1 = y - m1 * x;
      const b2 = y - m2 * x;
      return q(
        `systems-graphing-hard-${index + 1}`,
        "hard",
        "Graphing Systems: choose method from line behavior",
        `The lines ${line(m1, b1)} and ${line(m2, b2)} cross once. How many solutions does the system have?`,
        ["one solution", "one"],
        ["A crossing point is a shared solution.", "Different slopes mean the lines meet once.", "The system has exactly one ordered-pair solution."],
        [`The slopes are ${m1} and ${m2}.`, "The slopes are different, so the lines intersect once.", "The system has one solution."],
        "multiple-choice",
        shuffle(["one solution", "no solution", "infinitely many solutions", "two solutions"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function substitutionTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`substitution-easy-${index + 1}`, "easy", "Substitution: substitute y expression", () => {
      const x = rand(-6, 6);
      const y = rand(-6, 6);
      const m = nonZero(-4, 4);
      const b = y - m * x;
      const a = nonZero(2, 6);
      const c = a * x + y;
      return q(
        `substitution-easy-${index + 1}`,
        "easy",
        "Substitution: substitute y expression",
        `Solve by substitution: y = ${m}x ${signed(b)} and ${a}x + y = ${c}.`,
        pointAnswers(x, y),
        ["Substitute the expression for y into the second equation.", "Solve the resulting one-variable equation for x.", "Use x to find y."],
        [`Substitute: ${a}x + (${m}x ${signed(b)}) = ${c}.`, `${a + m}x ${signed(b)} = ${c}, so x = ${x}.`, `y = ${m}(${x}) ${signed(b)} = ${y}. The solution is (${x}, ${y}).`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`substitution-medium-${index + 1}`, "medium", "Substitution: solve for one variable first", () => {
      const x = rand(-5, 5);
      const y = rand(-5, 5);
      const s = x + y;
      const m = nonZero(-4, 4);
      const b = y - m * x;
      return q(
        `substitution-medium-${index + 1}`,
        "medium",
        "Substitution: solve for one variable first",
        `Solve: x + y = ${s} and y = ${m}x ${signed(b)}.`,
        pointAnswers(x, y),
        ["The second equation already gives y.", "Replace y in the first equation.", "Then back-substitute to find the other variable."],
        [`x + (${m}x ${signed(b)}) = ${s}.`, `${m + 1}x ${signed(b)} = ${s}, so x = ${x}.`, `y = ${m}(${x}) ${signed(b)} = ${y}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`substitution-hard-${index + 1}`, "hard", "Substitution: choose efficient method", () => {
      const x = rand(-5, 5);
      const y = rand(-5, 5);
      const a = rand(2, 6);
      const b = y - a * x;
      const c = x + y;
      return q(
        `substitution-hard-${index + 1}`,
        "hard",
        "Substitution: choose efficient method",
        `For the system y = ${a}x ${signed(b)} and x + y = ${c}, which method is most direct?`,
        ["substitution"],
        ["One equation already has y isolated.", "That makes it easy to replace y in the other equation.", "This is exactly what substitution is for."],
        ["Because y is already isolated, substitute its expression into x + y = c.", "Then solve one equation in x.", "So substitution is the most direct method."],
        "multiple-choice",
        shuffle(["substitution", "graphing only", "elimination only", "quadratic formula"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function eliminationTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`elimination-easy-${index + 1}`, "easy", "Elimination: add equations", () => {
      const x = rand(-8, 8);
      const y = rand(-8, 8);
      const sum = x + y;
      const diff = x - y;
      return q(
        `elimination-easy-${index + 1}`,
        "easy",
        "Elimination: add equations",
        `Solve by elimination: x + y = ${sum} and x - y = ${diff}.`,
        pointAnswers(x, y),
        ["Add the equations to eliminate y.", "Solve for x first.", "Substitute x into one original equation to find y."],
        [`Add: (x + y) + (x - y) = ${sum} + ${diff}.`, `2x = ${sum + diff}, so x = ${x}.`, `x + y = ${sum}, so y = ${y}. Solution: (${x}, ${y}).`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`elimination-medium-${index + 1}`, "medium", "Elimination: eliminate x or y", () => {
      const x = rand(-5, 5);
      const y = rand(-5, 5);
      const a = rand(2, 5);
      const c1 = a * x + y;
      const c2 = a * x - y;
      return q(
        `elimination-medium-${index + 1}`,
        "medium",
        "Elimination: eliminate x or y",
        `Solve: ${a}x + y = ${c1} and ${a}x - y = ${c2}.`,
        pointAnswers(x, y),
        ["Add the equations so y cancels.", "Then divide to find x.", "Use either equation to find y."],
        [`Add: ${2 * a}x = ${c1 + c2}.`, `x = ${x}.`, `${a}(${x}) + y = ${c1}, so y = ${y}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`elimination-hard-${index + 1}`, "hard", "Elimination: multiply before eliminating", () => {
      const x = rand(-4, 4);
      const y = rand(-4, 4);
      const c1 = x + y;
      const c2 = 2 * x + 3 * y;
      return q(
        `elimination-hard-${index + 1}`,
        "hard",
        "Elimination: multiply before eliminating",
        `Solve: x + y = ${c1} and 2x + 3y = ${c2}.`,
        pointAnswers(x, y),
        ["Multiply the first equation by -2 to eliminate x.", "Add it to the second equation.", "Back-substitute to find x."],
        [`Multiply first equation by -2: -2x - 2y = ${-2 * c1}.`, `Add to 2x + 3y = ${c2}: y = ${y}.`, `x + ${y} = ${c1}, so x = ${x}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function specialCasesTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`systems-special-easy-${index + 1}`, "easy", "Systems Special Cases: parallel lines", () => {
      const m = nonZero(-5, 5);
      const b1 = rand(-8, 0);
      const b2 = b1 + rand(1, 6);
      return q(
        `systems-special-easy-${index + 1}`,
        "easy",
        "Systems Special Cases: parallel lines",
        `Classify the system: ${line(m, b1)} and ${line(m, b2)}.`,
        ["no solution"],
        ["Compare slopes and intercepts.", "Same slope but different intercepts means parallel lines.", "Parallel lines do not intersect."],
        [`Both lines have slope ${m}.`, `The y-intercepts are ${b1} and ${b2}, so they are different lines.`, "The system has no solution."],
        "multiple-choice",
        shuffle(["no solution", "one solution", "infinitely many solutions", "two solutions"]),
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`systems-special-medium-${index + 1}`, "medium", "Systems Special Cases: same line", () => {
      const m = nonZero(-4, 4);
      const b = rand(-6, 6);
      return q(
        `systems-special-medium-${index + 1}`,
        "medium",
        "Systems Special Cases: same line",
        `Classify the system: ${line(m, b)} and ${line(m, b)}.`,
        ["infinitely many solutions", "infinite solutions"],
        ["Compare the equations.", "The equations describe the exact same line.", "Every point on the line solves both equations."],
        ["The equations are identical.", "Identical lines overlap completely.", "The system has infinitely many solutions."],
        "multiple-choice",
        shuffle(["infinitely many solutions", "no solution", "one solution", "undefined solution"]),
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`systems-special-hard-${index + 1}`, "hard", "Systems Special Cases: dependent or inconsistent", () => {
      const same = index % 2 === 0;
      const answer = same ? "dependent" : "inconsistent";
      return q(
        `systems-special-hard-${index + 1}`,
        "hard",
        "Systems Special Cases: dependent or inconsistent",
        same ? "A system has infinitely many solutions. Is it dependent or inconsistent?" : "A system has no solution. Is it dependent or inconsistent?",
        [answer],
        ["Dependent systems represent the same line.", "Inconsistent systems have no shared solution.", "Match the vocabulary to the number of solutions."],
        [same ? "Infinitely many solutions means the equations represent the same line." : "No solution means the lines never meet.", same ? "That is called dependent." : "That is called inconsistent.", `Answer: ${answer}.`],
        "multiple-choice",
        shuffle(["dependent", "inconsistent", "independent", "quadratic"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function wordProblemTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`systems-word-easy-${index + 1}`, "easy", "Systems Word Problems: tickets", () => {
      const adults = rand(2, 8);
      const students = rand(2, 8);
      const total = adults + students;
      const money = 12 * adults + 7 * students;
      return q(
        `systems-word-easy-${index + 1}`,
        "easy",
        "Systems Word Problems: tickets",
        `Adult tickets cost $12 and student tickets cost $7. ${total} tickets cost $${money}. How many adult and student tickets were sold? Answer as adult,student.`,
        [`${adults},${students}`, `${adults}, ${students}`],
        ["Let a be adults and s be students.", "Use total tickets and total money equations.", "Solve the system."],
        [`a + s = ${total}.`, `12a + 7s = ${money}.`, `The solution is a = ${adults}, s = ${students}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`systems-word-medium-${index + 1}`, "medium", "Systems Word Problems: coins", () => {
      const quarters = rand(2, 10);
      const dimes = rand(2, 10);
      const totalCoins = quarters + dimes;
      const cents = 25 * quarters + 10 * dimes;
      return q(
        `systems-word-medium-${index + 1}`,
        "medium",
        "Systems Word Problems: coins",
        `A jar has ${totalCoins} coins made of quarters and dimes worth ${cents} cents. How many quarters and dimes? Answer as quarters,dimes.`,
        [`${quarters},${dimes}`, `${quarters}, ${dimes}`],
        ["Let q be quarters and d be dimes.", "Use number of coins and value in cents.", "Solve the system."],
        [`q + d = ${totalCoins}.`, `25q + 10d = ${cents}.`, `q = ${quarters}, d = ${dimes}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`systems-word-hard-${index + 1}`, "hard", "Systems Word Problems: choosing variables", () => {
      const x = rand(3, 9);
      const y = rand(2, 8);
      const total = x + y;
      const value = 4 * x + 9 * y;
      return q(
        `systems-word-hard-${index + 1}`,
        "hard",
        "Systems Word Problems: choosing variables",
        `A mix has ${total} items. Type A costs $4 each and Type B costs $9 each. The total cost is $${value}. Which system models the situation if x = Type A and y = Type B?`,
        [`x+y=${total},4x+9y=${value}`, `x + y = ${total}, 4x + 9y = ${value}`],
        ["One equation counts items.", "One equation counts total cost.", "Match each price with the correct variable."],
        [`Item count: x + y = ${total}.`, `Cost: 4x + 9y = ${value}.`, `The system is x + y = ${total}, 4x + 9y = ${value}.`],
        "multiple-choice",
        shuffle([`x + y = ${total}, 4x + 9y = ${value}`, `4x + 9y = ${total}, x + y = ${value}`, `x + y = ${value}, 4x + 9y = ${total}`, `4x + y = ${total}, 9x + y = ${value}`]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

export const systemsEquations: Record<string, DeepTopicContent> = {
  "systems-graphing": {
    objectives: ["Understand a system solution as an intersection point.", "Verify an ordered pair in two equations.", "Recognize when two linear equations meet once.", "Connect graphs to algebraic solutions."],
    lesson: ["A system of equations is a set of equations that must be true at the same time.", "For two linear equations, the solution is the ordered pair where the two lines intersect.", "Graphing works because every point on a line satisfies that line's equation.", "The intersection point satisfies both equations, so it is the shared solution.", "If two lines have different slopes, they cross once and the system has one solution.", "Graphing is visual and helpful for understanding, but exact algebra methods are often better when the intersection is not clean."],
    formulas: [{ label: "System solution", latex: "\\text{solution}=(x,y) \\text{ satisfying both equations}" }, { label: "Intersection", latex: "y_1=y_2" }, { label: "Different slopes", latex: "m_1\\ne m_2 \\Rightarrow \\text{one solution}" }],
    visual: { title: "Intersection means agreement", body: "Each line shows points that make one equation true. The crossing point makes both equations true." },
    commonMistakes: ["Giving only x or only y instead of an ordered pair.", "Reading the graph intersection inaccurately.", "Forgetting to check the point in both equations.", "Thinking every system has one solution.", "Mixing up x- and y-coordinates."],
    masteryChecks: ["I can identify an intersection as the solution.", "I can check a point in both equations.", "I can classify different-slope lines as one solution.", "I can explain what a system solution means."],
    questionTemplates: graphingSystemsTemplates(),
  },
  substitution: {
    objectives: ["Use substitution when one variable is isolated.", "Replace a variable with an equivalent expression.", "Solve the resulting one-variable equation.", "Back-substitute to find the second variable."],
    lesson: ["Substitution solves a system by replacing one variable with an equal expression from another equation.", "It is especially efficient when one equation already says y = something or x = something.", "After substitution, the system becomes one equation with one variable.", "Solve that equation, then substitute the value back into one original equation to find the other variable.", "The final answer should be an ordered pair, not two disconnected numbers.", "Always check the ordered pair in both original equations to avoid carrying an algebra mistake."],
    formulas: [{ label: "Substitute", latex: "y=mx+b \\Rightarrow ax+y=c \\to ax+(mx+b)=c" }, { label: "Back-substitute", latex: "x=a \\Rightarrow y=m(a)+b" }, { label: "Solution", latex: "(x,y)" }],
    visual: { title: "Replace and reduce", body: "Use one equation as a replacement rule, reducing two variables down to one." },
    commonMistakes: ["Substituting into the same equation instead of the other one.", "Forgetting parentheses around the substituted expression.", "Solving for x but never finding y.", "Reporting x and y in the wrong order.", "Not checking in both original equations."],
    masteryChecks: ["I can spot when substitution is efficient.", "I can substitute one expression into another equation.", "I can back-substitute correctly.", "I can write the final ordered pair."],
    questionTemplates: substitutionTemplates(),
  },
  elimination: {
    objectives: ["Add or subtract equations to remove a variable.", "Choose which variable to eliminate.", "Multiply an equation before eliminating when needed.", "Solve and check the resulting ordered pair."],
    lesson: ["Elimination solves a system by combining equations so one variable cancels out.", "It is efficient when coefficients are opposites or can easily be made opposites.", "If terms are already opposites, add the equations. If terms are the same, subtract or multiply one equation first.", "After one variable is eliminated, solve the remaining one-variable equation.", "Back-substitute into either original equation to find the second variable.", "Elimination is powerful because it keeps equations balanced while removing one unknown at a time."],
    formulas: [{ label: "Opposites cancel", latex: "y+(-y)=0" }, { label: "Add equations", latex: "(x+y)+(x-y)=2x" }, { label: "Back-substitute", latex: "x=a \\Rightarrow y=\\text{value}" }],
    visual: { title: "Cancel a column", body: "Line up x-terms, y-terms, and constants. Combine equations so one variable column becomes zero." },
    commonMistakes: ["Adding equations when coefficients are not opposites.", "Multiplying only one side of an equation.", "Losing negative signs while combining.", "Forgetting to find the second variable.", "Checking in a modified equation instead of the original equations."],
    masteryChecks: ["I can choose a variable to eliminate.", "I can multiply an equation before adding.", "I can solve after a variable cancels.", "I can verify the ordered pair."],
    questionTemplates: eliminationTemplates(),
  },
  "special-cases": {
    objectives: ["Classify systems as one solution, no solution, or infinitely many solutions.", "Connect slope/intercept behavior to solution count.", "Use vocabulary: consistent, inconsistent, independent, dependent.", "Recognize parallel and identical lines from equations."],
    lesson: ["Not every system has exactly one solution. The graph tells you how many shared points the equations have.", "Intersecting lines have one solution because they share one point.", "Parallel distinct lines have no solution because they never meet.", "Identical lines have infinitely many solutions because every point on the line satisfies both equations.", "An inconsistent system has no solution. A dependent system has infinitely many solutions.", "Comparing slopes and intercepts is often the fastest way to classify a linear system."],
    formulas: [{ label: "One solution", latex: "m_1\\ne m_2" }, { label: "No solution", latex: "m_1=m_2, b_1\\ne b_2" }, { label: "Infinitely many", latex: "\\text{same line}" }],
    visual: { title: "Three graph pictures", body: "Cross once: one solution. Parallel: no solution. Same line: infinitely many solutions." },
    commonMistakes: ["Calling parallel lines infinitely many solutions.", "Calling identical lines no solution.", "Comparing only intercepts and ignoring slopes.", "Using dependent and inconsistent backwards.", "Thinking a system must always have an ordered pair answer."],
    masteryChecks: ["I can classify systems by graph behavior.", "I can identify no-solution systems.", "I can identify infinitely-many-solution systems.", "I can use dependent and inconsistent correctly."],
    questionTemplates: specialCasesTemplates(),
  },
  "systems-word-problems": {
    objectives: ["Define variables from a real situation.", "Write two equations from two conditions.", "Solve a system and interpret the solution.", "Check whether answers make sense in context."],
    lesson: ["Systems word problems involve two unknowns and two pieces of information.", "Start by defining variables clearly. The variables should match the quantities being asked about.", "One equation often counts the total number of items. The other equation often represents value, cost, distance, or another total.", "After writing the system, choose substitution or elimination based on which looks easier.", "The solution must be interpreted in context, including units and which number belongs to which variable.", "A negative number of tickets, coins, or people usually means something went wrong because the answer must make sense in the story."],
    formulas: [{ label: "Count equation", latex: "x+y=\\text{total items}" }, { label: "Value equation", latex: "ax+by=\\text{total value}" }, { label: "Context answer", latex: "x=\\text{amount of first item}, y=\\text{amount of second item}" }],
    visual: { title: "Two facts, two equations", body: "Underline the two totals in the problem. Each total usually becomes one equation." },
    commonMistakes: ["Not defining variables.", "Swapping which variable represents which item.", "Writing only one equation.", "Using dollars and cents inconsistently.", "Solving correctly but answering with the wrong units."],
    masteryChecks: ["I can define variables clearly.", "I can build a count equation.", "I can build a value equation.", "I can interpret the ordered pair in words."],
    questionTemplates: wordProblemTemplates(),
  },
};
