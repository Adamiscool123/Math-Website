import { AssessmentRunner } from "@/components/AssessmentRunner";
import { algebra1Course } from "@/content/algebra1";
import { generateAlgebra1FinalTestSet, ALGEBRA_1_FINAL_TEST_QUESTION_COUNT } from "@/content/assessmentSets";

export default function AlgebraOneFinalTestPage() {
  const questions = generateAlgebra1FinalTestSet(ALGEBRA_1_FINAL_TEST_QUESTION_COUNT);

  return (
    <AssessmentRunner
      assessmentType="final"
      backHref="/courses/algebra-1"
      backLabel="Back to Algebra 1"
      courseId={algebra1Course.id}
      description={`A massive ${ALGEBRA_1_FINAL_TEST_QUESTION_COUNT}-question Algebra 1 mastery test covering the whole course. Score 90% or higher to keep the final mastery check.`}
      eyebrow="Algebra 1 mastery test"
      questions={questions}
      title="Algebra 1 Mastery Test"
    />
  );
}
