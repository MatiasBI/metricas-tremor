import { NextRequest, NextResponse } from "next/server"
import { RouteData } from "./lib/routes"

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const protectedRoutes = Object.keys(RouteData).filter(
  (route: string | number) => !RouteData[route]?.authUnprotected
)
const publicRoutes = Object.keys(RouteData).filter(
  (route: string | number) => RouteData[route]?.authUnprotected
)
const noPermissionsRequiredRoutes = Object.keys(RouteData).filter(
  (route: string | number) => RouteData[route]?.alwaysAllowedMiddleware
)

// ============================================================================
// CSP DINÁMICO
// ============================================================================

const buildCSP = (backendUrl: string) => {
  let isDev = process.env.NODE_ENV === "development"

  return `
  default-src 'self';
  connect-src 'self' ${backendUrl} ${backendUrl}/api/v1/exports ${backendUrl}/api/v1/reactive-events;
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/css2 https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css;
  img-src 'self' blob: data: https://imagizer.imageshack.com https://raw.githubusercontent.com https://cdnjs.cloudflare.com https://*.tile.openstreetmap.org/ https://*.basemaps.cartocdn.com https://cdn.buenosaires.gob.ar;
  font-src 'self' https://fonts.googleapis.com/css2;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src data:;
  ${isDev ? "" : "upgrade-insecure-requests;"}
`
    .replace(/\n/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// ============================================================================
// HELPERS
// ============================================================================

const addSecurityHeaders = (response: NextResponse, backendUrl: string) => {
  response.headers.set("Content-Security-Policy", buildCSP(backendUrl))
  response.headers.set("X-Frame-Options", "DENY")
  return response
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const mainPath = `/${pathname.split("/")[1]}`
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ""

  // -------------------------------------------------------------------------
  // 0. SKIP RUTAS DE /api INTERNAS
  // -------------------------------------------------------------------------

  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/v1/")) {
    return NextResponse.next()
  }

  // -------------------------------------------------------------------------
  // 1. PROXY DINÁMICO PARA /api/v1/* (excepto reactive-events)
  // -------------------------------------------------------------------------
  if (
    pathname.startsWith("/api/v1/") &&
    !pathname.includes("reactive-events")
  ) {
    return backendUrl
      ? NextResponse.rewrite(new URL(pathname + search, backendUrl))
      : NextResponse.json(
          { error: "Backend URL not configured" },
          { status: 500 }
        )
  }

  // -------------------------------------------------------------------------
  // 2. LOGOUT
  // -------------------------------------------------------------------------
  if (mainPath === "/logout") {
    const response = NextResponse.redirect(new URL("/login", req.nextUrl))
    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")
    return addSecurityHeaders(response, backendUrl)
  }

  // -------------------------------------------------------------------------
  // 3. AUTENTICACIÓN Y AUTORIZACIÓN
  // -------------------------------------------------------------------------
  const isProtectedRoute = protectedRoutes.includes(mainPath)
  const isPublicRoute = publicRoutes.includes(mainPath)
  // const user = await getUser()

  // // Redirigir a /login si el usuario no esta autenticado
  // if (isProtectedRoute && !user) {
  //   return addSecurityHeaders(
  //     NextResponse.redirect(new URL("/login", req.nextUrl)),
  //     backendUrl
  //   )
  // }

  // // Redirect to / if the user is authenticated and trying to access public route
  // if (isPublicRoute && user && mainPath !== "/") {
  //   return addSecurityHeaders(
  //     NextResponse.redirect(new URL("/", req.nextUrl)),
  //     backendUrl
  //   )
  // }

  // // Redirigir a /no-access si el usuario no tiene ningun permiso de acceso
  // if (user && !user.accesses?.length && mainPath !== "/no-access") {
  //   return addSecurityHeaders(
  //     NextResponse.redirect(new URL("/no-access", req.nextUrl)),
  //     backendUrl
  //   )
  // }
  // // Redirigir a / si user no tiene permiso para acceder a la ruta
  // const isAllowedRoute = await isUserAllowed(mainPath)
  // if (!isAllowedRoute && !noPermissionsRequiredRoutes.includes(mainPath)) {
  //   return addSecurityHeaders(
  //     NextResponse.redirect(new URL("/", req.nextUrl)),
  //     backendUrl
  //   )
  // }

  // -------------------------------------------------------------------------
  // 4. RESPUESTA NORMAL CON HEADERS DE SEGURIDAD
  // -------------------------------------------------------------------------
  return addSecurityHeaders(NextResponse.next(), backendUrl)
}

// ============================================================================
// MATCHER CONFIG
// ============================================================================

export const config = {
  matcher: [
    // Rutas de la app (excluye assets estáticos)
    "/((?!_next/static|_next/image|.*\\.png$|favicon\\.ico|api/reactive-events|api/hello|api/search|api/claveveredear|api/loader-ofsc).*)",
  ],
  unstable_allowDynamic: ["./**"],
}
