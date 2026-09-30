import { ArrowDown, ArrowUp, Copy, Crown, FileStack, GitBranch, GripVertical, MoreHorizontal, Trash2, Upload, X } from "lucide-react";
import type { ComponentProps } from "react";
import { AutoTextarea } from "@/components/ui/auto-textarea";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { QUESTION_TYPE_META } from "@/lib/questions";
import { cn } from "@/lib/utils";
import { QUESTION_TYPES, type Question, type QuestionType } from "@/types";
import { OptionsEditor } from "./OptionsEditor";

interface QuestionEditorProps {
  question: Question;
  index: number;
  total: number;
  dragging: boolean;
  onChange: (patch: Partial<Question>) => void;
  onMove: (to: number) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  itemProps: ComponentProps<"div">;
  handleProps: ComponentProps<"button">;
  /** Earlier choice questions this one can depend on (conditional logic). */
  conditionSources: Question[];
  /** Conditions are a Pro feature. */
  pro: boolean;
  /** Called when a non-Pro user reaches for a Pro feature. */
  onRequirePro: () => void;
  /** Multi-page forms: how many pages exist, to offer "Move to page". */
  pageCount?: number;
}

/**
 * A single question, edited in place (Tally-style): the label is typed directly,
 * and the answer area looks like what the client will see. Controls appear on hover/focus.
 */
export function QuestionEditor({
  question,
  index,
  total,
  dragging,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
  itemProps,
  handleProps,
  conditionSources,
  pro,
  onRequirePro,
  pageCount,
}: QuestionEditorProps) {
  const meta = QUESTION_TYPE_META[question.type];

  const addCondition = () => {
    if (!pro) {
      onRequirePro();
      return;
    }
    const source = conditionSources[conditionSources.length - 1];
    if (source) onChange({ show_if: { question_id: source.id, value: source.options[0] ?? "" } });
  };

  const changeType = (type: QuestionType) => {
    const nextMeta = QUESTION_TYPE_META[type];
    onChange({
      type,
      options: nextMeta.hasOptions && question.options.length === 0 ? [...nextMeta.defaults.options] : question.options,
      placeholder: nextMeta.hasOptions ? "" : question.placeholder || nextMeta.defaults.placeholder,
    });
  };

  const reveal = "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100";

  return (
    <div
      {...itemProps}
      className={cn(
        "group relative -mx-3 rounded-2xl px-3 pt-2 pb-5 transition-colors hover:bg-neutral-50 focus-within:bg-neutral-50 sm:-mx-4 sm:px-4",
        dragging && "opacity-40",
      )}
    >
      {/* Drag handle in the left gutter */}
      <button
        type="button"
        {...handleProps}
        className={cn(
          "absolute top-12 -left-7 hidden cursor-grab touch-none rounded-md p-1 text-muted-foreground/60 hover:bg-accent hover:text-foreground active:cursor-grabbing lg:block",
          reveal,
        )}
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>

      {/* Toolbar */}
      <div className={cn("flex h-9 items-center gap-1 transition-opacity", reveal)}>
        <Select value={question.type} onValueChange={(value) => changeType(value as QuestionType)}>
          <SelectTrigger size="sm" className="h-7 gap-1.5 border-transparent bg-transparent px-2 text-xs text-muted-foreground shadow-none hover:bg-accent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map((type) => {
              const Icon = QUESTION_TYPE_META[type].icon;
              return (
                <SelectItem key={type} value={type}>
                  <Icon className="size-3.5 text-muted-foreground" />
                  {QUESTION_TYPE_META[type].label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-0.5">
          <label className="mr-1.5 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none">
            Required
            <Switch checked={question.required} onCheckedChange={(required) => onChange({ required })} />
          </label>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7 text-muted-foreground"
            onClick={() => onMove(index - 1)}
            disabled={index === 0}
            aria-label="Move up"
          >
            <ArrowUp />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7 text-muted-foreground"
            onClick={() => onMove(index + 1)}
            disabled={index === total - 1}
            aria-label="Move down"
          >
            <ArrowDown />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" className="size-7 text-muted-foreground" aria-label="More">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuItem onSelect={onDuplicate}>
                <Copy /> Duplicate
              </DropdownMenuItem>
              {!question.show_if && (
                <DropdownMenuItem onSelect={addCondition} disabled={pro && conditionSources.length === 0}>
                  <GitBranch /> Show only if…
                  {!pro && <Crown className="ml-auto size-3.5 text-violet-600" />}
                </DropdownMenuItem>
              )}
              {pro && !question.show_if && conditionSources.length === 0 && (
                <p className="px-2 pb-1.5 text-[11px] leading-snug text-muted-foreground">
                  Add a multiple choice or budget question above this one first.
                </p>
              )}
              {pageCount !== undefined && pageCount > 1 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Move to page</DropdownMenuLabel>
                  {Array.from({ length: pageCount }, (_, page) => (
                    <DropdownMenuItem key={page} disabled={page === question.page} onSelect={() => onChange({ page })}>
                      <FileStack /> Page {page + 1}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={onRemove}>
                <Trash2 /> Delete question
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {question.show_if && (
        <ConditionRow question={question} sources={conditionSources} onChange={onChange} />
      )}

      {/* Label */}
      <div className="flex items-start gap-3">
        <AutoTextarea
          id={`q-label-${question.id}`}
          value={question.label}
          maxLength={300}
          placeholder="Type your question"
          aria-label={`Question ${index + 1}`}
          onChange={(e) => onChange({ label: e.target.value.replace(/\n/g, " ") })}
          className="text-[17px] leading-snug font-medium"
        />
        {question.required && (
          <span className="mt-0.5 shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Required
          </span>
        )}
      </div>

      {/* Optional sub-label: a short "why we ask" under the question */}
      <AutoTextarea
        value={question.help_text}
        maxLength={300}
        placeholder="Add a note under the question (optional)"
        aria-label={`Sub-label for question ${index + 1}`}
        onChange={(e) => onChange({ help_text: e.target.value.replace(/\n/g, " ") })}
        className="mt-1 text-[13px] leading-relaxed text-muted-foreground placeholder:text-muted-foreground/45"
      />

      {/* Answer area, as the client will see it */}
      <div className="mt-3">
        {meta.hasOptions ? (
          <OptionsEditor options={question.options} onChange={(options) => onChange({ options })} />
        ) : question.type === "file" ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-background px-6 py-6 text-center">
            <Upload className="size-4 text-muted-foreground" />
            <input
              value={question.placeholder}
              maxLength={300}
              onChange={(e) => onChange({ placeholder: e.target.value })}
              placeholder="Add helper text (optional)"
              aria-label="Helper text"
              className="w-full bg-transparent text-center text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        ) : question.type === "long_text" ? (
          <AutoTextarea
            value={question.placeholder}
            maxLength={300}
            onChange={(e) => onChange({ placeholder: e.target.value })}
            placeholder="Placeholder text (optional)"
            aria-label="Placeholder"
            className="min-h-24 rounded-lg border bg-background px-3 py-2.5 text-sm text-muted-foreground"
          />
        ) : (
          <input
            value={question.placeholder}
            maxLength={300}
            onChange={(e) => onChange({ placeholder: e.target.value })}
            placeholder="Placeholder text (optional)"
            aria-label="Placeholder"
            className="h-11 w-full rounded-lg border bg-background px-3 text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground/30"
          />
        )}
      </div>
    </div>
  );
}

/** "Show this question only if [question] is [answer]", in plain words. */
function ConditionRow({
  question,
  sources,
  onChange,
}: {
  question: Question;
  sources: Question[];
  onChange: (patch: Partial<Question>) => void;
}) {
  const rule = question.show_if;
  if (!rule) return null;
  const source = sources.find((q) => q.id === rule.question_id);
  const answerMissing = source !== undefined && !source.options.includes(rule.value);

  return (
    <div className="mb-2 rounded-xl border border-violet-100 bg-violet-50/60 px-3 py-2.5 animate-in fade-in-0 duration-200">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px]">
        <GitBranch className="size-3.5 shrink-0 text-violet-600" />
        <span className="text-muted-foreground">Show this question only if</span>
        <Select
          value={source ? rule.question_id : undefined}
          onValueChange={(question_id) => {
            const next = sources.find((q) => q.id === question_id);
            onChange({ show_if: { question_id, value: next?.options[0] ?? "" } });
          }}
        >
          <SelectTrigger size="sm" className="h-7 max-w-56 bg-background text-xs">
            <SelectValue placeholder="Pick a question" />
          </SelectTrigger>
          <SelectContent>
            {sources.map((q, i) => (
              <SelectItem key={q.id} value={q.id}>
                <span className="truncate">{q.label.trim() || `Question ${i + 1}`}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">is</span>
        <Select
          value={source && !answerMissing ? rule.value : undefined}
          onValueChange={(value) => onChange({ show_if: { question_id: rule.question_id, value } })}
          disabled={!source}
        >
          <SelectTrigger size="sm" className="h-7 max-w-48 bg-background text-xs">
            <SelectValue placeholder="Pick an answer" />
          </SelectTrigger>
          <SelectContent>
            {(source?.options ?? []).filter(Boolean).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={() => onChange({ show_if: null })}
          className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
          aria-label="Remove condition"
        >
          <X className="size-3.5" />
        </button>
      </div>
      {(!source || answerMissing) && (
        <p className="mt-1.5 text-xs text-amber-700">
          {source ? "That answer was changed or removed. Pick another one." : "The question this depends on was moved or removed. Pick another one."}
        </p>
      )}
    </div>
  );
}
