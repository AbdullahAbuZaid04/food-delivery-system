import axios from "axios";

// Data-layer client for the وجبة API (AGENTS.md §2).
//
// Single axios instance shared by every `src/lib/api` module. It:
//   1. attaches the bearer token from localStorage on every request,
//   2. unwraps the server envelope ({ success, data } / { success: false, message }),
//   3. normalizes server Decimal strings to JS numbers on every successful payload,
//   4. transparently refreshes the access token once when a request 401s, then
//      retries the original request; if the refresh itself fails it clears the
//      session and notifies AuthContext via `setUnauthorizedHandler`.
//
// Components/pages never talk to this file directly — use the per-domain
// modules (auth, restaurants, cart, orders, …) or the barrel `./index.js`.

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const ACCESS_TOKEN_KEY = "wajba-access-token";
const REFRESH_TOKEN_KEY = "wajba-refresh-token";

const isBrowser = typeof window !== "undefined";

export function getAccessToken() {
  if (!isBrowser) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (!isBrowser) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken, refreshToken) {
  if (!isBrowser) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens() {
  if (!isBrowser) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ApiError — carries the server's message + HTTP status for callers to toast.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Money fields the server serializes as Prisma Decimal strings. Normalized to
// JS numbers inside the API layer so components can do arithmetic directly
// (AGENTS.md §2).
const MONEY_FIELDS = new Set([
  "price",
  "deliveryFee",
  "minimumOrder",
  "subtotal",
  "total",
  "unitPrice",
  "itemTotal",
]);

function normalizeMoney(value) {
  if (Array.isArray(value)) return value.map(normalizeMoney);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = MONEY_FIELDS.has(key)
        ? Number(nested)
        : normalizeMoney(nested);
    }
    return out;
  }
  return value;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;
let onUnauthorized = () => {};

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function refreshTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token stored.");
  }
  const response = await axios.post(`${BASE_URL}/auth/refresh`, {
    refreshToken,
  });
  const payload = response.data;
  if (!payload.success) {
    throw new Error(payload.message || "Session expired.");
  }
  setTokens(payload.data.token, payload.data.refreshToken);
  return payload.data.token;
}

api.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload === "object" && "success" in payload) {
      if (payload.success) {
        return normalizeMoney(payload.data);
      }
      throw new ApiError(payload.message || "Request failed.", response.status);
    }
    return normalizeMoney(payload);
  },
  async (error) => {
    const { response, config } = error;
    const status = response?.status ?? 0;
    const url = config?.url ?? "";
    const isAuthRequest =
      url.includes("/auth/login") || url.includes("/auth/refresh");

    if (status === 401 && !isAuthRequest && !config?._retried) {
      config._retried = true;
      try {
        refreshPromise = refreshPromise || refreshTokens();
        const token = await refreshPromise;
        refreshPromise = null;
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      } catch (refreshError) {
        refreshPromise = null;
        clearTokens();
        onUnauthorized();
        throw new ApiError("انتهت الجلسة، يرجى تسجيل الدخول من جديد.", 401);
      }
    }

    throw new ApiError(
      response?.data?.message || "تعذر الاتصال بالخادم، حاول مرة تانية.",
      status,
    );
  },
);

export default api;
