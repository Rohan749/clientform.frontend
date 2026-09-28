import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { FullPageSpinner } from "@/components/common/FullPageSpinner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { api, errorMessage } from "@/lib/api";
import { getSession, setSession } from "@/lib/session";
import { safeNext } from "./LoginPage";

/**
 * Landing page after Google sign-in or an email-confirmation link. The session tokens arrive
 * in the URL fragment (never sent to any server); we store them and immediately remove them
 * from the address bar.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const fragment = new URLSearchParams(window.location.hash.slice(1));
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    const failure = fragment.get("error_description") ?? params.get("error_description") ?? params.get("error");
    const accessToken = fragment.get("access_token");
    const refreshToken = fragment.get("refresh_token");
    if (failure || !accessToken || !refreshToken) {
      setError(failure ?? "This sign-in link is invalid or has expired.");
      return;
    }

    const expiresAt =
      Number(fragment.get("expires_at")) || Math.floor(Date.now() / 1000) + (Number(fragment.get("expires_in")) || 3600);
    setSession({ access_token: accessToken, refresh_token: refreshToken, expires_at: expiresAt, user: null });

    api.auth
      .me()
      .then((user) => {
        const current = getSession();
        if (current) setSession({ ...current, user });
        navigate(safeNext(params.get("next")), { replace: true });
      })
      .catch((err: unknown) => {
        setSession(null);
        setError(errorMessage(err));
      });
  }, [navigate, params]);

  if (!error) return <FullPageSpinner />;

  return (
    <AuthLayout
      title="Couldn't sign you in"
      description={error}
      footer={
        <Link to="/login" className="font-medium text-foreground hover:underline">
          Back to log in
        </Link>
      }
    >
      <p className="text-sm text-muted-foreground">Please try again. If it keeps happening, sign in with email instead.</p>
    </AuthLayout>
  );
}
