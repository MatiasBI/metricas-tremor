export type RouteGroups = "Administracion" | "Planificacion" | "Obras"

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

  "/metricas": {
    routeName: "Metricas",
    authUnprotected: true,
    alwaysAllowedMiddleware: true,
  },

  "/metricas/alumbrado": {
    routeName: "Metricas SSMAURB",
    authUnprotected: true,
    alwaysAllowedMiddleware: true,
  },

  "/metricas/ordenamiento": {
    routeName: "Metricas Ordenamiento",
    authUnprotected: true,
    alwaysAllowedMiddleware: true,
  },

  "/metricas/paisaje-urbano": {
    routeName: "Metricas Paisaje Urbano",
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
