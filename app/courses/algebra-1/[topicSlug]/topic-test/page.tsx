import { notFound } from "next/navigation";
import { AssessmentRunner } from "@/components/AssessmentRunner";
import { getTopicBySlug } from "@/content/algebra1";
import { generateTopicTestSet, TOPIC_TEST_QUESTION_COUNT } from "@/content/assessmentSets";

type Props = {
  params: Promise<{ topicSlug: string }>;
};

export default async function TopicTestPage({ params }: Props) {
  const { topicSlug } = await params;
  const topic = getTopicBySlug(topicSlug);
  if (!topic) notFound();

  const questions = generateTopicTestSet(topic, TOPIC_TEST_QUESTION_COUNT);

  return (
    <AssessmentRunner
      backHref={`/courses/algebra-1/${topic.slug}?mode=test`}
      backLabel="Back to topic"
      description={`A full end-of-topic assessment for ${topic.title}. This test has ${TOPIC_TEST_QUESTION_COUNT} mixed-difficulty questions and no hints.`}
      eyebrow="Topic test"
      questions={questions}
      title={`${topic.title} Topic Test`}
    />
  );
}
