import { analyticsSeries, dashboardStats } from "../data/mock";

const maxRevenue = Math.max(...analyticsSeries.map((p) => p.revenue), 1);

export function AnalyticsPage() {
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Analytics</h1>
          <p className="lede">Weekly revenue and order velocity. Connect GET /api/v1/analytics/sales-trend for live data.</p>
        </div>
        <button type="button" className="btn-secondary">
          Last 7 days
        </button>
      </header>

      <section className="analytics-layout">
        <article className="card chart-card">
          <div className="card-head">
            <h2>Revenue trend</h2>
          </div>
          <div className="chart-bars" role="img" aria-label="Revenue by day">
            {analyticsSeries.map((point) => {
              const h = Math.round((point.revenue / maxRevenue) * 160);
              return (
                <div key={point.label} className="chart-bar-wrap">
                  <div className="chart-bar" style={{ height: `${h}px` }} title={`Rs ${point.revenue.toLocaleString("en-IN")}`} />
                  <span className="chart-bar-label">{point.label}</span>
                </div>
              );
            })}
          </div>
        </article>

        <div className="summary-stack">
          {dashboardStats.slice(0, 3).map((s) => (
            <div key={s.label} className="summary-row">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
          <div className="summary-row">
            <strong>{analyticsSeries.reduce((a, p) => a + p.orders, 0)}</strong>
            <span>Orders this week (mock)</span>
          </div>
        </div>
      </section>
    </>
  );
}
