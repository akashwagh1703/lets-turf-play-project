const KEY = 'turf.admin.session'

// Mock users & roles
const USERS = [
  { id: 1, name: 'Admin User', email: 'admin@turf.com', role: 'Admin', password: 'admin123' },
  { id: 2, name: 'Manager User', email: 'manager@turf.com', role: 'Manager', password: 'manager123' },
  { id: 3, name: 'Staff User', email: 'staff@turf.com', role: 'Staff', password: 'staff123' },
]

export async function login(email, password) {
  // Simulate API
  await new Promise(r => setTimeout(r, 400))
  const found = USERS.find(u => u.email === email && u.password === password)
  if (!found) throw new Error('Invalid credentials')
  const token = btoa(`${found.email}:${Date.now()}`)
  const session = { token, user: { id: found.id, name: found.name, email: found.email, role: found.role } }
  localStorage.setItem(KEY, JSON.stringify(session))
  return session
}

export function getSession() {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function logout() {
  localStorage.removeItem(KEY)
}
