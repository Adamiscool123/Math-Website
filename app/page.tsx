import { ArrowRight, BookOpen, Brain, LineChart, Target } from "lucide-react";
import Link from "next/link";
import { algebra1Course } from "@/content/algebra1";

export default function HomePage() {
  const topicCount = algebra1Course.units.reduce((count, unit) => count + unit.topics.length, 0);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Algebra 1 learning platform</span>
            <h1>See math differently.</h1>
            <p>
              Matheye combines clear lessons, generated practice, and test feedback so Algebra 1 feels organized instead of scattered.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/courses/algebra-1">
                Start Algebra 1
                <ArrowRight size={17} />
              </Link>
              <Link className="btn btn-ghost" href="/auth?mode=signup">
                Create account
              </Link>
            </div>
          </div>
          <div className="math-visual" aria-label="Matheye lesson preview">
            {[
              ["Learn", "Slope is change in y divided by change in x.", "m = 3"],
              ["Practice", "Solve 4x - 7 = 17", "x = 6"],
              ["Test", "Review weak skills after submission.", "82%"],
            ].map(([label, body, value], index) => (
              <div className="visual-line" key={label}>
                <span className="visual-index">{index + 1}</span>
                <span>
                  <strong>{label}</strong>
                  <br />
                  <span className="muted">{body}</span>
                </span>
                <span className="badge badge-teal">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3">
          <div className="card">
            <BookOpen color="var(--teal)" />
            <h3>Learn</h3>
            <p>Short lessons, formulas, visuals, common mistakes, and worked examples for every topic.</p>
          </div>
          <div className="card">
            <Target color="var(--amber)" />
            <h3>Practice</h3>
            <p>Easy, medium, and hard randomized sets with progressive hints and step-by-step solutions.</p>
          </div>
          <div className="card">
            <Brain color="var(--blue)" />
            <h3>Test</h3>
            <p>Timed or untimed checks with skill breakdowns and review recommendations.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container panel">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="eyebrow">Launch course</span>
              <h2>{algebra1Course.title}</h2>
              <p>{algebra1Course.description}</p>
            </div>
            <LineChart color="var(--teal)" size={52} />
          </div>
          <div className="grid grid-3" style={{ marginTop: 18 }}>
            <div className="card">
              <strong>{algebra1Course.units.length}</strong>
              <p>Units</p>
            </div>
            <div className="card">
              <strong>{topicCount}</strong>
              <p>Topics</p>
            </div>
            <div className="card">
              <strong>{topicCount * 15}+</strong>
              <p>Question generators</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
