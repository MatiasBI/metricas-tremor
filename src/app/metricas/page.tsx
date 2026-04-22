import type { Metadata } from "next"
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined"

import DashboardSelector from "./DashboardSelector"
import styles from "./metricas-home.module.css"

export const metadata: Metadata = {
  title: "Metricas",
  description: "Accesos a tableros ejecutivos de mantenimiento",
}

export default function MetricasPage() {
  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.content}>
          <header className={styles.header}>
            <div>
              <p className={styles.brand}>MEEP</p>
              <h2 className={styles.title}>Tableros ejecutivos</h2>
              <p className={styles.lead}>
                Accesos directos a diferentes dashboards de seguimiento.
              </p>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryIconWrap}>
                <InsightsOutlinedIcon className={styles.summaryIcon} />
              </div>
              <div>
                <p className={styles.summaryEyebrow}>Centro de monitoreo</p>
                <p className={styles.summaryText}>
                  Tableros priorizados para presentacion ejecutiva y lectura rapida.
                </p>
              </div>
            </div>
          </header>

          <DashboardSelector />
        </div>
      </div>
    </main>
  )
}
