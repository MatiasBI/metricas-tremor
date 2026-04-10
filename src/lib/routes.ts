export type RouteGroups = "AdministraciÃ³n" | "PlanificaciÃ³n" | "Obras"

export type RouteDataType = {
  group?: RouteGroups
  authUnprotected?: boolean
  alwaysAllowedMiddleware?: boolean
  routeName?: string
  shortName?: string
  routeDescription?: string
  Icon?: unknown
  subRoutes?: any
}

export const RouteData: Record<string, RouteDataType> = {
  "/": {
    routeName: "Home",
    alwaysAllowedMiddleware: true,
  },

  "/home": {
    routeName: "Home",
    authUnprotected: true,
    alwaysAllowedMiddleware: true,
  },

  "/mantenimiento": {
    routeName: "MÃ©tricas SSMAURB",
    authUnprotected: true,
    alwaysAllowedMiddleware: true,
  },

  "/ordenamiento": {
    routeName: "MÃ©tricas Ordenamiento",
    authUnprotected: true,
    alwaysAllowedMiddleware: true,
  },

  "/paisaje-urbano": {
    routeName: "MÃ©tricas Paisaje Urbano",
    authUnprotected: true,
    alwaysAllowedMiddleware: true,
  },

  "/login": {
    authUnprotected: true,
    alwaysAllowedMiddleware: true,
  },

  "/logout": {
    alwaysAllowedMiddleware: true,
  },
}
