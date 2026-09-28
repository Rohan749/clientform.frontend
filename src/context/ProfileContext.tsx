import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Branding, Profile } from "@/types";
import { useAuth } from "./AuthContext";

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  setProfile: (profile: Profile) => void;
  /** Branding shown on the user's public forms. */
  branding: Branding;
  displayName: string;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    api.profile
      .get()
      .then((data) => active && setProfileState(data))
      .catch((error: unknown) => console.error("Failed to load profile", error))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user]);

  const setProfile = useCallback((next: Profile) => setProfileState(next), []);

  const value = useMemo<ProfileContextValue>(() => {
    const emailName = user?.email?.split("@")[0] ?? "";
    const displayName = profile?.display_name || profile?.name || emailName || "Your studio";
    return {
      profile,
      loading,
      setProfile,
      displayName,
      branding: {
        name: displayName,
        avatar_url: profile?.avatar_url ?? null,
        website_url: profile?.website_url ?? null,
      },
    };
  }, [profile, loading, setProfile, user]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used inside <ProfileProvider>");
  return context;
}
