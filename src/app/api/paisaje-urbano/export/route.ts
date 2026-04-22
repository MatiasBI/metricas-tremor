import { NextRequest, NextResponse } from "next/server"

import { buildMetricasExcelContent } from "../../../../lib/metricas-export"
import { getMetricasExportRows } from "../../../../lib/metricas"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const rows = await getMetricasExportRows("paisaje-urbano", {
      years: req.nextUrl.searchParams.get("years")?.split(",").filter(Boolean),
      months: req.nextUrl.searchParams.get("months")?.split(",").filter(Boolean),
      prestacion: req.nextUrl.searchParams
        .get("prestacion")
        ?.split(",")
        .filter(Boolean),
      categoria: req.nextUrl.searchParams
        .get("categoria")
        ?.split(",")
        .filter(Boolean),
      comuna: req.nextUrl.searchParams.get("comuna")?.split(",").filter(Boolean),
      barrio: req.nextUrl.searchParams.get("barrio")?.split(",").filter(Boolean),
    })

    const content = buildMetricasExcelContent(rows, "paisaje-urbano")

    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename="paisaje-urbano-${today}.xls"`,
      },
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Error exportando metricas filtradas" },
      { status: 500 }
    )
  }
}
