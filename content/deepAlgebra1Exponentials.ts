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

function pow(base: number, exponent: number) {
  return Math.round(base ** exponent * 100000) / 100000;
}

function exponentialGrowthTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`exponential-growth-easy-${index + 1}`, "easy", "Exponential Growth: evaluate repeated multiplication", () => {
      const start = rand(2, 9);
      const factor = rand(2, 4);
      const time = rand(2, 5);
      const answer = start * factor ** time;
      return q(
        `exponential-growth-easy-${index + 1}`,
        "easy",
        "Exponential Growth: evaluate repeated multiplication",
        `A quantity starts at ${start} and is multiplied by ${factor} each step. What is its value after ${time} steps?`,
        [String(answer)],
        ["Use start × factor^steps.", `The growth factor is ${factor}.`, `Compute ${start} × ${factor}^${time}.`],
        [`Model: y = ${start}(${factor})^t.`, `At t = ${time}: y = ${start}(${factor})^${time}.`, `y = ${answer}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`exponential-growth-medium-${index + 1}`, "medium", "Exponential Growth: percent increase", () => {
      const start = rand(50, 200);
      const percent = [5, 10, 20, 25, 50][index];
      const factor = 1 + percent / 100;
      return q(
        `exponential-growth-medium-${index + 1}`,
        "medium",
        "Exponential Growth: percent increase",
        `A population starts at ${start} and grows by ${percent}% per year. What is the growth factor?`,
        [String(factor), factor.toFixed(2)],
        ["Growth factor is 1 plus the percent written as a decimal.", `${percent}% = ${percent / 100}.`, `1 + ${percent / 100} = ${factor}.`],
        [`Convert ${percent}% to ${percent / 100}.`, `Growth factor = 1 + ${percent / 100}.`, `Growth factor = ${factor}.`],
        "numeric-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`exponential-growth-hard-${index + 1}`, "hard", "Exponential Growth: write a model", () => {
      const start = rand(20, 100);
      const percent = [5, 10, 15, 20, 25][index];
      const factor = 1 + percent / 100;
      const answer = `y=${start}(${factor})^t`;
      return q(
        `exponential-growth-hard-${index + 1}`,
        "hard",
        "Exponential Growth: write a model",
        `Write an exponential model for a starting value of ${start} growing by ${percent}% each time period. Use t as the input.`,
        [answer, `y = ${start}(${factor})^t`, `f(t)=${start}(${factor})^t`, `f(t) = ${start}(${factor})^t`],
        ["Use y = a(b)^t.", `The initial value a is ${start}.`, `The growth factor b is 1 + ${percent / 100} = ${factor}.`],
        [`Start with y = a(b)^t.`, `a = ${start} and b = ${factor}.`, `The model is y = ${start}(${factor})^t.`],
        "equation-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function exponentialDecayTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`exponential-decay-easy-${index + 1}`, "easy", "Exponential Decay: evaluate repeated decrease", () => {
      const start = rand(80, 300);
      const factor = [0.5, 0.8, 0.75, 0.6, 0.9][index];
      const time = rand(2, 4);
      const answer = pow(start * factor ** time, 1);
      return q(
        `exponential-decay-easy-${index + 1}`,
        "easy",
        "Exponential Decay: evaluate repeated decrease",
        `A quantity starts at ${start} and is multiplied by ${factor} each step. What is its value after ${time} steps?`,
        [String(answer), answer.toFixed(2)],
        ["Decay still uses y = a(b)^t.", "For decay, the factor is between 0 and 1.", `Compute ${start}(${factor})^${time}.`],
        [`Model: y = ${start}(${factor})^t.`, `At t = ${time}: y = ${start}(${factor})^${time}.`, `y = ${answer}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`exponential-decay-medium-${index + 1}`, "medium", "Exponential Decay: percent decrease", () => {
      const percent = [5, 10, 20, 25, 40][index];
      const factor = 1 - percent / 100;
      return q(
        `exponential-decay-medium-${index + 1}`,
        "medium",
        "Exponential Decay: percent decrease",
        `A value decreases by ${percent}% each year. What is the decay factor?`,
        [String(factor), factor.toFixed(2)],
        ["Decay factor is 1 minus the percent written as a decimal.", `${percent}% = ${percent / 100}.`, `1 - ${percent / 100} = ${factor}.`],
        [`Convert ${percent}% to ${percent / 100}.`, `Decay factor = 1 - ${percent / 100}.`, `Decay factor = ${factor}.`],
        "numeric-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`exponential-decay-hard-${index + 1}`, "hard", "Exponential Decay: half-life", () => {
      const start = [64, 80, 96, 120, 200][index];
      const periods = rand(2, 4);
      const answer = start / 2 ** periods;
      return q(
        `exponential-decay-hard-${index + 1}`,
        "hard",
        "Exponential Decay: half-life",
        `A sample starts with ${start} grams and halves every hour. How many grams remain after ${periods} hours?`,
        [String(answer)],
        ["Halving means multiplying by 1/2 each hour.", "Use y = a(1/2)^t.", `Compute ${start}(1/2)^${periods}.`],
        [`Model: y = ${start}(1/2)^t.`, `At t = ${periods}: y = ${start}(1/2)^${periods}.`, `y = ${answer}.`],
        "numeric-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function linearVsExponentialTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`linear-vs-exp-easy-${index + 1}`, "easy", "Linear vs Exponential: constant difference", () => {
      const start = rand(1, 10);
      const diff = rand(2, 8);
      const values = [start, start + diff, start + 2 * diff, start + 3 * diff];
      return q(
        `linear-vs-exp-easy-${index + 1}`,
        "easy",
        "Linear vs Exponential: constant difference",
        `Classify the pattern as linear or exponential: ${values.join(", ")}.`,
        ["linear"],
        ["Check differences first.", "A constant difference means linear.", `Each term increases by ${diff}.`],
        [`Differences are ${diff}, ${diff}, ${diff}.`, "The difference is constant.", "The model is linear."],
        "multiple-choice",
        shuffle(["linear", "exponential", "quadratic", "neither"]),
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`linear-vs-exp-medium-${index + 1}`, "medium", "Linear vs Exponential: constant ratio", () => {
      const start = rand(2, 7);
      const ratio = rand(2, 4);
      const values = [start, start * ratio, start * ratio ** 2, start * ratio ** 3];
      return q(
        `linear-vs-exp-medium-${index + 1}`,
        "medium",
        "Linear vs Exponential: constant ratio",
        `Classify the pattern as linear or exponential: ${values.join(", ")}.`,
        ["exponential"],
        ["Check ratios between consecutive terms.", "A constant ratio means exponential.", `Each term is multiplied by ${ratio}.`],
        [`Ratios are ${ratio}, ${ratio}, ${ratio}.`, "The ratio is constant.", "The model is exponential."],
        "multiple-choice",
        shuffle(["linear", "exponential", "constant", "not a function"]),
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`linear-vs-exp-hard-${index + 1}`, "hard", "Linear vs Exponential: compare long-term growth", () => {
      const linearStart = rand(10, 30);
      const add = rand(5, 12);
      const expStart = rand(2, 5);
      const factor = rand(2, 3);
      const time = 5;
      const linearValue = linearStart + add * time;
      const expValue = expStart * factor ** time;
      const answer = expValue > linearValue ? "exponential" : "linear";
      return q(
        `linear-vs-exp-hard-${index + 1}`,
        "hard",
        "Linear vs Exponential: compare long-term growth",
        `At t = ${time}, which model is larger: linear y = ${linearStart} + ${add}t or exponential y = ${expStart}(${factor})^t?`,
        [answer],
        ["Evaluate both models at the same input.", "Linear adds repeatedly; exponential multiplies repeatedly.", "Compare the two outputs."],
        [`Linear: ${linearStart} + ${add}(${time}) = ${linearValue}.`, `Exponential: ${expStart}(${factor})^${time} = ${expValue}.`, `The larger model is ${answer}.`],
        "multiple-choice",
        shuffle(["linear", "exponential", "both equal", "cannot tell"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function arithmeticSequencesTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`arithmetic-easy-${index + 1}`, "easy", "Arithmetic Sequences: common difference", () => {
      const start = rand(-10, 10);
      const diff = rand(2, 9);
      const terms = [start, start + diff, start + 2 * diff, start + 3 * diff];
      return q(
        `arithmetic-easy-${index + 1}`,
        "easy",
        "Arithmetic Sequences: common difference",
        `Find the common difference: ${terms.join(", ")}.`,
        [String(diff)],
        ["Subtract consecutive terms.", "Arithmetic sequences have a constant difference.", `The terms increase by ${diff}.`],
        [`${terms[1]} - ${terms[0]} = ${diff}.`, `${terms[2]} - ${terms[1]} = ${diff}.`, `Common difference is ${diff}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`arithmetic-medium-${index + 1}`, "medium", "Arithmetic Sequences: nth term", () => {
      const a1 = rand(-5, 10);
      const d = rand(2, 8);
      const n = rand(5, 12);
      const answer = a1 + (n - 1) * d;
      return q(
        `arithmetic-medium-${index + 1}`,
        "medium",
        "Arithmetic Sequences: nth term",
        `An arithmetic sequence has a1 = ${a1} and d = ${d}. Find a${n}.`,
        [String(answer)],
        ["Use a_n = a1 + (n - 1)d.", `Substitute n = ${n}.`, "Remember there are n - 1 jumps from the first term."],
        [`a_${n} = ${a1} + (${n} - 1)(${d}).`, `a_${n} = ${a1} + ${(n - 1) * d}.`, `a_${n} = ${answer}.`],
        "numeric-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`arithmetic-hard-${index + 1}`, "hard", "Arithmetic Sequences: explicit rule", () => {
      const a1 = rand(-6, 8);
      const d = rand(2, 9);
      const constant = a1 - d;
      const answer = `a_n=${d}n${signed(constant)}`;
      return q(
        `arithmetic-hard-${index + 1}`,
        "hard",
        "Arithmetic Sequences: explicit rule",
        `Write an explicit rule for an arithmetic sequence with a1 = ${a1} and common difference ${d}.`,
        [answer, `a_n = ${d}n ${signed(constant)}`, `an=${d}n${signed(constant)}`],
        ["Start with a_n = a1 + (n - 1)d.", "Distribute d.", "Simplify into slope-intercept-like form."],
        [`a_n = ${a1} + (n - 1)${d}.`, `a_n = ${a1} + ${d}n - ${d}.`, `a_n = ${d}n ${signed(constant)}.`],
        "equation-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function geometricSequencesTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`geometric-easy-${index + 1}`, "easy", "Geometric Sequences: common ratio", () => {
      const a1 = rand(2, 8);
      const r = rand(2, 5);
      const terms = [a1, a1 * r, a1 * r ** 2, a1 * r ** 3];
      return q(
        `geometric-easy-${index + 1}`,
        "easy",
        "Geometric Sequences: common ratio",
        `Find the common ratio: ${terms.join(", ")}.`,
        [String(r)],
        ["Divide consecutive terms.", "Geometric sequences have a constant ratio.", `Each term is multiplied by ${r}.`],
        [`${terms[1]} / ${terms[0]} = ${r}.`, `${terms[2]} / ${terms[1]} = ${r}.`, `Common ratio is ${r}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`geometric-medium-${index + 1}`, "medium", "Geometric Sequences: nth term", () => {
      const a1 = rand(2, 7);
      const r = rand(2, 4);
      const n = rand(4, 8);
      const answer = a1 * r ** (n - 1);
      return q(
        `geometric-medium-${index + 1}`,
        "medium",
        "Geometric Sequences: nth term",
        `A geometric sequence has a1 = ${a1} and r = ${r}. Find a${n}.`,
        [String(answer)],
        ["Use a_n = a1(r)^(n - 1).", `Substitute n = ${n}.`, "There are n - 1 multiplications after the first term."],
        [`a_${n} = ${a1}(${r})^(${n} - 1).`, `a_${n} = ${a1}(${r})^${n - 1}.`, `a_${n} = ${answer}.`],
        "numeric-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`geometric-hard-${index + 1}`, "hard", "Geometric Sequences: explicit rule", () => {
      const a1 = rand(2, 9);
      const r = rand(2, 5);
      const answer = `a_n=${a1}(${r})^(n-1)`;
      return q(
        `geometric-hard-${index + 1}`,
        "hard",
        "Geometric Sequences: explicit rule",
        `Write an explicit rule for a geometric sequence with first term ${a1} and common ratio ${r}.`,
        [answer, `a_n = ${a1}(${r})^(n - 1)`, `an=${a1}(${r})^(n-1)`],
        ["Use the geometric sequence formula.", "The first term is a1.", "The exponent is n - 1, not n."],
        [`Geometric explicit form: a_n = a1(r)^(n - 1).`, `a1 = ${a1} and r = ${r}.`, `a_n = ${a1}(${r})^(n - 1).`],
        "equation-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function recursiveExplicitTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`recursive-explicit-easy-${index + 1}`, "easy", "Recursive Rules: next term", () => {
      const a1 = rand(1, 10);
      const d = rand(2, 8);
      const terms = [a1, a1 + d, a1 + 2 * d];
      const answer = a1 + 3 * d;
      return q(
        `recursive-explicit-easy-${index + 1}`,
        "easy",
        "Recursive Rules: next term",
        `The sequence is ${terms.join(", ")}, ... What is the next term?`,
        [String(answer)],
        ["Find the pattern from term to term.", `Each term increases by ${d}.`, "Add the common difference to the last given term."],
        [`The common difference is ${d}.`, `Next term = ${terms[2]} + ${d}.`, `Next term = ${answer}.`],
        "numeric-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`recursive-explicit-medium-${index + 1}`, "medium", "Recursive Rules: identify recursive formula", () => {
      const a1 = rand(2, 9);
      const d = rand(2, 8);
      return q(
        `recursive-explicit-medium-${index + 1}`,
        "medium",
        "Recursive Rules: identify recursive formula",
        `Which recursive rule describes an arithmetic sequence with a1 = ${a1} and common difference ${d}?`,
        [`a_1=${a1}, a_n=a_(n-1)+${d}`],
        ["A recursive rule needs a starting term.", "Arithmetic recursion adds the common difference to the previous term.", `Here the common difference is ${d}.`],
        [`Start with a_1 = ${a1}.`, `Use a_n = a_(n-1) + d.`, `Rule: a_1 = ${a1}, a_n = a_(n-1) + ${d}.`],
        "multiple-choice",
        shuffle([`a_1=${a1}, a_n=a_(n-1)+${d}`, `a_1=${a1}, a_n=${d}a_(n-1)`, `a_n=${a1}+${d}n`, `a_1=${d}, a_n=a_(n-1)+${a1}`]),
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`recursive-explicit-hard-${index + 1}`, "hard", "Recursive and Explicit Rules: compare rule types", () => {
      const a1 = rand(2, 8);
      const d = rand(2, 7);
      const n = rand(6, 10);
      const answer = a1 + (n - 1) * d;
      return q(
        `recursive-explicit-hard-${index + 1}`,
        "hard",
        "Recursive and Explicit Rules: compare rule types",
        `A sequence has explicit rule a_n = ${d}n ${signed(a1 - d)}. Find a${n}.`,
        [String(answer)],
        ["Explicit rules let you plug in n directly.", `Substitute n = ${n}.`, "Simplify."],
        [`a_${n} = ${d}(${n}) ${signed(a1 - d)}.`, `a_${n} = ${d * n} ${signed(a1 - d)}.`, `a_${n} = ${answer}.`],
        "numeric-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

export const exponentialsSequences: Record<string, DeepTopicContent> = {
  "exponential-growth": {
    objectives: ["Model repeated multiplication with exponential functions.", "Identify initial value and growth factor.", "Convert percent growth into a growth factor.", "Evaluate exponential growth models."],
    lesson: ["Exponential growth happens when a quantity is multiplied by the same factor over equal intervals.", "The general form is y = a(b)^t, where a is the initial value and b is the growth factor.", "For growth, the factor b is greater than 1.", "Percent increase converts to a growth factor by adding the percent as a decimal to 1.", "Exponential growth eventually outpaces linear growth because multiplication compounds.", "The key is identifying whether the situation adds repeatedly or multiplies repeatedly."],
    formulas: [{ label: "Growth model", latex: "y=a(b)^t" }, { label: "Growth factor", latex: "b=1+r" }, { label: "Percent to decimal", latex: "r=\\frac{p}{100}" }],
    visual: { title: "Multiply every step", body: "Start at a. Each equal time step multiplies by b, so the curve grows faster and faster." },
    commonMistakes: ["Using addition instead of multiplication.", "Using the percent as the factor instead of 1 plus the decimal.", "Forgetting the exponent is the number of time periods.", "Confusing initial value with growth factor.", "Writing b less than 1 for a growth model."],
    masteryChecks: ["I can identify initial value.", "I can identify growth factor.", "I can convert percent growth.", "I can evaluate a growth model."],
    questionTemplates: exponentialGrowthTemplates(),
  },
  "exponential-decay": {
    objectives: ["Model repeated percent decrease.", "Identify decay factors between 0 and 1.", "Evaluate decay models.", "Interpret half-life situations."],
    lesson: ["Exponential decay happens when a quantity is repeatedly multiplied by a factor between 0 and 1.", "The form is still y = a(b)^t, but decay has 0 < b < 1.", "A percent decrease converts to a decay factor by subtracting the decimal percent from 1.", "Half-life is a common decay model where the factor is 1/2 for each time period.", "Decay approaches zero but does not become negative in basic Algebra 1 models.", "The important difference from linear decrease is that the amount lost changes because it is a percentage of the current amount."],
    formulas: [{ label: "Decay model", latex: "y=a(b)^t, \\ 0<b<1" }, { label: "Decay factor", latex: "b=1-r" }, { label: "Half-life", latex: "y=a(\\frac12)^t" }],
    visual: { title: "Multiply by a fraction", body: "Each step keeps part of the previous value, so the graph falls quickly at first and then levels out." },
    commonMistakes: ["Subtracting the same amount each time instead of using a percent.", "Using 1 plus the rate for decay.", "Using the percent number as the factor.", "Thinking decay must become negative.", "Forgetting that half-life means repeated multiplication by 1/2."],
    masteryChecks: ["I can identify a decay factor.", "I can convert percent decrease.", "I can evaluate a decay model.", "I can solve basic half-life questions."],
    questionTemplates: exponentialDecayTemplates(),
  },
  "linear-vs-exponential-models": {
    objectives: ["Distinguish constant difference from constant ratio.", "Classify tables as linear or exponential.", "Compare linear and exponential model values.", "Explain why exponential growth can overtake linear growth."],
    lesson: ["Linear models add or subtract the same amount each step. Exponential models multiply by the same factor each step.", "A constant difference indicates a linear model when input steps are equal.", "A constant ratio indicates an exponential model.", "Linear graphs have constant rate of change and form straight lines.", "Exponential graphs curve because the rate of change depends on the current value.", "When comparing models, evaluate both at the same input instead of guessing from the equation type alone."],
    formulas: [{ label: "Linear", latex: "y=mx+b" }, { label: "Exponential", latex: "y=a(b)^x" }, { label: "Test", latex: "\\Delta y \\text{ constant vs ratio constant}" }],
    visual: { title: "Add vs multiply", body: "Linear adds the same amount. Exponential multiplies by the same factor." },
    commonMistakes: ["Calling every increasing table exponential.", "Checking ratios before making sure inputs are equally spaced.", "Ignoring the starting value.", "Assuming exponential is always larger immediately.", "Confusing constant difference with constant ratio."],
    masteryChecks: ["I can classify from a table.", "I can identify constant difference.", "I can identify constant ratio.", "I can compare two models at the same input."],
    questionTemplates: linearVsExponentialTemplates(),
  },
  "arithmetic-sequences": {
    objectives: ["Identify arithmetic sequences by common difference.", "Find missing and later terms.", "Use explicit arithmetic sequence formulas.", "Connect arithmetic sequences to linear functions."],
    lesson: ["An arithmetic sequence changes by adding the same number each step.", "That repeated addition is called the common difference.", "The explicit formula is a_n = a_1 + (n - 1)d because the first term has zero jumps from itself.", "Arithmetic sequences behave like linear functions because they have a constant rate of change.", "The term number n is usually positive integer input, not an x-value from a continuous graph.", "Strong sequence work keeps track of whether the sequence starts at n = 1 or n = 0."],
    formulas: [{ label: "Common difference", latex: "d=a_n-a_{n-1}" }, { label: "Explicit formula", latex: "a_n=a_1+(n-1)d" }, { label: "Linear connection", latex: "a_n=dn+(a_1-d)" }],
    visual: { title: "Same jump each term", body: "Move from term to term by adding d. The graph of term number versus value forms a line." },
    commonMistakes: ["Using n instead of n - 1 in the formula.", "Confusing first term with common difference.", "Multiplying when the sequence is arithmetic.", "Forgetting negative common differences are possible.", "Starting at term zero when the problem says a1."],
    masteryChecks: ["I can find common difference.", "I can find the nth term.", "I can write explicit rules.", "I can connect arithmetic sequences to linear models."],
    questionTemplates: arithmeticSequencesTemplates(),
  },
  "geometric-sequences": {
    objectives: ["Identify geometric sequences by common ratio.", "Find later terms using repeated multiplication.", "Use explicit geometric sequence formulas.", "Connect geometric sequences to exponential functions."],
    lesson: ["A geometric sequence changes by multiplying by the same factor each step.", "That repeated multiplier is called the common ratio.", "The explicit formula is a_n = a_1(r)^(n - 1), not a_1(r)^n, because the first term has zero multiplications after itself.", "Geometric sequences are the sequence version of exponential functions.", "Ratios can be fractions, causing decay, or greater than 1, causing growth.", "To classify a sequence, divide consecutive terms and check whether the ratio stays constant."],
    formulas: [{ label: "Common ratio", latex: "r=\\frac{a_n}{a_{n-1}}" }, { label: "Explicit formula", latex: "a_n=a_1r^{n-1}" }, { label: "Exponential connection", latex: "y=a(b)^x" }],
    visual: { title: "Same multiplier each term", body: "Move from term to term by multiplying by r. This creates exponential behavior." },
    commonMistakes: ["Adding a common difference instead of multiplying by a ratio.", "Using exponent n instead of n - 1.", "Dividing terms in inconsistent order.", "Assuming every increasing sequence is geometric.", "Forgetting ratios can be fractions."],
    masteryChecks: ["I can find common ratio.", "I can find the nth term.", "I can write explicit rules.", "I can connect geometric sequences to exponential models."],
    questionTemplates: geometricSequencesTemplates(),
  },
  "recursive-explicit-rules": {
    objectives: ["Distinguish recursive rules from explicit rules.", "Use recursive rules to find next terms.", "Use explicit rules to find any term directly.", "Translate simple arithmetic patterns between rule types."],
    lesson: ["A recursive rule tells how to get a term from the previous term. It must include a starting value.", "An explicit rule gives a term directly from its term number n.", "Recursive rules are useful for generating a sequence step by step.", "Explicit rules are faster when you need a far-away term like a_50.", "Arithmetic recursive rules add or subtract the common difference from the previous term.", "A strong sequence solution notices which rule type is being used before trying to calculate."],
    formulas: [{ label: "Recursive arithmetic", latex: "a_1=k, \\ a_n=a_{n-1}+d" }, { label: "Explicit arithmetic", latex: "a_n=a_1+(n-1)d" }, { label: "Rule difference", latex: "recursive: previous term; explicit: term number" }],
    visual: { title: "Step-by-step vs direct", body: "Recursive rules need the previous term. Explicit rules jump directly to the term number." },
    commonMistakes: ["Writing a recursive rule without a starting term.", "Using an explicit rule as if it needed the previous term.", "Forgetting n - 1 in explicit sequence formulas.", "Mixing up term value and term number.", "Thinking recursive rules are always better for far-away terms."],
    masteryChecks: ["I can identify recursive rules.", "I can identify explicit rules.", "I can find terms from either rule type.", "I can choose the efficient rule for the question."],
    questionTemplates: recursiveExplicitTemplates(),
  },
};
