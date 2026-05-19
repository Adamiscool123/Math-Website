export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "free-response" | "multiple-choice" | "numeric-input" | "expression-input" | "equation-input";

export type Formula = {
  label: string;
  latex: string;
};

export type WorkedExample = {
  title: string;
  prompt: string;
  steps: string[];
  answer: string;
};

export type VisualAid = {
  title: string;
  body: string;
};

export type QuestionInstance = {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  skill: string;
  prompt: string;
  acceptedAnswers: string[];
  choices?: string[];
  hints: string[];
  solution: string[];
  courseId?: string;
  unitId?: string;
  topicId?: string;
  topicTitle?: string;
};

export type QuestionTemplate = {
  id: string;
  difficulty: Difficulty;
  skill: string;
  generate: () => QuestionInstance;
};

export type Topic = {
  courseId: string;
  unitId: string;
  id: string;
  slug: string;
  title: string;
  summary: string;
  objectives: string[];
  lesson: string[];
  formulas: Formula[];
  visual: VisualAid;
  commonMistakes: string[];
  examples: WorkedExample[];
  masteryChecks: string[];
  questionTemplates: QuestionTemplate[];
};

export type Unit = {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  units: Unit[];
};
