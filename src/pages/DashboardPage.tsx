import { useEffect, useState } from "react";
import { getDashboardSummary, getMedicines, getOrders } from "../api/admin";
import { UnauthorizedError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

function toTag(value: string) {
  return value.toLowerCase().replace(/_/g, "-");
}

export function DashboardPage() {
  const { token, logout } = useAuth();
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    totalOrders: number;
    lowStockAlerts: number;
    pendingDeliveries: number;
    revenueDeltaPct: number;
    ordersDeltaPct: number;
    stockDeltaPct: number;
    deliveryDeltaPct: number;
  } | null>(null);
  const [medicines, setMedicines] = useState<
    Array<{ id: string; name: string; sku: string; category: string; stock: number; price: number; status: string }>
  >([]);
  const [orders, setOrders] = useState<
    Array<{ id: string; customerName: string; amount: number; paymentStatus: string; fulfillmentStatus: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sum, meds, ords] = await Promise.all([
          getDashboardSummary(token, controller.signal),
          getMedicines(token, { page: 1, limit: 4 }, controller.signal),
          getOrders(token, { page: 1, limit: 5 }, controller.signal),
        ]);
        setSummary(sum);
        setMedicines(meds.items);
        setOrders(ords.items);
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          logout();
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [token, logout]);

  const stats = summary
    ? [
        { label: "Total Revenue", value: `Rs ${summary.totalRevenue.toLocaleString("en-IN")}`, delta: `${summary.revenueDeltaPct}%` },
        { label: "Total Orders", value: `${summary.totalOrders.toLocaleString("en-IN")}`, delta: `${summary.ordersDeltaPct}%` },
        { label: "Low Stock Alerts", value: `${summary.lowStockAlerts}`, delta: `${summary.stockDeltaPct}%` },
        { label: "Pending Deliveries", value: `${summary.pendingDeliveries}`, delta: `${summary.deliveryDeltaPct}%` },
      ]
    : [];

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Dashboard overview</h1>
          <p className="lede">Monitor inventory, orders, revenue, and fulfillment in one place.</p>
        </div>
        <button type="button" className="btn-primary">
          Add medicine
        </button>
      </header>

      {error ? <p className="api-error">{error}</p> : null}
      {loading ? <p className="api-loading">Loading dashboard...</p> : null}

      <section className="stats-grid" aria-label="Key metrics">
        {stats.map((item) => (
          <article key={item.label} className="stat-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small className={item.delta.startsWith("-") ? "negative" : "positive"}>{item.delta}</small>
          </article>
        ))}
      </section>

      <section className="table-grid" aria-label="Tables">
        <article className="card">
          <div className="card-head">
            <h2>Inventory snapshot</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td>{medicine.name}</td>
                    <td>{medicine.sku}</td>
                    <td>{medicine.category}</td>
                    <td>{medicine.stock}</td>
                    <td>Rs {medicine.price}</td>
                    <td>
                      <span className={`tag ${toTag(medicine.status)}`}>
                        {medicine.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <div className="card-head">
            <h2>Recent orders</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customerName}</td>
                    <td>Rs {order.amount.toLocaleString("en-IN")}</td>
                    <td>
                      <span className={`tag ${toTag(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`tag ${toTag(order.fulfillmentStatus)}`}>
                        {order.fulfillmentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  );
}
