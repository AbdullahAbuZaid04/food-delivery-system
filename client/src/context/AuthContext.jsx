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

const AuthContext = createContext(null);

// This client is the CUSTOMER app. Drivers, restaurant owners, and admins have
// their own dashboards (future phases) — a non-CUSTOMER session must never
// land inside the ordering UI, otherwise a driver would see the cart/menu and
// only fail with 403 when the API rejects them at checkout.
function isCustomerSession(user) {
  return user?.role === "CUSTOMER";
}

const NON_CUSTOMER_MESSAGE =
  "هالتطبيق للزبائن بس — حسابك إله لوحة تحكم خاصة (سائق/مالك مطعم). سجّل دخولك بحساب زبون.";

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
        if (!isCustomerSession(profile)) {
          // A driver/owner/admin token must not restore a customer session —
          // drop it so every customer screen redirects to /login.
          await authApi.logout();
          setUser(null);
          setStatus("unauthenticated");
          return;
        }
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
    if (!isCustomerSession(loggedInUser)) {
      await authApi.logout();
      throw new Error(NON_CUSTOMER_MESSAGE);
    }
    setUser(loggedInUser);
    setStatus("authenticated");
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const newUser = await authApi.register(payload);
    if (!isCustomerSession(newUser)) {
      await authApi.logout();
      throw new Error(NON_CUSTOMER_MESSAGE);
    }
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
    if (!isCustomerSession(updated)) {
      throw new Error(NON_CUSTOMER_MESSAGE);
    }
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      isReady: status !== "loading",
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
