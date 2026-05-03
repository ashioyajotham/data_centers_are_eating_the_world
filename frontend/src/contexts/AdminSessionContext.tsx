import { createContext, useContext } from 'react'

export type AdminSessionValue = {
  logout: () => void
}

export const AdminSessionContext = createContext<AdminSessionValue | null>(null)

export function useAdminSession(): AdminSessionValue | null {
  return useContext(AdminSessionContext)
}
