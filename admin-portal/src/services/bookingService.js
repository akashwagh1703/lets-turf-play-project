// import data from '../mock/data.json'

// export async function listBookings() {
//   await new Promise(r => setTimeout(r, 250))
//   return data.bookings
// }

import data from "../mock/bookings.json";

// Fetch bookings based on user role
export async function getBookings(user, turfs = []) {
  await new Promise((r) => setTimeout(r, 200));
  const key = user?.role?.toLowerCase() || "staff";

  if (key === "manager") {
    const ownerTurfIds = turfs.map((t) => t.id);
    return data.bookings.filter((b) => ownerTurfIds.includes(b.turfId));
  }

  // Admin or others see all bookings
  return data.bookings;
}

// Update booking status
export async function updateBookingStatus(id, status) {
  await new Promise((r) => setTimeout(r, 200));
  return { id, status };
}
