import { ArrowUpRight, Loader2, LogOut, Upload } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { PageContainer } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { api, errorMessage } from "@/lib/api";
import { hostname, initials } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { isValidHttpUrl } from "@/lib/testimonials";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { profile, loading, setProfile } = useProfile();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setDisplayName(profile.display_name ?? "");
    setWebsite(profile.website_url ?? "");
  }, [profile]);

  const dirty =
    profile !== null &&
    (name !== (profile.name ?? "") ||
      displayName !== (profile.display_name ?? "") ||
      website !== (profile.website_url ?? ""));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    let websiteUrl = website.trim();
    if (websiteUrl && !/^https?:\/\//i.test(websiteUrl)) websiteUrl = `https://${websiteUrl}`;
    if (websiteUrl && !isValidHttpUrl(websiteUrl)) {
      toast.error("Enter a valid website URL");
      return;
    }

    setSaving(true);
    try {
      const updated = await api.profile.update({
        name: name.trim(),
        display_name: displayName.trim(),
        website_url: websiteUrl,
      });
      setProfile(updated);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File | undefined) => {
    if (!file || !user) return;
    if (!AVATAR_TYPES.includes(file.type)) {
      toast.error("Use a PNG, JPG, WebP or GIF image");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Images must be 2 MB or smaller");
      return;
    }

    setUploading(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${user.id}/${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, {
        contentType: file.type,
        cacheControl: "31536000",
      });
      if (error) throw error;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const previous = profile?.avatar_url;
      const updated = await api.profile.update({ avatar_url: data.publicUrl });
      setProfile(updated);
      toast.success("Profile image updated");

      // Best-effort cleanup of the previous image in the user's folder.
      const previousPath = previous?.split("/avatars/")[1];
      if (previousPath?.startsWith(`${user.id}/`)) {
        void supabase.storage.from("avatars").remove([previousPath]);
      }
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      const updated = await api.profile.update({ avatar_url: "" });
      setProfile(updated);
      toast.success("Profile image removed");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const brandPreviewName = displayName.trim() || name.trim() || user?.email?.split("@")[0] || "Your studio";
  const site = hostname(/^https?:\/\//i.test(website) ? website : website ? `https://${website}` : "");

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Settings" description="Your profile and how you appear to clients." />

      {loading && !profile ? (
        <div className="mt-8 space-y-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <form onSubmit={save} className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 border">
                  {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
                  <AvatarFallback className="text-base">{initials(brandPreviewName)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                    Upload image
                  </Button>
                  {profile?.avatar_url && (
                    <Button type="button" variant="ghost" size="sm" onClick={removeAvatar}>
                      Remove
                    </Button>
                  )}
                  <p className="w-full text-xs text-muted-foreground">
                    PNG, JPG or WebP up to 2 MB. Also shown on your public forms.
                  </p>
                </div>
                <input
                  ref={fileInput}
                  type="file"
                  accept={AVATAR_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => {
                    void uploadAvatar(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder="Rohan Pandey" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email ?? ""} disabled readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>How your name appears at the top of every form you share.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    maxLength={120}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Rohan — Motion Design"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">
                    Website <span className="font-normal text-muted-foreground">Optional</span>
                  </Label>
                  <Input
                    id="website"
                    value={website}
                    maxLength={2048}
                    inputMode="url"
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="yourstudio.com"
                  />
                </div>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="mb-3 text-xs text-muted-foreground">Preview</p>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 border">
                    {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
                    <AvatarFallback className="bg-foreground text-sm font-semibold text-background">
                      {initials(brandPreviewName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{brandPreviewName}</p>
                    {site && (
                      <p className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                        {site} <ArrowUpRight className="size-3" />
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={!dirty || saving}>
              {saving && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      )}

      <Card className="mt-10">
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Account</CardTitle>
            <CardDescription className="mt-1">Signed in as {user?.email}</CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut /> Log out
          </Button>
        </CardHeader>
      </Card>
    </PageContainer>
  );
}
