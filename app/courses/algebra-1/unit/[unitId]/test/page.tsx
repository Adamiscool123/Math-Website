import { notFound } from "next/navigation";
import { AssessmentRunner } from "@/components/AssessmentRunner";
import { algebra1Course } from "@/content/algebra1";
import { generateUnitTestSet, UNIT_TEST_QUESTION_COUNT } from "@/content/assessmentSets";

type Props = {
  params: Promise<{ unitId: string }>;
};

export default async function UnitTestPage({ params }: Props) {
  const { unitId } = await params;
  const unit = algebra1Course.units.find((item) => item.id === unitId);
  if (!unit) notFound();

  const questions = generateUnitTestSet(unit, UNIT_TEST_QUESTION_COUNT);

  return (
    <AssessmentRunner
      assessmentType="unit"
      backHref="/courses/algebra-1"
      backLabel="Back to Algebra 1"
      courseId={algebra1Course.id}
      description={`A ${UNIT_TEST_QUESTION_COUNT}-question mastery test covering every topic in ${unit.title}. Score 90% or higher to keep the unit mastered.`}
      eyebrow="Unit test"
      questions={questions}
      title={`${unit.title} Unit Test`}
    />
  );
}
