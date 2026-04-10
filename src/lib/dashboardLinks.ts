import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined"
import ParkOutlinedIcon from "@mui/icons-material/ParkOutlined"
import RuleFolderOutlinedIcon from "@mui/icons-material/RuleFolderOutlined"
import type { SvgIconComponent } from "@mui/icons-material"

export type DashboardLink = {
  href: string
  title: string
  subtitle: string
  description: string
  Icon: SvgIconComponent
}

export const dashboardLinks: DashboardLink[] = [
  {
    href: "/mantenimiento",
    title: "Mantenimiento",
    subtitle: "Alumbrado y mantenimiento operativo",
    description:
      "Indicadores principales, distribucion por comunas, pendientes y motivos de baja.",
    Icon: LightbulbOutlinedIcon,
  },
  {
    href: "/ordenamiento",
    title: "Ordenamiento",
    subtitle: "Direccion General de Ordenamiento",
    description:
      "Seguimiento de fiscalizacion, volumen de casos, categorias y cierres denegados.",
    Icon: RuleFolderOutlinedIcon,
  },
  {
    href: "/paisaje-urbano",
    title: "Paisaje Urbano",
    subtitle: "Direccion General de Paisaje Urbano",
    description:
      "Lectura ejecutiva de patrimonio, espacios verdes, mobiliario y estado de resolucion.",
    Icon: ParkOutlinedIcon,
  },
]
