import { CheckCircle2, Circle, Sigma } from "lucide-react";
import Link from "next/link";
import { algebra1Course } from "@/content/algebra1";
import { getCourseProgress } from "@/lib/progress";
import { getCurrentUser } from "@/lib/session";

export default async function AlgebraOnePage() {
  const user = await getCurrentUser();
  const progress = user ? await getCourseProgress(user.id, algebra1Course.id) : {};
  const topicCount = algebra1Course.units.reduce((count, unit) => count + unit.topics.length, 0);
  const completed = Object.values(progress).filter((row) => row.learn_completed).length;
  const percentage = topicCount ? Math.round((completed / topicCount) * 100) : 0;

  return (
    <main className="container">
      <section className="course-header">
        <div>
          <span className="eyebrow">Course</span>
          <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)" }}>{algebra1Course.title}</h1>
          <p>{algebra1Course.description}</p>
        </div>
        <div className="panel" style={{ minWidth: 260 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="muted">Lesson completion</span>
            <strong>{percentage}%</strong>
          </div>
          <div className="progress">
            <span style={{ width: `${percentage}%` }} />
          </div>
          <p style={{ margin: "12px 0 0" }}>
            {completed} of {topicCount} topics complete
          </p>
        </div>
      </section>

      <section className="grid">
        {algebra1Course.units.map((unit, unitIndex) => (
          <div className="panel unit" key={unit.id}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="badge">Unit {unitIndex + 1}</span>
                <h2 style={{ fontSize: "1.7rem", marginTop: 10 }}>{unit.title}</h2>
                <p>{unit.description}</p>
              </div>
              <Sigma className="dim" />
            </div>
            <div className="topic-list">
              {unit.topics.map((topic) => {
                const row = progress[topic.id];
                return (
                  <Link className="topic-row" href={`/courses/algebra-1/${topic.slug}?mode=learn`} key={topic.id}>
                    <span>
                      <strong>{topic.title}</strong>
                      <br />
                      <span className="muted">{topic.summary}</span>
                    </span>
                    <span className={row?.learn_completed ? "badge badge-teal" : "badge"}>
                      {row?.learn_completed ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                      {row?.learn_completed ? "Done" : "Start"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
