/**
 * Script de procesamiento mensual del CSV de SSMAURB
 * Uso: npx tsx scripts/process-metricas.ts
 *
 * Requiere que el CSV esté en: data/SSMAURB.csv
 * Genera: public/data/metricas.json
 */

import fs from "fs"
import path from "path"
import Papa from "papaparse"

const CSV_PATH = path.join(process.cwd(), "data", "SSMAURB.csv")
const OUT_PATH = path.join(process.cwd(), "public", "data", "metricas.json")

const ORDEN_MESES = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
]

console.log("📂 Leyendo CSV:", CSV_PATH)
const csv = fs.readFileSync(CSV_PATH, "utf-8")
const { data: rows } = Papa.parse<Record<string, string>>(csv, {
  header: true,
  skipEmptyLines: true,
})

console.log("📊 Filas leídas:", rows.length)

// KPIs globales
const total = rows.length
const resueltos = rows.filter(r => r["Estado resumen"] === "Resuelto").length
const pendientes = rows.filter(r => r["Estado resumen"] === "Pendiente").length
const denegados = rows.filter(r => r["Estado resumen"] === "Denegado").length

// Por comuna
const porComuna: Record<string, { total: number; resueltos: number; pendientes: number; denegados: number }> = {}
rows.forEach(r => {
  const c = r["ArE"]
  if (!c || c === "C16") return
  if (!porComuna[c]) porComuna[c] = { total: 0, resueltos: 0, pendientes: 0, denegados: 0 }
  porComuna[c].total++
  if (r["Estado resumen"] === "Resuelto") porComuna[c].resueltos++
  if (r["Estado resumen"] === "Pendiente") porComuna[c].pendientes++
  if (r["Estado resumen"] === "Denegado") porComuna[c].denegados++
})

// Por categoría
const porCatMap: Record<string, { pendiente: number; denegado: number; resuelto: number }> = {}
rows.forEach(r => {
  const cat = r["Categoría"]
  if (!cat) return
  if (!porCatMap[cat]) porCatMap[cat] = { pendiente: 0, denegado: 0, resuelto: 0 }
  if (r["Estado resumen"] === "Resuelto") porCatMap[cat].resuelto++
  if (r["Estado resumen"] === "Pendiente") porCatMap[cat].pendiente++
  if (r["Estado resumen"] === "Denegado") porCatMap[cat].denegado++
})

const porCategoria = Object.entries(porCatMap)
  .map(([nombre, v]) => ({ nombre, ...v, total: v.pendiente + v.denegado + v.resuelto }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 12)

// Por mes
const porMesMap: Record<string, { total: number; resueltos: number; pendientes: number; denegados: number }> = {}
rows.forEach(r => {
  const anio = r["Año de ingreso"]
  const mes = r["Mes de ingreso"]
  if (!anio || !mes) return
  const idx = ORDEN_MESES.indexOf(mes.toLowerCase()) + 1
  if (!idx) return
  const key = `${anio}-${String(idx).padStart(2, "0")}`
  if (!porMesMap[key]) porMesMap[key] = { total: 0, resueltos: 0, pendientes: 0, denegados: 0 }
  porMesMap[key].total++
  if (r["Estado resumen"] === "Resuelto") porMesMap[key].resueltos++
  if (r["Estado resumen"] === "Pendiente") porMesMap[key].pendientes++
  if (r["Estado resumen"] === "Denegado") porMesMap[key].denegados++
})

const porMes = Object.entries(porMesMap)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([mes, v]) => ({ mes, ...v }))

// Determinar último mes
const ultMes = rows[0]?.["Ult_mes"] || new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })

const output = {
  resumen: {
    total, resueltos, pendientes, denegados,
    pct_resueltos: +((resueltos / total) * 100).toFixed(1),
    pct_pendientes: +((pendientes / total) * 100).toFixed(1),
    pct_denegados: +((denegados / total) * 100).toFixed(1),
    generado: ultMes,
  },
  por_comuna: porComuna,
  por_categoria: porCategoria,
  por_mes: porMes,
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2))
console.log("✅ Generado:", OUT_PATH)
console.log(`   Total: ${total} | Resueltos: ${resueltos} | Pendientes: ${pendientes} | Denegados: ${denegados}`)
