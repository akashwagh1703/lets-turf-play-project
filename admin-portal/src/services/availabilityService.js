import data from "../mock/availability.json";

// Fetch availability for a specific turf
export async function getAvailability(turfId) {
  await new Promise((r) => setTimeout(r, 200));
  const turfData = data.availability.find((a) => a.turfId === turfId);
  return turfData ? turfData.slots : [];
}

// Update or add a slot
export async function updateAvailability(turfId, slot) {
  await new Promise((r) => setTimeout(r, 200));

  let turfData = data.availability.find((a) => a.turfId === turfId);
  if (!turfData) {
    turfData = { turfId, slots: [] };
    data.availability.push(turfData);
  }

  const index = turfData.slots.findIndex(
    (s) => s.date === slot.date && s.time === slot.time
  );

  if (index >= 0) turfData.slots[index] = slot;
  else turfData.slots.push(slot);

  return slot;
}

// Block or unblock a time slot
export async function toggleSlot(turfId, date, time, status) {
  await new Promise((r) => setTimeout(r, 200));
  const turfData = data.availability.find((a) => a.turfId === turfId);
  if (!turfData) return null;

  const slot = turfData.slots.find((s) => s.date === date && s.time === time);
  if (slot) slot.status = status;
  return slot;
}
