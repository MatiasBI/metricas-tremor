import { getMetricasData, warmMetricasCache } from "../../lib/metricas"
import MetricasScreen from "../metricas/screen"

export const dynamic = "force-dynamic"

warmMetricasCache()

async function getData() {
  try {
    return await getMetricasData("alumbrado")
  } catch (error) {
    console.error(error)
    return null
  }
}

export default async function MantenimientoPage() {
  const data = await getData()
  return <MetricasScreen data={data} apiPath="/api/metricas" />
}
