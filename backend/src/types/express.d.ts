export {}

declare global {
  namespace Express {
    interface Request {
      /** Set by optionalAdmin when a valid admin JWT is present. */
      adminAuth?: boolean
    }
  }
}
