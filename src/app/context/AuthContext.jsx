"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const { data: session, status: sessionStatus } = useSession();

  // Combined loading: wait for both localStorage and NextAuth session
  const loading = localLoading || sessionStatus === "loading";

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("sm_user");
    const storedToken = localStorage.getItem("sm_token");
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);
    setLocalLoading(false);
  }, []);

  // Sync Google session → localStorage when no local session exists
  useEffect(() => {
    if (
      !localLoading &&
      sessionStatus === "authenticated" &&
      session?.customToken &&
      session?.customUser
    ) {
      const storedToken = localStorage.getItem("sm_token");
      if (!storedToken) {
        setUser(session.customUser);
        setToken(session.customToken);
        localStorage.setItem("sm_user", JSON.stringify(session.customUser));
        localStorage.setItem("sm_token", session.customToken);
      }
    }
  }, [session, sessionStatus, localLoading]);

  const login = ({ user: userData, token: authToken }) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("sm_user", JSON.stringify(userData));
    localStorage.setItem("sm_token", authToken);
  };

  // Merge partial updates into the stored user object (e.g. isEmailVerified: true)
  const updateUser = (partial) => {
    setUser((prev) => {
      const updated = { ...prev, ...partial };
      localStorage.setItem("sm_user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("sm_user");
    localStorage.removeItem("sm_token");
    // Also sign out from NextAuth (handles Google sessions)
    if (sessionStatus === "authenticated") {
      await nextAuthSignOut({ redirect: false });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
