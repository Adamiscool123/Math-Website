import { CheckCircle2, LineChart, Target } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { algebra1Course } from "@/content/algebra1";
import { calculateCourseMastery, calculateTopicMastery, calculateUnitMastery, countMasteredTopics } from "@/lib/mastery";
import { getCourseProgress } from "@/lib/progress";
import { getCurrentUser } from "@/lib/session";

export default async function ProgressPage() {
  const user = await getCurrentUser();
  const topicCount = algebra1Course.units.reduce((count, unit) => count + unit.topics.length, 0);

  if (!user) {
    return (
      <main className="container section">
        <div className="panel narrow-panel">
          <span className="eyebrow">Progress</span>
          <h1 style={{ fontSize: "2.4rem" }}>Sign in to track progress</h1>
          <p>Lesson completion, practice scores, and test results are saved to your account.</p>
          <Link className="btn btn-primary" href="/auth">
            Log in
          </Link>
        </div>
      </main>
    );
  }

  const progress = await getCourseProgress(user.id, algebra1Course.id);
  const rows = Object.values(progress);
  const lessonsCompleted = rows.filter((row) => row.learn_completed).length;
  const mastered = countMasteredTopics(algebra1Course, progress);
  const practiceAttempts = rows.reduce((sum, row) => sum + row.practice_attempts, 0);
  const testAttempts = rows.reduce((sum, row) => sum + row.test_attempts, 0);
  const bestPractice = rows.reduce((best, row) => Math.max(best, row.practice_best_score ?? 0), 0);
  const bestTest = rows.reduce((best, row) => Math.max(best, row.test_best_score ?? 0), 0);
  const percentage = calculateCourseMastery(algebra1Course, progress);

  return (
    <main className="container section">
      <div className="course-header compact-header">
        <div>
          <span className="eyebrow">Progress</span>
          <h1 style={{ fontSize: "clamp(2.3rem, 6vw, 4rem)" }}>Your Algebra 1 progress</h1>
          <p>
            {mastered} of {topicCount} topics mastered. Practice and test scores now count toward the whole course.
          </p>
        </div>
        <div className="panel progress-summary">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="muted">Algebra 1 mastery</span>
            <strong>{percentage}%</strong>
          </div>
          <div className="progress">
            <span style={{ width: `${percentage}%` }} />
          </div>
        </div>
      </div>

      <section className="grid grid-3">
        <MetricCard icon={<CheckCircle2 color="var(--teal)" />} label="Lessons complete" value={`${lessonsCompleted}/${topicCount}`} />
        <MetricCard icon={<Target color="var(--amber)" />} label="Practice attempts" value={String(practiceAttempts)} detail={`Best ${Math.round(bestPractice)}%`} />
        <MetricCard icon={<LineChart color="var(--blue)" />} label="Test attempts" value={String(testAttempts)} detail={`Best ${Math.round(bestTest)}%`} />
      </section>

      <section className="grid" style={{ marginTop: 18 }}>
        {algebra1Course.units.map((unit, unitIndex) => {
          const unitPercentage = calculateUnitMastery(unit, progress);

          return (
            <div className="panel unit" key={unit.id}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span className="badge">Unit {unitIndex + 1}</span>
                  <h2 style={{ fontSize: "1.5rem", marginTop: 10 }}>{unit.title}</h2>
                </div>
                <strong>{unitPercentage}%</strong>
              </div>
              <div className="progress" style={{ marginBottom: 12 }}>
                <span style={{ width: `${unitPercentage}%` }} />
              </div>
              <div className="topic-list">
                {unit.topics.map((topic) => {
                  const row = progress[topic.id];
                  const mastery = calculateTopicMastery(row);
                  return (
                    <Link className="topic-row" href={`/courses/algebra-1/${topic.slug}`} key={topic.id}>
                      <span>
                        <strong>{topic.title}</strong>
                        <br />
                        <span className="muted">
                          Mastery {mastery}% - Practice best {Math.round(row?.practice_best_score ?? 0)}% - Test best {Math.round(row?.test_best_score ?? 0)}%
                        </span>
                      </span>
                      <span className={mastery >= 100 ? "badge badge-teal" : "badge"}>{mastery}%</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}

function MetricCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail?: string }) {
  return (
    <div className="card metric-card">
      {icon}
      <span className="metric-value">{value}</span>
      <strong>{label}</strong>
      {detail ? <span className="muted">{detail}</span> : null}
    </div>
  );
}
