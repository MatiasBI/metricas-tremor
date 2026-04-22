"use client"

import { useEffect, useMemo, useState } from "react"

import formatComuna from "./formatComuna"

type ComunaMetric = {
  total: number
  resueltos: number
  pendientes: number
  denegados: number
}

type Props = {
  data: Record<string, ComunaMetric>
  selectedComunas?: string[]
  onToggleComuna?: (comuna: string) => void
}

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

const WIDTH = 420
const HEIGHT = 420
const PADDING = 18

function getColor(value: number, max: number) {
  if (max <= 0) {
    return "#f1f8fd"
  }

  const t = Math.max(0, Math.min(1, value / max))
  const emphasized = Math.pow(t, 0.72)
  const light = [241, 248, 253]
  const mid = [143, 215, 248]
  const dark = [0, 158, 217]

  const start = emphasized < 0.55 ? light : mid
  const end = emphasized < 0.55 ? mid : dark
  const localT =
    emphasized < 0.55 ? emphasized / 0.55 : (emphasized - 0.55) / 0.45

  return `rgb(${start
    .map((channel, index) =>
      Math.round(channel + (end[index] - channel) * localT)
    )
    .join(",")})`
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

export default function ComunasHeatmap({
  data,
  selectedComunas = [],
  onToggleComuna,
}: Props) {
  const [barriosGeojson, setBarriosGeojson] = useState<GeoJson | null>(null)
  const [comunasGeojson, setComunasGeojson] = useState<GeoJson | null>(null)
  const [hoveredBarrio, setHoveredBarrio] = useState<{
    barrio: string
    comuna: string
  } | null>(null)

  useEffect(() => {
    fetch("/maps/caba-barrios.geojson")
      .then((response) => response.json())
      .then(setBarriosGeojson)

    fetch("/maps/caba-comunas.geojson")
      .then((response) => response.json())
      .then(setComunasGeojson)
  }, [])

  const bounds = useMemo(
    () => (barriosGeojson ? getFeatureBounds(barriosGeojson.features) : null),
    [barriosGeojson]
  )

  const maxValue = useMemo(
    () => Math.max(...Object.values(data).map((value) => value.total), 0),
    [data]
  )

  const hoveredTotal = hoveredBarrio ? data[hoveredBarrio.comuna]?.total ?? 0 : 0

  return (
    <div className="w-full overflow-hidden rounded-[24px] border border-[#dbe5ef] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] shadow-[0_18px_36px_rgba(148,163,184,0.16)] lg:max-w-[42rem]">
      <div className="border-b border-[#e5edf4] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] px-5 py-4">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7f93a8]">
          Cobertura territorial
        </p>
        <h3 className="text-base font-semibold text-[#233546] sm:text-lg">
          Ingresos por comuna y barrio
        </h3>
      </div>

      <div className="px-4 pb-5 pt-4 sm:px-5">
        <div className="rounded-[22px] bg-[linear-gradient(180deg,#f9fcff_0%,#f1f8fd_100%)] px-3 py-4 sm:px-4">
          {barriosGeojson && comunasGeojson && bounds ? (
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="mx-auto h-auto w-full max-w-[400px] sm:max-w-[420px]"
              role="img"
              aria-label="Mapa de calor de ingresos por comuna y barrio"
            >
              {barriosGeojson.features.map((feature) => {
                const comunaValue = feature.properties.comuna
                const barrioValue = feature.properties.nombre
                const comuna = `C${String(comunaValue).padStart(2, "0")}`
                const barrio = String(barrioValue)
                const comunaLabel = formatComuna(comuna)
                const total = data[comuna]?.total ?? 0
                const fill = getColor(total, maxValue)
                const path = geometryToPath(feature, bounds)
                const isHovered = hoveredBarrio?.barrio === barrio
                const isSelected = selectedComunas.includes(comuna)

                return (
                  <path
                    key={`${comuna}-${barrio}`}
                    d={path}
                    fill={fill}
                    stroke={isSelected ? "#007fb0" : "#d6e5ef"}
                    strokeWidth={isHovered ? 2 : 0.95}
                    style={{
                      cursor: onToggleComuna ? "pointer" : "default",
                      transition:
                        "fill 160ms ease, stroke-width 160ms ease, stroke 160ms ease",
                      filter: isHovered
                        ? "drop-shadow(0 6px 10px rgba(15, 23, 42, 0.12))"
                        : "none",
                    }}
                    onMouseEnter={() => setHoveredBarrio({ barrio, comuna })}
                    onMouseLeave={() => setHoveredBarrio(null)}
                    onClick={() => onToggleComuna?.(comuna)}
                  >
                    <title>{`${barrio} (${comunaLabel}): ${total.toLocaleString("es-AR")} ingresos`}</title>
                  </path>
                )
              })}

              {comunasGeojson.features.map((feature) => {
                const comuna = `C${String(feature.properties.COMUNAS).padStart(2, "0")}`
                const path = geometryToPath(feature, bounds)
                const isSelected = selectedComunas.includes(comuna)

                return (
                  <path
                    key={`outline-${comuna}`}
                    d={path}
                    fill="none"
                    stroke={isSelected ? "#005f86" : "#8fa2b4"}
                    strokeWidth={isSelected ? 2.4 : 1.35}
                    style={{
                      pointerEvents: "none",
                      transition: "stroke-width 160ms ease, stroke 160ms ease",
                    }}
                  />
                )
              })}
            </svg>
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-slate-500 sm:h-[420px]">
              Cargando mapa...
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 sm:gap-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:text-[11px]">
            Menos
          </span>
          <div
            className="h-3 flex-1 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgb(241,248,253) 0%, rgb(143,215,248) 52%, rgb(0,158,217) 100%)",
            }}
          />
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:text-[11px]">
            Mas
          </span>
        </div>

        <p className="mt-3 min-h-4 text-xs text-slate-600">
          {hoveredBarrio
            ? `${hoveredBarrio.barrio} (${formatComuna(hoveredBarrio.comuna)}): ${hoveredTotal.toLocaleString("es-AR")} ingresos`
            : "Pasa el mouse por un barrio para ver sus ingresos por comuna."}
        </p>
      </div>
    </div>
  )
}
