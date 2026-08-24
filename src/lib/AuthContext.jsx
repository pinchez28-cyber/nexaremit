import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  getSupabaseBrowserClient,
  isPhoneAuthEnabled,
  isSupabaseConfigured
} from "@/lib/supabase-browser";

const AuthContext = createContext(null);

/**
 * Real authentication, replacing the stub that reported every visitor as
 * signed in with no identity behind it.
 *
 * Why this matters beyond login: safetyEngine's first check is
 * `if (!user?.id) -> "User must be authenticated"`, KYC approval has to attach
 * to a durable customer rather than a browser, and AML record-keeping needs a
 * customer id that survives clearing site data. None of that was possible
 * while identity was a localStorage device id.
 *
 * When Supabase is unconfigured the app still runs — it just cannot sign
 * anyone in, and anything requiring a user says so plainly instead of
 * pretending.
 */
export function AuthProvider({ children }) {
  const supabase = getSupabaseBrowserClient();

  const [session, setSession] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(Boolean(supabase));
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setIsLoadingAuth(false);
      return undefined;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data?.session || null);
      })
      .catch((error) => {
        if (!active) return;
        setAuthError({ type: "auth_unavailable", message: error?.message });
      })
      .finally(() => {
        if (active) setIsLoadingAuth(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setIsLoadingAuth(false);
      }
    );

    return () => {
      active = false;
      subscription?.subscription?.unsubscribe();
    };
  }, [supabase]);

  const requireClient = useCallback(() => {
    if (!supabase) {
      throw new Error(
        "Sign-in is unavailable because Supabase is not configured on this deployment."
      );
    }
    return supabase;
  }, [supabase]);

  const signInWithMagicLink = useCallback(
    async (email) => {
      const client = requireClient();
      const { error } = await client.auth.signInWithOtp({
        email: String(email || "").trim(),
        options: { emailRedirectTo: `${window.location.origin}/SignIn` }
      });
      if (error) throw error;
      return { sent: true };
    },
    [requireClient]
  );

  const signInWithPassword = useCallback(
    async (email, password) => {
      const client = requireClient();
      const { error } = await client.auth.signInWithPassword({
        email: String(email || "").trim(),
        password
      });
      if (error) throw error;
    },
    [requireClient]
  );

  const signUpWithPassword = useCallback(
    async (email, password) => {
      const client = requireClient();
      const { data, error } = await client.auth.signUp({
        email: String(email || "").trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/SignIn` }
      });
      if (error) throw error;
      // Supabase returns no session when email confirmation is required.
      return { needsConfirmation: !data?.session };
    },
    [requireClient]
  );

  const signInWithPhone = useCallback(
    async (phone) => {
      const client = requireClient();
      const { error } = await client.auth.signInWithOtp({
        phone: String(phone || "").trim()
      });
      if (error) throw error;
      return { sent: true };
    },
    [requireClient]
  );

  const verifyPhoneOtp = useCallback(
    async (phone, token) => {
      const client = requireClient();
      const { error } = await client.auth.verifyOtp({
        phone: String(phone || "").trim(),
        token: String(token || "").trim(),
        type: "sms"
      });
      if (error) throw error;
    },
    [requireClient]
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  }, [supabase]);

  /**
   * Access token for calling our own API routes.
   *
   * Read from the live session each time rather than cached, so a token
   * refreshed in the background is picked up instead of sending a stale one.
   */
  const getAccessToken = useCallback(async () => {
    if (!supabase) return "";
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || "";
  }, [supabase]);

  const value = useMemo(
    () => ({
      user: session?.user || null,
      session,
      isAuthenticated: Boolean(session?.user),
      isAuthConfigured: isSupabaseConfigured(),
      isPhoneAuthEnabled: isPhoneAuthEnabled(),
      isLoadingAuth,
      // Kept for the existing AuthenticatedApp shell, which reads them.
      isLoadingPublicSettings: false,
      authError,
      navigateToLogin: () => {
        window.location.assign("/SignIn");
      },
      signInWithMagicLink,
      signInWithPassword,
      signUpWithPassword,
      signInWithPhone,
      verifyPhoneOtp,
      signOut,
      getAccessToken
    }),
    [
      session,
      isLoadingAuth,
      authError,
      signInWithMagicLink,
      signInWithPassword,
      signUpWithPassword,
      signInWithPhone,
      verifyPhoneOtp,
      signOut,
      getAccessToken
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
