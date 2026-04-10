import "./metricas.css"

export default function LoadingMetricas() {
  return (
    <div className="metricas-loading-shell">
      <div className="metricas-loading-header">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-3">
            <div className="metricas-loading-block h-8 w-72" />
            <div className="metricas-loading-block h-4 w-60" />
          </div>
          <div className="space-y-2">
            <div className="metricas-loading-block h-3 w-24 ml-auto" />
            <div className="metricas-loading-block h-5 w-36" />
          </div>
        </div>
      </div>

      <div className="metricas-loading-container">
        <div className="metricas-loading-pill" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="metricas-loading-card p-5 space-y-4">
              <div className="metricas-loading-line w-28" />
              <div className="metricas-loading-line w-20 h-8" />
              <div className="metricas-loading-line w-32" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="metricas-loading-chart p-5 space-y-4">
            <div className="metricas-loading-line w-36" />
            <div className="metricas-loading-block h-64 w-full" />
          </div>
          <div className="metricas-loading-chart p-5 space-y-4">
            <div className="metricas-loading-line w-32" />
            <div className="metricas-loading-block h-64 w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="metricas-loading-chart p-5 space-y-4">
            <div className="metricas-loading-line w-40" />
            <div className="metricas-loading-block h-72 w-full" />
          </div>
          <div className="metricas-loading-chart p-5 space-y-4">
            <div className="metricas-loading-line w-44" />
            <div className="metricas-loading-block h-72 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
