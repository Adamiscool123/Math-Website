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

function template(id: string, difficulty: Difficulty, skill: string, generate: () => QuestionInstance): QuestionTemplate {
  return { id, difficulty, skill, generate };
}

function dataset(start = rand(2, 12), step = rand(2, 6)) {
  return [start, start + step, start + 2 * step, start + 3 * step, start + 4 * step];
}

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function meanMedianModeRangeTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`stats-center-easy-${index + 1}`, "easy", "Statistics: mean", () => {
      const values = dataset(rand(4, 14), rand(1, 4));
      const answer = mean(values);
      return q(
        `stats-center-easy-${index + 1}`,
        "easy",
        "Statistics: mean",
        `Find the mean of ${values.join(", ")}.`,
        [String(answer)],
        ["Mean means average.", "Add all values.", "Divide the total by the number of values."],
        [`Sum: ${values.join(" + ")} = ${values.reduce((s, v) => s + v, 0)}.`, `There are ${values.length} values.`, `Mean = ${values.reduce((s, v) => s + v, 0)} / ${values.length} = ${answer}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`stats-center-medium-${index + 1}`, "medium", "Statistics: median and mode", () => {
      const low = rand(2, 8);
      const values = [low, low + 2, low + 2, low + 5, low + 9].sort((a, b) => a - b);
      const answer = low + 2;
      return q(
        `stats-center-medium-${index + 1}`,
        "medium",
        "Statistics: median and mode",
        `Find the mode of ${values.join(", ")}.`,
        [String(answer)],
        ["Mode means most frequent value.", "Count how many times each value appears.", "The repeated value is the mode."],
        [`The value ${answer} appears twice.`, "All other values appear once.", `The mode is ${answer}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`stats-center-hard-${index + 1}`, "hard", "Statistics: range and outlier effect", () => {
      const values = [rand(3, 8), rand(9, 14), rand(15, 20), rand(21, 26), rand(30, 40)].sort((a, b) => a - b);
      const answer = values[values.length - 1] - values[0];
      return q(
        `stats-center-hard-${index + 1}`,
        "hard",
        "Statistics: range and outlier effect",
        `Find the range of ${values.join(", ")}.`,
        [String(answer)],
        ["Range measures spread.", "Subtract the smallest value from the largest value.", "Do not use all values, only the extremes."],
        [`Smallest value: ${values[0]}.`, `Largest value: ${values[values.length - 1]}.`, `Range = ${values[values.length - 1]} - ${values[0]} = ${answer}.`],
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function boxPlotTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`box-plots-easy-${index + 1}`, "easy", "Box Plots: five-number summary", () => {
      const values = dataset(rand(2, 10), rand(2, 5));
      return q(
        `box-plots-easy-${index + 1}`,
        "easy",
        "Box Plots: five-number summary",
        `For the ordered data ${values.join(", ")}, what is the median?`,
        [String(values[2])],
        ["The data are already ordered.", "The median is the middle value.", "With five values, the third value is the median."],
        [`There are five values.`, `The middle value is the third value.`, `Median = ${values[2]}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`box-plots-medium-${index + 1}`, "medium", "Box Plots: quartiles and IQR", () => {
      const values = dataset(rand(4, 12), rand(2, 4));
      const q1 = values[1];
      const q3 = values[3];
      const iqr = q3 - q1;
      return q(
        `box-plots-medium-${index + 1}`,
        "medium",
        "Box Plots: quartiles and IQR",
        `For the ordered data ${values.join(", ")}, find the IQR.`,
        [String(iqr)],
        ["IQR means interquartile range.", "Find Q1 and Q3.", "Subtract Q1 from Q3."],
        [`Q1 = ${q1}.`, `Q3 = ${q3}.`, `IQR = ${q3} - ${q1} = ${iqr}.`],
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`box-plots-hard-${index + 1}`, "hard", "Box Plots: compare spread", () => {
      const iqrA = rand(4, 8);
      const iqrB = iqrA + rand(3, 8);
      return q(
        `box-plots-hard-${index + 1}`,
        "hard",
        "Box Plots: compare spread",
        `Data Set A has IQR ${iqrA}. Data Set B has IQR ${iqrB}. Which set has more spread in the middle 50%?`,
        ["b", "set b", "data set b"],
        ["IQR measures the spread of the middle 50%.", "Larger IQR means more spread.", `Compare ${iqrA} and ${iqrB}.`],
        [`Set A IQR = ${iqrA}.`, `Set B IQR = ${iqrB}.`, `Because ${iqrB} is larger, Set B has more middle spread.`],
        "multiple-choice",
        shuffle(["Set A", "Set B", "They have equal spread", "Cannot tell"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function scatterPlotTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`scatter-easy-${index + 1}`, "easy", "Scatter Plots: association direction", () => {
      const answer = index % 2 === 0 ? "positive" : "negative";
      const context = answer === "positive" ? "as study time increases, test score tends to increase" : "as car age increases, resale value tends to decrease";
      return q(
        `scatter-easy-${index + 1}`,
        "easy",
        "Scatter Plots: association direction",
        `Classify the association: ${context}.`,
        [answer],
        ["Positive association means both variables tend to increase together.", "Negative association means one variable increases while the other decreases.", "Use the trend described in the context."],
        [`The context says ${context}.`, answer === "positive" ? "Both variables move upward together." : "One variable rises while the other falls.", `The association is ${answer}.`],
        "multiple-choice",
        shuffle(["positive", "negative", "no association", "perfectly constant"]),
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`scatter-medium-${index + 1}`, "medium", "Scatter Plots: correlation strength", () => {
      const answer = index % 2 === 0 ? "strong" : "weak";
      return q(
        `scatter-medium-${index + 1}`,
        "medium",
        "Scatter Plots: correlation strength",
        `A scatter plot's points are ${answer === "strong" ? "clustered tightly around a line" : "widely scattered with only a slight trend"}. Is the association strong or weak?`,
        [answer],
        ["Strength depends on how close the points are to a trend line.", "Tight clustering means strong association.", "Wide scatter means weak association."],
        [answer === "strong" ? "The points are close to a line." : "The points are spread out far from a clear line.", `That indicates a ${answer} association.`, `Answer: ${answer}.`],
        "multiple-choice",
        shuffle(["strong", "weak", "impossible", "quadratic only"]),
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`scatter-hard-${index + 1}`, "hard", "Scatter Plots: correlation is not causation", () => {
      return q(
        `scatter-hard-${index + 1}`,
        "hard",
        "Scatter Plots: correlation is not causation",
        "A scatter plot shows that ice cream sales and sunburns both increase in summer. What hidden variable likely explains both?",
        ["temperature", "hot weather", "summer weather", "weather"],
        ["Correlation does not automatically mean one variable causes the other.", "Look for a third factor that affects both variables.", "Summer heat affects both ice cream sales and sunburns."],
        ["Ice cream sales do not directly cause sunburns.", "Both increase when the weather is hotter and sunnier.", "A likely hidden variable is temperature or summer weather."],
        "free-response",
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

function lineOfBestFitTemplates(): QuestionTemplate[] {
  const easy = Array.from({ length: 5 }, (_, index) =>
    template(`line-best-fit-easy-${index + 1}`, "easy", "Line of Best Fit: prediction", () => {
      const m = rand(2, 8);
      const b = rand(5, 20);
      const x = rand(3, 10);
      const answer = m * x + b;
      return q(
        `line-best-fit-easy-${index + 1}`,
        "easy",
        "Line of Best Fit: prediction",
        `Use the trend line y = ${m}x + ${b} to predict y when x = ${x}.`,
        [String(answer)],
        ["Substitute the x-value into the equation.", "Multiply first.", "Then add the intercept."],
        [`y = ${m}(${x}) + ${b}.`, `y = ${m * x} + ${b}.`, `y = ${answer}.`],
      );
    }),
  );

  const medium = Array.from({ length: 5 }, (_, index) =>
    template(`line-best-fit-medium-${index + 1}`, "medium", "Line of Best Fit: slope interpretation", () => {
      const m = rand(2, 12);
      return q(
        `line-best-fit-medium-${index + 1}`,
        "medium",
        "Line of Best Fit: slope interpretation",
        `A line of best fit for cost y after x months has slope ${m}. What does the slope mean?`,
        [`cost increases by ${m} per month`, `${m} dollars per month`, `increase of ${m} per month`],
        ["Slope is rate of change.", "The input is months.", "The output is cost."],
        [`Slope = change in cost / change in months.`, `A slope of ${m} means the predicted cost changes by ${m} for each month.`, `So the cost increases by about ${m} dollars per month.`],
        "free-response",
      );
    }),
  );

  const hard = Array.from({ length: 5 }, (_, index) =>
    template(`line-best-fit-hard-${index + 1}`, "hard", "Line of Best Fit: interpolation vs extrapolation", () => {
      const min = 1;
      const max = 10;
      const x = index % 2 === 0 ? rand(2, 9) : rand(12, 20);
      const answer = x <= max ? "interpolation" : "extrapolation";
      return q(
        `line-best-fit-hard-${index + 1}`,
        "hard",
        "Line of Best Fit: interpolation vs extrapolation",
        `A data set has x-values from ${min} to ${max}. A trend line is used to predict at x = ${x}. Is this interpolation or extrapolation?`,
        [answer],
        ["Interpolation predicts inside the data range.", "Extrapolation predicts outside the data range.", `Compare x = ${x} to the range ${min} through ${max}.`],
        [`The data range is ${min} to ${max}.`, x <= max ? `${x} is inside the range.` : `${x} is outside the range.`, `The prediction is ${answer}.`],
        "multiple-choice",
        shuffle(["interpolation", "extrapolation", "causation", "residual"]),
      );
    }),
  );

  return [...easy, ...medium, ...hard];
}

export const statisticsTopics: Record<string, DeepTopicContent> = {
  "mean-median-mode-range": {
    objectives: ["Calculate mean, median, mode, and range.", "Choose the best measure of center for a data set.", "Understand how outliers affect mean and median.", "Use spread to describe variability."],
    lesson: ["Statistics turns data into useful summaries. Mean, median, mode, and range each answer a different question about a data set.", "The mean is the average: add all values and divide by the number of values.", "The median is the middle value after the data are ordered. It is often better than the mean when there are outliers.", "The mode is the most frequent value. A data set can have one mode, multiple modes, or no mode.", "The range is the largest value minus the smallest value. It describes spread, not center.", "A strong statistics answer includes both calculation and interpretation: what the number says about the data."],
    formulas: [{ label: "Mean", latex: "\\bar{x}=\\frac{\\text{sum of values}}{\\text{number of values}}" }, { label: "Median", latex: "\\text{middle value after ordering}" }, { label: "Range", latex: "\\text{max}-\\text{min}" }],
    visual: { title: "Center vs spread", body: "Mean, median, and mode describe center or typical value. Range describes how far the data spread out." },
    commonMistakes: ["Forgetting to order data before finding median.", "Dividing by the wrong number of values for mean.", "Thinking mode must always exist.", "Using range as a measure of center.", "Ignoring how outliers pull the mean."],
    masteryChecks: ["I can compute mean.", "I can find median after sorting.", "I can identify mode.", "I can calculate and interpret range."],
    questionTemplates: meanMedianModeRangeTemplates(),
  },
  "box-plots": {
    objectives: ["Find the five-number summary.", "Calculate interquartile range.", "Interpret spread using box plots.", "Compare data sets using medians and IQRs."],
    lesson: ["A box plot summarizes a data set using five numbers: minimum, Q1, median, Q3, and maximum.", "The box stretches from Q1 to Q3. It contains the middle 50% of the data.", "The median line inside the box marks the middle of the whole data set.", "The interquartile range, or IQR, is Q3 minus Q1. It measures spread in the middle half of the data.", "Longer boxes or whiskers show more spread. Shorter boxes or whiskers show less spread.", "Box plots are especially useful for comparing two data sets quickly without listing every value."],
    formulas: [{ label: "Five-number summary", latex: "\\min, Q_1, \\text{median}, Q_3, \\max" }, { label: "IQR", latex: "IQR=Q_3-Q_1" }, { label: "Middle half", latex: "Q_1 \\text{ to } Q_3" }],
    visual: { title: "Box shows middle 50%", body: "The box is the middle half of the data. Whiskers stretch toward the minimum and maximum." },
    commonMistakes: ["Confusing Q1 with the minimum.", "Confusing Q3 with the maximum.", "Finding IQR using max minus min.", "Not ordering data first.", "Comparing only medians when spread is also important."],
    masteryChecks: ["I can find a five-number summary.", "I can calculate IQR.", "I can compare spreads from box plots.", "I can interpret the median on a box plot."],
    questionTemplates: boxPlotTemplates(),
  },
  "scatter-plots": {
    objectives: ["Classify positive, negative, and no association.", "Describe strength of association.", "Use scatter plots to identify trends.", "Avoid confusing correlation with causation."],
    lesson: ["A scatter plot shows paired numerical data as points on a coordinate plane.", "Positive association means y tends to increase as x increases. Negative association means y tends to decrease as x increases.", "No association means there is no clear pattern between the variables.", "Strength describes how closely the points follow a pattern. Points close to a line show stronger association.", "Correlation does not prove causation. A hidden variable may explain both trends.", "Scatter plots are useful for making predictions, but the quality of the prediction depends on the strength and appropriateness of the trend."],
    formulas: [{ label: "Positive association", latex: "x \\uparrow, y \\uparrow" }, { label: "Negative association", latex: "x \\uparrow, y \\downarrow" }, { label: "Correlation warning", latex: "\\text{correlation} \\ne \\text{causation}" }],
    visual: { title: "Trend direction", body: "Look from left to right: upward trend is positive, downward trend is negative, no clear trend is no association." },
    commonMistakes: ["Calling every pattern causal.", "Ignoring strength of association.", "Mixing up positive and negative trends.", "Using a line of best fit when the pattern is curved.", "Making predictions far outside the data range without caution."],
    masteryChecks: ["I can classify association direction.", "I can describe association strength.", "I can identify no association.", "I can explain correlation versus causation."],
    questionTemplates: scatterPlotTemplates(),
  },
  "line-of-best-fit": {
    objectives: ["Use a trend line to make predictions.", "Interpret slope and intercept in context.", "Distinguish interpolation from extrapolation.", "Judge whether a linear model is reasonable."],
    lesson: ["A line of best fit is a line that models the trend of a scatter plot.", "It does not usually pass through every point. It should balance the points above and below the line.", "The slope describes the predicted change in y for each one-unit increase in x.", "The y-intercept gives the predicted y-value when x = 0, but it only makes sense if x = 0 is meaningful in context.", "Interpolation means predicting inside the range of data. Extrapolation means predicting outside the range and is usually less reliable.", "A line of best fit should only be used when the scatter plot has a roughly linear pattern."],
    formulas: [{ label: "Trend line", latex: "y=mx+b" }, { label: "Prediction", latex: "\\hat{y}=mx+b" }, { label: "Slope meaning", latex: "m=\\frac{\\text{predicted change in }y}{\\text{change in }x}" }],
    visual: { title: "Balanced trend line", body: "A good line of best fit runs through the middle of the cloud of points, not necessarily through all points." },
    commonMistakes: ["Forcing the line through every point.", "Using a line when the data are clearly curved.", "Trusting extrapolation too much.", "Ignoring units when interpreting slope.", "Treating the y-intercept as meaningful when x = 0 makes no sense."],
    masteryChecks: ["I can use a trend line for prediction.", "I can interpret slope in context.", "I can identify interpolation and extrapolation.", "I can judge whether a linear model is reasonable."],
    questionTemplates: lineOfBestFitTemplates(),
  },
};
