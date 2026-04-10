import * as React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Métricas SSMAURB",
  description: "Reclamos de mantenimiento - Ciudad de Buenos Aires",
}

export default function MetricasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
