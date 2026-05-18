import { CheckCircle2, Circle, Sigma } from "lucide-react";
import Link from "next/link";
import { algebra1Course } from "@/content/algebra1";
import { ALGEBRA_1_FINAL_TEST_QUESTION_COUNT, UNIT_TEST_QUESTION_COUNT } from "@/content/assessmentSets";
import { calculateCourseMastery, calculateTopicMastery, calculateUnitMastery, countMasteredTopics } from "@/lib/mastery";
import { getCourseProgress } from "@/lib/progress";
import { getCurrentUser } from "@/lib/session";

export default async function AlgebraOnePage() {
  const user = await getCurrentUser();
  const progress = user ? await getCourseProgress(user.id, algebra1Course.id) : {};
  const topicCount = algebra1Course.units.reduce((count, unit) => count + unit.topics.length, 0);
  const mastered = countMasteredTopics(algebra1Course, progress);
  const percentage = calculateCourseMastery(algebra1Course, progress);

  return (
    <main className="container">
      <section className="course-header">
        <div>
          <span className="eyebrow">Course</span>
          <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)" }}>{algebra1Course.title}</h1>
          <p>{algebra1Course.description}</p>
          <p className="muted" style={{ marginTop: 10 }}>
            Finish lessons, practice, topic tests, unit tests, and the final mastery test to earn the full check.
          </p>
        </div>
        <div className="panel" style={{ minWidth: 260 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="muted">Algebra 1 mastery</span>
            <strong>{percentage}%</strong>
          </div>
          <div className="progress">
            <span style={{ width: `${percentage}%` }} />
          </div>
          <p style={{ margin: "12px 0 0" }}>
            {mastered} of {topicCount} topics mastered
          </p>
        </div>
      </section>

      <section className="grid">
        {algebra1Course.units.map((unit, unitIndex) => {
          const unitMastery = calculateUnitMastery(unit, progress);
          return (
            <div className="panel unit" key={unit.id}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span className="badge">Unit {unitIndex + 1}</span>
                  <h2 style={{ fontSize: "1.7rem", marginTop: 10 }}>{unit.title}</h2>
                  <p>{unit.description}</p>
                </div>
                <Sigma className="dim" />
              </div>

              <div className="row" style={{ justifyContent: "space-between", marginTop: 14 }}>
                <span className="muted">Unit mastery</span>
                <strong>{unitMastery}%</strong>
              </div>
              <div className="progress" style={{ marginBottom: 14 }}>
                <span style={{ width: `${unitMastery}%` }} />
              </div>

              <div className="topic-list">
                {unit.topics.map((topic) => {
                  const row = progress[topic.id];
                  const mastery = calculateTopicMastery(row);
                  return (
                    <Link className="topic-row" href={`/courses/algebra-1/${topic.slug}?mode=learn`} key={topic.id}>
                      <span>
                        <strong>{topic.title}</strong>
                        <br />
                        <span className="muted">Practice 5 questions / Topic test 10 questions</span>
                        <br />
                        <span className="muted">
                          Practice {Math.round(row?.practice_best_score ?? 0)}% / Test {Math.round(row?.test_best_score ?? 0)}%
                        </span>
                      </span>
                      <span className={mastery >= 100 ? "badge badge-teal" : "badge"}>
                        {mastery >= 100 ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                        {mastery}%
                      </span>
                    </Link>
                  );
                })}
              </div>

              <Link className="topic-row" href={`/courses/algebra-1/unit/${unit.id}/test`} style={{ marginTop: 14 }}>
                <span>
                  <strong>Unit Test</strong>
                  <br />
                  <span className="muted">{UNIT_TEST_QUESTION_COUNT} questions across this unit. Score 90%+ to keep mastery.</span>
                </span>
                <span className={unitMastery >= 100 ? "badge badge-teal" : "badge"}>
                  {unitMastery >= 100 ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                  Start
                </span>
              </Link>
            </div>
          );
        })}
      </section>

      <section className="panel" style={{ marginTop: 22, marginBottom: 48 }}>
        <span className="eyebrow">Final mastery</span>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", marginTop: 8 }}>Algebra 1 Mastery Test</h2>
        <p>
          One massive {ALGEBRA_1_FINAL_TEST_QUESTION_COUNT}-question test covering the entire course. Score 90%+ to prove full Algebra 1 mastery. If you miss skills, those topics drop so you know what to remaster.
        </p>
        <div className="row" style={{ marginTop: 18 }}>
          <Link className="btn btn-primary" href="/courses/algebra-1/final-test">
            Take final mastery test
          </Link>
          <span className={percentage >= 100 ? "badge badge-teal" : "badge"}>
            {percentage >= 100 ? <CheckCircle2 size={15} /> : <Circle size={15} />}
            {percentage}% course mastery
          </span>
        </div>
      </section>
    </main>
  );
}
