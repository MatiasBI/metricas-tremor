"use client"

import { Badge, Fab } from "@mui/material"
import TuneIcon from "@mui/icons-material/Tune"

type Props = {
  hasActiveFilter: boolean
  activeFilterCount: number
  isRefreshing: boolean
  onOpen: () => void
}

export default function FilterFab({
  hasActiveFilter,
  activeFilterCount,
  isRefreshing,
  onOpen,
}: Props) {
  return (
    <Badge
      color="error"
      badgeContent={activeFilterCount}
      invisible={!hasActiveFilter}
      overlap="circular"
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{
        position: "relative",
        display: "inline-flex",
        zIndex: 0,
        "& .MuiBadge-root": {
          position: "relative",
        },
        "& .MuiBadge-badge": {
          top: 4,
          right: 4,
          position: "absolute",
          minWidth: 24,
          height: 24,
          padding: "0 6px",
          borderRadius: 999,
          border: "2px solid white",
          fontWeight: 700,
          zIndex: 20,
          boxShadow: "0 8px 18px rgba(220, 38, 38, 0.28)",
          pointerEvents: "none",
        },
      }}
    >
      <Fab
        aria-label="Abrir filtros"
        onClick={onOpen}
        sx={{
          width: 66,
          height: 66,
          background: "#00b9f1",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow:
            "0 18px 28px rgba(0, 185, 241, 0.3), inset 0 2px 0 rgba(255,255,255,0.28)",
          transform: "translateY(0)",
          transition:
            "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
          "&:hover": {
            background: "#00a7da",
            boxShadow:
              "0 22px 32px rgba(0, 185, 241, 0.34), inset 0 2px 0 rgba(255,255,255,0.28)",
            transform: "translateY(-2px)",
          },
          "&:active": {
            transform: "translateY(1px)",
            boxShadow:
              "0 12px 20px rgba(0, 185, 241, 0.24), inset 0 1px 0 rgba(255,255,255,0.18)",
          },
          zIndex: 1,
        }}
      >
        <span className="metricas-filter-button-content">
          {isRefreshing ? <span className="metricas-refresh-spinner" /> : null}
          <TuneIcon fontSize="medium" />
        </span>
      </Fab>
    </Badge>
  )
}
