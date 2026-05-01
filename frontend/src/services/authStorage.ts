/** Session-only admin JWT for mutating API calls. */
export const ADMIN_TOKEN_STORAGE_KEY = 'dc_map_admin_jwt'

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setAdminToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token)
    else sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
  } catch {
    /* storage unavailable */
  }
}
