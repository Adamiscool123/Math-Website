import { getEnhancedTopic as getBaseEnhancedTopic, isDeepenedTopic as isBaseDeepenedTopic } from "@/content/deepAlgebra1";
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

export function getEnhancedTopic(topic: Topic): Topic {
  const inequalityTopic = inequalities[topic.slug];
  if (inequalityTopic) {
    return {
      ...topic,
      summary: `Master ${topic.title.toLowerCase()} with deeper lessons, randomized practice, and mastery checks.`,
      objectives: inequalityTopic.objectives,
      lesson: inequalityTopic.lesson,
      formulas: inequalityTopic.formulas,
      visual: inequalityTopic.visual,
      commonMistakes: inequalityTopic.commonMistakes,
      masteryChecks: inequalityTopic.masteryChecks,
      questionTemplates: inequalityTopic.questionTemplates,
      examples: examplesFromTemplates(inequalityTopic.questionTemplates),
    };
  }

  return getBaseEnhancedTopic(topic);
}

export function isDeepenedTopic(slug: string) {
  return Boolean(inequalities[slug]) || isBaseDeepenedTopic(slug);
}
