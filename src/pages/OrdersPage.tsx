import { PageToolbar } from "../components/PageToolbar";
import { useEffect, useMemo, useState } from "react";
import { getOrders, updateOrderStatus } from "../api/admin";
import { UnauthorizedError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

function toTag(value: string) {
  return value.toLowerCase().replace(/_/g, "-");
}

export function OrdersPage() {
  const { token, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [fulfillmentStatus, setFulfillmentStatus] = useState("");
  const [orders, setOrders] = useState<
    Array<{
      id: string;
      customerName: string;
      createdAt: string;
      amount: number;
      paymentStatus: string;
      fulfillmentStatus: string;
    }>
  >([]);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [editFulfillmentStatus, setEditFulfillmentStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOrders(
          token,
          {
            page: 1,
            limit: 50,
            paymentStatus: paymentStatus || undefined,
            fulfillmentStatus: fulfillmentStatus || undefined,
          },
          controller.signal
        );
        setOrders(data.items);
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          logout();
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [token, logout, paymentStatus, fulfillmentStatus, refreshTick]);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) => `${o.id} ${o.customerName}`.toLowerCase().includes(q));
  }, [orders, search]);

  async function saveStatus(orderId: string) {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {};
      if (editFulfillmentStatus) payload.fulfillmentStatus = editFulfillmentStatus;
      if (Object.keys(payload).length === 0) {
        setError("Select a fulfillment status to update.");
        return;
      }
      await updateOrderStatus(token, orderId, payload);
      setEditOrderId(null);
      setEditFulfillmentStatus("");
      setRefreshTick((v) => v + 1);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        logout();
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to update order status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Orders</h1>
          <p className="lede">Review payment status, packing, and shipments across B2B and retail channels.</p>
        </div>
        <button type="button" className="btn-primary">
          Create order
        </button>
      </header>

      <PageToolbar>
        <input
          className="input field-grow"
          type="search"
          placeholder="Search order ID, customer…"
          aria-label="Search orders"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select"
          aria-label="Payment status"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          <option value="">All payments</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
        <select
          className="select"
          aria-label="Fulfillment status"
          value={fulfillmentStatus}
          onChange={(e) => setFulfillmentStatus(e.target.value)}
        >
          <option value="">All fulfilment</option>
          <option value="PROCESSING">Processing</option>
          <option value="PACKED">Packed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
        </select>
        <button type="button" className="btn-secondary">
          Export
        </button>
      </PageToolbar>

      {error ? <p className="api-error">{error}</p> : null}
      {loading ? <p className="api-loading">Loading orders...</p> : null}

      <article className="card">
        <div className="card-head">
          <h2>Order queue ({orders.length})</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customerName}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>Rs {o.amount.toLocaleString("en-IN")}</td>
                  <td>
                    <span className={`tag ${toTag(o.paymentStatus)}`}>{o.paymentStatus}</span>
                  </td>
                  <td>
                    <span className={`tag ${toTag(o.fulfillmentStatus)}`}>{o.fulfillmentStatus}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => {
                        setEditOrderId(o.id);
                        setEditFulfillmentStatus(o.fulfillmentStatus);
                      }}
                    >
                      Update status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {editOrderId ? (
        <div className="modal-overlay" role="presentation" onClick={() => setEditOrderId(null)}>
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Update order status</h3>
            <div className="modal-grid">
              <label className="form-row">
                <span>Fulfillment status</span>
                <select
                  className="select"
                  value={editFulfillmentStatus}
                  onChange={(e) => setEditFulfillmentStatus(e.target.value)}
                >
                  <option value="">No change</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setEditOrderId(null)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" disabled={saving} onClick={() => saveStatus(editOrderId)}>
                {saving ? "Saving..." : "Save status"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
