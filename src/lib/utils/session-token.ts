const KEY = 'bon_sim_session_token'
const PROFILE_KEY = 'bon_sim_profile_id'
const PROFILE_NAME_KEY = 'bon_sim_profile_name'

export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(KEY)
}

export function setSessionToken(token: string): void {
  localStorage.setItem(KEY, token)
}

export function clearSessionToken(): void {
  localStorage.removeItem(KEY)
}

export function getProfileId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PROFILE_KEY)
}

export function setProfileId(id: string, name: string): void {
  localStorage.setItem(PROFILE_KEY, id)
  localStorage.setItem(PROFILE_NAME_KEY, name)
}

export function getProfileName(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PROFILE_NAME_KEY)
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY)
  localStorage.removeItem(PROFILE_NAME_KEY)
}
