import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// This middleware runs before every request that matches the `matcher`
// pattern at the bottom of this file. We use it to protect pages that
// require the user to be logged in.
//
// If the user has no session, we redirect them to /login.
// Otherwise, we let the request continue as normal.

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/projects")

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin)

    // Remember where the user was trying to go, so we can send them
    // back there after they log in.
    loginUrl.searchParams.set("callbackUrl", pathname)

    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

// Only run this middleware on the routes below.
// Running it on every single request (including static assets) would
// add unnecessary overhead.
export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*"],
}
