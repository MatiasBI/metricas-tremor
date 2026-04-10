import { getMetricasData, warmMetricasCache } from "../../lib/metricas"
import MetricasScreen from "../metricas/screen"

export const dynamic = "force-dynamic"

warmMetricasCache("ordenamiento")

async function getData() {
  try {
    return await getMetricasData("ordenamiento")
  } catch (error) {
    console.error(error)
    return null
  }
}

export default async function OrdenamientoPage() {
  const data = await getData()

  return (
    <MetricasScreen
      data={data}
      apiPath="/api/ordenamiento"
      title="Ministerio de Espacio Público"
      subtitle="Subsecretaría de Mantenimiento - Dirección General de Ordenamiento"
      externalUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vTfpGKLc6MCOt07jHQ9sfl3PI9BPKtE1TdYtvThPhND9OOsyuiX7pIvhzlEGMvADg/pub?gid=165046499&single=true&output=csv"
      externalLabel="Ver mas en Power BI"
    />
  )
}
