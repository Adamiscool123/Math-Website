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

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
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

function radical(coefficient: number, radicand: number) {
  if (radicand === 1) return String(coefficient);
  if (coefficient === 1) return `sqrt(${radicand})`;
  return `${coefficient}sqrt(${radicand})`;
}

function simplifyingRadicalsTemplates(): QuestionTemplate[] {
  const easyValues = [4, 9, 16, 25, 36];
  const easy = easyValues.map((value, index) =>
    template(`simplifying-radicals-easy-${index + 1}`, "easy", "Simplifying Radicals: perfect squares", () => {
      const answer = Math.sqrt(value);
      return q(
        `simplifying-radicals-easy-${index + 1}`,
        "easy",
        "Simplifying Radicals: perfect squares",
        `Simplify sqrt(${value}).`,
        [String(answer)],
        ["Ask what number squared equals the radicand.", `${answer} × ${answer} = ${value}.`, "Perfect square roots simplify to whole numbers."],
        [`${value} is a perfect square.`, `${answer}^2 = ${value}.`, `sqrt(${value}) = ${answer}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`simplifying-radicals-medium-${index + 1}`, "medium", "Simplifying Radicals: factor out perfect squares", () => {
      const outside = rand(2, 8);
      const inside = [2, 3, 5, 6, 7][index];
      const value = outside * outside * inside;
      const answer = radical(outside, inside);
      return q(
        `simplifying-radicals-medium-${index + 1}`,
        "medium",
        "Simplifying Radicals: factor out perfect squares",
        `Simplify sqrt(${value}). Use sqrt notation, like 3sqrt(2).`,
        [answer, `${outside} sqrt(${inside})`],
        ["Look for the largest perfect-square factor.", `${value} = ${outside * outside} × ${inside}.`, `sqrt(${outside * outside}) = ${outside}.`],
        [`sqrt(${value}) = sqrt(${outside * outside} × ${inside}).`, `sqrt(${outside * outside}) = ${outside}.`, `So sqrt(${value}) = ${answer}.`],
        "expression-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`simplifying-radicals-hard-${index + 1}`, "hard", "Simplifying Radicals: variables", () => {
      const outside = rand(2, 6);
      const inside = [2, 3, 5, 6, 7][index];
      const value = outside * outside * inside;
      const answer = `${outside}x^2sqrt(${inside})`;
      return q(
        `simplifying-radicals-hard-${index + 1}`,
        "hard",
        "Simplifying Radicals: variables",
        `Simplify sqrt(${value}x^4). Use sqrt notation.`,
        [answer, `${outside}*x^2sqrt(${inside})`, `${outside}x^2 sqrt(${inside})`],
        ["Factor the number into a perfect square times a leftover factor.", "sqrt(x^4) = x^2 in Algebra 1 simplification contexts.", "Pull perfect-square factors outside the radical."],
        [`${value} = ${outside * outside} × ${inside}.`, `sqrt(${outside * outside}) = ${outside} and sqrt(x^4) = x^2.`, `The simplified form is ${answer}.`],
        "expression-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function radicalOperationsTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`radical-ops-easy-${index + 1}`, "easy", "Radical Operations: add like radicals", () => {
      const a = rand(2, 8);
      const b = rand(2, 8);
      const r = [2, 3, 5, 6, 7][index];
      const answer = radical(a + b, r);
      return q(
        `radical-ops-easy-${index + 1}`,
        "easy",
        "Radical Operations: add like radicals",
        `Simplify ${a}sqrt(${r}) + ${b}sqrt(${r}).`,
        [answer, `${a + b} sqrt(${r})`],
        ["The radicands match, so these are like radicals.", "Add the coefficients only.", "Keep the same radical part."],
        [`${a}sqrt(${r}) and ${b}sqrt(${r}) are like radicals.`, `Add coefficients: ${a} + ${b} = ${a + b}.`, `The answer is ${answer}.`],
        "expression-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`radical-ops-medium-${index + 1}`, "medium", "Radical Operations: simplify then add", () => {
      const r = [2, 3, 5, 6, 7][index];
      const outside = rand(2, 6);
      const coefficient = rand(2, 5);
      const value = outside * outside * r;
      const answer = radical(outside + coefficient, r);
      return q(
        `radical-ops-medium-${index + 1}`,
        "medium",
        "Radical Operations: simplify then add",
        `Simplify sqrt(${value}) + ${coefficient}sqrt(${r}).`,
        [answer, `${outside + coefficient} sqrt(${r})`],
        ["Simplify the first radical first.", `sqrt(${value}) = ${outside}sqrt(${r}).`, "Then combine like radicals."],
        [`sqrt(${value}) = sqrt(${outside * outside} × ${r}) = ${outside}sqrt(${r}).`, `${outside}sqrt(${r}) + ${coefficient}sqrt(${r}) = ${outside + coefficient}sqrt(${r}).`, `The answer is ${answer}.`],
        "expression-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`radical-ops-hard-${index + 1}`, "hard", "Radical Operations: multiply radicals", () => {
      const a = rand(2, 6);
      const b = rand(2, 6);
      const r1 = [2, 3, 5, 6, 7][index];
      const r2 = r1;
      const answer = String(a * b * r1);
      return q(
        `radical-ops-hard-${index + 1}`,
        "hard",
        "Radical Operations: multiply radicals",
        `Simplify (${a}sqrt(${r1}))(${b}sqrt(${r2})).`,
        [answer],
        ["Multiply coefficients together.", "Multiply radical parts together.", `sqrt(${r1}) × sqrt(${r1}) = ${r1}.`],
        [`Coefficients: ${a} × ${b} = ${a * b}.`, `Radicals: sqrt(${r1}) × sqrt(${r1}) = sqrt(${r1 * r1}) = ${r1}.`, `Product: ${a * b} × ${r1} = ${answer}.`],
        "numeric-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function pythagoreanTemplates(): QuestionTemplate[] {
  const triples = [
    [3, 4, 5],
    [5, 12, 13],
    [6, 8, 10],
    [7, 24, 25],
    [8, 15, 17],
  ];

  const easy = triples.map(([a, b, c], index) =>
    template(`pythagorean-easy-${index + 1}`, "easy", "Pythagorean Theorem: find hypotenuse", () =>
      q(
        `pythagorean-easy-${index + 1}`,
        "easy",
        "Pythagorean Theorem: find hypotenuse",
        `A right triangle has legs ${a} and ${b}. Find the hypotenuse.`,
        [String(c)],
        ["Use a^2 + b^2 = c^2.", "The hypotenuse is the side across from the right angle.", "Take the square root at the end."],
        [`${a}^2 + ${b}^2 = c^2.`, `${a * a} + ${b * b} = ${c * c}.`, `c = ${c}.`],
        "numeric-input",
      ),
    ),
  );

  const medium = triples.map(([a, b, c], index) =>
    template(`pythagorean-medium-${index + 1}`, "medium", "Pythagorean Theorem: find missing leg", () =>
      q(
        `pythagorean-medium-${index + 1}`,
        "medium",
        "Pythagorean Theorem: find missing leg",
        `A right triangle has hypotenuse ${c} and one leg ${a}. Find the missing leg.`,
        [String(b)],
        ["Use a^2 + b^2 = c^2.", "Subtract the known leg squared from the hypotenuse squared.", "Take the square root."],
        [`${a}^2 + b^2 = ${c}^2.`, `b^2 = ${c * c} - ${a * a} = ${b * b}.`, `b = ${b}.`],
        "numeric-input",
      ),
    ),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`pythagorean-hard-${index + 1}`, "hard", "Pythagorean Theorem: classify triangles", () => {
      const [a, b, c] = triples[index];
      return q(
        `pythagorean-hard-${index + 1}`,
        "hard",
        "Pythagorean Theorem: classify triangles",
        `Do side lengths ${a}, ${b}, and ${c} form a right triangle?`,
        ["yes"],
        ["Check whether a^2 + b^2 equals c^2 for the largest side c.", "Square the two smaller sides.", "Compare the sum with the largest side squared."],
        [`${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b}.`, `${c}^2 = ${c * c}.`, "The values match, so it is a right triangle."],
        "multiple-choice",
        shuffle(["yes", "no", "only if it is isosceles", "not enough information"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function distanceFormulaTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) => {
    const dx = [3, 5, 6, 7, 8][index];
    const dy = [4, 12, 8, 24, 15][index];
    const distance = Math.sqrt(dx * dx + dy * dy);
    return template(`distance-easy-${index + 1}`, "easy", "Distance Formula: horizontal and vertical changes", () =>
      q(
        `distance-easy-${index + 1}`,
        "easy",
        "Distance Formula: horizontal and vertical changes",
        `Find the distance between (0, 0) and (${dx}, ${dy}).`,
        [String(distance)],
        ["Use the distance formula or Pythagorean theorem.", `Horizontal change is ${dx}.`, `Vertical change is ${dy}.`],
        [`d = sqrt((${dx})^2 + (${dy})^2).`, `d = sqrt(${dx * dx} + ${dy * dy}) = sqrt(${dx * dx + dy * dy}).`, `d = ${distance}.`],
        "numeric-input",
      ),
    );
  });

  const medium = Array.from({ length: 5 }, (_, index) => {
    const x1 = rand(-8, -1);
    const y1 = rand(-8, -1);
    const dx = [3, 5, 6, 7, 8][index];
    const dy = [4, 12, 8, 24, 15][index];
    const x2 = x1 + dx;
    const y2 = y1 + dy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return template(`distance-medium-${index + 1}`, "medium", "Distance Formula: coordinate pairs", () =>
      q(
        `distance-medium-${index + 1}`,
        "medium",
        "Distance Formula: coordinate pairs",
        `Find the distance between (${x1}, ${y1}) and (${x2}, ${y2}).`,
        [String(distance)],
        ["Find change in x and change in y.", "Square both changes and add.", "Take the square root."],
        [`Change in x: ${x2} - (${x1}) = ${dx}.`, `Change in y: ${y2} - (${y1}) = ${dy}.`, `d = sqrt(${dx}^2 + ${dy}^2) = ${distance}.`],
        "numeric-input",
      ),
    );
  });

  const hard = Array.from({ length: 5 }, (_, index) => {
    const dx = [2, 3, 5, 6, 7][index];
    const dy = [2, 3, 5, 6, 7][index];
    const inside = dx * dx + dy * dy;
    const answer = `sqrt(${inside})`;
    return template(`distance-hard-${index + 1}`, "hard", "Distance Formula: irrational distances", () =>
      q(
        `distance-hard-${index + 1}`,
        "hard",
        "Distance Formula: irrational distances",
        `Find the exact distance between (0, 0) and (${dx}, ${dy}). Use sqrt notation if needed.`,
        [answer],
        ["Use the distance formula.", "Not every distance simplifies to a whole number.", "Leave the answer in exact radical form if needed."],
        [`d = sqrt(${dx}^2 + ${dy}^2).`, `d = sqrt(${dx * dx} + ${dy * dy}) = sqrt(${inside}).`, `Exact distance is ${answer}.`],
        "expression-input",
      ),
    );
  });

  return [...easy, ...medium, ...hard];
}

export const radicalsIrrationals: Record<string, DeepTopicContent> = {
  "simplifying-radicals": {
    objectives: ["Recognize perfect squares under radicals.", "Simplify square roots by factoring out perfect-square factors.", "Simplify radicals with variable powers.", "Write exact answers instead of decimal approximations when asked."],
    lesson: ["A square root asks what number squared gives the radicand.", "Perfect squares like 4, 9, 16, 25, and 36 simplify to whole numbers.", "For non-perfect squares, look for the largest perfect-square factor. For example, sqrt(72) uses 36 times 2.", "The square root of a product can split into the product of square roots when working with nonnegative quantities.", "Variable powers simplify by pulling out pairs of variables because a square root undoes squaring.", "Exact radical form is often better than a decimal because it preserves the true value without rounding."],
    formulas: [{ label: "Product property", latex: "\\sqrt{ab}=\\sqrt a\\sqrt b" }, { label: "Perfect square factor", latex: "\\sqrt{36\\cdot2}=6\\sqrt2" }, { label: "Variable powers", latex: "\\sqrt{x^4}=x^2" }],
    visual: { title: "Pull out square groups", body: "Break the radicand into a perfect square part and a leftover part. The square root of the perfect square moves outside." },
    commonMistakes: ["Leaving a perfect-square factor inside the radical.", "Splitting sums like sqrt(a + b) incorrectly.", "Turning sqrt(50) into 25sqrt(2) instead of 5sqrt(2).", "Using decimals when exact radical form is requested.", "Forgetting variable factors under the radical."],
    masteryChecks: ["I can simplify perfect square roots.", "I can factor out perfect squares.", "I can simplify radicals with variables.", "I can keep answers exact."],
    questionTemplates: simplifyingRadicalsTemplates(),
  },
  "radical-operations": {
    objectives: ["Add and subtract like radicals.", "Simplify radicals before combining them.", "Multiply radical expressions.", "Recognize when radicals are not like terms."],
    lesson: ["Radical expressions combine like terms the same way variables do: the radical part must match.", "You can add 3sqrt(2) and 5sqrt(2), but you cannot directly add 3sqrt(2) and 5sqrt(3).", "Often you must simplify radicals first before seeing that they are like radicals.", "Multiplying radicals uses the product property: sqrt(a) times sqrt(b) equals sqrt(ab).", "When the same radical multiplies itself, the result is the radicand because square root and square undo each other.", "Clean radical work means simplifying first, combining like radicals second, and checking whether the final radical can simplify further."],
    formulas: [{ label: "Like radicals", latex: "a\\sqrt b+c\\sqrt b=(a+c)\\sqrt b" }, { label: "Multiply radicals", latex: "\\sqrt a\\sqrt b=\\sqrt{ab}" }, { label: "Same radical", latex: "\\sqrt a\\cdot\\sqrt a=a" }],
    visual: { title: "Radical like terms", body: "The number outside can change, but the radical inside must match before adding or subtracting." },
    commonMistakes: ["Adding unlike radicals.", "Adding radicands instead of coefficients.", "Not simplifying first before combining.", "Forgetting to simplify after multiplying.", "Treating sqrt(a) + sqrt(b) as sqrt(a + b)."],
    masteryChecks: ["I can combine like radicals.", "I can simplify before adding.", "I can multiply radicals.", "I can tell when radicals are unlike."],
    questionTemplates: radicalOperationsTemplates(),
  },
  "pythagorean-theorem": {
    objectives: ["Use a^2 + b^2 = c^2 in right triangles.", "Find missing hypotenuse lengths.", "Find missing leg lengths.", "Classify side lengths as right triangles."],
    lesson: ["The Pythagorean theorem works only for right triangles.", "The legs are the two sides that form the right angle. The hypotenuse is the longest side, across from the right angle.", "When finding the hypotenuse, add the squares of the legs and take the square root.", "When finding a missing leg, subtract the known leg squared from the hypotenuse squared.", "Pythagorean triples are whole-number side lengths like 3, 4, 5 and 5, 12, 13.", "The theorem also helps connect geometry to radicals and distance on the coordinate plane."],
    formulas: [{ label: "Pythagorean theorem", latex: "a^2+b^2=c^2" }, { label: "Hypotenuse", latex: "c=\\sqrt{a^2+b^2}" }, { label: "Missing leg", latex: "a=\\sqrt{c^2-b^2}" }],
    visual: { title: "Right triangle square areas", body: "The area of the square on the hypotenuse equals the sum of the areas on the two legs." },
    commonMistakes: ["Using the theorem on non-right triangles.", "Putting the hypotenuse in the wrong place.", "Adding when solving for a missing leg instead of subtracting.", "Forgetting to take the square root at the end.", "Rounding when exact form is requested."],
    masteryChecks: ["I can identify the hypotenuse.", "I can find a missing hypotenuse.", "I can find a missing leg.", "I can verify right triangle triples."],
    questionTemplates: pythagoreanTemplates(),
  },
  "distance-formula": {
    objectives: ["Find distance between two points on the coordinate plane.", "Connect distance formula to the Pythagorean theorem.", "Handle negative coordinates correctly.", "Give exact radical distances when needed."],
    lesson: ["The distance formula finds the length of the straight segment between two coordinate points.", "It comes from the Pythagorean theorem: horizontal change and vertical change act like the legs of a right triangle.", "Subtract x-values to get horizontal change and y-values to get vertical change.", "Because the differences are squared, the order of subtraction does not change the final distance if you are consistent.", "Some distances are whole numbers, especially Pythagorean triples. Others stay as square roots.", "Coordinate distance is important for geometry, graphing, circles, and later analytic geometry."],
    formulas: [{ label: "Distance formula", latex: "d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}" }, { label: "Horizontal change", latex: "\\Delta x=x_2-x_1" }, { label: "Vertical change", latex: "\\Delta y=y_2-y_1" }],
    visual: { title: "Coordinate right triangle", body: "Draw a horizontal leg and vertical leg between the points. The distance is the hypotenuse." },
    commonMistakes: ["Subtracting coordinates inconsistently.", "Forgetting to square both changes.", "Adding coordinates instead of subtracting them.", "Rounding exact radical distances unnecessarily.", "Mixing x-values with y-values."],
    masteryChecks: ["I can calculate horizontal and vertical changes.", "I can use the distance formula.", "I can handle negative coordinates.", "I can leave irrational distances exact."],
    questionTemplates: distanceFormulaTemplates(),
  },
};
