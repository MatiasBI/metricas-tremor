import { promises as fs } from "fs"
import path from "path"

import { getMetricasData, type MetricasDatasetKey } from "../src/lib/metricas"

const DATASET_KEYS: MetricasDatasetKey[] = [
  "alumbrado",
  "ordenamiento",
  "paisaje-urbano",
]

const CACHE_FILE_NAMES: Record<MetricasDatasetKey, string> = {
  alumbrado: "metricas-alumbrado-dataset.json",
  ordenamiento: "metricas-ordenamiento-dataset.json",
  "paisaje-urbano": "metricas-paisaje-urbano-dataset.json",
}

const DEMO_FILE_NAMES: Record<MetricasDatasetKey, string> = {
  alumbrado: "alumbrado-dataset.json",
  ordenamiento: "ordenamiento-dataset.json",
  "paisaje-urbano": "paisaje-urbano-dataset.json",
}

async function waitForCacheSnapshot(cachePath: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const stats = await fs.stat(cachePath)

      if (stats.size > 0) {
        return
      }
    } catch {
      // Keep polling until the cache file is persisted.
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error(`El snapshot cacheado no estuvo listo a tiempo: ${cachePath}`)
}

async function ensureDemoSnapshot(datasetKey: MetricasDatasetKey) {
  await getMetricasData(datasetKey)

  const cachePath = path.join(
    process.cwd(),
    ".next",
    "cache",
    CACHE_FILE_NAMES[datasetKey]
  )
  const demoDir = path.join(process.cwd(), "src", "data", "metricas-demo")
  const demoPath = path.join(demoDir, DEMO_FILE_NAMES[datasetKey])

  await waitForCacheSnapshot(cachePath)
  await fs.mkdir(demoDir, { recursive: true })
  await fs.copyFile(cachePath, demoPath)

  console.log(`Demo snapshot generado: ${demoPath}`)
}

async function main() {
  for (const datasetKey of DATASET_KEYS) {
    console.log(`Preparando snapshot demo para ${datasetKey}...`)
    await ensureDemoSnapshot(datasetKey)
  }
}

main().catch((error) => {
  console.error("No se pudieron generar los snapshots demo")
  console.error(error)
  process.exit(1)
})
