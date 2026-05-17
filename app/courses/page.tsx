import { BookOpen, Lock, Sigma } from "lucide-react";
import Link from "next/link";
import { algebra1Course } from "@/content/algebra1";
import { getCurrentUser } from "@/lib/session";
import { getCourseProgress } from "@/lib/progress";

export default async function CoursesPage() {
  const user = await getCurrentUser();
  const progress = user ? await getCourseProgress(user.id, algebra1Course.id) : {};
  const topicCount = algebra1Course.units.reduce((count, unit) => count + unit.topics.length, 0);
  const completed = Object.values(progress).filter((row) => row.learn_completed).length;
  const percentage = topicCount ? Math.round((completed / topicCount) * 100) : 0;

  return (
    <main className="container section">
      <div className="course-header">
        <div>
          <span className="eyebrow">Courses</span>
          <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)" }}>Choose your path</h1>
          <p>{user ? `Welcome back, ${user.name.split(" ")[0]}.` : "Browse lessons as a guest or sign in to save progress."}</p>
        </div>
      </div>

      <div className="grid grid-3">
        <Link className="card card-link" href="/courses/algebra-1">
          <Sigma color="var(--teal)" size={38} />
          <h2 style={{ fontSize: "1.6rem" }}>{algebra1Course.title}</h2>
          <span className="badge badge-teal">Available</span>
          <p>{algebra1Course.description}</p>
          <div className="row">
            <span className="badge">{algebra1Course.units.length} units</span>
            <span className="badge">{topicCount} topics</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted">Progress</span>
              <strong>{percentage}%</strong>
            </div>
            <div className="progress">
              <span style={{ width: `${percentage}%` }} />
            </div>
          </div>
        </Link>

        <div className="card">
          <BookOpen color="var(--amber)" size={38} />
          <h2 style={{ fontSize: "1.6rem" }}>Geometry</h2>
          <span className="badge badge-amber">Coming soon</span>
          <p>Proofs, congruence, similarity, circles, area, volume, and trigonometry fundamentals.</p>
          <Lock className="dim" />
        </div>

        <div className="card">
          <BookOpen color="var(--blue)" size={38} />
          <h2 style={{ fontSize: "1.6rem" }}>Algebra 2</h2>
          <span className="badge badge-amber">Coming soon</span>
          <p>Advanced functions, logarithms, rational expressions, complex numbers, and conics.</p>
          <Lock className="dim" />
        </div>
      </div>
    </main>
  );
}
