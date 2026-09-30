import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { EmbedDialog } from "@/components/forms/EmbedDialog";
import { FormCard } from "@/components/forms/FormCard";
import { PageContainer } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { api, errorMessage } from "@/lib/api";
import { queryCache, queryKeys } from "@/lib/queryCache";
import type { FormSummary } from "@/types";

export default function FormsPage() {
  const { data: forms, loading, error, reload, setData } = useCachedQuery(queryKeys.forms, () => api.forms.list(), {
    staleTime: 60_000,
  });
  const [pendingDelete, setPendingDelete] = useState<FormSummary | null>(null);
  const [embedding, setEmbedding] = useState<FormSummary | null>(null);

  const duplicate = async (form: FormSummary) => {
    const pending = toast.loading("Duplicating…");
    try {
      const copy = await api.forms.duplicate(form.id);
      const { questions: _q, testimonials: _t, ...summary } = copy;
      // The copy goes right after the original (lists are newest first after a refresh).
      setData((prev) => {
        if (!prev) return prev;
        const index = prev.findIndex((f) => f.id === form.id);
        const next = [...prev];
        next.splice(index + 1, 0, { ...summary, submission_count: 0 });
        return next;
      });
      queryCache.invalidate(queryKeys.dashboard);
      toast.success(`Created "${copy.name}"`, { id: pending, description: "It's a draft you can edit on its own." });
    } catch (err) {
      toast.error(errorMessage(err), { id: pending });
    }
  };

  const replace = (updated: Partial<FormSummary> & { id: string }) => {
    setData((prev) => prev?.map((f) => (f.id === updated.id ? { ...f, ...updated } : f)) ?? prev);
    queryCache.invalidate(queryKeys.dashboard);
  };

  const unpublish = async (form: FormSummary) => {
    try {
      const updated = await api.forms.unpublish(form.id);
      replace({ id: form.id, status: updated.status, updated_at: updated.updated_at });
      toast.success("Form unpublished");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const toggleArchive = async (form: FormSummary) => {
    const status = form.status === "archived" ? "draft" : "archived";
    try {
      const updated = await api.forms.update(form.id, { status });
      replace({ id: form.id, status: updated.status, updated_at: updated.updated_at });
      toast.success(status === "archived" ? "Form archived" : "Form restored to drafts");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    try {
      await api.forms.remove(pendingDelete.id);
      setData((prev) => prev?.filter((f) => f.id !== pendingDelete.id) ?? prev);
      // Its submissions are gone too.
      queryCache.invalidate(queryKeys.dashboard, queryKeys.submissionLists);
      toast.success("Form deleted");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Forms"
        description="Every project request form you've created."
        actions={
          <Button asChild>
            <Link to="/create-form">
              <Plus /> Create new form
            </Link>
          </Button>
        }
      />

      <div className="mt-8">
        {loading && !forms ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[212px] rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => void reload().catch(() => undefined)} />
        ) : forms && forms.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="You haven't created a form yet."
            description="Create your first client form and start collecting project requests."
            action={
              <Button asChild>
                <Link to="/create-form">
                  <Plus /> Create form
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {forms?.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onUnpublish={() => unpublish(form)}
                onArchiveToggle={() => toggleArchive(form)}
                onDelete={() => setPendingDelete(form)}
                onDuplicate={() => duplicate(form)}
                onEmbed={() => setEmbedding(form)}
              />
            ))}
          </div>
        )}
      </div>

      <EmbedDialog
        open={Boolean(embedding)}
        onOpenChange={(open) => !open && setEmbedding(null)}
        slug={embedding?.status === "published" ? embedding.slug : null}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? "form"}"?`}
        description="This permanently deletes the form and all of its submissions. This can't be undone."
        confirmLabel="Delete form"
        destructive
        onConfirm={remove}
      />
    </PageContainer>
  );
}
