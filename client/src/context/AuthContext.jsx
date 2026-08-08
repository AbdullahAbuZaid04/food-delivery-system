"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "@lib/api";
import { getAccessToken, setUnauthorizedHandler } from "@lib/api/client";

// AuthContext — session state for the whole app (AGENTS.md §2).
//
// The API client owns the tokens (localStorage); this context owns the *user*.
// On mount it restores the session from the stored access token via
// GET /api/auth/profile (browser-only, in an effect — same hydration-safe
// pattern as CartContext). When the API client's refresh flow fails it calls
// the handler registered via setUnauthorizedHandler, and we drop to
// "unauthenticated" so the UI re-renders logged-out.
//
// Any authenticated role (CUSTOMER/DRIVER/OWNER/ADMIN) is kept in the session
// here. Route groups guard themselves by role: the customer app redirects
// non-customers, and the owner dashboard requires OWNER.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!getAccessToken()) {
        if (active) setStatus("unauthenticated");
        return;
      }
      try {
        const profile = await authApi.getProfile();
        if (!active) return;
        setUser(profile);
        setStatus("authenticated");
      } catch {
        if (!active) return;
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    restoreSession();

    setUnauthorizedHandler(() => {
      if (!active) return;
      setUser(null);
      setStatus("unauthenticated");
    });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const loggedInUser = await authApi.login(email, password);
    setUser(loggedInUser);
    setStatus("authenticated");
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const newUser = await authApi.register(payload);
    setUser(newUser);
    setStatus("authenticated");
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Token already invalid — still clear the local session.
    }
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const updateUser = useCallback(async (payload) => {
    const updated = await authApi.updateProfile(payload);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      isReady: status !== "loading",
      role: user?.role ?? null,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, status, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}
