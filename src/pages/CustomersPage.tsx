import { PageToolbar } from "../components/PageToolbar";
import { useEffect, useMemo, useState } from "react";
import { getCustomers } from "../api/admin";
import { UnauthorizedError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function CustomersPage() {
  const { token, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [customers, setCustomers] = useState<
    Array<{ id: string; name: string; type: "B2B" | "B2C"; phone: string | null; email: string | null; creditLimit: number }>
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
        const data = await getCustomers(token, controller.signal);
        setCustomers(data.items);
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          logout();
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load customers");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [token, logout]);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchText = `${c.name} ${c.email ?? ""}`.toLowerCase().includes(search.toLowerCase());
      const mappedType = c.type === "B2C" ? "Retail" : "B2B";
      const matchType = !type || mappedType === type;
      return matchText && matchType;
    });
  }, [customers, search, type]);

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
        <input
          className="input field-grow"
          type="search"
          placeholder="Search name, email…"
          aria-label="Search customers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" aria-label="Customer type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option>B2B</option>
          <option>Retail</option>
        </select>
      </PageToolbar>

      {error ? <p className="api-error">{error}</p> : null}
      {loading ? <p className="api-loading">Loading customers...</p> : null}

      <article className="card">
        <div className="card-head">
          <h2>Accounts ({filtered.length})</h2>
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>
                    <span className={`tag ${c.type === "B2B" ? "b2b" : "retail"}`}>
                      {c.type === "B2B" ? "B2B" : "Retail"}
                    </span>
                  </td>
                  <td>{c.phone ?? "-"}</td>
                  <td>{c.email ?? "-"}</td>
                  <td>Rs {c.creditLimit.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
