import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { queryCache, queryKeys } from "@/lib/queryCache";
import { starterQuestions } from "@/lib/questions";
import type { FormDraft, FormRecord, FormWithContent } from "@/types";

export function toDraft(form: FormWithContent): FormDraft {
  return {
    name: form.name,
    title: form.title,
    description: form.description,
    testimonials_heading: form.testimonials_heading,
    testimonials_description: form.testimonials_description,
    questions: form.questions.map(({ id, label, type, placeholder, required, options }) => ({
      id,
      label,
      type,
      placeholder,
      required,
      options,
    })),
    testimonials: form.testimonials.map(({ id, provider, url, author_name, author_handle, content }) => ({
      id,
      provider,
      url,
      author_name,
      author_handle,
      content,
    })),
  };
}

function toMeta({ questions: _q, testimonials: _t, ...meta }: FormWithContent): FormRecord {
  return meta;
}

export function newDraft(): FormDraft {
  return {
    name: "Project request",
    title: "Let's work together",
    description: "Tell me about your project and I'll get back to you within two business days.",
    testimonials_heading: "What clients say",
    testimonials_description: "A few words from people I've worked with.",
    questions: starterQuestions(),
    testimonials: [],
  };
}

/** Removes empty choice options and trims text before sending to the API. */
function toPayload(draft: FormDraft): FormDraft {
  return {
    ...draft,
    name: draft.name.trim(),
    questions: draft.questions.map((q) => ({
      ...q,
      options: q.options.map((o) => o.trim()).filter(Boolean),
    })),
  };
}

interface Options {
  formId?: string;
  initialForm?: FormWithContent;
  /** Called when a brand new form is persisted for the first time. */
  onCreated: (form: FormWithContent, options: { published: boolean }) => void;
}

export function useFormBuilder({ formId, initialForm, onCreated }: Options) {
  const [meta, setMeta] = useState<FormRecord | null>(initialForm ? toMeta(initialForm) : null);
  const [draft, setDraft] = useState<FormDraft>(() => (initialForm ? toDraft(initialForm) : newDraft()));
  const [snapshot, setSnapshot] = useState(() => JSON.stringify(draft));
  const [loading, setLoading] = useState(Boolean(formId && !initialForm));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (!formId || initialForm) return;
    let active = true;
    setLoading(true);
    api.forms
      .get(formId)
      .then((form) => {
        if (!active) return;
        const loaded = toDraft(form);
        setMeta(toMeta(form));
        setDraft(loaded);
        setSnapshot(JSON.stringify(loaded));
        setLoadError(null);
      })
      .catch((error: unknown) => active && setLoadError(errorMessage(error)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [formId, initialForm]);

  const dirty = useMemo(() => JSON.stringify(draft) !== snapshot, [draft, snapshot]);

  /** Syncs local state with the server's canonical copy after a successful save. */
  const applySaved = useCallback((saved: FormWithContent, sent: FormDraft) => {
    // The forms list and dashboard show this form's name/status: refresh them next time they're viewed.
    queryCache.invalidate(queryKeys.forms, queryKeys.dashboard);
    const canonical = toDraft(saved);
    setMeta(toMeta(saved));
    setSnapshot(JSON.stringify(canonical));
    // Only replace the draft if the user hasn't kept typing while we were saving.
    if (draftRef.current === sent) setDraft(canonical);
  }, []);

  const save = useCallback(async (): Promise<FormWithContent> => {
    const sent = draftRef.current;
    setSaving(true);
    try {
      if (!meta) {
        const created = await api.forms.create(toPayload(sent));
        applySaved(created, sent);
        onCreated(created, { published: false });
        return created;
      }
      const saved = await api.forms.update(meta.id, toPayload(sent));
      applySaved(saved, sent);
      return saved;
    } finally {
      setSaving(false);
    }
  }, [meta, applySaved, onCreated]);

  const publish = useCallback(
    async (slug?: string): Promise<FormWithContent> => {
      setPublishing(true);
      try {
        const isNew = !meta;
        const sent = draftRef.current;
        let created: FormWithContent | null = null;
        let id = meta?.id;

        if (isNew) {
          created = await api.forms.create(toPayload(sent));
          applySaved(created, sent);
          id = created.id;
        } else if (dirty) {
          const saved = await api.forms.update(meta.id, toPayload(sent));
          applySaved(saved, sent);
        }

        let published: FormWithContent;
        try {
          published = await api.forms.publish(id as string, slug);
        } catch (error) {
          // The draft was still created — move to its edit URL before surfacing the error.
          if (created) onCreated(created, { published: false });
          throw error;
        }
        setMeta(toMeta(published));
        queryCache.invalidate(queryKeys.forms, queryKeys.dashboard);
        if (isNew) onCreated(published, { published: true });
        return published;
      } finally {
        setPublishing(false);
      }
    },
    [meta, dirty, applySaved, onCreated],
  );

  const unpublish = useCallback(async () => {
    if (!meta) return;
    setPublishing(true);
    try {
      const form = await api.forms.unpublish(meta.id);
      setMeta(toMeta(form));
      queryCache.invalidate(queryKeys.forms, queryKeys.dashboard);
    } finally {
      setPublishing(false);
    }
  }, [meta]);

  const update = useCallback((patch: Partial<FormDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  return {
    meta,
    draft,
    update,
    dirty,
    isNew: !meta,
    loading,
    loadError,
    saving,
    publishing,
    save,
    publish,
    unpublish,
  };
}
