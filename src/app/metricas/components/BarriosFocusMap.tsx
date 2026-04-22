"use client"

import { useEffect, useMemo, useState } from "react"

import { getBarriosForComuna } from "../../../lib/barrios"
import formatComuna from "./formatComuna"

type GeoFeature = {
  properties: Record<string, string | number>
  geometry: {
    type: "Polygon" | "MultiPolygon"
    coordinates: number[][][] | number[][][][]
  }
}

type GeoJson = {
  features: GeoFeature[]
}

type Bounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

type Props = {
  activeComuna: string | null
  barrioTotales: Record<string, number>
  selectedBarrios: string[]
  onToggleBarrio: (barrio: string) => void
}

const WIDTH = 420
const HEIGHT = 420
const PADDING = 22

function normalizeBarrioName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(la|las|el|los)\s+/i, "")
    .trim()
    .toLowerCase()
}

function getFeatureBounds(features: GeoFeature[]): Bounds {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const feature of features) {
    const polygons =
      feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates as number[][][]]
        : (feature.geometry.coordinates as number[][][][])

    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (const [x, y] of ring) {
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
        }
      }
    }
  }

  return { minX, minY, maxX, maxY }
}

function projectPoint(x: number, y: number, bounds: Bounds) {
  const usableWidth = WIDTH - PADDING * 2
  const usableHeight = HEIGHT - PADDING * 2
  const scale = Math.min(
    usableWidth / (bounds.maxX - bounds.minX),
    usableHeight / (bounds.maxY - bounds.minY)
  )

  const offsetX =
    (WIDTH - (bounds.maxX - bounds.minX) * scale) / 2 - bounds.minX * scale
  const offsetY =
    (HEIGHT - (bounds.maxY - bounds.minY) * scale) / 2 + bounds.maxY * scale

  return {
    x: x * scale + offsetX,
    y: -y * scale + offsetY,
  }
}

function ringToPath(ring: number[][], bounds: Bounds) {
  return ring
    .map(([x, y], index) => {
      const point = projectPoint(x, y, bounds)
      return `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    })
    .join(" ")
}

function geometryToPath(feature: GeoFeature, bounds: Bounds) {
  const polygons =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates as number[][][]]
      : (feature.geometry.coordinates as number[][][][])

  return polygons
    .map((polygon) =>
      polygon.map((ring) => `${ringToPath(ring, bounds)} Z`).join(" ")
    )
    .join(" ")
}

export default function BarriosFocusMap({
  activeComuna,
  barrioTotales,
  selectedBarrios,
  onToggleBarrio,
}: Props) {
  const [barriosGeojson, setBarriosGeojson] = useState<GeoJson | null>(null)
  const [hoveredBarrio, setHoveredBarrio] = useState<string | null>(null)

  useEffect(() => {
    fetch("/maps/caba-barrios.geojson")
      .then((response) => response.json())
      .then(setBarriosGeojson)
  }, [])

  const activeFeatures = useMemo(() => {
    if (!barriosGeojson || !activeComuna) {
      return []
    }

    const comunaNumber = Number(activeComuna.replace(/^C0?/, ""))

    return barriosGeojson.features.filter(
      (feature) => Number(feature.properties.comuna) === comunaNumber
    )
  }, [activeComuna, barriosGeojson])

  const bounds = useMemo(
    () => (activeFeatures.length ? getFeatureBounds(activeFeatures) : null),
    [activeFeatures]
  )

  const availableBarrios = activeComuna ? getBarriosForComuna(activeComuna) : []
  const canonicalBarrios = useMemo(
    () =>
      new Map(
        availableBarrios.map((barrio) => [normalizeBarrioName(barrio), barrio])
      ),
    [availableBarrios]
  )
  const barrioLabels = useMemo(() => {
    const labels = new Map<string, string>()

    for (const feature of activeFeatures) {
      const rawBarrio = String(feature.properties.nombre)
      const canonicalBarrio =
        canonicalBarrios.get(normalizeBarrioName(rawBarrio)) ?? rawBarrio

      labels.set(canonicalBarrio, rawBarrio)
    }

    return labels
  }, [activeFeatures, canonicalBarrios])
  const selectedBarriosTotal = selectedBarrios.reduce(
    (sum, barrio) => sum + (barrioTotales[barrio] ?? 0),
    0
  )

  return (
    <div className="metricas-surface-card">
      <div className="mb-4 flex flex-col gap-2">
        <p className="metricas-eyebrow mb-0">Zoom barrial</p>
        <h3 className="text-base font-semibold text-[#233546] sm:text-lg">
          {activeComuna
            ? `Barrios de ${formatComuna(activeComuna)}`
            : "Seleccion de barrios por comuna"}
        </h3>
        {!activeComuna ? (
          <p className="text-sm leading-6 text-slate-500">
            Selecciona una comuna en el mapa general para ver su poligono ampliado y elegir barrios.
          </p>
        ) : null}
      </div>

      {activeComuna && activeFeatures.length && bounds ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900">
              {formatComuna(activeComuna)}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              {availableBarrios.length} barrios disponibles
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              {selectedBarrios.length} seleccionados
            </span>
            {selectedBarrios.length ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                {selectedBarriosTotal.toLocaleString("es-AR")} ingresos seleccionados
              </span>
            ) : null}
          </div>

          <div className="rounded-[22px] bg-[linear-gradient(180deg,#f9fcff_0%,#f1f8fd_100%)] px-3 py-4 sm:px-4">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="mx-auto h-auto w-full max-w-[400px] sm:max-w-[420px]"
              role="img"
              aria-label={`Mapa ampliado de barrios de ${formatComuna(activeComuna)}`}
            >
              {activeFeatures.map((feature) => {
                const rawBarrio = String(feature.properties.nombre)
                const barrio =
                  canonicalBarrios.get(normalizeBarrioName(rawBarrio)) ?? rawBarrio
                const barrioLabel = barrioLabels.get(barrio) ?? rawBarrio
                const total = barrioTotales[barrio] ?? 0
                const isSelected = selectedBarrios.includes(barrio)
                const isHovered = hoveredBarrio === barrio

                return (
                  <path
                    key={barrio}
                    d={geometryToPath(feature, bounds)}
                    fill={isSelected ? "#8fd7f8" : "#f7fbff"}
                    stroke={isSelected ? "#007fb0" : "#8fa2b4"}
                    strokeWidth={isHovered || isSelected ? 2.6 : 1.2}
                    style={{
                      cursor: "pointer",
                      transition:
                        "fill 160ms ease, stroke-width 160ms ease, stroke 160ms ease",
                      filter: isHovered
                        ? "drop-shadow(0 8px 12px rgba(15, 23, 42, 0.12))"
                        : "none",
                    }}
                    onMouseEnter={() => setHoveredBarrio(barrio)}
                    onMouseLeave={() => setHoveredBarrio(null)}
                    onClick={() => onToggleBarrio(barrio)}
                  >
                    <title>{`${barrioLabel}: ${total.toLocaleString("es-AR")} ingresos${isSelected ? " (seleccionado)" : ""}`}</title>
                  </path>
                )
              })}
            </svg>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {availableBarrios.map((barrio) => {
              const barrioLabel = barrioLabels.get(barrio) ?? barrio
              const total = barrioTotales[barrio] ?? 0
              const isSelected = selectedBarrios.includes(barrio)

              return (
                <button
                  key={barrio}
                  type="button"
                  onClick={() => onToggleBarrio(barrio)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? "border-sky-400 bg-sky-100 text-sky-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                  }`}
                >
                  {barrioLabel} · {total.toLocaleString("es-AR")}
                </button>
              )
            })}
          </div>

          <p className="mt-3 min-h-4 text-xs text-slate-600">
            {hoveredBarrio
              ? `${barrioLabels.get(hoveredBarrio) ?? hoveredBarrio} en ${formatComuna(activeComuna)}: ${(barrioTotales[hoveredBarrio] ?? 0).toLocaleString("es-AR")} ingresos`
              : "Pasa el mouse por un barrio o usa las chips para ajustar el filtro."}
          </p>
        </>
      ) : (
        <div className="flex min-h-[320px] items-center justify-center rounded-[22px] bg-[linear-gradient(180deg,#f9fcff_0%,#f1f8fd_100%)] px-6 py-8 text-center text-sm leading-6 text-slate-500">
          Selecciona una comuna en el mapa general para ampliar su poligono y elegir barrios.
        </div>
      )}
    </div>
  )
}
