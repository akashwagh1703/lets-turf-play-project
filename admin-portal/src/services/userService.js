import data from "../mock/data.json";

// Keep an in-memory copy so we can modify it
let users = [...data.users];

export async function listUsers() {
  await new Promise((r) => setTimeout(r, 150));
  return users;
}

export async function getUserById(id) {
  await new Promise((r) => setTimeout(r, 100));
  return users.find((u) => u.id === id);
}

export async function createUser(newUser) {
  await new Promise((r) => setTimeout(r, 100));
  const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const user = { id, status: "Active", lastLogin: null, ...newUser };
  users.push(user);
  return user;
}

export async function updateUser(id, updates) {
  await new Promise((r) => setTimeout(r, 100));
  users = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
  return users.find((u) => u.id === id);
}

export async function deactivateUser(id) {
  return updateUser(id, { status: "Inactive" });
}

export async function activateUser(id) {
  return updateUser(id, { status: "Active" });
}

export async function resetPassword(id) {
  await new Promise((r) => setTimeout(r, 100));
  return { id, message: "Password has been reset successfully." };
}

export async function filterByRole(role) {
  await new Promise((r) => setTimeout(r, 100));
  return users.filter((u) => u.role === role);
}

export async function getActivityLogs(id) {
  await new Promise((r) => setTimeout(r, 100));
  return [
    { action: "login", timestamp: "2025-08-20 09:15" },
    { action: "updated profile", timestamp: "2025-08-21 14:30" },
    { action: "changed password", timestamp: "2025-08-23 17:45" },
  ];
}
