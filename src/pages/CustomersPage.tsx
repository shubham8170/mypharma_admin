import { PageToolbar } from "../components/PageToolbar";
import { customers } from "../data/mock";

export function CustomersPage() {
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Customers</h1>
          <p className="lede">Hospitals, clinics, and retail outlets with credit limits and recent order activity.</p>
        </div>
        <button type="button" className="btn-primary">
          Add customer
        </button>
      </header>

      <PageToolbar>
        <input className="input field-grow" type="search" placeholder="Search name, email…" aria-label="Search customers" />
        <select className="select" aria-label="Customer type">
          <option value="">All types</option>
          <option>B2B</option>
          <option>Retail</option>
        </select>
      </PageToolbar>

      <article className="card">
        <div className="card-head">
          <h2>Accounts ({customers.length})</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Credit limit</th>
                <th>Last order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>
                    <span className={`tag ${c.type === "B2B" ? "b2b" : "retail"}`}>{c.type}</span>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.email}</td>
                  <td>Rs {c.creditLimit.toLocaleString("en-IN")}</td>
                  <td>{c.lastOrderAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
