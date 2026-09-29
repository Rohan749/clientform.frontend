import { Loader2, MailCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthDivider, GoogleButton } from "@/components/auth/GoogleButton";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, errorMessage } from "@/lib/api";
import { setSession } from "@/lib/session";
import { safeNext } from "./LoginPage";

export default function SignupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Where to go after signing up, e.g. /billing when someone picked Pro on the landing page.
  const next = safeNext(params.get("next"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await api.auth.signup(email.trim(), password, name.trim());
      // With email confirmation enabled there's no session until the link is clicked.
      if (!result.session) {
        setConfirmationSent(true);
        return;
      }
      setSession(result.session);
      navigate(next, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (confirmationSent) {
    return (
      <AuthLayout
        title="Check your inbox"
        description={`We sent a confirmation link to ${email}. Click it to activate your account.`}
        footer={
          <>
            Already confirmed?{" "}
            <Link to="/login" className="font-medium text-foreground hover:underline">
              Log in
            </Link>
          </>
        }
      >
        <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
          <MailCheck className="size-5 shrink-0 text-foreground" />
          Didn't get it? Check your spam folder, or try signing up again in a minute.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Build a project form you'll be proud to send."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <GoogleButton next={next} onError={setError} />
      <AuthDivider />
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={120}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
