import api from "./client";

export async function getDashboardStats() {
  return api.get("/dashboard");
}
