import { PageToolbar } from "../components/PageToolbar";
import { suppliers } from "../data/mock";

export function SuppliersPage() {
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Suppliers</h1>
          <p className="lede">Primary distributors and wholesale partners linked to purchase orders and stock.</p>
        </div>
        <button type="button" className="btn-primary">
          Add supplier
        </button>
      </header>

      <PageToolbar>
        <input className="input field-grow" type="search" placeholder="Search supplier, city…" aria-label="Search suppliers" />
        <button type="button" className="btn-secondary">
          Download contacts
        </button>
      </PageToolbar>

      <article className="card">
        <div className="card-head">
          <h2>Directory ({suppliers.length})</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Open POs</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.contactName}</td>
                  <td>{s.phone}</td>
                  <td>{s.email}</td>
                  <td>{s.city}</td>
                  <td>{s.activeOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
