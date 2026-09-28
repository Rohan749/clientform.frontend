import { moveItem, useReorder } from "@/hooks/useReorder";
import { createQuestion } from "@/lib/questions";
import type { Question } from "@/types";
import { AddQuestionMenu } from "./AddQuestionMenu";
import { QuestionEditor } from "./QuestionEditor";

const MAX_QUESTIONS = 50;

export function QuestionList({ questions, onChange }: { questions: Question[]; onChange: (questions: Question[]) => void }) {
  const move = (from: number, to: number) => onChange(moveItem(questions, from, to));
  const reorder = useReorder(move);

  return (
    <div className="space-y-1">
      {questions.map((question, index) => (
        <QuestionEditor
          key={question.id}
          question={question}
          index={index}
          total={questions.length}
          dragging={reorder.dragIndex === index}
          itemProps={reorder.itemProps(index)}
          handleProps={reorder.handleProps(index)}
          onChange={(patch) => onChange(questions.map((q) => (q.id === question.id ? { ...q, ...patch } : q)))}
          onMove={(to) => move(index, to)}
          onDuplicate={() => {
            const copy = createQuestion(question.type, { ...question, id: crypto.randomUUID(), options: [...question.options] });
            onChange([...questions.slice(0, index + 1), copy, ...questions.slice(index + 1)]);
          }}
          onRemove={() => onChange(questions.filter((q) => q.id !== question.id))}
        />
      ))}

      <AddQuestionMenu
        disabled={questions.length >= MAX_QUESTIONS}
        onAdd={(type) => {
          onChange([...questions, createQuestion(type)]);
          requestAnimationFrame(() => {
            const labels = document.querySelectorAll<HTMLTextAreaElement>('textarea[id^="q-label-"]');
            const last = labels[labels.length - 1];
            last?.focus();
            last?.select();
          });
        }}
      />
    </div>
  );
}
