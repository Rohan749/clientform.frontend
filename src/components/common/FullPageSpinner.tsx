import { LogoMark } from "./Logo";

export function FullPageSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <LogoMark className="size-8 animate-pulse" />
    </div>
  );
}
