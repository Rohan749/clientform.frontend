import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthDivider, GoogleButton } from "@/components/auth/GoogleButton";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

/** Only allow redirecting to in-app paths (prevents open redirects). */
export function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials" ? "That email and password don't match." : signInError.message,
      );
      return;
    }
    navigate(safeNext(params.get("next")), { replace: true });
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to manage your forms and client requests."
      footer={
        <>
          New to ClientForm?{" "}
          <Link to="/signup" className="font-medium text-foreground hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <GoogleButton next={safeNext(params.get("next"))} onError={setError} />
      <AuthDivider />
      <form onSubmit={submit} className="space-y-4">
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
