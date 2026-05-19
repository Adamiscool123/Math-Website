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

function term(coefficient: number, variable = "x", power = 1) {
  const abs = Math.abs(coefficient);
  const sign = coefficient < 0 ? "-" : "";
  const coeff = abs === 1 ? "" : String(abs);
  const variablePart = power === 0 ? "" : power === 1 ? variable : `${variable}^${power}`;
  return `${sign}${coeff}${variablePart || abs}`;
}

function q(
  id: string,
  difficulty: Difficulty,
  skill: string,
  prompt: string,
  acceptedAnswers: string[],
  hints: string[],
  solution: string[],
  type: QuestionInstance["type"] = "expression-input",
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

function exponentRulesTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`exponent-rules-easy-${index + 1}`, "easy", "Exponent Rules: product rule", () => {
      const a = rand(2, 7);
      const b = rand(2, 7);
      const answer = `x^${a + b}`;
      return q(
        `exponent-rules-easy-${index + 1}`,
        "easy",
        "Exponent Rules: product rule",
        `Simplify x^${a} · x^${b}.`,
        [answer],
        ["The bases are the same.", "When multiplying same bases, add exponents.", `${a} + ${b} = ${a + b}.`],
        [`Use x^a · x^b = x^(a+b).`, `Add exponents: ${a} + ${b} = ${a + b}.`, `The simplified expression is ${answer}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`exponent-rules-medium-${index + 1}`, "medium", "Exponent Rules: power rule", () => {
      const a = rand(2, 6);
      const b = rand(2, 5);
      const answer = `x^${a * b}`;
      return q(
        `exponent-rules-medium-${index + 1}`,
        "medium",
        "Exponent Rules: power rule",
        `Simplify (x^${a})^${b}.`,
        [answer],
        ["A power raised to a power uses multiplication.", "Multiply the exponents.", `${a} × ${b} = ${a * b}.`],
        [`Use (x^a)^b = x^(ab).`, `Multiply: ${a} × ${b} = ${a * b}.`, `The simplified expression is ${answer}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`exponent-rules-hard-${index + 1}`, "hard", "Exponent Rules: quotient and zero exponents", () => {
      const top = rand(5, 12);
      const bottom = rand(1, top - 1);
      const coefficient = rand(2, 9);
      const answer = `${coefficient}x^${top - bottom}`;
      return q(
        `exponent-rules-hard-${index + 1}`,
        "hard",
        "Exponent Rules: quotient and zero exponents",
        `Simplify (${coefficient}x^${top}) / x^${bottom}.`,
        [answer, `${coefficient}*x^${top - bottom}`],
        ["The coefficient stays because only x powers divide.", "For same bases in a quotient, subtract exponents.", `${top} - ${bottom} = ${top - bottom}.`],
        [`Use x^a / x^b = x^(a-b).`, `Subtract exponents: ${top} - ${bottom} = ${top - bottom}.`, `The result is ${answer}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function addSubtractPolynomialsTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`add-sub-poly-easy-${index + 1}`, "easy", "Polynomials: combine like terms", () => {
      const a = rand(2, 8);
      const b = rand(2, 8);
      const c = rand(-9, 9);
      const d = rand(-9, 9);
      const answer = `${a + b}x${signed(c + d)}`;
      return q(
        `add-sub-poly-easy-${index + 1}`,
        "easy",
        "Polynomials: combine like terms",
        `Simplify ${a}x ${signed(c)} + ${b}x ${signed(d)}.`,
        [answer, `${a + b}*x${signed(c + d)}`],
        ["Combine x-terms with x-terms.", "Combine constants with constants.", "Do not combine x-terms with plain numbers."],
        [`x-terms: ${a}x + ${b}x = ${a + b}x.`, `Constants: ${c} ${signed(d)} = ${c + d}.`, `The result is ${answer}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`add-sub-poly-medium-${index + 1}`, "medium", "Polynomials: add binomials and trinomials", () => {
      const a = rand(1, 6);
      const b = rand(-8, 8);
      const c = rand(-8, 8);
      const d = rand(1, 6);
      const e = rand(-8, 8);
      const f = rand(-8, 8);
      const answer = `${a + d}x^2${signed(b + e)}x${signed(c + f)}`;
      return q(
        `add-sub-poly-medium-${index + 1}`,
        "medium",
        "Polynomials: add binomials and trinomials",
        `Add (${a}x^2 ${signed(b)}x ${signed(c)}) + (${d}x^2 ${signed(e)}x ${signed(f)}).`,
        [answer, `${a + d}*x^2${signed(b + e)}*x${signed(c + f)}`],
        ["Line up like terms by degree.", "Add x^2 terms, x terms, and constants separately.", "Keep signs attached to each coefficient."],
        [`x^2 terms: ${a} + ${d} = ${a + d}.`, `x terms: ${b} ${signed(e)} = ${b + e}.`, `Constants: ${c} ${signed(f)} = ${c + f}.`, `The sum is ${answer}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`add-sub-poly-hard-${index + 1}`, "hard", "Polynomials: subtract polynomials", () => {
      const a = rand(2, 7);
      const b = rand(-8, 8);
      const c = rand(-8, 8);
      const d = rand(1, 5);
      const e = rand(-8, 8);
      const f = rand(-8, 8);
      const answer = `${a - d}x^2${signed(b - e)}x${signed(c - f)}`;
      return q(
        `add-sub-poly-hard-${index + 1}`,
        "hard",
        "Polynomials: subtract polynomials",
        `Subtract (${a}x^2 ${signed(b)}x ${signed(c)}) - (${d}x^2 ${signed(e)}x ${signed(f)}).`,
        [answer, `${a - d}*x^2${signed(b - e)}*x${signed(c - f)}`],
        ["Distribute the subtraction sign to every term in the second polynomial.", "Then combine like terms.", "This is where most sign errors happen."],
        [`Subtract coefficients by degree.`, `x^2: ${a} - ${d} = ${a - d}. x: ${b} - (${e}) = ${b - e}. Constant: ${c} - (${f}) = ${c - f}.`, `The result is ${answer}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function multiplyPolynomialsTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`multiply-poly-easy-${index + 1}`, "easy", "Multiplying Polynomials: monomial times polynomial", () => {
      const a = rand(2, 6);
      const b = rand(2, 8);
      const c = rand(-8, 8);
      const answer = `${a * b}x^2${signed(a * c)}x`;
      return q(
        `multiply-poly-easy-${index + 1}`,
        "easy",
        "Multiplying Polynomials: monomial times polynomial",
        `Multiply ${a}x(${b}x ${signed(c)}).`,
        [answer, `${a * b}*x^2${signed(a * c)}*x`],
        ["Distribute the monomial to every term.", "Multiply coefficients.", "Add exponents when multiplying x by x."],
        [`${a}x · ${b}x = ${a * b}x^2.`, `${a}x · ${c} = ${a * c}x.`, `The product is ${answer}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`multiply-poly-medium-${index + 1}`, "medium", "Multiplying Polynomials: binomial products", () => {
      const a = rand(-8, 8);
      const b = rand(-8, 8);
      const answer = `x^2${signed(a + b)}x${signed(a * b)}`;
      return q(
        `multiply-poly-medium-${index + 1}`,
        "medium",
        "Multiplying Polynomials: binomial products",
        `Multiply (x ${signed(a)})(x ${signed(b)}).`,
        [answer, `1x^2${signed(a + b)}x${signed(a * b)}`],
        ["Use FOIL or area model.", "The middle terms combine.", "The constant term is the product of the constants."],
        [`First: x · x = x^2.`, `Outer + inner: ${b}x ${signed(a)}x = ${a + b}x.`, `Last: ${a} · ${b} = ${a * b}.`, `The product is ${answer}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`multiply-poly-hard-${index + 1}`, "hard", "Multiplying Polynomials: leading coefficients", () => {
      const a = rand(2, 5);
      const b = rand(-6, 6);
      const c = rand(2, 5);
      const d = rand(-6, 6);
      const answer = `${a * c}x^2${signed(a * d + b * c)}x${signed(b * d)}`;
      return q(
        `multiply-poly-hard-${index + 1}`,
        "hard",
        "Multiplying Polynomials: leading coefficients",
        `Multiply (${a}x ${signed(b)})(${c}x ${signed(d)}).`,
        [answer, `${a * c}*x^2${signed(a * d + b * c)}*x${signed(b * d)}`],
        ["Multiply every term in the first binomial by every term in the second.", "Combine the two x terms in the middle.", "Watch signs."],
        [`First: ${a}x · ${c}x = ${a * c}x^2.`, `Middle terms: ${a * d}x and ${b * c}x combine to ${a * d + b * c}x.`, `Last: ${b} · ${d} = ${b * d}.`, `The product is ${answer}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function factoringGcfTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`factoring-gcf-easy-${index + 1}`, "easy", "Factoring GCF: numeric common factor", () => {
      const g = rand(2, 9);
      const a = rand(2, 8);
      const b = rand(2, 8);
      const answer = `${g}(${a}x+${b})`;
      return q(
        `factoring-gcf-easy-${index + 1}`,
        "easy",
        "Factoring GCF: numeric common factor",
        `Factor ${g * a}x + ${g * b}.`,
        [answer, `${g}(${a}*x+${b})`],
        ["Find the greatest number that divides both terms.", `Both coefficients are divisible by ${g}.`, "Put the common factor outside parentheses."],
        [`The GCF is ${g}.`, `${g * a}x ÷ ${g} = ${a}x and ${g * b} ÷ ${g} = ${b}.`, `The factored form is ${answer}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`factoring-gcf-medium-${index + 1}`, "medium", "Factoring GCF: variable common factor", () => {
      const g = rand(2, 7);
      const a = rand(2, 6);
      const b = rand(2, 6);
      const answer = `${g}x(${a}x+${b})`;
      return q(
        `factoring-gcf-medium-${index + 1}`,
        "medium",
        "Factoring GCF: variable common factor",
        `Factor ${g * a}x^2 + ${g * b}x.`,
        [answer, `${g}*x(${a}*x+${b})`],
        ["Both terms have a numeric common factor.", "Both terms also have at least one x.", "Factor out the GCF including x."],
        [`The numeric GCF is ${g}.`, `The variable GCF is x.`, `Factored form: ${answer}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`factoring-gcf-hard-${index + 1}`, "hard", "Factoring GCF: negative leading term", () => {
      const g = rand(2, 7);
      const a = rand(2, 6);
      const b = rand(2, 6);
      const answer = `-${g}x(${a}x-${b})`;
      return q(
        `factoring-gcf-hard-${index + 1}`,
        "hard",
        "Factoring GCF: negative leading term",
        `Factor -${g * a}x^2 + ${g * b}x.`,
        [answer, `-${g}*x(${a}*x-${b})`],
        ["When the leading term is negative, factor out a negative GCF.", "Both terms share the numeric factor and x.", "Check by distributing back."],
        [`The GCF is -${g}x.`, `-${g * a}x^2 ÷ (-${g}x) = ${a}x.`, `${g * b}x ÷ (-${g}x) = -${b}.`, `The factored form is ${answer}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function factoringTrinomialsTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`factoring-trinomials-easy-${index + 1}`, "easy", "Factoring Trinomials: x^2 + bx + c", () => {
      const a = rand(1, 9);
      const b = rand(1, 9);
      const answer = `(x+${a})(x+${b})`;
      return q(
        `factoring-trinomials-easy-${index + 1}`,
        "easy",
        "Factoring Trinomials: x^2 + bx + c",
        `Factor x^2 + ${a + b}x + ${a * b}.`,
        [answer, `(x + ${a})(x + ${b})`, `(x+${b})(x+${a})`, `(x + ${b})(x + ${a})`],
        ["Find two numbers that multiply to c and add to b.", `${a} and ${b} multiply to ${a * b}.`, `${a} and ${b} add to ${a + b}.`],
        [`Need product ${a * b} and sum ${a + b}.`, `${a} and ${b} work.`, `The factored form is ${answer}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`factoring-trinomials-medium-${index + 1}`, "medium", "Factoring Trinomials: mixed signs", () => {
      const a = rand(2, 9);
      const b = rand(1, 8);
      const answer = `(x+${a})(x-${b})`;
      return q(
        `factoring-trinomials-medium-${index + 1}`,
        "medium",
        "Factoring Trinomials: mixed signs",
        `Factor x^2 ${signed(a - b)}x ${signed(-a * b)}.`,
        [answer, `(x + ${a})(x - ${b})`, `(x-${b})(x+${a})`, `(x - ${b})(x + ${a})`],
        ["A negative constant means the factors have opposite signs.", "Find two numbers with product equal to the constant and sum equal to the x coefficient.", `${a} and -${b} work.`],
        [`Product: ${a} · (-${b}) = ${-a * b}.`, `Sum: ${a} + (-${b}) = ${a - b}.`, `The factored form is ${answer}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`factoring-trinomials-hard-${index + 1}`, "hard", "Factoring Trinomials: leading coefficient", () => {
      const a = rand(2, 4);
      const b = rand(1, 6);
      const c = rand(2, 5);
      const d = rand(1, 6);
      const answer = `(${a}x+${b})(${c}x+${d})`;
      const ax2 = a * c;
      const bx = a * d + b * c;
      const constant = b * d;
      return q(
        `factoring-trinomials-hard-${index + 1}`,
        "hard",
        "Factoring Trinomials: leading coefficient",
        `Factor ${ax2}x^2 + ${bx}x + ${constant}.`,
        [answer, `(${c}x+${d})(${a}x+${b})`, `(${a}*x+${b})(${c}*x+${d})`],
        ["The leading coefficient is not 1, so test binomial pairs.", "Use the area/box method or reverse FOIL.", "Check the middle term."],
        [`First terms multiply to ${ax2}x^2.`, `Outer and inner terms combine to ${bx}x.`, `Last terms multiply to ${constant}.`, `The factored form is ${answer}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function differenceOfSquaresTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`difference-squares-easy-${index + 1}`, "easy", "Difference of Squares: recognize pattern", () => {
      const a = rand(2, 12);
      const answer = `(x-${a})(x+${a})`;
      return q(
        `difference-squares-easy-${index + 1}`,
        "easy",
        "Difference of Squares: recognize pattern",
        `Factor x^2 - ${a * a}.`,
        [answer, `(x+${a})(x-${a})`, `(x - ${a})(x + ${a})`],
        ["This is a square minus a square.", `x^2 is x squared and ${a * a} is ${a} squared.`, "Use a^2 - b^2 = (a - b)(a + b)."],
        [`x^2 - ${a * a} = x^2 - ${a}^2.`, `Use difference of squares.`, `The factored form is ${answer}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`difference-squares-medium-${index + 1}`, "medium", "Difference of Squares: coefficients", () => {
      const a = rand(2, 8);
      const b = rand(2, 9);
      const answer = `(${a}x-${b})(${a}x+${b})`;
      return q(
        `difference-squares-medium-${index + 1}`,
        "medium",
        "Difference of Squares: coefficients",
        `Factor ${a * a}x^2 - ${b * b}.`,
        [answer, `(${a}x+${b})(${a}x-${b})`, `(${a}*x-${b})(${a}*x+${b})`],
        ["Both terms must be perfect squares.", `${a * a}x^2 = (${a}x)^2.`, `${b * b} = ${b}^2.`],
        [`${a * a}x^2 - ${b * b} = (${a}x)^2 - ${b}^2.`, `Use A^2 - B^2 = (A - B)(A + B).`, `The result is ${answer}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`difference-squares-hard-${index + 1}`, "hard", "Difference of Squares: choose factorable expression", () => {
      const a = rand(2, 9);
      const correct = `x^2 - ${a * a}`;
      return q(
        `difference-squares-hard-${index + 1}`,
        "hard",
        "Difference of Squares: choose factorable expression",
        `Which expression is a difference of squares?`,
        [correct],
        ["A difference of squares has subtraction.", "Both terms must be perfect squares.", "Look for something like x^2 - a^2."],
        [`${correct} has x^2 and ${a}^2.`, "It uses subtraction between squares.", "So it is a difference of squares."],
        "multiple-choice",
        shuffle([correct, `x^2 + ${a * a}`, `x^2 - ${a * a + 1}`, `x^3 - ${a * a}`]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

export const exponentsPolynomials: Record<string, DeepTopicContent> = {
  "exponent-rules": {
    objectives: ["Apply product, quotient, and power rules for exponents.", "Distinguish adding exponents from multiplying exponents.", "Simplify expressions with coefficients and powers.", "Recognize zero and negative exponent traps."],
    lesson: ["Exponent rules are shortcuts for repeated multiplication. They only work cleanly when the bases match.", "When multiplying powers with the same base, add exponents because repeated factors combine into one longer product.", "When dividing powers with the same base, subtract exponents because common factors cancel.", "When raising a power to a power, multiply exponents because repeated groups are being repeated again.", "The zero exponent rule says any nonzero base to the zero power equals 1.", "Most mistakes happen when students memorize rules without checking whether they are multiplying, dividing, or raising a power to a power."],
    formulas: [{ label: "Product rule", latex: "x^a x^b=x^{a+b}" }, { label: "Quotient rule", latex: "\\frac{x^a}{x^b}=x^{a-b}" }, { label: "Power rule", latex: "(x^a)^b=x^{ab}" }],
    visual: { title: "Same base, choose operation", body: "Multiplying same bases adds exponents. Dividing same bases subtracts. Power to a power multiplies." },
    commonMistakes: ["Multiplying exponents in the product rule.", "Adding exponents in the power rule.", "Using exponent rules when bases are different.", "Thinking x^0 equals 0.", "Dropping coefficients while simplifying."],
    masteryChecks: ["I can identify the rule needed.", "I can simplify products of powers.", "I can simplify quotients of powers.", "I can simplify powers raised to powers."],
    questionTemplates: exponentRulesTemplates(),
  },
  "adding-subtracting-polynomials": {
    objectives: ["Identify like terms by variable and exponent.", "Add polynomial expressions by combining like terms.", "Subtract polynomials by distributing the negative sign.", "Write polynomial answers in standard form."],
    lesson: ["Polynomials are expressions made from terms with coefficients, variables, and whole-number exponents.", "Like terms have the same variable part with the same exponent. Only their coefficients can be combined.", "Adding polynomials means grouping like terms and adding coefficients.", "Subtracting polynomials is more dangerous because the minus sign changes every term in the second polynomial.", "Standard form lists terms from highest degree to lowest degree.", "Combining like terms is the cleanup step that makes later multiplication, factoring, and solving possible."],
    formulas: [{ label: "Like terms", latex: "ax^n+bx^n=(a+b)x^n" }, { label: "Subtract", latex: "A-(B+C)=A-B-C" }, { label: "Standard form", latex: "ax^2+bx+c" }],
    visual: { title: "Sort by degree", body: "Put x^2 terms in one column, x terms in another, and constants in another. Then combine coefficients." },
    commonMistakes: ["Combining unlike terms.", "Forgetting to distribute the minus sign.", "Changing exponents when adding terms.", "Writing terms out of standard order.", "Dropping zero coefficient terms incorrectly in the middle of work."],
    masteryChecks: ["I can identify like terms.", "I can add polynomials.", "I can subtract polynomials.", "I can write answers in standard form."],
    questionTemplates: addSubtractPolynomialsTemplates(),
  },
  "multiplying-polynomials": {
    objectives: ["Distribute monomials across polynomials.", "Multiply binomials using area model or FOIL.", "Combine middle terms after multiplication.", "Track signs and exponents accurately."],
    lesson: ["Multiplying polynomials is repeated distribution. Every term in one factor must multiply every term in the other factor.", "A monomial times a polynomial is the distributive property with exponent rules included.", "A binomial times a binomial creates four products. The two middle products often combine into one x-term.", "The area model helps prevent missing products because each box represents one multiplication.", "When multiplying variables with the same base, add exponents.", "The final answer should be simplified and written in standard form."],
    formulas: [{ label: "Distribute", latex: "a(b+c)=ab+ac" }, { label: "Binomial product", latex: "(x+a)(x+b)=x^2+(a+b)x+ab" }, { label: "Exponent product", latex: "x^m x^n=x^{m+n}" }],
    visual: { title: "Every term times every term", body: "Use a box or arrows so no product is skipped. Then combine like terms." },
    commonMistakes: ["Multiplying only first and last terms.", "Forgetting to combine middle terms.", "Losing negative signs.", "Adding exponents to coefficients.", "Leaving the answer unsimplified."],
    masteryChecks: ["I can distribute a monomial.", "I can multiply binomials.", "I can handle leading coefficients.", "I can combine the product into standard form."],
    questionTemplates: multiplyPolynomialsTemplates(),
  },
  "factoring-gcf": {
    objectives: ["Find the greatest common factor of polynomial terms.", "Factor out numeric and variable common factors.", "Factor out a negative GCF when helpful.", "Check factoring by distributing back."],
    lesson: ["Factoring is rewriting an expression as multiplication. It reverses distribution.", "The greatest common factor is the largest factor shared by every term.", "For polynomial terms, the GCF can include a number and variables with the smallest exponent shared by all terms.", "If the leading term is negative, factoring out a negative GCF often makes the expression inside parentheses easier to read.", "After factoring, distribute back to check that the original expression returns exactly.", "GCF factoring should be tried before more advanced factoring methods."],
    formulas: [{ label: "Reverse distribution", latex: "ab+ac=a(b+c)" }, { label: "Variable GCF", latex: "x^m, x^n \\Rightarrow x^{\\min(m,n)}" }, { label: "Check", latex: "\\text{factor}\\cdot\\text{inside}=\\text{original}" }],
    visual: { title: "Pull out what every term shares", body: "Ask: what number divides every coefficient, and what variable power appears in every term?" },
    commonMistakes: ["Factoring a number that does not divide every term.", "Forgetting the variable part of the GCF.", "Not factoring out the smallest exponent.", "Losing a negative sign when factoring negative GCF.", "Not checking by distributing."],
    masteryChecks: ["I can find a numeric GCF.", "I can find a variable GCF.", "I can factor out a negative GCF.", "I can check the factored form."],
    questionTemplates: factoringGcfTemplates(),
  },
  "factoring-trinomials": {
    objectives: ["Factor trinomials with leading coefficient 1.", "Handle trinomials with mixed signs.", "Factor simple trinomials with leading coefficient greater than 1.", "Use multiplication checks to verify factors."],
    lesson: ["Factoring trinomials rewrites ax^2 + bx + c as a product of two binomials.", "When the leading coefficient is 1, find two numbers that multiply to c and add to b.", "If c is positive, the signs in the binomials match. If c is negative, the signs are opposite.", "When the leading coefficient is not 1, use a box, grouping, or careful reverse FOIL.", "Checking is not optional: multiply the factors back to make sure the middle term is correct.", "Factoring trinomials is essential for solving quadratics later."],
    formulas: [{ label: "Simple trinomial", latex: "x^2+bx+c=(x+m)(x+n)" }, { label: "Conditions", latex: "m+n=b, \\ mn=c" }, { label: "Check", latex: "(x+m)(x+n)=x^2+(m+n)x+mn" }],
    visual: { title: "Product and sum", body: "Look for two numbers: their product gives the constant, and their sum gives the x coefficient." },
    commonMistakes: ["Using numbers that multiply correctly but do not add correctly.", "Forgetting opposite signs when c is negative.", "Ignoring leading coefficients greater than 1.", "Not checking the middle term.", "Factoring when there is a GCF left outside."],
    masteryChecks: ["I can factor x^2 + bx + c.", "I can handle mixed signs.", "I can factor simple leading-coefficient trinomials.", "I can verify by multiplying."],
    questionTemplates: factoringTrinomialsTemplates(),
  },
  "difference-of-squares": {
    objectives: ["Recognize perfect square terms.", "Factor expressions in a^2 - b^2 form.", "Distinguish difference of squares from sum of squares.", "Use the pattern inside larger factoring problems."],
    lesson: ["A difference of squares is one of the fastest factoring patterns to recognize.", "The expression must be subtraction, and both terms must be perfect squares.", "The pattern is a^2 - b^2 = (a - b)(a + b).",
      "Sums of squares like a^2 + b^2 do not factor over the real numbers in Algebra 1.", "With coefficients, rewrite each term as a square first, such as 9x^2 = (3x)^2.", "Difference of squares often appears after factoring out a GCF first."],
    formulas: [{ label: "Pattern", latex: "a^2-b^2=(a-b)(a+b)" }, { label: "Coefficient square", latex: "9x^2=(3x)^2" }, { label: "Not a difference", latex: "a^2+b^2 \\text{ is not difference of squares}" }],
    visual: { title: "Minus between two squares", body: "Check two things: subtraction sign and both terms are squares. Then write conjugate factors." },
    commonMistakes: ["Factoring a sum of squares as if it were a difference.", "Missing coefficient squares like 16x^2.", "Writing two identical factors instead of conjugates.", "Forgetting to factor a GCF first.", "Not multiplying back to check."],
    masteryChecks: ["I can recognize perfect squares.", "I can factor a^2 - b^2.", "I can reject sums of squares.", "I can handle coefficients like 4x^2 or 25x^2."],
    questionTemplates: differenceOfSquaresTemplates(),
  },
};
