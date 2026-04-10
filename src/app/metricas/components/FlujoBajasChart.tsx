interface Props {
  resueltos: number
  pendientes: number
  denegados: number
  pctResueltos: number
  pctPendientes: number
  pctDenegados: number
}

const fmt = (n: number) => n.toLocaleString("es-AR")
const CIRCUMFERENCE = 283

export default function FlujoBajasChart({
  resueltos,
  pendientes,
  denegados,
  pctResueltos,
  pctPendientes,
  pctDenegados,
}: Props) {
  const strokeResueltos = (pctResueltos / 100) * CIRCUMFERENCE
  const strokePendientes = (pctPendientes / 100) * CIRCUMFERENCE
  const strokeDenegados = (pctDenegados / 100) * CIRCUMFERENCE

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Estado general
        </p>
        <h3 className="text-base font-semibold text-slate-800 sm:text-lg">
          Diagnostico de ejecucion
        </h3>
        <p className="text-xs text-slate-500 sm:text-sm">
          Distribucion entre reclamos resueltos, pendientes y denegados.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 pt-1 sm:pt-2">
        <div className="relative h-40 w-40 sm:h-48 sm:w-48">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#e2ebf3"
              strokeWidth="16"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#00b9f1"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${strokeResueltos} ${CIRCUMFERENCE}`}
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#7ccff2"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${strokePendientes} ${CIRCUMFERENCE}`}
              strokeDashoffset={-strokeResueltos}
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#e58a92"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${strokeDenegados} ${CIRCUMFERENCE}`}
              strokeDashoffset={-(strokeResueltos + strokePendientes)}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-semibold tracking-tight text-slate-700 sm:text-4xl">
              {pctResueltos}
              <span className="text-xl sm:text-2xl">%</span>
            </div>
            <div className="text-sm text-slate-500 sm:text-base">Resueltos</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-xs text-slate-600 sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#00b9f1]" />
            <span>Resueltos {fmt(resueltos)} ({pctResueltos}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#7ccff2]" />
            <span>Pendientes {fmt(pendientes)} ({pctPendientes}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#e58a92]" />
            <span>Denegados {fmt(denegados)} ({pctDenegados}%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
