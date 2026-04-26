// SCRIBE — Alexandria lesson quiz.
// Five questions on one page. Submit reveals correct/incorrect with
// per-option explanations and writes results into useProgressStore.
// 3+/5 correct flips the lesson to "completed".

import { useMemo, useState } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { useProgressStore } from '@/stores/progressStore';
import type { QuizOption, QuizQuestion } from '@/lib/types/curriculum';

interface LessonQuizProps {
  lessonId: string;
  quiz: QuizQuestion[];
}

const PASS_THRESHOLD = 3;

export function LessonQuiz({ lessonId, quiz }: LessonQuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const recordQuizAttempt = useProgressStore((s) => s.recordQuizAttempt);
  const markCompleted = useProgressStore((s) => s.markCompleted);

  const selectedAll = quiz.every((q) => answers[q.id]);

  const correctCount = useMemo(() => {
    if (!submitted) return 0;
    return quiz.reduce((acc, q) => {
      const picked = q.options.find((o) => o.id === answers[q.id]);
      return acc + (picked?.correct ? 1 : 0);
    }, 0);
  }, [submitted, quiz, answers]);

  const handleSelect = (questionId: string, optionId: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    if (submitted || !selectedAll) return;
    const correct = quiz.reduce((acc, q) => {
      const picked = q.options.find((o) => o.id === answers[q.id]);
      return acc + (picked?.correct ? 1 : 0);
    }, 0);
    recordQuizAttempt(lessonId, correct, quiz.length);
    if (correct >= PASS_THRESHOLD) {
      markCompleted(lessonId);
    }
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <section style={{ marginTop: S.xxl }}>
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      11,
          fontWeight:    600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         C.electricBlue,
          marginBottom:  S.xs,
        }}
      >
        Check your understanding
      </div>
      <EditorialIdentity size="hero">Five questions.</EditorialIdentity>

      {submitted && (
        <ResultsBanner correct={correctCount} total={quiz.length} onRetry={handleRetry} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: S.md, marginTop: S.lg }}>
        {quiz.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            selected={answers[q.id]}
            submitted={submitted}
            onSelect={(optionId) => handleSelect(q.id, optionId)}
          />
        ))}
      </div>

      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedAll}
          style={{
            marginTop:      S.lg,
            fontFamily:     F.mono,
            fontSize:       12,
            fontWeight:     600,
            letterSpacing:  '0.10em',
            textTransform:  'uppercase',
            color:          selectedAll ? C.bgBase : C.textMuted,
            background:     selectedAll ? C.electricBlue : 'transparent',
            border:         `1px solid ${selectedAll ? C.electricBlue : C.borderDefault}`,
            borderRadius:   R.md,
            padding:        `${S.sm} ${S.lg}`,
            cursor:         selectedAll ? 'pointer' : 'not-allowed',
            transition:     'background-color 150ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          Submit answers →
        </button>
      )}
    </section>
  );
}

function ResultsBanner({
  correct,
  total,
  onRetry,
}: {
  correct: number;
  total: number;
  onRetry: () => void;
}) {
  const passed = correct >= PASS_THRESHOLD;
  const accent = passed ? C.alertNormal : C.alertHigh;
  const message = passed
    ? correct === total
      ? 'Excellent.'
      : 'Solid foundation. You can keep going.'
    : 'Below the threshold. Re-read the lesson and try again.';
  return (
    <div
      style={{
        marginTop:    S.lg,
        padding:      `${S.md} ${S.lg}`,
        background:   passed ? 'rgba(16,185,129,0.08)' : 'rgba(249,115,22,0.08)',
        border:       `1px solid ${passed ? 'rgba(16,185,129,0.35)' : 'rgba(249,115,22,0.35)'}`,
        borderRadius: R.md,
        display:      'flex',
        alignItems:   'center',
        gap:          S.md,
        flexWrap:     'wrap',
      }}
    >
      <span
        style={{
          fontFamily:         F.mono,
          fontSize:           18,
          fontWeight:         700,
          color:              accent,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {correct}/{total}
      </span>
      <span
        style={{
          fontFamily: F.sans,
          fontSize:   14,
          color:      C.textPrimary,
        }}
      >
        {message}
      </span>
      <button
        type="button"
        onClick={onRetry}
        style={{
          marginLeft:     'auto',
          fontFamily:     F.mono,
          fontSize:       11,
          fontWeight:     600,
          letterSpacing:  '0.10em',
          textTransform:  'uppercase',
          color:          C.electricBlue,
          background:     'transparent',
          border:         `1px solid ${C.borderActive}`,
          borderRadius:   R.md,
          padding:        `${S.xs} ${S.md}`,
          cursor:         'pointer',
        }}
      >
        Retry quiz
      </button>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  selected,
  submitted,
  onSelect,
}: {
  question: QuizQuestion;
  index: number;
  selected: string | undefined;
  submitted: boolean;
  onSelect: (optionId: string) => void;
}) {
  return (
    <ContainedCard padding={S.lg}>
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      10,
          fontWeight:    600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         C.falconGold,
          marginBottom:  S.xs,
        }}
      >
        Q{(index + 1).toString().padStart(2, '0')}
      </div>
      <div
        style={{
          fontFamily:   F.sans,
          fontSize:     16,
          fontWeight:   500,
          color:        C.textPrimary,
          lineHeight:   1.5,
          marginBottom: S.md,
        }}
      >
        {question.prompt}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
        {question.options.map((opt) => (
          <OptionRow
            key={opt.id}
            option={opt}
            questionId={question.id}
            chosen={selected === opt.id}
            submitted={submitted}
            onSelect={() => onSelect(opt.id)}
          />
        ))}
      </div>
    </ContainedCard>
  );
}

function OptionRow({
  option,
  questionId,
  chosen,
  submitted,
  onSelect,
}: {
  option: QuizOption;
  questionId: string;
  chosen: boolean;
  submitted: boolean;
  onSelect: () => void;
}) {
  const stateColor = (() => {
    if (!submitted) return chosen ? C.electricBlue : C.borderStrong;
    if (option.correct) return C.alertNormal;
    if (chosen && !option.correct) return C.alertCritical;
    return C.borderDefault;
  })();

  const background = (() => {
    if (!submitted) return chosen ? 'rgba(59,130,246,0.08)' : 'transparent';
    if (option.correct) return 'rgba(16,185,129,0.08)';
    if (chosen && !option.correct) return 'rgba(239,68,68,0.08)';
    return 'transparent';
  })();

  const showExplanation =
    submitted && option.explanation && (option.correct || chosen);

  return (
    <div>
      <button
        type="button"
        onClick={onSelect}
        disabled={submitted}
        aria-pressed={chosen}
        style={{
          width:          '100%',
          textAlign:      'left',
          display:        'flex',
          alignItems:     'flex-start',
          gap:            S.sm,
          padding:        `${S.sm} ${S.md}`,
          background,
          border:         `1px solid ${stateColor}`,
          borderRadius:   R.md,
          cursor:         submitted ? 'default' : 'pointer',
          transition:     'border-color 150ms cubic-bezier(0.4,0,0.2,1), background-color 150ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <span
          aria-hidden
          style={{
            width:          14,
            height:         14,
            borderRadius:   '50%',
            border:         `1px solid ${stateColor}`,
            background:     chosen ? stateColor : 'transparent',
            flexShrink:     0,
            marginTop:      4,
            display:        'inline-flex',
            alignItems:     'center',
            justifyContent: 'center',
            color:          C.bgBase,
            fontSize:       9,
            fontWeight:     700,
          }}
        >
          {submitted && option.correct ? '✓' : submitted && chosen && !option.correct ? '×' : ''}
        </span>
        <span
          style={{
            fontFamily: F.sans,
            fontSize:   14,
            color:      submitted && (option.correct || chosen) ? C.textPrimary : C.textSecondary,
            lineHeight: 1.5,
          }}
        >
          {option.text}
        </span>
      </button>
      {showExplanation && (
        <div
          style={{
            marginTop:  S.xs,
            marginLeft: 26,
            fontFamily: F.display,
            fontSize:   13,
            fontStyle:  'italic',
            color:      'rgba(255,255,255,0.55)',
            lineHeight: 1.5,
          }}
          // Use the question id in a data-attribute so multiple option rows in
          // the same quiz produce uniquely targetable nodes during testing.
          data-question-id={questionId}
        >
          {option.explanation}
        </div>
      )}
    </div>
  );
}

export default LessonQuiz;
