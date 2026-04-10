import type { Metadata } from "next"
import Link from "next/link"
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded"
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
        <aside className={styles.sidebar}>
          <div className={styles.sidebarBrand}>
            <p className={styles.sidebarEyebrow}>MEEP</p>
            <h1 className={styles.sidebarTitle}>Metricas</h1>
            <p className={styles.sidebarText}>
              Centro ejecutivo para monitoreo estrategico del Ministerio de Espacio Publico.
            </p>
          </div>

          <nav className={styles.sidebarNav}>
            {dashboardLinks.map(({ href, title, Icon }) => (
              <Link key={href} href={href} className={styles.sidebarLink}>
                <span className={styles.sidebarLinkIcon}>
                  <Icon fontSize="inherit" />
                </span>
                <span>{title}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className={styles.content}>
          <header className={styles.header}>
            <div>
              <p className={styles.brand}>MEEP</p>
              <h2 className={styles.title}>Tableros ejecutivos</h2>
              <p className={styles.lead}>
                Accesos directos a pantallas de seguimiento adaptadas al lenguaje visual del ecosistema MEEP.
              </p>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryIconWrap}>
                <InsightsOutlinedIcon className={styles.summaryIcon} />
              </div>
              <div>
                <p className={styles.summaryEyebrow}>Centro de monitoreo</p>
                <p className={styles.summaryText}>
                  Tres tableros priorizados para presentacion ejecutiva y lectura rapida.
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

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelEyebrow}>Detalle</p>
                <h2 className={styles.panelTitle}>Descripcion de accesos</h2>
              </div>
            </div>

            <div className={styles.cardGrid}>
              {dashboardLinks.map(({ href, title, subtitle, description, Icon }) => (
                <Link key={href} href={href} className={styles.dashboardCard}>
                  <div className={styles.dashboardIconWrap}>
                    <Icon className={styles.dashboardIcon} />
                  </div>
                  <div className={styles.dashboardBody}>
                    <div className={styles.dashboardTopline}>
                      <h3 className={styles.dashboardTitle}>{title}</h3>
                      <ArrowOutwardRoundedIcon className={styles.dashboardArrow} />
                    </div>
                    <p className={styles.dashboardSubtitle}>{subtitle}</p>
                    <p className={styles.dashboardDescription}>{description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
