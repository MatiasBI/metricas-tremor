import type { Metadata } from "next"
import Link from "next/link"
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined"

import { dashboardLinks } from "../../lib/dashboardLinks"

import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "Home",
  description: "Accesos a tableros ejecutivos de mantenimiento",
}

export default function HomePage() {
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

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelEyebrow}>Tableros Ejecutivos</p>
                <h2 className={styles.panelTitle}>Seguimiento estrategico</h2>
              </div>
              <p className={styles.panelDescription}>
                Selecciona uno de los accesos para abrir el dashboard correspondiente.
              </p>
            </div>

            <div className={styles.buttonGrid}>
              {dashboardLinks.map(({ href, title, Icon }) => (
                <Link key={href} href={href} className={styles.quickAccess}>
                  <span className={styles.quickIcon}>
                    <Icon fontSize="inherit" />
                  </span>
                  <span className={styles.quickLabel}>{title}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
