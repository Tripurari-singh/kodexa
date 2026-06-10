import { handlers } from "@/lib/auth"

// NextAuth needs to handle several routes under /api/auth/, such as:
//   /api/auth/signin
//   /api/auth/signout
//   /api/auth/callback/github
//   /api/auth/callback/google
//   /api/auth/session
//
// Instead of writing each one by hand, we just re-export the GET and POST
// handlers that NextAuth generates for us. This single file handles all
// of those routes automatically.

export const { GET, POST } = handlers
