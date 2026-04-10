import { NextRequest, NextResponse } from "next/server"
import { getMetricasData, warmMetricasCache } from "../../../lib/metricas"

export const dynamic = "force-dynamic"

warmMetricasCache("ordenamiento")

export async function GET(req: NextRequest) {
  try {
    const payload = await getMetricasData("ordenamiento", {
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
    })

    return NextResponse.json(payload)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Error leyendo metricas desde Google Sheets" },
      { status: 500 }
    )
  }
}
