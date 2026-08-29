import { createContext, useContext, useEffect, useState } from "react";

type User = {
  name?: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/session", { cache: "no-store" });

      if (!res.ok) {
        throw new Error("Failed to fetch session");
      }

      const data = await res.json();
      setUser(data.loggedIn ? data.user : null);
    } catch (error) {
      console.error("Session check failed", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
