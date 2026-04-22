"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { dashboardLinks } from "../../lib/dashboardLinks"

import styles from "./DashboardSelector.module.css"

type Props = {
  compact?: boolean
}

export default function DashboardSelector({ compact = false }: Props) {
  const pathname = usePathname()

  return (
    <section
      className={`${styles.panel} ${compact ? styles.panelCompact : ""}`.trim()}
    >
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
        {dashboardLinks.map(({ href, title, subtitle, Icon }) => {
          const isActive = pathname === href

          return (
            <Link
              key={href}
              href={href}
              className={`${styles.quickAccess} ${
                isActive ? styles.quickAccessActive : ""
              }`.trim()}
            >
              <span className={styles.quickIcon}>
                <Icon fontSize="inherit" />
              </span>
              <span className={styles.quickLabel}>{title}</span>
              <span className={styles.quickSubtitle}>{subtitle}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
