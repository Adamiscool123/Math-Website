import { ArrowRight, BookOpen, Brain, CheckCircle2, Eye, Gauge, LineChart, LogIn, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { algebra1Course } from "@/content/algebra1";

export default function HomePage() {
  const topicCount = algebra1Course.units.reduce((count, unit) => count + unit.topics.length, 0);
  const featuredUnits = algebra1Course.units.slice(0, 6);

  return (
    <main className="public-home">
      <header className="public-nav">
        <Link href="/" className="brand" aria-label="Matheye home">
          <span className="brand-mark">
            <Eye size={20} />
          </span>
          <span>Matheye</span>
        </Link>
        <nav className="public-nav-links" aria-label="Public navigation">
          <Link href="/courses">Courses</Link>
          <Link className="btn btn-ghost" href="/auth">
            <LogIn size={16} />
            Log in
          </Link>
          <Link className="btn btn-primary" href="/auth?mode=signup">
            <BookOpen size={16} />
            Start
          </Link>
        </nav>
      </header>
      <div className="public-theme-dock">
        <ThemeCustomizer variant="popover" />
      </div>

      <section className="public-hero">
        <div className="container public-hero-grid">
          <div className="public-hero-copy">
            <span className="eyebrow">Algebra 1 learning platform</span>
            <h1>Algebra 1 that shows the work.</h1>
            <p>Move from lesson to practice to test without losing the thread. Every topic stays tied to examples, feedback, and progress.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/courses/algebra-1">
                Start Algebra 1
                <ArrowRight size={17} />
              </Link>
              <Link className="btn btn-ghost" href="/auth?mode=signup">
                Create account
              </Link>
            </div>
            <div className="public-stats" aria-label="Course overview">
              <span>
                <strong>10</strong>
                Units
              </span>
              <span>
                <strong>48</strong>
                Topics
              </span>
              <span>
                <strong>720+</strong>
                Questions
              </span>
            </div>
          </div>

          <div className="insight-board" aria-label="Matheye Algebra 1 preview">
            <div className="board-toolbar">
              <span>
                <Sparkles size={16} />
                Linear functions
              </span>
              <span className="badge badge-teal">Live practice</span>
            </div>

            <div className="graph-panel">
              <div className="graph-grid" aria-hidden="true">
                <span className="graph-axis graph-axis-x" />
                <span className="graph-axis graph-axis-y" />
                <span className="graph-line" />
                <span className="graph-point point-a" />
                <span className="graph-point point-b" />
                <span className="graph-label label-a">(0, -1)</span>
                <span className="graph-label label-b">(3, 5)</span>
              </div>
              <div className="graph-callout">
                <strong>Find the slope</strong>
                <span>Rise 6, run 3</span>
                <span className="badge badge-amber">m = 2</span>
              </div>
            </div>

            <div className="preview-steps">
              <span className="preview-step active">Learn</span>
              <span className="preview-step">Practice</span>
              <span className="preview-step">Test</span>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container section-heading">
          <span className="eyebrow">Course rhythm</span>
          <h2>One loop for every topic.</h2>
          <p>Each Algebra 1 topic moves through the same rhythm: understand it, try it, then prove it under test conditions.</p>
        </div>
        <div className="container flow-grid">
          {[
            {
              icon: BookOpen,
              label: "Learn",
              title: "Short lessons with the key idea first",
              body: "Read the concept, formulas, common mistakes, and worked examples before touching the question set.",
            },
            {
              icon: Target,
              label: "Practice",
              title: "Generated questions at three levels",
              body: "Switch easy, medium, and hard sets as you build fluency. Hints and solutions stay attached to each question.",
            },
            {
              icon: Brain,
              label: "Test",
              title: "Mixed checks with review direction",
              body: "Submit a test, see weak skills, and know what to review before the next attempt.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article className="flow-card" key={item.label}>
                <span className="flow-icon">
                  <Icon size={22} />
                </span>
                <span className="badge badge-teal">{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="public-section course-map-section">
        <div className="container course-map-grid">
          <div className="section-heading align-left">
            <span className="eyebrow">Algebra 1 map</span>
            <h2>{algebra1Course.units.length} units, {topicCount} topics, one place.</h2>
            <p>The course starts with foundations and keeps building toward functions, quadratics, radicals, and statistics.</p>
            <Link className="btn btn-primary" href="/courses/algebra-1">
              Open the course
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="unit-ladder" aria-label="Featured Algebra 1 units">
            {featuredUnits.map((unit, index) => (
              <Link className="unit-rung" href="/courses/algebra-1" key={unit.id}>
                <span className="unit-number">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{unit.title}</strong>
                  <span>{unit.topics.length} topics</span>
                </span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container practice-preview-grid">
          <div className="practice-console">
            <div className="console-header">
              <span className="badge badge-amber">Practice set</span>
              <span className="muted">Medium</span>
            </div>
            <div className="console-question">
              <span className="badge">Question 4</span>
              <h3>Solve 3(x - 2) + 5 = 20</h3>
              <div className="choice-preview active">x = 7</div>
              <div className="choice-preview">x = 9</div>
              <div className="choice-preview">x = 12</div>
            </div>
            <div className="console-feedback">
              <CheckCircle2 size={18} />
              Correct. Distribute first, then isolate x.
            </div>
          </div>

          <div className="section-heading align-left">
            <span className="eyebrow">Practice that responds</span>
            <h2>Questions do not just grade you. They leave a trail.</h2>
            <p>Hints, accepted answers, worked solutions, attempts, and best scores stay organized by topic so review does not feel random.</p>
            <div className="signal-list">
              <span>
                <Gauge size={18} />
                Progress by topic
              </span>
              <span>
                <LineChart size={18} />
                Best practice and test scores
              </span>
              <span>
                <Sparkles size={18} />
                Review notes after tests
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section final-band">
        <div className="container final-cta">
          <div>
            <span className="eyebrow">Ready when you are</span>
            <h2>Start with the first Algebra 1 topic.</h2>
            <p>Jump in as a guest, or create an account when you want progress saved.</p>
          </div>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/courses/algebra-1">
              Start learning
              <ArrowRight size={17} />
            </Link>
            <Link className="btn btn-ghost" href="/auth?mode=signup">
              Create account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
