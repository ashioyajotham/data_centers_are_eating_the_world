/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_MAPBOX_TOKEN: string
  /** Same OAuth Web Client ID as backend GOOGLE_CLIENT_ID when using Google admin sign-in */
  readonly VITE_GOOGLE_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Google Identity Services (loaded from https://accounts.google.com/gsi/client) */
interface GoogleCredentialResponse {
  credential: string
  select_by?: string
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string
          callback: (resp: GoogleCredentialResponse) => void
        }) => void
        renderButton: (
          parent: HTMLElement,
          options: {
            theme?: string
            size?: string
            text?: string
            width?: string | number
            shape?: string
          }
        ) => void
        prompt: (moment?: (n: unknown) => void) => void
      }
    }
  }
}
