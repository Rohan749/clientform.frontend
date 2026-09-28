import { useCallback, useEffect } from "react";
import { Link, useParams } from "react-router";
import { LogoMark } from "@/components/common/Logo";
import { FormRenderer, type SubmissionValues } from "@/components/forms/FormRenderer";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/useApi";
import { api, ApiError } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function PublicFormPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: form, loading, error } = useApi(() => api.public.getForm(slug), [slug]);

  useEffect(() => {
    if (!form) return;
    document.title = form.branding.name ? `${form.title} — ${form.branding.name}` : form.title || "Project request";
  }, [form]);

  const handleUpload = useCallback(
    async (questionId: string, file: File) => {
      const { path, token } = await api.public.createUpload(slug, {
        question_id: questionId,
        file_name: file.name,
        file_size: file.size,
      });
      const { error: uploadError } = await supabase.storage
        .from("submission-files")
        .uploadToSignedUrl(path, token, file, { contentType: file.type || "application/octet-stream" });
      if (uploadError) throw new ApiError(400, "Upload failed. Please try again.");
      return path;
    },
    [slug],
  );

  const handleSubmit = useCallback(
    async (values: SubmissionValues) => {
      await api.public.submit(slug, values);
    },
    [slug],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-14">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="mt-10 h-10 w-3/4" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
        <div className="mt-12 space-y-7">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <LogoMark className="size-9" />
        <h1 className="mt-6 text-xl font-semibold tracking-tight">This form isn't available</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The link may be wrong, or the form is no longer accepting requests.
        </p>
        <Link to="/" className="mt-8 text-sm font-medium hover:underline">
          Create your own form with ClientForm →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <FormRenderer
        mode="live"
        title={form.title}
        description={form.description}
        questions={form.questions}
        testimonials={form.testimonials}
        testimonialsHeading={form.testimonials_heading}
        testimonialsDescription={form.testimonials_description}
        branding={form.branding}
        onSubmit={handleSubmit}
        onUpload={handleUpload}
      />
    </div>
  );
}
