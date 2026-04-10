import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined"
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined"
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined"
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined"

interface Resumen {
  total: number
  resueltos: number
  pendientes: number
  denegados: number
  pct_resueltos: number
  pct_pendientes: number
  pct_denegados: number
  generado: string
}

const fmt = (n: number) => n.toLocaleString("es-AR")

export default function KPICards({ resumen }: { resumen: Resumen }) {
  const cards = [
    {
      label: "Total de ingresos",
      value: fmt(resumen.total),
      sub: "Vision consolidada del volumen relevado.",
      icon: AssignmentTurnedInOutlinedIcon,
      iconClassName: "bg-[#eaf8ff] text-[#00a7da]",
    },
    {
      label: "Resueltos",
      value: fmt(resumen.resueltos),
      sub: `${resumen.pct_resueltos}% del total`,
      icon: CheckCircleOutlineOutlinedIcon,
      iconClassName: "bg-[#e8f8f4] text-[#159a7f]",
    },
    {
      label: "Pendientes",
      value: fmt(resumen.pendientes),
      sub: `${resumen.pct_pendientes}% del total`,
      icon: PendingActionsOutlinedIcon,
      iconClassName: "bg-[#fff6e6] text-[#b7791f]",
    },
    {
      label: "Denegados",
      value: fmt(resumen.denegados),
      sub: `${resumen.pct_denegados}% del total`,
      icon: HighlightOffOutlinedIcon,
      iconClassName: "bg-[#fdeeee] text-[#c45f66]",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <div
            key={card.label}
            className="rounded-[24px] border border-[#dbe5ef] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-5 shadow-[0_18px_36px_rgba(148,163,184,0.14)]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">{card.label}</p>
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClassName}`}
              >
                <Icon fontSize="small" />
              </span>
            </div>
            <p className="text-3xl font-semibold tracking-tight text-slate-900">
              {card.value}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{card.sub}</p>
          </div>
        )
      })}
    </div>
  )
}
