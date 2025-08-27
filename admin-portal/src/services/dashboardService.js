// src/services/dashboardService.js
import data from "../mock/dashboard.json";

export async function getDashboardData(role = "staff") {
  await new Promise((r) => setTimeout(r, 300));
  const key = role?.toLowerCase() || "staff";
  return data[key] || {};
}

// This function is kept for any components that might still use it, but the main flow now uses getDashboardData
export async function recentBookings(limit = 5) {
  await new Promise((r) => setTimeout(r, 220));
  // Using the admin's recent bookings as a fallback generic list
  return data.admin?.recentBookings ? data.admin.recentBookings.slice(0, limit) : [];
}
