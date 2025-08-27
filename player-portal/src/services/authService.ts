import { User, AuthState } from '../types'

const STORAGE_KEYS = {
  AUTH_STATE: 'turfbooker_auth',
  USER_DATA: 'turfbooker_user'
}

// Mock OTP verification
export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  console.log(`Mock OTP sent to ${phoneNumber}: 123456`)
  
  return {
    success: true,
    message: 'OTP sent successfully'
  }
}

export const verifyOTP = async (phoneNumber: string, otp: string): Promise<{ success: boolean; isNewUser?: boolean; user?: User }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  if (otp !== '123456') {
    return { success: false }
  }

  // Check if user exists (mock check)
  const existingUsers = getStoredUsers()
  const existingUser = existingUsers.find(u => u.phone === phoneNumber)
  
  if (existingUser) {
    setAuthState({ isAuthenticated: true, user: existingUser, isLoading: false })
    return { success: true, isNewUser: false, user: existingUser }
  }

  return { success: true, isNewUser: true }
}

export const completeProfile = async (userData: Omit<User, 'id'>): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const user: User = {
    id: Date.now().toString(),
    ...userData
  }

  // Store user
  const users = getStoredUsers()
  users.push(user)
  localStorage.setItem('turfbooker_users', JSON.stringify(users))
  
  setAuthState({ isAuthenticated: true, user, isLoading: false })
  
  return user
}

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_STATE)
  localStorage.removeItem(STORAGE_KEYS.USER_DATA)
}

export const getAuthState = (): AuthState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH_STATE)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error getting auth state:', error)
  }
  
  return { isAuthenticated: false, user: null, isLoading: false }
}

export const setAuthState = (state: AuthState): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(state))
}

export const updateProfile = async (updates: Partial<User>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const currentState = getAuthState()
  if (!currentState.user) throw new Error('No user found')
  
  const updatedUser = { ...currentState.user, ...updates }
  
  // Update in stored users
  const users = getStoredUsers()
  const userIndex = users.findIndex(u => u.id === updatedUser.id)
  if (userIndex !== -1) {
    users[userIndex] = updatedUser
    localStorage.setItem('turfbooker_users', JSON.stringify(users))
  }
  
  setAuthState({ ...currentState, user: updatedUser })
  
  return updatedUser
}

const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem('turfbooker_users')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}
