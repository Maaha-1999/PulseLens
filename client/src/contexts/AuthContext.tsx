import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Auto logout when browser/tab closes
    const handleBeforeUnload = async () => {
      // Sign out from Supabase
      await supabase.auth.signOut();
    };

    // Add event listener for when user closes the tab/browser
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Alternative: Clear session on page visibility change (when tab becomes hidden)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        // Store a timestamp when the page becomes hidden
        sessionStorage.setItem('lastHiddenTime', Date.now().toString());
      } else if (document.visibilityState === 'visible') {
        // Check if it's been a while since the page was hidden
        const lastHiddenTime = sessionStorage.getItem('lastHiddenTime');
        if (lastHiddenTime) {
          const timeDiff = Date.now() - parseInt(lastHiddenTime);
          // If more than 5 minutes (300000ms), consider it a new session and logout
          if (timeDiff > 300000) {
            await supabase.auth.signOut();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}