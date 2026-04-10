import { PageToolbar } from "../components/PageToolbar";
import { useEffect, useState } from "react";
import { getSuppliers } from "../api/admin";
import { UnauthorizedError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function SuppliersPage() {
  const { token, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState<
    Array<{ id: string; name: string; contactName: string | null; phone: string | null; email: string | null; address: string | null }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSuppliers(token, controller.signal);
        setSuppliers(data.items);
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          logout();
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load suppliers");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [token, logout]);

  const filtered = suppliers.filter((s) => `${s.name} ${s.address ?? ""}`.toLowerCase().includes(search.toLowerCase()));

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
        <input
          className="input field-grow"
          type="search"
          placeholder="Search supplier, city…"
          aria-label="Search suppliers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn-secondary">
          Download contacts
        </button>
      </PageToolbar>

      {error ? <p className="api-error">{error}</p> : null}
      {loading ? <p className="api-loading">Loading suppliers...</p> : null}

      <article className="card">
        <div className="card-head">
          <h2>Directory ({filtered.length})</h2>
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
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.contactName ?? "-"}</td>
                  <td>{s.phone ?? "-"}</td>
                  <td>{s.email ?? "-"}</td>
                  <td>{s.address ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
