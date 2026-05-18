import { AssessmentRunner } from "@/components/AssessmentRunner";
import { generateAlgebra1FinalTestSet, ALGEBRA_1_FINAL_TEST_QUESTION_COUNT } from "@/content/assessmentSets";

export default function AlgebraOneFinalTestPage() {
  const questions = generateAlgebra1FinalTestSet(ALGEBRA_1_FINAL_TEST_QUESTION_COUNT);

  return (
    <AssessmentRunner
      backHref="/courses/algebra-1"
      backLabel="Back to Algebra 1"
      description={`A full Algebra 1 final review covering the whole course. This test has ${ALGEBRA_1_FINAL_TEST_QUESTION_COUNT} mixed questions across the course and no hints.`}
      eyebrow="Algebra 1 final test"
      questions={questions}
      title="Algebra 1 Final Test"
    />
  );
}
