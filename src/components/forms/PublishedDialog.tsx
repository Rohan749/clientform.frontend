import { Check, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShareLink } from "./ShareLink";

export function PublishedDialog({
  open,
  onOpenChange,
  slug,
  onEmbed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string | null;
  onEmbed?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <div className="flex size-11 items-center justify-center rounded-full bg-foreground text-background">
          <Check className="size-5" />
        </div>
        <DialogHeader>
          <DialogTitle className="text-lg">Your form is live</DialogTitle>
          <DialogDescription>
            Share this link in your bio, email signature, proposals — anywhere clients find you.
          </DialogDescription>
        </DialogHeader>
        {slug && <ShareLink slug={slug} />}
        {slug && onEmbed && (
          <Button variant="outline" className="w-full" onClick={onEmbed}>
            <Code2 /> Embed it on your website
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
