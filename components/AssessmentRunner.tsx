"use client";

import Link from "next/link";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import type { CSSProperties } from "react";
import { buildTopicResults, MASTERY_TEST_THRESHOLD } from "@/content/assessmentSets";
import type { QuestionInstance } from "@/content/types";
import { MathText } from "@/components/MathText";
import { reviewRecommendations, scoreQuestions } from "@/lib/scoring";

type ScoreResult = ReturnType<typeof scoreQuestions>;

type Props = {
  title: string;
  eyebrow: string;
  description: string;
  questions: QuestionInstance[];
  backHref: string;
  backLabel: string;
  courseId?: string;
  assessmentType?: "unit" | "final";
};

export function AssessmentRunner({ title, eyebrow, description, questions, backHref, backLabel, courseId, assessmentType }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [started, setStarted] = useState(false);
  const [notice, setNotice] = useState("");

  function start() {
    setStarted(true);
    setResult(null);
    setAnswers({});
    setNotice("");
  }

  async function submit() {
    const scored = scoreQuestions(questions, answers);
    setResult(scored);

    if (!courseId || !assessmentType) return;

    const topicResults = buildTopicResults(questions, scored.correctByQuestion);
    const response = await fetch(`/api/progress/${courseId}/assessment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessmentType,
        score: scored.score,
        totalQuestions: scored.total,
        correctAnswers: scored.correct,
        topicResults,
      }),
    });

    if (response.ok) {
      setNotice(scored.score >= MASTERY_TEST_THRESHOLD ? "Mastery saved. Great work." : "Saved. Missed skills were downgraded so you know what to remaster.");
    } else {
      setNotice("Sign in to save this assessment and update mastery.");
    }
  }

  const recommendations = result ? reviewRecommendations(result.skillBreakdown) : [];

  return (
    <main className="container" style={{ paddingTop: 36, paddingBottom: 56 }}>
      <section className="panel" style={{ marginBottom: 18 }}>
        <span className="eyebrow">{eyebrow}</span>
        <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", marginBottom: 10 }}>{title}</h1>
        <p>{description}</p>
        <div className="row" style={{ marginTop: 18 }}>
          <span className="badge">{questions.length} questions</span>
          <span className="badge badge-teal">90%+ for mastery</span>
          <span className="badge">No hints</span>
          <Link className="btn btn-ghost" href={backHref}>{backLabel}</Link>
        </div>
        {notice ? <div className={notice.includes("downgraded") ? "alert alert-error" : "alert alert-success"} style={{ marginTop: 14 }}>{notice}</div> : null}
      </section>

      {!started ? (
        <section className="panel">
          <h2 style={{ fontSize: "1.6rem" }}>Ready?</h2>
          <p>This is a mastery assessment. Score 90% or higher to keep the check. If you miss skills, those topic scores drop so you know exactly what to redo.</p>
          <button className="btn btn-primary" onClick={start} type="button">Start assessment</button>
        </section>
      ) : null}

      {started ? (
        <section className="panel">
          {result ? (
            <div className="attempt-summary">
              <div>
                <span className="eyebrow">Assessment score</span>
                <h3>{result.score}%</h3>
                <p>{result.correct} of {result.total} correct</p>
              </div>
              <div className="attempt-meter" style={{ "--score": result.score } as CSSProperties}>
                <span>{result.score}%</span>
              </div>
            </div>
          ) : null}

          <div className="grid" style={{ marginBottom: 16 }}>
            {questions.map((question, index) => {
              const isCorrect = result?.correctByQuestion[question.id];
              return (
                <div className="question" key={question.id}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span className="badge">Question {index + 1}</span>
                    <span className="badge badge-teal">{question.topicTitle ?? question.difficulty}</span>
                  </div>
                  <strong><MathText value={question.prompt} /></strong>
                  {question.choices ? (
                    <div className="choice-list">
                      {question.choices.map((choice, choiceIndex) => (
                        <button className={`choice ${answers[question.id] === choice ? "active" : ""}`} disabled={Boolean(result)} key={`${question.id}-${choice}-${choiceIndex}`} onClick={() => setAnswers((current) => ({ ...current, [question.id]: choice }))} type="button">
                          <MathText value={choice} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input className="answer" disabled={Boolean(result)} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} placeholder="Type your answer" value={answers[question.id] ?? ""} />
                  )}
                  {isCorrect != null ? (
                    <div className={isCorrect ? "alert alert-success" : "alert alert-error"}>
                      {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {isCorrect ? "Correct" : <>Review. Accepted answer: <MathText value={question.acceptedAnswers[0]} /></>}
                    </div>
                  ) : null}
                  {result ? (
                    <div className="solution">
                      <strong>Solution</strong>
                      <ol>{question.solution.map((step) => <li key={step}><MathText value={step} /></li>)}</ol>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {result ? (
            <div className="panel" style={{ marginTop: 16 }}>
              <h3>What to review</h3>
              <div className="grid">{recommendations.map((item) => <div className="hint" key={item}>{item}</div>)}</div>
            </div>
          ) : null}

          <div className="row">
            {!result ? <button className="btn btn-primary" onClick={submit} type="button">Submit assessment</button> : null}
            <button className="btn btn-ghost" onClick={start} type="button"><RotateCcw size={16} />Restart</button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
