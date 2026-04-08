import { PageToolbar } from "../components/PageToolbar";
import { medicines } from "../data/mock";

export function InventoryPage() {
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Inventory</h1>
          <p className="lede">Search SKUs, track stock levels, and spot low inventory before it affects fulfilment.</p>
        </div>
        <button type="button" className="btn-primary">
          Add medicine
        </button>
      </header>

      <PageToolbar>
        <input className="input field-grow" type="search" placeholder="Search name, SKU…" aria-label="Search inventory" />
        <select className="select" aria-label="Filter by category">
          <option value="">All categories</option>
          <option>Pain Relief</option>
          <option>Antibiotic</option>
          <option>Supplements</option>
          <option>Gastro</option>
          <option>Diabetes</option>
        </select>
        <select className="select" aria-label="Filter by status">
          <option value="">All statuses</option>
          <option>Active</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>
        <button type="button" className="btn-secondary">
          Export CSV
        </button>
      </PageToolbar>

      <article className="card">
        <div className="card-head">
          <h2>All medicines ({medicines.length})</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.name}</td>
                  <td>{m.sku}</td>
                  <td>{m.category}</td>
                  <td>{m.stock}</td>
                  <td>Rs {m.price}</td>
                  <td>
                    <span className={`tag ${m.status.replace(/\s+/g, "-").toLowerCase()}`}>{m.status}</span>
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
