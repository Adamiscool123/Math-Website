import { notFound } from "next/navigation";
import { TopicWorkspace } from "@/components/TopicWorkspace";
import { getTopicBySlug } from "@/content/algebra1";
import { getTopicProgress } from "@/lib/progress";
import { getCurrentUser } from "@/lib/session";

type Props = {
  params: Promise<{ topicSlug: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function TopicPage({ params, searchParams }: Props) {
  const { topicSlug } = await params;
  const { mode } = await searchParams;
  const topic = getTopicBySlug(topicSlug);
  if (!topic) notFound();

  const user = await getCurrentUser();
  const progress = user ? await getTopicProgress(user.id, topic.courseId, topic.id) : null;
  const initialMode = mode === "practice" || mode === "test" || mode === "learn" ? mode : "learn";

  return <TopicWorkspace initialMode={initialMode} progress={progress} signedIn={Boolean(user)} topicSlug={topicSlug} />;
}
