import { useEffect, useMemo, useState } from "react";
import { getDashboardSummary, getSalesTrend } from "../api/admin";
import { UnauthorizedError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

function formatDate(dt: Date) {
  return dt.toISOString().slice(0, 10);
}

export function AnalyticsPage() {
  const { token, logout } = useAuth();
  const [series, setSeries] = useState<Array<{ label: string; revenue: number; orders: number }>>([]);
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    totalOrders: number;
    lowStockAlerts: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 6);

    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [trend, dashboard] = await Promise.all([
          getSalesTrend(token, { from: formatDate(from), to: formatDate(to), groupBy: "day" }, controller.signal),
          getDashboardSummary(token, controller.signal),
        ]);
        setSeries(trend.series);
        setSummary({
          totalRevenue: dashboard.totalRevenue,
          totalOrders: dashboard.totalOrders,
          lowStockAlerts: dashboard.lowStockAlerts,
        });
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          logout();
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [token, logout]);

  const maxRevenue = useMemo(() => Math.max(...series.map((p) => p.revenue), 1), [series]);

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

      {error ? <p className="api-error">{error}</p> : null}
      {loading ? <p className="api-loading">Loading analytics...</p> : null}

      <section className="analytics-layout">
        <article className="card chart-card">
          <div className="card-head">
            <h2>Revenue trend</h2>
          </div>
          <div className="chart-bars" role="img" aria-label="Revenue by day">
            {series.map((point) => {
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
          {summary ? (
            <>
              <div className="summary-row">
                <strong>Rs {summary.totalRevenue.toLocaleString("en-IN")}</strong>
                <span>Total Revenue</span>
              </div>
              <div className="summary-row">
                <strong>{summary.totalOrders}</strong>
                <span>Total Orders</span>
              </div>
              <div className="summary-row">
                <strong>{summary.lowStockAlerts}</strong>
                <span>Low Stock Alerts</span>
              </div>
            </>
          ) : null}
          <div className="summary-row">
            <strong>{series.reduce((a, p) => a + p.orders, 0)}</strong>
            <span>Orders this week</span>
          </div>
        </div>
      </section>
    </>
  );
}
