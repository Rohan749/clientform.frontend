import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QUESTION_TYPE_META } from "@/lib/questions";
import { QUESTION_TYPES, type QuestionType } from "@/types";

export function AddQuestionMenu({ onAdd, disabled }: { onAdd: (type: QuestionType) => void; disabled?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className="-mx-3 flex w-[calc(100%+1.5rem)] items-center gap-2 rounded-xl px-3 py-3 text-sm text-muted-foreground transition-colors outline-none hover:bg-neutral-50 hover:text-foreground focus-visible:bg-neutral-50 disabled:opacity-50 data-[state=open]:bg-neutral-50 sm:-mx-4 sm:w-[calc(100%+2rem)] sm:px-4"
      >
        <span className="flex size-6 items-center justify-center rounded-md border bg-background">
          <Plus className="size-3.5" />
        </span>
        Add question
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {QUESTION_TYPES.map((type) => {
          const meta = QUESTION_TYPE_META[type];
          const Icon = meta.icon;
          return (
            <DropdownMenuItem key={type} onSelect={() => onAdd(type)} className="py-2">
              <div className="flex size-8 items-center justify-center rounded-lg border bg-background">
                <Icon />
              </div>
              <div>
                <p className="text-sm font-medium">{meta.label}</p>
                <p className="text-xs text-muted-foreground">{meta.description}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
