import { ArrowDown, ArrowUp, Copy, GripVertical, MoreHorizontal, Trash2, Upload } from "lucide-react";
import type { ComponentProps } from "react";
import { AutoTextarea } from "@/components/ui/auto-textarea";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
}: QuestionEditorProps) {
  const meta = QUESTION_TYPE_META[question.type];

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
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onDuplicate}>
                <Copy /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={onRemove}>
                <Trash2 /> Delete question
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
