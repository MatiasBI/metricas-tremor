import formatPrestacion from "./formatPrestacion"

interface Item {
  prestacion: string
  cantidad: number
  porcentaje: number
}

const fmt = (n: number) => n.toLocaleString("es-AR")

export default function TopPendientesPrestacionChart({
  items,
}: {
  items: Item[]
}) {
  const max = Math.max(...items.map((item) => item.cantidad), 1)

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Foco de seguimiento
        </p>
        <h3 className="text-base font-semibold text-slate-800 sm:text-lg">
          Top 5 pendientes por prestacion
        </h3>
        <p className="text-xs text-slate-500 sm:text-sm">
          Prestaciones con mas reclamos todavia abiertos.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.prestacion}>
            <div className="relative h-10 overflow-hidden rounded-full border border-[#dbe5ef] bg-[#f4f8fb] sm:h-11">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#cfeefe_0%,#6dcdf6_100%)]"
                style={{ width: `${(item.cantidad / max) * 100}%` }}
              />
              <div className="relative z-10 flex h-full items-center justify-between px-4">
                <span className="text-[11px] font-medium text-slate-700 sm:text-xs">
                  {formatPrestacion(item.prestacion)}
                </span>
                <span className="text-[11px] font-semibold text-slate-700 sm:text-xs">
                  {fmt(item.cantidad)} ({item.porcentaje}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
