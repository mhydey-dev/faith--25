import { useEffect, useMemo, useState } from "react";
import { HER_FIRST, quizQuestions as fallbackQuiz } from "./data";
import { Reveal } from "./Reveal";
import { useConfetti } from "./effects";
import type { QuizQuestion } from "@/lib/api";

type Answers = Record<string, number | null>;

export function KnowHerQuiz({ questions }: { questions?: QuizQuestion[] }) {
  const quizQuestions = questions && questions.length > 0 ? questions : fallbackQuiz;
  const quizSignature = quizQuestions.map((q) => q.id).join("|");
  const [answers, setAnswers] = useState<Answers>(() =>
    Object.fromEntries(quizQuestions.map((q) => [q.id, null])),
  );
  const [submitted, setSubmitted] = useState(false);
  const { fire, overlay } = useConfetti();

  useEffect(() => {
    setAnswers(Object.fromEntries(quizQuestions.map((q) => [q.id, null])));
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when quiz identity changes
  }, [quizSignature]);

  const score = useMemo(() => {
    return quizQuestions.reduce((total, q) => {
      const picked = answers[q.id];
      if (picked == null) return total;
      return total + (q.options[picked]?.correct ? 1 : 0);
    }, 0);
  }, [answers, quizQuestions]);

  const allAnswered = quizQuestions.every((q) => answers[q.id] != null);

  const onSubmit = () => {
    if (!allAnswered) return;
    const nextScore = quizQuestions.reduce((total, q) => {
      const picked = answers[q.id];
      if (picked == null) return total;
      return total + (q.options[picked]?.correct ? 1 : 0);
    }, 0);
    setSubmitted(true);
    if (nextScore >= quizQuestions.length - 1) {
      fire(100);
    }
  };

  const onReset = () => {
    setAnswers(Object.fromEntries(quizQuestions.map((q) => [q.id, null])));
    setSubmitted(false);
  };

  return (
    <section id="quiz" className="px-5 py-24 sm:py-32">
      {overlay}
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-sea">How well do you know her?</p>
            <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              The {HER_FIRST} quiz
            </h2>
            <p className="mt-4 font-serif text-lg italic text-muted-foreground">
              Pick what feels right. Wrong answers are still adorable — correct ones prove you pay attention.
            </p>
          </div>
        </Reveal>

        <ol className="mt-14 space-y-12">
          {quizQuestions.map((q, qi) => {
            const picked = answers[q.id];
            return (
              <Reveal key={q.id} delay={qi * 50}>
                <li>
                  <p className="font-display text-xl font-semibold sm:text-2xl">
                    <span className="mr-3 text-marigold">{String(qi + 1).padStart(2, "0")}</span>
                    {q.prompt}
                  </p>
                  <div className="mt-5 space-y-3" role="group" aria-label={q.prompt}>
                    {q.options.map((opt, oi) => {
                      const selected = picked === oi;
                      let stateClass =
                        "border-border bg-background hover:border-primary/50";
                      if (submitted) {
                        if (opt.correct) {
                          stateClass = "border-primary bg-primary/10 text-foreground";
                        } else if (selected) {
                          stateClass =
                            "border-destructive/60 bg-destructive/5 text-muted-foreground line-through";
                        } else {
                          stateClass = "border-border/60 opacity-60";
                        }
                      } else if (selected) {
                        stateClass = "border-primary bg-primary text-primary-foreground";
                      }

                      return (
                        <button
                          key={`${q.id}-${oi}`}
                          type="button"
                          disabled={submitted}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                          }
                          className={`flex w-full items-start gap-3 border px-4 py-3.5 text-left text-sm transition-colors sm:text-base ${stateClass}`}
                        >
                          <span className="mt-0.5 font-display text-xs uppercase tracking-widest opacity-70">
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="font-serif">{opt.label}</span>
                          {submitted && opt.correct ? (
                            <span className="ml-auto text-xs uppercase tracking-wider text-primary">
                              Right
                            </span>
                          ) : null}
                          {submitted && selected && !opt.correct ? (
                            <span className="ml-auto text-xs uppercase tracking-wider text-destructive">
                              Wrong
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ol>

        <Reveal delay={100}>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            {!submitted ? (
              <button
                type="button"
                disabled={!allAnswered}
                onClick={onSubmit}
                className="bg-primary px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                Check my answers
              </button>
            ) : (
              <>
                <p className="font-display text-2xl font-semibold">
                  You scored{" "}
                  <span className="text-marigold">
                    {score}/{quizQuestions.length}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={onReset}
                  className="border border-border px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] transition-colors hover:border-primary"
                >
                  Try again
                </button>
              </>
            )}
            {!submitted && !allAnswered ? (
              <p className="text-sm text-muted-foreground">Answer every question to reveal the score.</p>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
