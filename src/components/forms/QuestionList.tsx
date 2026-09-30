import { FilePlus2, Trash2 } from "lucide-react";
import { useState } from "react";
import { moveItem, useReorder } from "@/hooks/useReorder";
import { createQuestion, isChoiceQuestion, pageCount } from "@/lib/questions";
import type { FormType, Question } from "@/types";
import { AddQuestionMenu } from "./AddQuestionMenu";
import { QuestionEditor } from "./QuestionEditor";

const MAX_QUESTIONS = 50;
const MAX_PAGES = 20;

interface QuestionListProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
  formType: FormType;
  pro: boolean;
  onRequirePro: () => void;
}

/** Keeps questions in page order, so "earlier question" always means earlier in the form. */
const byPage = (questions: Question[]) =>
  questions.map((q, i) => [q, i] as const).sort((a, b) => a[0].page - b[0].page || a[1] - b[1]).map(([q]) => q);

/** Removing a question also removes rules that depended on it. */
const withoutQuestion = (questions: Question[], id: string) =>
  questions.filter((q) => q.id !== id).map((q) => (q.show_if?.question_id === id ? { ...q, show_if: null } : q));

function focusLastLabel() {
  requestAnimationFrame(() => {
    const labels = document.querySelectorAll<HTMLTextAreaElement>('textarea[id^="q-label-"]');
    const last = labels[labels.length - 1];
    last?.focus();
    last?.select();
  });
}

export function QuestionList({ questions, onChange, formType, pro, onRequirePro }: QuestionListProps) {
  const multi = formType === "multi";
  // Pages that exist but have no questions yet (just added) are kept locally until used.
  const [extraPages, setExtraPages] = useState(0);
  const pages = multi ? Math.min(MAX_PAGES, pageCount(questions) + extraPages) : 1;

  /** Saves a change; pages that become empty stay listed (until removed) so nothing jumps. */
  const update = (next: Question[], totalPages = pages) => {
    if (multi) setExtraPages(Math.max(0, totalPages - pageCount(next)));
    onChange(multi ? byPage(next) : next);
  };

  /** Earlier choice questions (same or earlier page) that `question` may depend on. */
  const sourcesFor = (question: Question) => {
    const index = questions.findIndex((q) => q.id === question.id);
    return questions.slice(0, index).filter((q) => isChoiceQuestion(q) && (!multi || q.page <= question.page));
  };

  const addQuestion = (type: Question["type"], page: number) => {
    update([...questions, createQuestion(type, { page })]);
    focusLastLabel();
  };

  const removePage = (page: number) => {
    // Only empty pages can be removed; later pages move up by one.
    update(
      questions.map((q) => (q.page > page ? { ...q, page: q.page - 1 } : q)),
      pages - 1,
    );
  };

  if (!multi) {
    return (
      <PageQuestions
        questions={questions}
        all={questions}
        onChange={update}
        sourcesFor={sourcesFor}
        pro={pro}
        onRequirePro={onRequirePro}
        onAdd={(type) => addQuestion(type, 0)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {Array.from({ length: pages }, (_, page) => {
        const onPage = questions.filter((q) => q.page === page);
        return (
          <section key={page} className="rounded-2xl border bg-background px-4 pt-3 pb-2 sm:px-6">
            <div className="flex items-center justify-between gap-3 pb-1">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Page {page + 1}
                {page === 0 && <span className="ml-2 font-normal normal-case tracking-normal">· starts with name and email</span>}
              </p>
              {page > 0 && onPage.length === 0 && (
                <button
                  type="button"
                  onClick={() => removePage(page)}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Trash2 className="size-3" /> Remove page
                </button>
              )}
            </div>
            <PageQuestions
              questions={onPage}
              all={questions}
              onChange={update}
              sourcesFor={sourcesFor}
              pro={pro}
              onRequirePro={onRequirePro}
              pageCount={pages}
              onAdd={(type) => addQuestion(type, page)}
              emptyHint={page > 0 && onPage.length === 0 ? "This page is empty. Add a question, or remove the page." : undefined}
            />
          </section>
        );
      })}

      <button
        type="button"
        disabled={pages >= MAX_PAGES}
        onClick={() => setExtraPages((n) => n + 1)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-4 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
      >
        <FilePlus2 className="size-4" /> Add page
      </button>
    </div>
  );
}

/** One run of questions (a whole single-page form, or one page of a multi-page form). */
function PageQuestions({
  questions,
  all,
  onChange,
  sourcesFor,
  pro,
  onRequirePro,
  pageCount: pages,
  onAdd,
  emptyHint,
}: {
  questions: Question[];
  all: Question[];
  onChange: (questions: Question[]) => void;
  sourcesFor: (question: Question) => Question[];
  pro: boolean;
  onRequirePro: () => void;
  pageCount?: number;
  onAdd: (type: Question["type"]) => void;
  emptyHint?: string;
}) {
  // Reordering happens within this run; the result is written back into the full list.
  const replaceRun = (run: Question[]) => {
    const ids = new Set(questions.map((q) => q.id));
    const firstIndex = all.findIndex((q) => ids.has(q.id));
    const rest = all.filter((q) => !ids.has(q.id));
    const at = firstIndex === -1 ? rest.length : all.slice(0, firstIndex).filter((q) => !ids.has(q.id)).length;
    onChange([...rest.slice(0, at), ...run, ...rest.slice(at)]);
  };
  const move = (from: number, to: number) => replaceRun(moveItem(questions, from, to));
  const reorder = useReorder(move);

  return (
    <div className="space-y-1">
      {emptyHint && <p className="py-3 text-sm text-muted-foreground">{emptyHint}</p>}
      {questions.map((question, index) => (
        <QuestionEditor
          key={question.id}
          question={question}
          index={index}
          total={questions.length}
          dragging={reorder.dragIndex === index}
          itemProps={reorder.itemProps(index)}
          handleProps={reorder.handleProps(index)}
          conditionSources={sourcesFor(question)}
          pro={pro}
          onRequirePro={onRequirePro}
          pageCount={pages}
          onChange={(patch) => onChange(all.map((q) => (q.id === question.id ? { ...q, ...patch } : q)))}
          onMove={(to) => move(index, to)}
          onDuplicate={() => {
            const copy = createQuestion(question.type, {
              ...question,
              id: crypto.randomUUID(),
              options: [...question.options],
            });
            const at = all.findIndex((q) => q.id === question.id);
            onChange([...all.slice(0, at + 1), copy, ...all.slice(at + 1)]);
          }}
          onRemove={() => onChange(withoutQuestion(all, question.id))}
        />
      ))}

      <AddQuestionMenu disabled={all.length >= MAX_QUESTIONS} onAdd={onAdd} />
    </div>
  );
}
