import { PageToolbar } from "../components/PageToolbar";
import { orders } from "../data/mock";

export function OrdersPage() {
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
        <input className="input field-grow" type="search" placeholder="Search order ID, customer…" aria-label="Search orders" />
        <select className="select" aria-label="Payment status">
          <option value="">All payments</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Failed</option>
        </select>
        <select className="select" aria-label="Fulfillment status">
          <option value="">All fulfilment</option>
          <option>Processing</option>
          <option>Packed</option>
          <option>Shipped</option>
          <option>Delivered</option>
        </select>
        <button type="button" className="btn-secondary">
          Export
        </button>
      </PageToolbar>

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
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customerName}</td>
                  <td>{o.createdAt}</td>
                  <td>Rs {o.amount.toLocaleString("en-IN")}</td>
                  <td>
                    <span className={`tag ${o.paymentStatus.toLowerCase()}`}>{o.paymentStatus}</span>
                  </td>
                  <td>
                    <span className={`tag ${o.fulfillmentStatus.toLowerCase()}`}>{o.fulfillmentStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
