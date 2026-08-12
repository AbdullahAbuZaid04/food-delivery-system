import api, { setTokens, clearTokens } from "./client";

// All functions unwrap the server envelope already (client.js), so callers get
// the `data` payload directly and are responsible only for handling ApiError.

export async function login(email, password) {
  const data = await api.post("/auth/login", { email, password });
  setTokens(data.token, data.refreshToken);
  return data.user;
}

export async function register(payload) {
  const data = await api.post("/auth/register", payload);
  setTokens(data.token, data.refreshToken);
  return data.user;
}

export async function getProfile() {
  const data = await api.get("/auth/profile");
  return data.user;
}

export async function updateProfile(payload) {
  const data = await api.put("/auth/profile", payload);
  return data.user;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    clearTokens();
  }
}

// Re-submit a rejected driver application back into the admin review queue.
// Returns the refreshed user profile (driverStatus → PENDING).
export async function reapplyAsDriver() {
  const data = await api.patch("/auth/driver/reapply");
  return data.user;
}

export async function addAddress(address) {
  return api.post("/auth/profile/address", address);
}

export async function updateAddress(addressId, address) {
  return api.put(`/auth/profile/address/${addressId}`, address);
}

export async function deleteAddress(addressId) {
  return api.delete(`/auth/profile/address/${addressId}`);
}
