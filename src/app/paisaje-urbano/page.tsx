import { getMetricasData, warmMetricasCache } from "../../lib/metricas"
import MetricasScreen from "../metricas/screen"

export const dynamic = "force-dynamic"

warmMetricasCache("paisaje-urbano")

async function getData() {
  try {
    return await getMetricasData("paisaje-urbano")
  } catch (error) {
    console.error(error)
    return null
  }
}

export default async function PaisajeUrbanoPage() {
  const data = await getData()

  return (
    <MetricasScreen
      data={data}
      apiPath="/api/paisaje-urbano"
      title="Ministerio de Espacio Público"
      subtitle="Subsecretaría de Mantenimiento - Dirección General de Paisaje Urbano"
      externalUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vRggT7omiTs6RRnJdWZfcm33wSk_UsdEB3ORObMtFcXXh6CXFgfHxra0WF-fFaFyw/pub?gid=267678007&single=true&output=csv"
      externalLabel="Ver mas en Power BI"
    />
  )
}
