import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useBlocker, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { BuilderHeader } from "@/components/forms/BuilderHeader";
import type { BuilderTab } from "@/components/forms/BuilderTabs";
import { FormBuilder } from "@/components/forms/FormBuilder";
import { FormPreview } from "@/components/forms/FormPreview";
import { PublishedDialog } from "@/components/forms/PublishedDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/context/ProfileContext";
import { useFormBuilder } from "@/hooks/useFormBuilder";
import { errorMessage } from "@/lib/api";
import type { FormWithContent } from "@/types";

interface LocationState {
  form?: FormWithContent;
  justPublished?: boolean;
}

/** Keyed by form id so switching between forms (or to a new one) always starts fresh. */
export default function CreateFormPage() {
  const { id } = useParams<{ id: string }>();
  return <FormEditor key={id ?? "new"} />;
}

function FormEditor() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { branding } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: BuilderTab = searchParams.get("view") === "preview" ? "preview" : "edit";
  const setTab = (next: BuilderTab) => {
    setSearchParams(next === "preview" ? { view: "preview" } : {}, { replace: true });
    window.scrollTo({ top: 0 });
  };

  // Router state (set right after a form is first created) is read once, then cleared
  // so a page refresh always loads fresh data from the server.
  const [{ initialForm, justPublished }] = useState(() => {
    const state = (location.state ?? null) as LocationState | null;
    return {
      initialForm: state?.form && state.form.id === id ? state.form : undefined,
      justPublished: Boolean(state?.justPublished),
    };
  });
  useEffect(() => {
    if (location.state) navigate(location.pathname + location.search, { replace: true, state: null });
  }, []);

  const [publishedOpen, setPublishedOpen] = useState(justPublished);
  const allowNavigation = useRef(false);

  const onCreated = useCallback(
    (form: FormWithContent, { published }: { published: boolean }) => {
      allowNavigation.current = true;
      navigate(`/forms/${form.id}/edit`, { replace: true, state: { form, justPublished: published } });
    },
    [navigate],
  );

  const builder = useFormBuilder({ formId: id, initialForm, onCreated });
  const { dirty, save, publish } = builder;

  // Warn before leaving with unsaved changes (in-app navigation)…
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !allowNavigation.current && dirty && currentLocation.pathname !== nextLocation.pathname,
  );

  // …and on tab close / reload.
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const handleSave = useCallback(async () => {
    try {
      await save();
      toast.success("Form saved");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }, [save]);

  const handlePublish = async () => {
    try {
      await publish();
      toast.success("Form published");
      setPublishedOpen(true);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleUnpublish = async () => {
    try {
      await builder.unpublish();
      toast.success("Form unpublished", { description: "The public link no longer works." });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleChangeSlug = async (slug: string) => {
    await publish(slug);
    toast.success("Link updated");
  };

  // ⌘S / Ctrl+S saves.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!builder.saving && !builder.publishing && (dirty || builder.isNew)) void handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [builder.saving, builder.publishing, builder.isNew, dirty, handleSave]);

  if (builder.loadError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <ErrorState message={builder.loadError} />
        <div className="mt-6 flex justify-center">
          <Button variant="outline" asChild>
            <Link to="/forms">
              <ArrowLeft /> Back to forms
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (builder.loading) return <BuilderSkeleton />;

  return (
    <div className="flex flex-col lg:h-dvh">
      <BuilderHeader
        tab={tab}
        onTabChange={setTab}
        name={builder.draft.name}
        onNameChange={(name) => builder.update({ name })}
        meta={builder.meta}
        dirty={dirty || builder.isNew}
        saving={builder.saving}
        publishing={builder.publishing}
        onSave={handleSave}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />

      {tab === "edit" ? (
        <div className="flex-1 lg:min-h-0 lg:overflow-y-auto">
          <FormBuilder
            draft={builder.draft}
            meta={builder.meta}
            branding={branding}
            onChange={builder.update}
            onChangeSlug={handleChangeSlug}
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col bg-neutral-50/70 lg:min-h-0">
          <FormPreview draft={builder.draft} branding={branding} slug={builder.meta?.slug ?? null} />
        </div>
      )}

      <PublishedDialog open={publishedOpen} onOpenChange={setPublishedOpen} slug={builder.meta?.slug ?? null} />

      <ConfirmDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => !open && blocker.state === "blocked" && blocker.reset()}
        title="Discard unsaved changes?"
        description="You have changes that haven't been saved. If you leave now, they'll be lost."
        confirmLabel="Discard changes"
        destructive
        onConfirm={() => {
          if (blocker.state === "blocked") blocker.proceed();
        }}
      />
    </div>
  );
}

function BuilderSkeleton() {
  return (
    <div className="flex flex-col lg:h-dvh">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mx-auto hidden h-8 w-40 lg:block" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-2xl space-y-5 px-8 py-14">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="mt-10 h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="grid gap-4 pt-8 sm:grid-cols-2">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}
