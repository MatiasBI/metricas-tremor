import { promises as fs } from "fs"
import path from "path"
import { parse } from "csv-parse/sync"

import { BARRIOS_BY_COMUNA } from "./barrios"

type SpreadsheetRow = {
  "Fecha de ingreso"?: string
  "Estado resumen"?: string
  Comuna?: string
  "Categor\u00EDa"?: string
  "\u00C1rea"?: string
  Area?: string
  Prestacion?: string
  Prestaciones?: string
  "Prestaci\u00F3n"?: string
  Denegado1?: string
  MotivoDenegado?: string
  Ult_mes?: string
}

type EstadoClave = "resueltos" | "pendientes" | "denegados"

type NormalizedRow = {
  fecha: Date | null
  horaIngreso: string | null
  comuna: string | null
  barrio: string | null
  categoria: string | null
  prestacion: string | null
  motivoDenegado: string | null
  estado: EstadoClave | null
  ultMes: string
}

type DatasetSnapshot = {
  rows: NormalizedRow[]
  filtros: {
    years: string[]
    prestaciones: string[]
    categorias: string[]
    comunas: string[]
    barrios: string[]
  }
}

type PersistedDatasetSnapshot = {
  rows: Array<Omit<NormalizedRow, "fecha"> & { fecha: string | null }>
  filtros: DatasetSnapshot["filtros"]
}

type FiltrosMetricas = {
  years?: string[]
  months?: string[]
  prestacion?: string[]
  categoria?: string[]
  comuna?: string[]
  barrio?: string[]
}

export type MetricasExportRow = {
  fecha_ingreso: string
  hora_ingreso: string
  comuna: string
  barrio: string
  categoria: string
  prestacion: string
  estado: string
  motivo_denegado: string
  ult_mes: string
}

export type MetricasPayload = {
  resumen: {
    total: number
    resueltos: number
    pendientes: number
    denegados: number
    pct_resueltos: number
    pct_pendientes: number
    pct_denegados: number
    generado: string
  }
  por_comuna: Record<
    string,
    { total: number; resueltos: number; pendientes: number; denegados: number }
  >
  por_categoria: Array<{
    nombre: string
    pendiente: number
    denegado: number
    resuelto: number
    total: number
  }>
  por_mes: Array<{
    mes: string
    total: number
    resueltos: number
    pendientes: number
    denegados: number
  }>
  motivos_baja: Array<{ motivo: string; cantidad: number; porcentaje: number }>
  top_ingresos_prestacion: Array<{
    prestacion: string
    cantidad: number
    porcentaje: number
  }>
  top_pendientes_prestacion: Array<{
    prestacion: string
    cantidad: number
    porcentaje: number
  }>
  por_barrio: Array<{
    barrio: string
    cantidad: number
    porcentaje: number
  }>
  por_hora: Array<{
    hora: string
    cantidad: number
    porcentaje: number
  }>
  barrio_totales: Record<string, number>
  flujo_bajas: {
    resueltos: number
    pendientes: number
    denegados: number
    pct_resueltos: number
    pct_pendientes: number
    pct_denegados: number
  }
  filtros: {
    years: string[]
    prestaciones: string[]
    categorias: string[]
    comunas: string[]
    barrios: string[]
  }
}

export type MetricasDatasetKey =
  | "alumbrado"
  | "ordenamiento"
  | "paisaje-urbano"

type DatasetConfig = {
  csvUrl: string
  cacheFileName: string
  demoFileName: string
  areaFilter?: string
  prestacionesFiltro?: string[]
}

const CACHE_TTL_MS = 15 * 60 * 1000
const FETCH_TIMEOUT_MS = 120000
const DEMO_SNAPSHOT_DIR = path.join(process.cwd(), "src", "data", "metricas-demo")
const PRESTACIONES_FILTRO = [
  "COLUMNA DE ALUMBRADO: TAPA FALT Y/O DETE",
  "LUMINARIA: APAGADA",
  "LUMINARIA: ARTEFACTO ROTO Y/O FALTANTE",
  "LUMINARIA: ENCENDIDO INTERMITENTE",
  "LUMINARIA: ENCENDIDO PERMANENTE",
  "LUMINARIA: LIMPIEZA DE ARTEFACTO",
  "LUMINARIA: REFUERZO DE ALUMBRADO PUBLICO",
  "TOMA DE ENERGIA: FALTANTE O DETERIORADA",
]

const DATASET_CONFIGS: Record<MetricasDatasetKey, DatasetConfig> = {
  alumbrado: {
    csvUrl:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRAFSmOBLHn9wBeMebBvJpcZbwc7ajY0tlh9B4Cmjqud3rMUebB9LsRGsQbkYxC7w/pub?gid=1574405517&single=true&output=csv",
    cacheFileName: "metricas-alumbrado-dataset.json",
    demoFileName: "alumbrado-dataset.json",
    areaFilter: "Alumbrado",
    prestacionesFiltro: PRESTACIONES_FILTRO,
  },
  ordenamiento: {
    csvUrl:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfpGKLc6MCOt07jHQ9sfl3PI9BPKtE1TdYtvThPhND9OOsyuiX7pIvhzlEGMvADg/pub?gid=165046499&single=true&output=csv",
    cacheFileName: "metricas-ordenamiento-dataset.json",
    demoFileName: "ordenamiento-dataset.json",
  },
  "paisaje-urbano": {
    csvUrl:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRggT7omiTs6RRnJdWZfcm33wSk_UsdEB3ORObMtFcXXh6CXFgfHxra0WF-fFaFyw/pub?gid=267678007&single=true&output=csv",
    cacheFileName: "metricas-paisaje-urbano-dataset.json",
    demoFileName: "paisaje-urbano-dataset.json",
  },
}

const ESTADO_MAP: Record<string, EstadoClave | null> = {
  resuelto: "resueltos",
  resueltos: "resueltos",
  pendiente: "pendientes",
  pendientes: "pendientes",
  denegado: "denegados",
  denegados: "denegados",
}

const MESES_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
]

function normalizarEstado(estado: string | undefined): EstadoClave | null {
  if (!estado) return null
  return ESTADO_MAP[estado.trim().toLowerCase()] ?? null
}

function parseFechaLatam(fecha: string | undefined) {
  if (!fecha) return null
  const [dia, mes, anio] = fecha.split("/")
  if (!dia || !mes || !anio) return null

  const parsed = new Date(
    Date.UTC(Number(anio), Number(mes) - 1, Number(dia))
  )

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatearUltimaActualizacion(fecha: Date | null, ultMes?: string) {
  if (ultMes?.trim()) return ultMes.trim()
  if (!fecha) return "Sin datos"
  return `${MESES_ES[fecha.getUTCMonth()]} ${fecha.getUTCFullYear()}`
}

function createColumns(headers: string[]) {
  let denegadoCount = 0

  return headers.map((header) => {
    const trimmed = header.trim()

    if (trimmed === "Denegado") {
      denegadoCount += 1
      return denegadoCount === 2 ? "MotivoDenegado" : "DenegadoCantidad"
    }

    return trimmed
  })
}

function getDatasetCachePath(datasetKey: MetricasDatasetKey) {
  return path.join(
    process.cwd(),
    ".next",
    "cache",
    DATASET_CONFIGS[datasetKey].cacheFileName
  )
}

function hashString(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash
}

function resolveSyntheticBarrio(row: {
  comuna: string | null
  fecha: Date | null
  categoria: string | null
  prestacion: string | null
  motivoDenegado: string | null
}) {
  if (!row.comuna) {
    return null
  }

  const barrios = BARRIOS_BY_COMUNA[row.comuna]

  if (!barrios?.length) {
    return null
  }

  const fingerprint = [
    row.comuna,
    row.fecha?.toISOString() ?? "",
    row.categoria ?? "",
    row.prestacion ?? "",
    row.motivoDenegado ?? "",
  ].join("|")

  return barrios[hashString(fingerprint) % barrios.length]
}

function resolveSyntheticHoraIngreso(row: {
  fecha: Date | null
  comuna: string | null
  categoria: string | null
  prestacion: string | null
  motivoDenegado: string | null
}) {
  const fingerprint = [
    row.fecha?.toISOString() ?? "",
    row.comuna ?? "",
    row.categoria ?? "",
    row.prestacion ?? "",
    row.motivoDenegado ?? "",
  ].join("|")

  const hash = hashString(fingerprint)
  const weightedHourBuckets = [
    { hour: 7, weight: 2 },
    { hour: 8, weight: 5 },
    { hour: 9, weight: 11 },
    { hour: 10, weight: 15 },
    { hour: 11, weight: 13 },
    { hour: 12, weight: 9 },
    { hour: 13, weight: 6 },
    { hour: 14, weight: 8 },
    { hour: 15, weight: 10 },
    { hour: 16, weight: 9 },
    { hour: 17, weight: 6 },
    { hour: 18, weight: 3 },
    { hour: 19, weight: 2 },
    { hour: 20, weight: 1 },
    { hour: 21, weight: 1 },
  ]
  const totalWeight = weightedHourBuckets.reduce(
    (sum, bucket) => sum + bucket.weight,
    0
  )
  const target = hash % totalWeight
  let cumulative = 0
  let selectedHour = 10

  for (const bucket of weightedHourBuckets) {
    cumulative += bucket.weight
    if (target < cumulative) {
      selectedHour = bucket.hour
      break
    }
  }

  const minutes = String((hash >>> 3) % 60).padStart(2, "0")
  const hours = String(selectedHour).padStart(2, "0")

  return `${hours}:${minutes}`
}

function getDemoSnapshotPath(datasetKey: MetricasDatasetKey) {
  return path.join(DEMO_SNAPSHOT_DIR, DATASET_CONFIGS[datasetKey].demoFileName)
}

function buildSnapshot(
  rows: SpreadsheetRow[],
  config: DatasetConfig
): DatasetSnapshot {
  const normalizedRows = rows
    .filter((row) => {
      if (!config.areaFilter) return true
      return (row.Area ?? row["\u00C1rea"])?.trim() === config.areaFilter
    })
    .map((row) => {
      const comunaRaw = row.Comuna?.trim()
      const prestacion =
        row["Prestaci\u00F3n"]?.trim() ||
        row.Prestacion?.trim() ||
        row.Prestaciones?.trim() ||
        null

      return {
        fecha: parseFechaLatam(row["Fecha de ingreso"]),
        horaIngreso: null,
        comuna: comunaRaw ? `C${comunaRaw.padStart(2, "0")}` : null,
        barrio: null,
        categoria: row["Categor\u00EDa"]?.trim() || null,
        prestacion,
        motivoDenegado: row.MotivoDenegado?.trim() || row.Denegado1?.trim() || null,
        estado: normalizarEstado(row["Estado resumen"]),
        ultMes: row.Ult_mes?.trim() || "",
      }
    })
    .map((row) => ({
      ...row,
      horaIngreso: resolveSyntheticHoraIngreso(row),
      barrio: resolveSyntheticBarrio(row),
    }))

  const years = Array.from(
    new Set(
      normalizedRows
        .map((row) => row.fecha?.getUTCFullYear())
        .filter((year): year is number => typeof year === "number")
        .map(String)
    )
  ).sort()

  return {
    rows: normalizedRows,
    filtros: {
      years,
      prestaciones: (
        config.prestacionesFiltro
          ? config.prestacionesFiltro.filter((prestacion) =>
              normalizedRows.some((row) => row.prestacion === prestacion)
            )
          : Array.from(
              new Set(normalizedRows.map((row) => row.prestacion).filter(Boolean))
            ).sort()
      ) as string[],
      categorias: Array.from(
        new Set(normalizedRows.map((row) => row.categoria).filter(Boolean))
      ).sort() as string[],
      comunas: Array.from(
        new Set(normalizedRows.map((row) => row.comuna).filter(Boolean))
      ).sort() as string[],
      barrios: Array.from(
        new Set(normalizedRows.map((row) => row.barrio).filter(Boolean))
      ).sort() as string[],
    },
  }
}

function serializeSnapshot(snapshot: DatasetSnapshot): PersistedDatasetSnapshot {
  return {
    ...snapshot,
    rows: snapshot.rows.map((row) => ({
      ...row,
      fecha: row.fecha ? row.fecha.toISOString() : null,
    })),
  }
}

function deserializeSnapshot(
  snapshot: PersistedDatasetSnapshot
): DatasetSnapshot {
  const rows = snapshot.rows.map((row) => ({
    ...row,
    fecha: row.fecha ? new Date(row.fecha) : null,
    horaIngreso: resolveSyntheticHoraIngreso({
      fecha: row.fecha ? new Date(row.fecha) : null,
      comuna: row.comuna,
      categoria: row.categoria,
      prestacion: row.prestacion,
      motivoDenegado: row.motivoDenegado,
    }),
    barrio: row.barrio ?? resolveSyntheticBarrio({
      comuna: row.comuna,
      fecha: row.fecha ? new Date(row.fecha) : null,
      categoria: row.categoria,
      prestacion: row.prestacion,
      motivoDenegado: row.motivoDenegado,
    }),
  }))

  return {
    ...snapshot,
    rows,
    filtros: {
      ...snapshot.filtros,
      barrios:
        snapshot.filtros.barrios ??
        (Array.from(new Set(rows.map((row) => row.barrio).filter(Boolean))).sort() as string[]),
    },
  }
}

async function persistSnapshot(
  datasetKey: MetricasDatasetKey,
  snapshot: DatasetSnapshot
) {
  const datasetCachePath = getDatasetCachePath(datasetKey)
  await fs.mkdir(path.dirname(datasetCachePath), { recursive: true })
  await fs.writeFile(
    datasetCachePath,
    JSON.stringify(serializeSnapshot(snapshot)),
    "utf8"
  )
}

async function readPersistedSnapshot(datasetKey: MetricasDatasetKey) {
  const datasetCachePath = getDatasetCachePath(datasetKey)
  try {
    const raw = await fs.readFile(datasetCachePath, "utf8")
    return deserializeSnapshot(JSON.parse(raw) as PersistedDatasetSnapshot)
  } catch {
    return null
  }
}

async function readDemoSnapshot(datasetKey: MetricasDatasetKey) {
  const demoSnapshotPath = getDemoSnapshotPath(datasetKey)
  try {
    const raw = await fs.readFile(demoSnapshotPath, "utf8")
    return deserializeSnapshot(JSON.parse(raw) as PersistedDatasetSnapshot)
  } catch {
    return null
  }
}

export function crearResumenVacio(
  filtros: MetricasPayload["filtros"] = {
    years: [],
    prestaciones: [],
    categorias: [],
    comunas: [],
    barrios: [],
  }
): MetricasPayload {
  return {
    resumen: {
      total: 0,
      resueltos: 0,
      pendientes: 0,
      denegados: 0,
      pct_resueltos: 0,
      pct_pendientes: 0,
      pct_denegados: 0,
      generado: "Sin datos",
    },
    por_comuna: {},
    por_categoria: [],
    por_mes: [],
    motivos_baja: [],
    top_ingresos_prestacion: [],
    top_pendientes_prestacion: [],
    por_barrio: [],
    por_hora: [],
    barrio_totales: {},
    flujo_bajas: {
      resueltos: 0,
      pendientes: 0,
      denegados: 0,
      pct_resueltos: 0,
      pct_pendientes: 0,
      pct_denegados: 0,
    },
    filtros,
  }
}

const datasetCache = new Map<
  MetricasDatasetKey,
  {
    expiresAt: number
    snapshot: DatasetSnapshot
  }
>()

const datasetPromises = new Map<MetricasDatasetKey, Promise<DatasetSnapshot>>()

const responseCache = new Map<
  string,
  {
    expiresAt: number
    payload: MetricasPayload
  }
>()

async function fetchRemoteSnapshot(datasetKey: MetricasDatasetKey) {
  const res = await fetch(DATASET_CONFIGS[datasetKey].csvUrl, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })

  if (!res.ok) {
    throw new Error(`Error descargando CSV: ${res.status}`)
  }

  const csv = await res.text()
  const rows = parse(csv, {
    columns: createColumns,
    skip_empty_lines: true,
  }) as SpreadsheetRow[]

  return buildSnapshot(rows, DATASET_CONFIGS[datasetKey])
}

async function updateDatasetCacheFromRemote(datasetKey: MetricasDatasetKey) {
  const snapshot = await fetchRemoteSnapshot(datasetKey)

  datasetCache.set(datasetKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    snapshot,
  })

  for (const key of Array.from(responseCache.keys())) {
    if (key.startsWith(`${datasetKey}|`)) {
      responseCache.delete(key)
    }
  }
  void persistSnapshot(datasetKey, snapshot)

  return snapshot
}

async function getCachedDataset(datasetKey: MetricasDatasetKey) {
  const now = Date.now()
  const cachedDataset = datasetCache.get(datasetKey)

  if (cachedDataset && cachedDataset.expiresAt > now) {
    return cachedDataset.snapshot
  }

  const demoSnapshot = await readDemoSnapshot(datasetKey)

  if (demoSnapshot) {
    await persistSnapshot(datasetKey, demoSnapshot)

    datasetCache.set(datasetKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      snapshot: demoSnapshot,
    })

    return demoSnapshot
  }

  const persistedSnapshot = await readPersistedSnapshot(datasetKey)

  if (persistedSnapshot) {
    datasetCache.set(datasetKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      snapshot: persistedSnapshot,
    })

    if (!datasetPromises.has(datasetKey)) {
      const promise = updateDatasetCacheFromRemote(datasetKey).catch(
        () => persistedSnapshot
      )
      datasetPromises.set(datasetKey, promise)
      void promise.finally(() => {
        datasetPromises.delete(datasetKey)
      })
    }

    return persistedSnapshot
  }

  const pendingPromise = datasetPromises.get(datasetKey)

  if (pendingPromise) {
    return pendingPromise
  }

  const promise = (async () => {
    try {
      return await updateDatasetCacheFromRemote(datasetKey)
    } catch (error) {
      const fallbackSnapshot = datasetCache.get(datasetKey)

      if (fallbackSnapshot) {
        return fallbackSnapshot.snapshot
      }

      throw error
    }
  })()

  datasetPromises.set(datasetKey, promise)

  try {
    return await promise
  } finally {
    datasetPromises.delete(datasetKey)
  }
}

export function warmMetricasCache(datasetKey: MetricasDatasetKey = "alumbrado") {
  void getCachedDataset(datasetKey).catch((error) => {
    console.error("Error warming metricas cache", error)
  })
}

function buildCacheKey(datasetKey: MetricasDatasetKey, filters: FiltrosMetricas) {
  return [
    datasetKey,
    filters.years?.join(",") || "all",
    filters.months?.join(",") || "all",
    filters.prestacion?.join(",") || "all",
    filters.categoria?.join(",") || "all",
    filters.comuna?.join(",") || "all",
    filters.barrio?.join(",") || "all",
  ].join("|")
}

function filterDatasetRows(
  rows: NormalizedRow[],
  filters: FiltrosMetricas = {}
) {
  const selectedPrestaciones = new Set(filters.prestacion ?? [])
  const selectedCategorias = new Set(filters.categoria ?? [])
  const selectedComunas = new Set(filters.comuna ?? [])
  const selectedBarrios = new Set(filters.barrio ?? [])
  const selectedYears = new Set(filters.years ?? [])
  const selectedMonths = new Set(filters.months ?? [])
  const hasPeriodFilter = selectedYears.size > 0 || selectedMonths.size > 0

  return rows
    .filter((row) => {
      const fecha = row.fecha
      if (!fecha) return false
      if (!hasPeriodFilter) return true

      const year = String(fecha.getUTCFullYear())
      const monthKey = `${year}-${String(fecha.getUTCMonth() + 1).padStart(2, "0")}`

      return selectedYears.has(year) || selectedMonths.has(monthKey)
    })
    .filter((row) =>
      selectedPrestaciones.size
        ? selectedPrestaciones.has(row.prestacion ?? "")
        : true
    )
    .filter((row) =>
      selectedCategorias.size ? selectedCategorias.has(row.categoria ?? "") : true
    )
    .filter((row) =>
      selectedComunas.size ? selectedComunas.has(row.comuna ?? "") : true
    )
    .filter((row) =>
      selectedBarrios.size ? selectedBarrios.has(row.barrio ?? "") : true
    )
    .sort((a, b) => {
      const timeA = a.fecha?.getTime() ?? 0
      const timeB = b.fecha?.getTime() ?? 0
      return timeA - timeB
    })
}

function formatExportDate(date: Date | null) {
  if (!date) {
    return ""
  }

  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const year = String(date.getUTCFullYear())

  return `${day}/${month}/${year}`
}

function formatExportEstado(value: EstadoClave | null) {
  if (value === "resueltos") return "Resuelto"
  if (value === "pendientes") return "Pendiente"
  if (value === "denegados") return "Denegado"
  return ""
}

function formatHoraBucket(value: string | null) {
  if (!value) {
    return null
  }

  const [hours] = value.split(":")
  if (!hours) {
    return null
  }

  return `${hours.padStart(2, "0")}:00`
}

export async function getMetricasData(
  datasetKey: MetricasDatasetKey = "alumbrado",
  filters: FiltrosMetricas = {}
): Promise<MetricasPayload> {
  const cacheKey = buildCacheKey(datasetKey, filters)
  const now = Date.now()
  const cachedResponse = responseCache.get(cacheKey)

  if (cachedResponse && cachedResponse.expiresAt > now) {
    return cachedResponse.payload
  }

  const dataset = await getCachedDataset(datasetKey)
  const rowsFiltradas = filterDatasetRows(dataset.rows, filters)

  if (!rowsFiltradas.length) {
    return crearResumenVacio({
      years: dataset.filtros.years,
      prestaciones: dataset.filtros.prestaciones,
      categorias: dataset.filtros.categorias,
      comunas: dataset.filtros.comunas,
      barrios: dataset.filtros.barrios,
    })
  }

  const porComuna: Record<
    string,
    { total: number; resueltos: number; pendientes: number; denegados: number }
  > = {}
  const porCategoriaMap: Record<
    string,
    { pendiente: number; denegado: number; resuelto: number }
  > = {}
  const porMesMap: Record<
    string,
    { total: number; resueltos: number; pendientes: number; denegados: number }
  > = {}
  const motivosBajaMap: Record<string, number> = {}
  const ingresosPrestacionMap: Record<string, number> = {}
  const pendientesPrestacionMap: Record<string, number> = {}
  const porBarrioMap: Record<string, number> = {}
  const porHoraMap: Record<string, number> = {}

  let total = 0
  let resueltos = 0
  let pendientes = 0
  let denegados = 0
  let ultimaFecha: Date | null = null
  let ultMes = ""

  for (const row of rowsFiltradas) {
    const fecha = row.fecha
    const comuna = row.comuna
    const categoria = row.categoria
    const prestacion = row.prestacion
    const barrio = row.barrio
    const horaBucket = formatHoraBucket(row.horaIngreso)
    const motivoDenegado = row.motivoDenegado
    const estado = row.estado

    total += 1

    if (fecha && (!ultimaFecha || fecha > ultimaFecha)) {
      ultimaFecha = fecha
    }

    if (row.ultMes) {
      ultMes = row.ultMes
    }

    if (estado === "resueltos") resueltos += 1
    if (estado === "pendientes") pendientes += 1
    if (estado === "denegados") denegados += 1

    if (estado === "denegados" && motivoDenegado) {
      motivosBajaMap[motivoDenegado] = (motivosBajaMap[motivoDenegado] ?? 0) + 1
    }

    if (prestacion) {
      ingresosPrestacionMap[prestacion] =
        (ingresosPrestacionMap[prestacion] ?? 0) + 1
    }

    if (estado === "pendientes" && prestacion) {
      pendientesPrestacionMap[prestacion] =
        (pendientesPrestacionMap[prestacion] ?? 0) + 1
    }

    if (barrio) {
      porBarrioMap[barrio] = (porBarrioMap[barrio] ?? 0) + 1
    }

    if (horaBucket) {
      porHoraMap[horaBucket] = (porHoraMap[horaBucket] ?? 0) + 1
    }

    if (comuna) {
      porComuna[comuna] ??= {
        total: 0,
        resueltos: 0,
        pendientes: 0,
        denegados: 0,
      }
      porComuna[comuna].total += 1
      if (estado) {
        porComuna[comuna][estado] += 1
      }
    }

    if (categoria) {
      porCategoriaMap[categoria] ??= {
        pendiente: 0,
        denegado: 0,
        resuelto: 0,
      }
      if (estado === "resueltos") porCategoriaMap[categoria].resuelto += 1
      if (estado === "pendientes") porCategoriaMap[categoria].pendiente += 1
      if (estado === "denegados") porCategoriaMap[categoria].denegado += 1
    }

    if (fecha) {
      const mes = `${fecha.getUTCFullYear()}-${String(
        fecha.getUTCMonth() + 1
      ).padStart(2, "0")}`
      porMesMap[mes] ??= {
        total: 0,
        resueltos: 0,
        pendientes: 0,
        denegados: 0,
      }
      porMesMap[mes].total += 1
      if (estado) {
        porMesMap[mes][estado] += 1
      }
    }
  }

  const payload: MetricasPayload = {
    resumen: {
      total,
      resueltos,
      pendientes,
      denegados,
      pct_resueltos: total ? +((resueltos / total) * 100).toFixed(1) : 0,
      pct_pendientes: total ? +((pendientes / total) * 100).toFixed(1) : 0,
      pct_denegados: total ? +((denegados / total) * 100).toFixed(1) : 0,
      generado: formatearUltimaActualizacion(ultimaFecha, ultMes),
    },
    por_comuna: porComuna,
    por_categoria: Object.entries(porCategoriaMap)
      .map(([nombre, valores]) => ({
        nombre,
        ...valores,
        total: valores.pendiente + valores.denegado + valores.resuelto,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10),
    por_mes: Object.entries(porMesMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, valores]) => ({ mes, ...valores })),
    motivos_baja: Object.entries(motivosBajaMap)
      .map(([motivo, cantidad]) => ({
        motivo,
        cantidad,
        porcentaje: denegados
          ? +((cantidad / denegados) * 100).toFixed(1)
          : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 6),
    top_ingresos_prestacion: Object.entries(ingresosPrestacionMap)
      .map(([prestacion, cantidad]) => ({
        prestacion,
        cantidad,
        porcentaje: total ? +((cantidad / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5),
    top_pendientes_prestacion: Object.entries(pendientesPrestacionMap)
      .map(([prestacion, cantidad]) => ({
        prestacion,
        cantidad,
        porcentaje: pendientes ? +((cantidad / pendientes) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5),
    por_barrio: Object.entries(porBarrioMap)
      .map(([barrio, cantidad]) => ({
        barrio,
        cantidad,
        porcentaje: total ? +((cantidad / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8),
    por_hora: Object.entries(porHoraMap)
      .map(([hora, cantidad]) => ({
        hora,
        cantidad,
        porcentaje: total ? +((cantidad / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => a.hora.localeCompare(b.hora)),
    barrio_totales: porBarrioMap,
    flujo_bajas: {
      resueltos,
      pendientes,
      denegados,
      pct_resueltos: total ? +((resueltos / total) * 100).toFixed(1) : 0,
      pct_pendientes: total ? +((pendientes / total) * 100).toFixed(1) : 0,
      pct_denegados: total ? +((denegados / total) * 100).toFixed(1) : 0,
    },
    filtros: {
      years: dataset.filtros.years,
      prestaciones: dataset.filtros.prestaciones,
      categorias: dataset.filtros.categorias,
      comunas: dataset.filtros.comunas,
      barrios: dataset.filtros.barrios,
    },
  }

  responseCache.set(cacheKey, {
    expiresAt: now + CACHE_TTL_MS,
    payload,
  })

  return payload
}

export async function getMetricasExportRows(
  datasetKey: MetricasDatasetKey = "alumbrado",
  filters: FiltrosMetricas = {}
): Promise<MetricasExportRow[]> {
  const dataset = await getCachedDataset(datasetKey)
  const rowsFiltradas = filterDatasetRows(dataset.rows, filters)

  return rowsFiltradas.map((row) => ({
    fecha_ingreso: formatExportDate(row.fecha),
    hora_ingreso: row.horaIngreso ?? "",
    comuna: row.comuna ?? "",
    barrio: row.barrio ?? "",
    categoria: row.categoria ?? "",
    prestacion: row.prestacion ?? "",
    estado: formatExportEstado(row.estado),
    motivo_denegado: row.motivoDenegado ?? "",
    ult_mes: row.ultMes ?? "",
  }))
}
