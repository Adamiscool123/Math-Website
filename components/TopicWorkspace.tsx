"use client";

import { CheckCircle2, Clock, Lightbulb, RotateCcw, Save, XCircle } from "lucide-react";
import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";
import { generatePracticeSet, generateTestSet, getTopicBySlug } from "@/content/algebra1";
import { getEnhancedTopic, isDeepenedTopic } from "@/content/deepAlgebra1";
import type { Difficulty, QuestionInstance, Topic } from "@/content/types";
import { MathExpression } from "@/components/MathExpression";
import { calculateTopicMastery } from "@/lib/mastery";
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
  const baseTopic = getTopicBySlug(topicSlug);
  const topic = baseTopic ? getEnhancedTopic(baseTopic) : null;
  const [mode, setModeState] = useState<Mode>(initialMode);
  const [notice, setNotice] = useState("");
  const [progressState, setProgressState] = useState<ProgressSummary>({
    learn_completed: Boolean(progress?.learn_completed),
    practice_attempts: progress?.practice_attempts ?? 0,
    practice_best_score: progress?.practice_best_score ?? 0,
    test_attempts: progress?.test_attempts ?? 0,
    test_best_score: progress?.test_best_score ?? 0,
  });
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [practiceSeed, setPracticeSeed] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceHints, setPracticeHints] = useState<Record<string, number>>({});
  const [practiceSolutions, setPracticeSolutions] = useState<Record<string, boolean>>({});
  const [practiceResult, setPracticeResult] = useState<ScoreResult | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<QuestionInstance[]>([]);

  const [timed, setTimed] = useState(false);
  const [seconds, setSeconds] = useState(600);
  const [testQuestions, setTestQuestions] = useState<QuestionInstance[]>([]);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testStarted, setTestStarted] = useState(false);
  const [testResult, setTestResult] = useState<ScoreResult | null>(null);
  const learnComplete = Boolean(progressState.learn_completed);
  const topicMastery = calculateTopicMastery(progressState);

  useEffect(() => {
    setPracticeQuestions(topic ? generatePracticeSet(topic, difficulty) : []);
  }, [difficulty, practiceSeed, topicSlug]);

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

    const response = await fetch(`/api/progress/${topic.courseId}/${topic.id}/learn`, { method: "POST" });
    if (response.ok) {
      setProgressState((current) => ({ ...current, learn_completed: true }));
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

    const response = await fetch(`/api/progress/${topic.courseId}/${topic.id}/practice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        difficulty,
        score: result.score,
        questionsAttempted: result.total,
        questionsCorrect: result.correct,
      }),
    });
    if (response.ok) {
      setProgressState((current) => ({
        ...current,
        practice_attempts: (current.practice_attempts ?? 0) + 1,
        practice_best_score: Math.max(current.practice_best_score ?? 0, result.score),
      }));
      setNotice("Practice score saved.");
    } else {
      setNotice("Could not save practice score.");
    }
  }

  function startTest() {
    setTestQuestions(generateTestSet(topic));
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

    const response = await fetch(`/api/progress/${topic.courseId}/${topic.id}/test`, {
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
    if (response.ok) {
      setProgressState((current) => ({
        ...current,
        test_attempts: (current.test_attempts ?? 0) + 1,
        test_best_score: Math.max(current.test_best_score ?? 0, result.score),
      }));
      setNotice("Test result saved.");
    } else {
      setNotice("Could not save test result.");
    }
  }

  return (
    <div className="workspace">
      <main className="workspace-main">
        <div className="panel">
          <span className="eyebrow">Algebra 1</span>
          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", marginBottom: 10 }}>{topic.title}</h1>
          <p>{topic.summary}</p>
          {isDeepenedTopic(topic.slug) ? <div className="badge badge-teal" style={{ marginTop: 12 }}>Deep lesson upgraded</div> : null}
          <div className="tabs" aria-label="Topic mode">
            {modeTabs.map((tab) => (
              <button key={tab.value} className={`tab ${mode === tab.value ? "active" : ""}`} onClick={() => setMode(tab.value)} type="button">
                {tab.label}
              </button>
            ))}
          </div>
          {notice ? <div className="alert alert-success">{notice}</div> : null}
        </div>

        {mode === "learn" ? <LearnPanel learnComplete={learnComplete} onComplete={markLearnComplete} signedIn={signedIn} topic={topic} /> : null}
        {mode === "practice" ? (
          <PracticePanel
            difficulty={difficulty}
            onChangeDifficulty={changeDifficulty}
            onReset={resetPractice}
            onSubmit={submitPractice}
            practiceAnswers={practiceAnswers}
            practiceHints={practiceHints}
            practiceQuestions={practiceQuestions}
            practiceResult={practiceResult}
            practiceSolutions={practiceSolutions}
            setPracticeAnswers={setPracticeAnswers}
            setPracticeHints={setPracticeHints}
            setPracticeSolutions={setPracticeSolutions}
          />
        ) : null}
        {mode === "test" ? (
          <TestPanel
            onReset={resetTest}
            onStart={startTest}
            onSubmit={submitTest}
            seconds={seconds}
            setTestAnswers={setTestAnswers}
            setTimed={setTimed}
            testAnswers={testAnswers}
            testQuestions={testQuestions}
            testResult={testResult}
            testStarted={testStarted}
            timed={timed}
          />
        ) : null}
      </main>

      <aside className="workspace-side">
        <div className="panel">
          <h3>Progress</h3>
          <div className="grid">
            <div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="muted">Topic mastery</span>
                <strong>{topicMastery}%</strong>
              </div>
              <div className="progress">
                <span style={{ width: `${topicMastery}%` }} />
              </div>
            </div>
            <ProgressLine label="Lesson" value={learnComplete ? "Complete" : "Not complete"} />
            <ProgressLine label="Practice best" value={(progressState.practice_attempts ?? 0) > 0 ? `${Math.round(progressState.practice_best_score ?? 0)}%` : "No score"} />
            <ProgressLine label="Test best" value={(progressState.test_attempts ?? 0) > 0 ? `${Math.round(progressState.test_best_score ?? 0)}%` : "No score"} />
            <ProgressLine label="Practice tries" value={String(progressState.practice_attempts ?? 0)} />
            <ProgressLine label="Test tries" value={String(progressState.test_attempts ?? 0)} />
          </div>
        </div>
        <div className="panel">
          <h3>Question bank</h3>
          <p>{topic.questionTemplates.length} generators across easy, medium, and hard difficulty.</p>
          <div className="progress">
            <span style={{ width: "100%" }} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function LearnPanel({ topic, signedIn, learnComplete, onComplete }: { topic: Topic; signedIn: boolean; learnComplete: boolean; onComplete: () => void }) {
  return (
    <section className="workspace-main">
      <div className="panel">
        <h2 style={{ fontSize: "1.6rem" }}>What you will master</h2>
        <div className="learning-list">{topic.objectives.map((objective) => <LearningItem key={objective} text={objective} />)}</div>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: "1.6rem" }}>Concept</h2>
        {topic.lesson.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <button className="btn btn-primary" onClick={onComplete} type="button"><CheckCircle2 size={16} />{learnComplete ? "Completed" : signedIn ? "Mark complete" : "Log in to save"}</button>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: "1.6rem" }}>Key formulas</h2>
        <div className="formula-grid">{topic.formulas.map((formula) => <div className="formula" key={formula.label}><strong>{formula.label}</strong><MathExpression block value={formula.latex} /></div>)}</div>
      </div>

      <div className="panel"><h2 style={{ fontSize: "1.6rem" }}>{topic.visual.title}</h2><p>{topic.visual.body}</p></div>

      <div className="grid grid-2">
        <div className="panel"><h2 style={{ fontSize: "1.4rem" }}>Common mistakes</h2><div className="grid">{topic.commonMistakes.map((mistake) => <div className="hint" key={mistake}>{mistake}</div>)}</div></div>
        <div className="panel"><h2 style={{ fontSize: "1.4rem" }}>Worked examples</h2><div className="grid">{topic.examples.map((example) => <details className="card" key={example.title}><summary><strong>{example.title}</strong>: {example.prompt}</summary><ol>{example.steps.map((step) => <li key={step}>{step}</li>)}</ol><strong>Answer: {example.answer}</strong></details>)}</div></div>
      </div>

      <div className="panel"><h2 style={{ fontSize: "1.4rem" }}>Ready for the test when...</h2><div className="learning-list">{topic.masteryChecks.map((check) => <LearningItem key={check} text={check} />)}</div></div>
    </section>
  );
}

function PracticePanel(props: {
  difficulty: Difficulty;
  onChangeDifficulty: (value: Difficulty) => void;
  onReset: () => void;
  onSubmit: () => void;
  practiceAnswers: Record<string, string>;
  practiceHints: Record<string, number>;
  practiceQuestions: QuestionInstance[];
  practiceResult: ScoreResult | null;
  practiceSolutions: Record<string, boolean>;
  setPracticeAnswers: Dispatch<SetStateAction<Record<string, string>>>;
  setPracticeHints: Dispatch<SetStateAction<Record<string, number>>>;
  setPracticeSolutions: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <section className="panel">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div><h2 style={{ fontSize: "1.6rem" }}>Practice</h2><p>Use hints freely, then reveal solutions after checking your work.</p></div>
        <div className="segmented" aria-label="Difficulty">{(["easy", "medium", "hard"] as Difficulty[]).map((value) => <button key={value} className={`segment ${props.difficulty === value ? "active" : ""}`} onClick={() => props.onChangeDifficulty(value)} type="button">{value}</button>)}</div>
      </div>
      {props.practiceResult ? <AttemptSummary label="Practice score" result={props.practiceResult} /> : null}
      <QuestionList
        allowHints
        answers={props.practiceAnswers}
        correctByQuestion={props.practiceResult?.correctByQuestion}
        hintCounts={props.practiceHints}
        onAnswer={(id, value) => props.setPracticeAnswers((answers) => ({ ...answers, [id]: value }))}
        onHint={(id) => props.setPracticeHints((hints) => ({ ...hints, [id]: Math.min((hints[id] ?? 0) + 1, props.practiceQuestions.find((question) => question.id === id)?.hints.length ?? 0) }))}
        onReveal={(id) => props.setPracticeSolutions((solutions) => ({ ...solutions, [id]: true }))}
        questions={props.practiceQuestions}
        revealedSolutions={props.practiceSolutions}
      />
      <div className="row"><button className="btn btn-primary" onClick={props.onSubmit} type="button"><Save size={16} />Check practice</button><button className="btn btn-ghost" onClick={props.onReset} type="button"><RotateCcw size={16} />New set</button></div>
    </section>
  );
}

function TestPanel(props: {
  timed: boolean;
  seconds: number;
  testStarted: boolean;
  testResult: ScoreResult | null;
  testQuestions: QuestionInstance[];
  testAnswers: Record<string, string>;
  setTimed: Dispatch<SetStateAction<boolean>>;
  setTestAnswers: Dispatch<SetStateAction<Record<string, string>>>;
  onStart: () => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  return (
    <section className="panel">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div><h2 style={{ fontSize: "1.6rem" }}>Test</h2><p>No hints, mixed difficulty, and a skill breakdown after submission.</p></div>
        <button className={`btn ${props.timed ? "btn-primary" : "btn-ghost"}`} onClick={() => props.setTimed((value) => !value)} type="button"><Clock size={16} />{props.timed ? "Timed" : "Untimed"}</button>
      </div>
      {!props.testStarted && !props.testResult ? <button className="btn btn-primary" onClick={props.onStart} type="button">Start test</button> : null}
      {props.testStarted || props.testResult ? (
        <>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}><span className="badge">{props.testQuestions.length} questions</span>{props.timed ? <span className="badge">Time: {Math.floor(props.seconds / 60)}:{String(props.seconds % 60).padStart(2, "0")}</span> : null}</div>
          {props.timed && props.seconds <= 0 && !props.testResult ? <div className="alert alert-error">Time is up. Submit to score this attempt.</div> : null}
          {props.testResult ? <ScorePanel result={props.testResult} showReview /> : null}
          <QuestionList answers={props.testAnswers} correctByQuestion={props.testResult?.correctByQuestion} hintCounts={{}} onAnswer={(id, value) => props.setTestAnswers((answers) => ({ ...answers, [id]: value }))} onHint={() => undefined} onReveal={() => undefined} questions={props.testQuestions} revealedSolutions={props.testResult ? Object.fromEntries(props.testQuestions.map((question) => [question.id, true])) : {}} />
          <div className="row">{!props.testResult ? <button className="btn btn-primary" onClick={props.onSubmit} type="button">Submit test</button> : null}<button className="btn btn-ghost" onClick={props.onReset} type="button"><RotateCcw size={16} />Reset</button></div>
        </>
      ) : null}
    </section>
  );
}

function QuestionList({ questions, answers, hintCounts, revealedSolutions, correctByQuestion, allowHints = false, onAnswer, onHint, onReveal }: {
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
            <div className="row" style={{ justifyContent: "space-between" }}><span className="badge">Question {index + 1}</span><span className="badge badge-teal">{question.difficulty}</span></div>
            <strong>{question.prompt}</strong>
            {question.choices ? <div className="choice-list">{question.choices.map((choice, choiceIndex) => <button className={`choice ${answers[question.id] === choice ? "active" : ""}`} key={`${question.id}-${choice}-${choiceIndex}`} onClick={() => onAnswer(question.id, choice)} type="button">{choice}</button>)}</div> : <input className="answer" onChange={(event) => onAnswer(question.id, event.target.value)} placeholder={answerPlaceholder(question.type)} value={answers[question.id] ?? ""} />}
            {isCorrect != null ? <div className={isCorrect ? "alert alert-success" : "alert alert-error"}>{isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {isCorrect ? "Correct" : `Review. Accepted answer: ${question.acceptedAnswers[0]}`}</div> : null}
            {allowHints ? <div className="row"><button className="btn btn-ghost" disabled={hintCount >= question.hints.length} onClick={() => onHint(question.id)} type="button"><Lightbulb size={16} />Hint {Math.min(hintCount + 1, question.hints.length)}</button><button className="btn btn-ghost" onClick={() => onReveal(question.id)} type="button">Show solution</button></div> : null}
            {question.hints.slice(0, hintCount).map((hint, hintIndex) => <div className="hint" key={hint}>Hint {hintIndex + 1}: {hint}</div>)}
            {revealedSolutions[question.id] ? <div className="solution"><strong>Solution</strong><ol>{question.solution.map((step) => <li key={step}>{step}</li>)}</ol></div> : null}
          </div>
        );
      })}
    </div>
  );
}

function answerPlaceholder(type: QuestionInstance["type"]) {
  if (type === "expression-input") return "Type an expression, like 2x + 3";
  if (type === "equation-input") return "Type an equation, like y = 2x + 3";
  if (type === "numeric-input") return "Type a number";
  return "Type your answer";
}

function ScorePanel({ result, showReview = false }: { result: ScoreResult; showReview?: boolean }) {
  const recommendations = reviewRecommendations(result.skillBreakdown);
  return <div className="panel" style={{ marginTop: 16 }}><div className="score" style={{ "--score": result.score } as CSSProperties}><div className="score-inner">{result.score}%</div></div><p style={{ textAlign: "center" }}>{result.correct} of {result.total} correct</p><div className="grid">{Object.entries(result.skillBreakdown).map(([skill, value]) => <div key={skill}><div className="row" style={{ justifyContent: "space-between" }}><strong>{skill}</strong><span>{value.score}%</span></div><div className="progress"><span style={{ width: `${value.score}%` }} /></div></div>)}</div>{showReview ? <div style={{ marginTop: 16 }}><h3>What to review</h3><div className="grid">{recommendations.map((item) => <div className="hint" key={item}>{item}</div>)}</div></div> : null}</div>;
}

function AttemptSummary({ label, result }: { label: string; result: ScoreResult }) {
  return <div className="attempt-summary"><div><span className="eyebrow">{label}</span><h3>{result.score}%</h3><p>{result.correct} of {result.total} correct</p></div><div className="attempt-meter" style={{ "--score": result.score } as CSSProperties}><span>{result.score}%</span></div></div>;
}

function ProgressLine({ label, value }: { label: string; value: string }) {
  return <div className="row" style={{ justifyContent: "space-between" }}><span className="muted">{label}</span><strong>{value}</strong></div>;
}

function LearningItem({ text }: { text: string }) {
  return <div className="learning-item"><CheckCircle2 size={16} /><span>{text}</span></div>;
}
