import { dashboardStats, medicines, orders } from "../data/mock";

export function DashboardPage() {
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

      <section className="stats-grid" aria-label="Key metrics">
        {dashboardStats.map((item) => (
          <article key={item.label} className="stat-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small className={item.positive ? "positive" : "negative"}>{item.delta}</small>
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
                {medicines.slice(0, 4).map((medicine) => (
                  <tr key={medicine.id}>
                    <td>{medicine.name}</td>
                    <td>{medicine.sku}</td>
                    <td>{medicine.category}</td>
                    <td>{medicine.stock}</td>
                    <td>Rs {medicine.price}</td>
                    <td>
                      <span className={`tag ${medicine.status.replace(/\s+/g, "-").toLowerCase()}`}>
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
                      <span className={`tag ${order.paymentStatus.toLowerCase()}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`tag ${order.fulfillmentStatus.toLowerCase()}`}>
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
