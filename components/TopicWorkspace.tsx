"use client";

import { CheckCircle2, Clock, Lightbulb, RotateCcw, Save, XCircle } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { generatePracticeSet, generateTestSet, getTopicBySlug } from "@/content/algebra1";
import type { Difficulty, QuestionInstance } from "@/content/types";
import { MathExpression } from "@/components/MathExpression";
import { reviewRecommendations, scoreQuestions } from "@/lib/scoring";

type Mode = "learn" | "practice" | "test";

type ProgressSummary = {
  learn_completed?: boolean;
  practice_best_score?: number;
  practice_attempts?: number;
  test_best_score?: number;
  test_attempts?: number;
};

type ScoreResult = ReturnType<typeof scoreQuestions>;

type Props = {
  topicSlug: string;
  initialMode: Mode;
  signedIn: boolean;
  progress?: ProgressSummary | null;
};

export function TopicWorkspace({ topicSlug, initialMode, signedIn, progress }: Props) {
  const topic = getTopicBySlug(topicSlug);
  const [mode, setModeState] = useState<Mode>(initialMode);
  const [notice, setNotice] = useState("");
  const [learnComplete, setLearnComplete] = useState(Boolean(progress?.learn_completed));
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [practiceSeed, setPracticeSeed] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceHints, setPracticeHints] = useState<Record<string, number>>({});
  const [practiceSolutions, setPracticeSolutions] = useState<Record<string, boolean>>({});
  const [practiceResult, setPracticeResult] = useState<ScoreResult | null>(null);

  const [timed, setTimed] = useState(false);
  const [seconds, setSeconds] = useState(600);
  const [testQuestions, setTestQuestions] = useState<QuestionInstance[]>([]);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testStarted, setTestStarted] = useState(false);
  const [testResult, setTestResult] = useState<ScoreResult | null>(null);

  const practiceQuestions = useMemo(
    () => (practiceSeed < 0 || !topic ? [] : generatePracticeSet(topic, difficulty)),
    [difficulty, practiceSeed, topic],
  );

  useEffect(() => {
    if (!testStarted || !timed || testResult) return;
    if (seconds <= 0) return;
    const handle = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(handle);
  }, [seconds, testStarted, timed, testResult]);

  const modeTabs = useMemo(
    () => [
      { value: "learn" as const, label: "Learn" },
      { value: "practice" as const, label: "Practice" },
      { value: "test" as const, label: "Test" },
    ],
    [],
  );

  if (!topic) {
    return <div className="panel">Topic not found.</div>;
  }
  const activeTopic = topic;

  function setMode(nextMode: Mode) {
    setNotice("");
    setModeState(nextMode);
    const url = new URL(window.location.href);
    url.searchParams.set("mode", nextMode);
    window.history.replaceState(null, "", url.toString());
  }

  async function markLearnComplete() {
    if (!signedIn) {
      setNotice("Log in to save lesson completion.");
      return;
    }

    const response = await fetch(`/api/progress/${activeTopic.courseId}/${activeTopic.id}/learn`, { method: "POST" });
    if (response.ok) {
      setLearnComplete(true);
      setNotice("Lesson saved.");
    } else {
      setNotice("Could not save progress.");
    }
  }

  function resetPractice() {
    setPracticeSeed((seed) => seed + 1);
    setPracticeAnswers({});
    setPracticeHints({});
    setPracticeSolutions({});
    setPracticeResult(null);
    setNotice("");
  }

  function changeDifficulty(value: Difficulty) {
    setDifficulty(value);
    setPracticeSeed((seed) => seed + 1);
    setPracticeAnswers({});
    setPracticeHints({});
    setPracticeSolutions({});
    setPracticeResult(null);
    setNotice("");
  }

  async function submitPractice() {
    const result = scoreQuestions(practiceQuestions, practiceAnswers);
    setPracticeResult(result);

    if (!signedIn) {
      setNotice("Log in to save this practice score.");
      return;
    }

    await fetch(`/api/progress/${activeTopic.courseId}/${activeTopic.id}/practice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        difficulty,
        score: result.score,
        questionsAttempted: result.total,
        questionsCorrect: result.correct,
      }),
    });
    setNotice("Practice score saved.");
  }

  function startTest() {
    setTestQuestions(generateTestSet(activeTopic));
    setTestAnswers({});
    setTestStarted(true);
    setTestResult(null);
    setSeconds(600);
    setNotice("");
  }

  function resetTest() {
    setTestQuestions([]);
    setTestAnswers({});
    setTestStarted(false);
    setTestResult(null);
    setSeconds(600);
    setNotice("");
  }

  async function submitTest() {
    if (!testQuestions.length || testResult) return;
    const result = scoreQuestions(testQuestions, testAnswers);
    setTestResult(result);
    setTestStarted(false);

    if (!signedIn) {
      setNotice("Log in to save test results.");
      return;
    }

    await fetch(`/api/progress/${activeTopic.courseId}/${activeTopic.id}/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: result.score,
        totalQuestions: result.total,
        correctAnswers: result.correct,
        timeTaken: timed ? 600 - seconds : null,
        skillBreakdown: result.skillBreakdown,
      }),
    });
    setNotice("Test result saved.");
  }

  return (
    <div className="workspace">
      <main className="workspace-main">
        <div className="panel">
          <span className="eyebrow">Algebra 1</span>
          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", marginBottom: 10 }}>{activeTopic.title}</h1>
          <p>{activeTopic.summary}</p>
          <div className="tabs" aria-label="Topic mode">
            {modeTabs.map((tab) => (
              <button key={tab.value} className={`tab ${mode === tab.value ? "active" : ""}`} onClick={() => setMode(tab.value)} type="button">
                {tab.label}
              </button>
            ))}
          </div>
          {notice ? <div className="alert alert-success">{notice}</div> : null}
        </div>

        {mode === "learn" ? (
          <LearnPanel learnComplete={learnComplete} onComplete={markLearnComplete} signedIn={signedIn} topic={activeTopic} />
        ) : null}

        {mode === "practice" ? (
          <section className="panel">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: "1.6rem" }}>Practice</h2>
                <p>Use hints freely, then reveal solutions after checking your work.</p>
              </div>
              <div className="segmented" aria-label="Difficulty">
                {(["easy", "medium", "hard"] as Difficulty[]).map((value) => (
                  <button key={value} className={`segment ${difficulty === value ? "active" : ""}`} onClick={() => changeDifficulty(value)} type="button">
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <QuestionList
              allowHints
              answers={practiceAnswers}
              correctByQuestion={practiceResult?.correctByQuestion}
              hintCounts={practiceHints}
              onAnswer={(id, value) => setPracticeAnswers((answers) => ({ ...answers, [id]: value }))}
              onHint={(id) => setPracticeHints((hints) => ({ ...hints, [id]: Math.min((hints[id] ?? 0) + 1, practiceQuestions.find((question) => question.id === id)?.hints.length ?? 0) }))}
              onReveal={(id) => setPracticeSolutions((solutions) => ({ ...solutions, [id]: true }))}
              questions={practiceQuestions}
              revealedSolutions={practiceSolutions}
            />

            <div className="row">
              <button className="btn btn-primary" onClick={submitPractice} type="button">
                <Save size={16} />
                Check practice
              </button>
              <button className="btn btn-ghost" onClick={resetPractice} type="button">
                <RotateCcw size={16} />
                New set
              </button>
            </div>

            {practiceResult ? <ScorePanel result={practiceResult} /> : null}
          </section>
        ) : null}

        {mode === "test" ? (
          <section className="panel">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: "1.6rem" }}>Test</h2>
                <p>No hints, mixed difficulty, and a skill breakdown after submission.</p>
              </div>
              <button className={`btn ${timed ? "btn-primary" : "btn-ghost"}`} onClick={() => setTimed((value) => !value)} type="button">
                <Clock size={16} />
                {timed ? "Timed" : "Untimed"}
              </button>
            </div>

            {!testStarted && !testResult ? (
              <button className="btn btn-primary" onClick={startTest} type="button">
                Start test
              </button>
            ) : null}

            {testStarted || testResult ? (
              <>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
                  <span className="badge">{testQuestions.length} questions</span>
                  {timed ? <span className="badge">Time: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span> : null}
                </div>
                {timed && seconds <= 0 && !testResult ? <div className="alert alert-error">Time is up. Submit to score this attempt.</div> : null}
                <QuestionList
                  answers={testAnswers}
                  correctByQuestion={testResult?.correctByQuestion}
                  hintCounts={{}}
                  onAnswer={(id, value) => setTestAnswers((answers) => ({ ...answers, [id]: value }))}
                  onHint={() => undefined}
                  onReveal={() => undefined}
                  questions={testQuestions}
                  revealedSolutions={testResult ? Object.fromEntries(testQuestions.map((question) => [question.id, true])) : {}}
                />
                <div className="row">
                  {!testResult ? (
                    <button className="btn btn-primary" onClick={submitTest} type="button">
                      Submit test
                    </button>
                  ) : null}
                  <button className="btn btn-ghost" onClick={resetTest} type="button">
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </div>
              </>
            ) : null}

            {testResult ? <ScorePanel result={testResult} showReview /> : null}
          </section>
        ) : null}
      </main>

      <aside className="workspace-side">
        <div className="panel">
          <h3>Progress</h3>
          <div className="grid">
            <ProgressLine label="Lesson" value={learnComplete ? "Complete" : "Not complete"} />
            <ProgressLine label="Practice best" value={progress?.practice_best_score != null ? `${Math.round(progress.practice_best_score)}%` : "No score"} />
            <ProgressLine label="Test best" value={progress?.test_best_score != null ? `${Math.round(progress.test_best_score)}%` : "No score"} />
          </div>
        </div>
        <div className="panel">
          <h3>Question bank</h3>
          <p>{activeTopic.questionTemplates.length} generators across easy, medium, and hard difficulty.</p>
          <div className="progress">
            <span style={{ width: "100%" }} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function LearnPanel({
  topic,
  signedIn,
  learnComplete,
  onComplete,
}: {
  topic: NonNullable<ReturnType<typeof getTopicBySlug>>;
  signedIn: boolean;
  learnComplete: boolean;
  onComplete: () => void;
}) {
  return (
    <section className="workspace-main">
      <div className="panel">
        <h2 style={{ fontSize: "1.6rem" }}>Concept</h2>
        {topic.lesson.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <button className="btn btn-primary" onClick={onComplete} type="button">
          <CheckCircle2 size={16} />
          {learnComplete ? "Completed" : signedIn ? "Mark complete" : "Log in to save"}
        </button>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: "1.6rem" }}>Key formulas</h2>
        <div className="formula-grid">
          {topic.formulas.map((formula) => (
            <div className="formula" key={formula.label}>
              <strong>{formula.label}</strong>
              <MathExpression block value={formula.latex} />
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: "1.6rem" }}>{topic.visual.title}</h2>
        <p>{topic.visual.body}</p>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <h2 style={{ fontSize: "1.4rem" }}>Common mistakes</h2>
          <div className="grid">
            {topic.commonMistakes.map((mistake) => (
              <div className="hint" key={mistake}>
                {mistake}
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2 style={{ fontSize: "1.4rem" }}>Worked examples</h2>
          <div className="grid">
            {topic.examples.map((example) => (
              <details className="card" key={example.title}>
                <summary>
                  <strong>{example.title}</strong>: {example.prompt}
                </summary>
                <ol>
                  {example.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <strong>Answer: {example.answer}</strong>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function QuestionList({
  questions,
  answers,
  hintCounts,
  revealedSolutions,
  correctByQuestion,
  allowHints = false,
  onAnswer,
  onHint,
  onReveal,
}: {
  questions: QuestionInstance[];
  answers: Record<string, string>;
  hintCounts: Record<string, number>;
  revealedSolutions: Record<string, boolean>;
  correctByQuestion?: Record<string, boolean>;
  allowHints?: boolean;
  onAnswer: (id: string, value: string) => void;
  onHint: (id: string) => void;
  onReveal: (id: string) => void;
}) {
  return (
    <div className="grid" style={{ marginBottom: 16 }}>
      {questions.map((question, index) => {
        const hintCount = hintCounts[question.id] ?? 0;
        const isCorrect = correctByQuestion?.[question.id];
        return (
          <div className="question" key={question.id}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="badge">Question {index + 1}</span>
              <span className="badge badge-teal">{question.difficulty}</span>
            </div>
            <strong>{question.prompt}</strong>

            {question.choices ? (
              <div className="choice-list">
                {question.choices.map((choice) => (
                  <button className={`choice ${answers[question.id] === choice ? "active" : ""}`} key={choice} onClick={() => onAnswer(question.id, choice)} type="button">
                    {choice}
                  </button>
                ))}
              </div>
            ) : (
              <input className="answer" onChange={(event) => onAnswer(question.id, event.target.value)} placeholder="Type your answer" value={answers[question.id] ?? ""} />
            )}

            {isCorrect != null ? (
              <div className={isCorrect ? "alert alert-success" : "alert alert-error"}>
                {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {isCorrect ? "Correct" : `Review. Accepted answer: ${question.acceptedAnswers[0]}`}
              </div>
            ) : null}

            {allowHints ? (
              <div className="row">
                <button className="btn btn-ghost" disabled={hintCount >= question.hints.length} onClick={() => onHint(question.id)} type="button">
                  <Lightbulb size={16} />
                  Hint {Math.min(hintCount + 1, question.hints.length)}
                </button>
                <button className="btn btn-ghost" onClick={() => onReveal(question.id)} type="button">
                  Show solution
                </button>
              </div>
            ) : null}

            {question.hints.slice(0, hintCount).map((hint, hintIndex) => (
              <div className="hint" key={hint}>
                Hint {hintIndex + 1}: {hint}
              </div>
            ))}

            {revealedSolutions[question.id] ? (
              <div className="solution">
                <strong>Solution</strong>
                <ol>
                  {question.solution.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ScorePanel({ result, showReview = false }: { result: ScoreResult; showReview?: boolean }) {
  const recommendations = reviewRecommendations(result.skillBreakdown);

  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <div className="score" style={{ "--score": result.score } as CSSProperties}>
        <div className="score-inner">{result.score}%</div>
      </div>
      <p style={{ textAlign: "center" }}>
        {result.correct} of {result.total} correct
      </p>
      <div className="grid">
        {Object.entries(result.skillBreakdown).map(([skill, value]) => (
          <div key={skill}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>{skill}</strong>
              <span>{value.score}%</span>
            </div>
            <div className="progress">
              <span style={{ width: `${value.score}%` }} />
            </div>
          </div>
        ))}
      </div>
      {showReview ? (
        <div style={{ marginTop: 16 }}>
          <h3>What to review</h3>
          <div className="grid">
            {recommendations.map((item) => (
              <div className="hint" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProgressLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="row" style={{ justifyContent: "space-between" }}>
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
