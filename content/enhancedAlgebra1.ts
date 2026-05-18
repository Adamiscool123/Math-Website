import { getEnhancedTopic as getBaseEnhancedTopic, isDeepenedTopic as isBaseDeepenedTopic } from "@/content/deepAlgebra1";
import { functionsRelations } from "@/content/deepAlgebra1Functions";
import { inequalities } from "@/content/deepAlgebra1Inequalities";
import type { QuestionTemplate, Topic, WorkedExample } from "@/content/types";

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

function applyDeepTopic(topic: Topic, deepTopic: {
  objectives: string[];
  lesson: string[];
  formulas: Topic["formulas"];
  visual: Topic["visual"];
  commonMistakes: string[];
  masteryChecks: string[];
  questionTemplates: QuestionTemplate[];
}): Topic {
  return {
    ...topic,
    summary: `Master ${topic.title.toLowerCase()} with deeper lessons, randomized practice, and mastery checks.`,
    objectives: deepTopic.objectives,
    lesson: deepTopic.lesson,
    formulas: deepTopic.formulas,
    visual: deepTopic.visual,
    commonMistakes: deepTopic.commonMistakes,
    masteryChecks: deepTopic.masteryChecks,
    questionTemplates: deepTopic.questionTemplates,
    examples: examplesFromTemplates(deepTopic.questionTemplates),
  };
}

export function getEnhancedTopic(topic: Topic): Topic {
  const inequalityTopic = inequalities[topic.slug];
  if (inequalityTopic) return applyDeepTopic(topic, inequalityTopic);

  const functionTopic = functionsRelations[topic.slug];
  if (functionTopic) return applyDeepTopic(topic, functionTopic);

  return getBaseEnhancedTopic(topic);
}

export function isDeepenedTopic(slug: string) {
  return Boolean(inequalities[slug]) || Boolean(functionsRelations[slug]) || isBaseDeepenedTopic(slug);
}
