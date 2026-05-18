import type { Difficulty, Formula, QuestionInstance, QuestionTemplate, Topic, VisualAid, WorkedExample } from "@/content/types";

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

function orderOfOperationsTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`order-ops-easy-${index + 1}`, "easy", "Order of Operations: grouping and left-to-right arithmetic", () => {
      const a = rand(2, 9);
      const b = rand(2, 9);
      const c = rand(2, 9);
      const answer = a + b * c;
      return q(
        `order-ops-easy-${index + 1}`,
        "easy",
        "Order of Operations: grouping and left-to-right arithmetic",
        `Evaluate ${a} + ${b} × ${c}.`,
        [String(answer)],
        ["Multiplication happens before addition.", `Start with ${b} × ${c}.`, `Then add ${a}.`],
        [`${b} × ${c} = ${b * c}.`, `${a} + ${b * c} = ${answer}.`, `The value is ${answer}.`],
        "numeric-input",
        index % 2 === 0 ? numericChoices(answer, [a * b + c, a + b + c, (a + b) * c]) : undefined,
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`order-ops-medium-${index + 1}`, "medium", "Order of Operations: parentheses and exponents", () => {
      const a = rand(2, 6);
      const b = rand(2, 5);
      const c = rand(2, 4);
      const d = rand(1, 8);
      const answer = (a + b) ** 2 - c * d;
      return q(
        `order-ops-medium-${index + 1}`,
        "medium",
        "Order of Operations: parentheses and exponents",
        `Evaluate (${a} + ${b})^2 - ${c} × ${d}.`,
        [String(answer)],
        ["Simplify inside parentheses first.", "Square the grouped value before multiplying or subtracting.", "Do multiplication before subtraction."],
        [`${a} + ${b} = ${a + b}.`, `(${a + b})^2 = ${(a + b) ** 2}.`, `${c} × ${d} = ${c * d}.`, `${(a + b) ** 2} - ${c * d} = ${answer}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`order-ops-hard-${index + 1}`, "hard", "Order of Operations: nested expressions and negatives", () => {
      const a = rand(2, 7);
      const b = rand(2, 6);
      const c = rand(2, 5);
      const d = rand(2, 6);
      const answer = a * (b + c ** 2) - d ** 2;
      return q(
        `order-ops-hard-${index + 1}`,
        "hard",
        "Order of Operations: nested expressions and negatives",
        `Evaluate ${a}[${b} + ${c}^2] - ${d}^2.`,
        [String(answer)],
        ["Evaluate exponents inside and outside the brackets.", "Simplify the bracket before multiplying by the number outside.", "Subtract the final square at the end."],
        [`${c}^2 = ${c ** 2} and ${d}^2 = ${d ** 2}.`, `Inside the bracket: ${b} + ${c ** 2} = ${b + c ** 2}.`, `${a} × ${b + c ** 2} = ${a * (b + c ** 2)}.`, `${a * (b + c ** 2)} - ${d ** 2} = ${answer}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function propertiesTemplates(): QuestionTemplate[] {
  const properties = [
    { name: "Commutative Property", example: "a + b = b + a", reason: "the order changes but the operation stays addition or multiplication" },
    { name: "Associative Property", example: "(a + b) + c = a + (b + c)", reason: "the grouping changes but the order stays the same" },
    { name: "Distributive Property", example: "a(b + c) = ab + ac", reason: "one factor is multiplied across a sum or difference" },
    { name: "Identity Property", example: "a + 0 = a or a × 1 = a", reason: "the value stays unchanged by adding 0 or multiplying by 1" },
    { name: "Inverse Property", example: "a + (-a) = 0 or a × 1/a = 1", reason: "opposites or reciprocals combine to an identity" },
  ];

  const easy = properties.map((property, index) =>
    template(`properties-easy-${index + 1}`, "easy", "Properties of Real Numbers: identify properties", () =>
      q(
        `properties-easy-${index + 1}`,
        "easy",
        "Properties of Real Numbers: identify properties",
        `Which property is shown by ${property.example}?`,
        [property.name],
        ["Look at what changed from left to right.", "Ask whether order, grouping, distribution, identity, or inverse behavior is shown.", property.reason],
        [`The statement is ${property.example}.`, `This shows that ${property.reason}.`, `So the property is the ${property.name}.`],
        "multiple-choice",
        shuffle([property.name, "Commutative Property", "Associative Property", "Distributive Property", "Identity Property", "Inverse Property"]).slice(0, 4),
      ),
    ),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`properties-medium-${index + 1}`, "medium", "Properties of Real Numbers: rewrite expressions", () => {
      const a = rand(2, 8);
      const b = rand(2, 9);
      const c = rand(2, 7);
      const answer = `${a * b}+${a * c}`;
      return q(
        `properties-medium-${index + 1}`,
        "medium",
        "Properties of Real Numbers: rewrite expressions",
        `Use the distributive property to expand ${a}(${b} + ${c}).`,
        [answer, `${a * b} + ${a * c}`],
        ["Multiply the outside number by each term inside parentheses.", `${a} × ${b} and ${a} × ${c} are the two products.`, "Write the two products as a sum."],
        [`${a}(${b} + ${c}) = ${a} × ${b} + ${a} × ${c}.`, `${a} × ${b} = ${a * b} and ${a} × ${c} = ${a * c}.`, `The expanded form is ${a * b} + ${a * c}.`],
        "expression-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`properties-hard-${index + 1}`, "hard", "Properties of Real Numbers: factor and justify", () => {
      const a = rand(2, 8);
      const b = rand(2, 9);
      const c = rand(2, 7);
      const answer = `${a}(${b}+${c})`;
      return q(
        `properties-hard-${index + 1}`,
        "hard",
        "Properties of Real Numbers: factor and justify",
        `Factor ${a * b} + ${a * c} using the greatest common factor.`,
        [answer, `${a}(${b} + ${c})`],
        ["Find the common factor in both terms.", `${a} divides both ${a * b} and ${a * c}.`, "Put the common factor outside parentheses."],
        [`The common factor is ${a}.`, `${a * b} ÷ ${a} = ${b} and ${a * c} ÷ ${a} = ${c}.`, `The factored form is ${a}(${b} + ${c}).`],
        "expression-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function evaluatingExpressionsTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`eval-expressions-easy-${index + 1}`, "easy", "Evaluating Expressions: substitution", () => {
      const a = rand(2, 9);
      const b = rand(-8, 8);
      const x = rand(-6, 6);
      const answer = a * x + b;
      return q(
        `eval-expressions-easy-${index + 1}`,
        "easy",
        "Evaluating Expressions: substitution",
        `Evaluate ${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} when x = ${x}.`,
        [String(answer)],
        ["Replace every x with the given value.", "Multiply before adding or subtracting.", "Keep the sign on the constant."],
        [`Substitute: ${a}(${x}) ${b >= 0 ? "+" : "-"} ${Math.abs(b)}.`, `${a}(${x}) = ${a * x}.`, `${a * x} ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${answer}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`eval-expressions-medium-${index + 1}`, "medium", "Evaluating Expressions: powers and negatives", () => {
      const x = rand(-5, 5);
      const a = rand(2, 4);
      const b = rand(1, 8);
      const answer = a * x ** 2 - b * x;
      return q(
        `eval-expressions-medium-${index + 1}`,
        "medium",
        "Evaluating Expressions: powers and negatives",
        `Evaluate ${a}x^2 - ${b}x when x = ${x}.`,
        [String(answer)],
        ["Substitute x in both places.", "Square x before multiplying by the coefficient.", "Be careful: a negative squared becomes positive."],
        [`x^2 = ${x ** 2}.`, `${a}x^2 = ${a * x ** 2}.`, `${b}x = ${b * x}.`, `${a * x ** 2} - ${b * x} = ${answer}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`eval-expressions-hard-${index + 1}`, "hard", "Evaluating Expressions: two variables", () => {
      const x = rand(-5, 5);
      const y = rand(-5, 5);
      const a = rand(2, 5);
      const b = rand(2, 5);
      const answer = a * x ** 2 + b * x * y - y;
      return q(
        `eval-expressions-hard-${index + 1}`,
        "hard",
        "Evaluating Expressions: two variables",
        `Evaluate ${a}x^2 + ${b}xy - y when x = ${x} and y = ${y}.`,
        [String(answer)],
        ["Substitute both variables before simplifying.", "Handle the exponent before multiplication.", "Compute the xy term carefully because signs matter."],
        [`${a}x^2 = ${a}(${x})^2 = ${a * x ** 2}.`, `${b}xy = ${b}(${x})(${y}) = ${b * x * y}.`, `-y = ${-y}.`, `${a * x ** 2} + ${b * x * y} - ${y} = ${answer}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function writingExpressionsTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`writing-expressions-easy-${index + 1}`, "easy", "Writing Expressions: translate phrases", () => {
      const add = rand(2, 12);
      return q(
        `writing-expressions-easy-${index + 1}`,
        "easy",
        "Writing Expressions: translate phrases",
        `Write an expression for: ${add} more than a number x.`,
        [`x+${add}`, `${add}+x`],
        ["Choose a variable for the unknown number.", "More than means addition.", "The order can be x plus the number or the number plus x for addition."],
        [`Let the unknown number be x.`, `${add} more than x means add ${add}.`, `An expression is x + ${add}.`],
        "expression-input",
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`writing-expressions-medium-${index + 1}`, "medium", "Writing Expressions: coefficients and products", () => {
      const multiplier = rand(2, 10);
      const add = rand(2, 12);
      return q(
        `writing-expressions-medium-${index + 1}`,
        "medium",
        "Writing Expressions: coefficients and products",
        `Write an expression for: ${add} less than ${multiplier} times a number x.`,
        [`${multiplier}x-${add}`, `${multiplier}*x-${add}`],
        ["Times a number x means a coefficient times x.", "Less than means subtract from what came before it.", "Do not write the subtraction backwards."],
        [`${multiplier} times x is ${multiplier}x.`, `${add} less than that means subtract ${add}.`, `The expression is ${multiplier}x - ${add}.`],
        "expression-input",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`writing-expressions-hard-${index + 1}`, "hard", "Writing Expressions: multi-step contexts", () => {
      const fee = rand(3, 12);
      const rate = rand(2, 9);
      return q(
        `writing-expressions-hard-${index + 1}`,
        "hard",
        "Writing Expressions: multi-step contexts",
        `A club charges a $${fee} sign-up fee plus $${rate} per month. Write an expression for the cost after m months.`,
        [`${fee}+${rate}m`, `${rate}m+${fee}`, `${fee}+${rate}*m`, `${rate}*m+${fee}`],
        ["The fixed fee happens once.", "The monthly cost is rate times months.", "Add the fixed cost and the variable cost."],
        [`The sign-up fee is ${fee}.`, `The monthly part is ${rate}m.`, `The total cost is ${fee} + ${rate}m.`],
        "expression-input",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function examplesFromTemplates(templates: QuestionTemplate[]): WorkedExample[] {
  return templates.slice(0, 3).map((item, index) => {
    const question = item.generate();
    return {
      title: `Example ${index + 1}`,
      prompt: question.prompt,
      steps: question.solution,
      answer: question.acceptedAnswers[0],
    };
  });
}

const foundations: Record<string, DeepTopicContent> = {
  "order-of-operations": {
    objectives: [
      "Evaluate expressions using the correct operation order.",
      "Handle parentheses, exponents, multiplication, division, addition, and subtraction without skipping steps.",
      "Explain why multiplication/division and addition/subtraction are handled left to right.",
      "Catch common traps involving negative signs, brackets, and exponents.",
    ],
    lesson: [
      "Order of operations is the agreement mathematicians use so one expression has one value. Without an order, 3 + 4 × 2 could mean 14 or 11 depending on who reads it. The rule removes that confusion.",
      "Work inside grouping symbols first: parentheses, brackets, fraction bars, and radicals. A fraction bar acts like grouping because the whole numerator and whole denominator must be simplified before division.",
      "Next evaluate exponents. Exponents attach to the base directly beside them. This matters with negatives: (-3)^2 equals 9, but -3^2 means the opposite of 3 squared, which is -9.",
      "Then multiply and divide from left to right. Multiplication does not always come before division; whichever appears first from left to right goes first. The same is true for addition and subtraction.",
      "A strong solution writes one clean line per step. Do not try to do everything mentally. Most mistakes happen when students combine two or three steps and lose a sign.",
      "When you finish, estimate whether the answer is reasonable. If the expression included a large square like 9^2, an answer like 8 is probably suspicious.",
    ],
    formulas: [
      { label: "Operation order", latex: "\\text{Grouping} \\rightarrow \\text{Exponents} \\rightarrow \\text{Multiply/Divide} \\rightarrow \\text{Add/Subtract}" },
      { label: "Left-to-right rule", latex: "a-b+c \\text{ is handled from left to right}" },
      { label: "Negative exponent trap", latex: "(-a)^2=a^2 \\quad \\text{but} \\quad -a^2=-(a^2)" },
    ],
    visual: {
      title: "Order ladder",
      body: "1. Clean up grouping. 2. Evaluate powers. 3. Move left to right for multiplication/division. 4. Move left to right for addition/subtraction. Write a new line after each level.",
    },
    commonMistakes: [
      "Multiplying before division even when division appears first.",
      "Adding before subtraction even when subtraction appears first.",
      "Treating -3^2 as 9 instead of -9.",
      "Skipping the bracket step and multiplying too early.",
      "Doing too many operations in one line and losing a negative sign.",
    ],
    masteryChecks: [
      "I can simplify a multi-step expression one operation level at a time.",
      "I can explain why multiplication and division go left to right.",
      "I can correctly handle negative numbers with exponents.",
      "I can show enough work that another student can follow my steps.",
    ],
    questionTemplates: orderOfOperationsTemplates(),
  },
  "properties-of-real-numbers": {
    objectives: [
      "Identify commutative, associative, distributive, identity, and inverse properties.",
      "Use properties to rewrite expressions without changing their value.",
      "Explain the reason behind an algebraic rewrite.",
      "Recognize when two expressions are equivalent because of structure, not luck.",
    ],
    lesson: [
      "Properties of real numbers are the rules that make algebra legal. They explain why you are allowed to reorder, regroup, distribute, factor, or undo operations.",
      "The commutative property changes order: a + b = b + a and ab = ba. It works for addition and multiplication, but not subtraction or division.",
      "The associative property changes grouping: (a + b) + c = a + (b + c). The numbers stay in the same order, but the parentheses move.",
      "The distributive property connects multiplication with addition: a(b + c) = ab + ac. This is the bridge between factoring and expanding.",
      "Identity properties keep a number unchanged: adding 0 or multiplying by 1. Inverse properties undo a number: adding the opposite gives 0, multiplying by the reciprocal gives 1.",
      "The goal is not memorizing names only. The goal is recognizing structure so later factoring, solving equations, and simplifying expressions make sense.",
    ],
    formulas: [
      { label: "Commutative", latex: "a+b=b+a, \\quad ab=ba" },
      { label: "Associative", latex: "(a+b)+c=a+(b+c)" },
      { label: "Distributive", latex: "a(b+c)=ab+ac" },
      { label: "Identity and inverse", latex: "a+0=a, \\quad a+(-a)=0" },
    ],
    visual: {
      title: "Rewrite decision tree",
      body: "Ask what changed: order changed means commutative, grouping changed means associative, multiplication spread across terms means distributive, value stayed by 0 or 1 means identity, value canceled to 0 or 1 means inverse.",
    },
    commonMistakes: [
      "Using the commutative property for subtraction or division.",
      "Calling every parentheses change distributive.",
      "Forgetting to multiply every term when distributing.",
      "Confusing identity with inverse.",
      "Expanding correctly but not being able to explain why the rewrite is valid.",
    ],
    masteryChecks: [
      "I can name the property shown in an equation.",
      "I can expand with the distributive property.",
      "I can factor by reversing the distributive property.",
      "I can explain whether order, grouping, or structure changed.",
    ],
    questionTemplates: propertiesTemplates(),
  },
  "evaluating-expressions": {
    objectives: [
      "Substitute values for variables accurately.",
      "Evaluate expressions with powers, negatives, and more than one variable.",
      "Show substitution before simplifying.",
      "Check answers for sign and operation-order mistakes.",
    ],
    lesson: [
      "Evaluating an expression means finding its value after the variables are replaced by given numbers. The expression itself does not ask you to solve for the variable; the variable value is already given.",
      "The safest first step is substitution with parentheses. If x = -4, write 3(-4), not 3-4. Parentheses protect the negative sign and make multiplication clear.",
      "After substitution, use order of operations. Exponents happen before multiplication, so 2x^2 with x = -3 becomes 2(-3)^2, then 2(9), then 18.",
      "For two-variable expressions, replace every variable every time it appears. If the expression has xy, that means x times y, so both values must be substituted.",
      "A common mistake is treating the expression like an equation. There is no solving step unless an equals sign and an unknown value are involved.",
      "A good final answer is a number, but the work should show how the number was produced. This makes it easier to catch mistakes before they become habits.",
    ],
    formulas: [
      { label: "Substitution", latex: "3x+2 \\text{ when } x=5 \\Rightarrow 3(5)+2" },
      { label: "Power substitution", latex: "ax^2 \\text{ when } x=-3 \\Rightarrow a(-3)^2" },
      { label: "Two variables", latex: "axy \\text{ means } a\\cdot x\\cdot y" },
    ],
    visual: {
      title: "Substitution pipeline",
      body: "Copy the expression, replace variables with parentheses, simplify powers, multiply/divide, add/subtract, then check the sign of the final answer.",
    },
    commonMistakes: [
      "Replacing only one copy of a variable when it appears more than once.",
      "Dropping parentheses around negative substitutions.",
      "Multiplying before evaluating an exponent.",
      "Treating xy as a two-letter variable instead of x times y.",
      "Trying to solve even though no equation was given.",
    ],
    masteryChecks: [
      "I can substitute negative numbers using parentheses.",
      "I can evaluate expressions with exponents correctly.",
      "I can handle expressions with two variables.",
      "I can show work clearly enough to find arithmetic mistakes.",
    ],
    questionTemplates: evaluatingExpressionsTemplates(),
  },
  "writing-expressions": {
    objectives: [
      "Translate verbal phrases into algebraic expressions.",
      "Distinguish sums, differences, products, quotients, and powers from wording.",
      "Use variables to represent unknown quantities.",
      "Build expressions for real-world situations with fixed and changing parts.",
    ],
    lesson: [
      "Writing expressions is the skill of turning language into algebra. You are not solving yet; you are building a mathematical phrase that represents the situation.",
      "Start by defining the variable. If a problem says a number, an amount, or months, decide what letter represents that quantity. The variable should match the meaning, not just be random.",
      "Operation words matter. More than usually signals addition, less than often means subtract from the previous quantity, times means multiplication, and per usually signals a rate.",
      "The order matters for subtraction and division. '5 less than x' means x - 5, not 5 - x. This is one of the most common translation mistakes.",
      "Context expressions usually have a fixed part and a changing part. A sign-up fee is fixed. A monthly charge changes with the number of months, so it becomes a coefficient times the variable.",
      "A strong expression should be simple and readable. You do not need an equals sign unless the problem asks for an equation.",
    ],
    formulas: [
      { label: "Addition phrase", latex: "n \\text{ more than } x \\Rightarrow x+n" },
      { label: "Subtraction phrase", latex: "n \\text{ less than } x \\Rightarrow x-n" },
      { label: "Rate model", latex: "\\text{total}=\\text{fixed}+\\text{rate}\\cdot\\text{quantity}" },
    ],
    visual: {
      title: "Phrase to expression map",
      body: "Underline the unknown, assign a variable, circle operation words, identify fixed and changing quantities, then write the expression without solving it.",
    },
    commonMistakes: [
      "Writing an equation when the prompt only asks for an expression.",
      "Reversing subtraction phrases like 'less than.'",
      "Forgetting the variable on a repeated cost or rate.",
      "Using x for every quantity even when the context suggests a clearer variable.",
      "Leaving words in the final algebraic expression.",
    ],
    masteryChecks: [
      "I can define a variable for an unknown quantity.",
      "I can translate phrase problems into expressions.",
      "I can avoid reversing subtraction and division phrases.",
      "I can model fixed cost plus rate times quantity.",
    ],
    questionTemplates: writingExpressionsTemplates(),
  },
};

export function getEnhancedQuestionTemplates(topic: Topic) {
  return foundations[topic.slug]?.questionTemplates ?? topic.questionTemplates;
}

export function getEnhancedTopic(topic: Topic): Topic {
  const deep = foundations[topic.slug];
  if (!deep) return topic;

  return {
    ...topic,
    summary: `Master ${topic.title.toLowerCase()} with deeper lessons, worked examples, randomized practice, and mastery checks.`,
    objectives: deep.objectives,
    lesson: deep.lesson,
    formulas: deep.formulas,
    visual: deep.visual,
    commonMistakes: deep.commonMistakes,
    masteryChecks: deep.masteryChecks,
    questionTemplates: deep.questionTemplates,
    examples: examplesFromTemplates(deep.questionTemplates),
  };
}

export function isDeepenedTopic(slug: string) {
  return Boolean(foundations[slug]);
}
