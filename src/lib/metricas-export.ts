import type { MetricasDatasetKey, MetricasExportRow } from "./metricas"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function buildMetricasExcelContent(
  rows: MetricasExportRow[],
  datasetKey: MetricasDatasetKey
) {
  const headers = [
    "Fecha de ingreso",
    "Hora de ingreso",
    "Comuna",
    "Barrio",
    "Categoria",
    "Prestacion",
    "Estado",
    "Motivo denegado",
    "Ultimo mes",
  ]

  const tableRows = rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.fecha_ingreso)}</td>
          <td>${escapeHtml(row.hora_ingreso)}</td>
          <td>${escapeHtml(row.comuna)}</td>
          <td>${escapeHtml(row.barrio)}</td>
          <td>${escapeHtml(row.categoria)}</td>
          <td>${escapeHtml(row.prestacion)}</td>
          <td>${escapeHtml(row.estado)}</td>
          <td>${escapeHtml(row.motivo_denegado)}</td>
          <td>${escapeHtml(row.ult_mes)}</td>
        </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8" />
    <meta name="ProgId" content="Excel.Sheet" />
    <meta name="Generator" content="Codex" />
    <title>metricas-${datasetKey}</title>
  </head>
  <body>
    <table border="1">
      <thead>
        <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </body>
</html>`
}
