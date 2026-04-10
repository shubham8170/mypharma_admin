import { PageToolbar } from "../components/PageToolbar";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createMedicine, getMedicines, updateMedicine } from "../api/admin";
import { UnauthorizedError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

function toTag(value: string) {
  return value.toLowerCase().replace(/_/g, "-");
}

export function InventoryPage() {
  const { token, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [medicines, setMedicines] = useState<
    Array<{ id: string; name: string; sku: string; category: string; stock: number; price: number; status: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ price: string; stock: string; reorderLevel: string }>({
    price: "",
    stock: "",
    reorderLevel: "",
  });
  const [createValues, setCreateValues] = useState({
    name: "",
    sku: "",
    category: "General",
    description: "",
    price: "",
    mrp: "",
    stock: "",
    reorderLevel: "",
    supplierId: "",
    batchNumber: "",
    expiryDate: "",
  });

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMedicines(
          token,
          { page: 1, limit: 50, search: search || undefined, category: category || undefined, status: status || undefined },
          controller.signal
        );
        setMedicines(data.items);
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          logout();
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load medicines");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [token, logout, search, category, status, refreshTick]);

  const categories = useMemo(() => {
    return Array.from(new Set(medicines.map((m) => m.category).filter(Boolean))).sort();
  }, [medicines]);

  async function submitAddMedicine(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        name: createValues.name.trim(),
        sku: createValues.sku.trim(),
        category: createValues.category.trim() || "General",
        description: createValues.description.trim(),
        price: Number(createValues.price),
        mrp: Number(createValues.mrp),
        stock: Number(createValues.stock),
        reorderLevel: Number(createValues.reorderLevel),
        supplierId: createValues.supplierId.trim() || undefined,
        batchNumber: createValues.batchNumber.trim(),
        expiryDate: createValues.expiryDate.trim(),
      };
      await createMedicine(token, payload);
      setIsAddOpen(false);
      setCreateValues({
        name: "",
        sku: "",
        category: "General",
        description: "",
        price: "",
        mrp: "",
        stock: "",
        reorderLevel: "",
        supplierId: "",
        batchNumber: "",
        expiryDate: "",
      });
      setRefreshTick((v) => v + 1);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to create medicine");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveQuickEdit(id: string) {
    if (!token) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {};
      if (editValues.price !== "") payload.price = Number(editValues.price);
      if (editValues.stock !== "") payload.stock = Number(editValues.stock);
      if (editValues.reorderLevel !== "") payload.reorderLevel = Number(editValues.reorderLevel);
      if (Object.keys(payload).length === 0) {
        setError("Enter at least one value to update.");
        return;
      }
      await updateMedicine(token, id, payload);
      setEditId(null);
      setEditValues({ price: "", stock: "", reorderLevel: "" });
      setRefreshTick((v) => v + 1);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to update medicine");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Inventory</h1>
          <p className="lede">Search SKUs, track stock levels, and spot low inventory before it affects fulfilment.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setIsAddOpen(true)}>
          Add medicine
        </button>
      </header>

      <PageToolbar>
        <input
          className="input field-grow"
          type="search"
          placeholder="Search name, SKU…"
          aria-label="Search inventory"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select className="select" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
        <button type="button" className="btn-secondary">
          Export CSV
        </button>
      </PageToolbar>

      {error ? <p className="api-error">{error}</p> : null}
      {loading ? <p className="api-loading">Loading medicines...</p> : null}

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
                <th>Actions</th>
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
                    <span className={`tag ${toTag(m.status)}`}>{m.status}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => {
                        setEditId(m.id);
                        setEditValues({ price: String(m.price), stock: String(m.stock), reorderLevel: "" });
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {editId ? (
        <div className="modal-overlay" role="presentation" onClick={() => setEditId(null)}>
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Quick edit medicine</h3>
            <div className="modal-grid">
              <label className="form-row">
                <span>Price</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={editValues.price}
                  onChange={(e) => setEditValues((v) => ({ ...v, price: e.target.value }))}
                />
              </label>
              <label className="form-row">
                <span>Stock</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={editValues.stock}
                  onChange={(e) => setEditValues((v) => ({ ...v, stock: e.target.value }))}
                />
              </label>
              <label className="form-row">
                <span>Reorder level</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={editValues.reorderLevel}
                  onChange={(e) => setEditValues((v) => ({ ...v, reorderLevel: e.target.value }))}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setEditId(null)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={() => saveQuickEdit(editId)} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAddOpen ? (
        <div className="modal-overlay" role="presentation" onClick={() => setIsAddOpen(false)}>
          <div className="modal-card modal-lg" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Add medicine</h3>
            <form onSubmit={submitAddMedicine}>
              <div className="modal-grid modal-grid-2">
                <label className="form-row">
                  <span>Name</span>
                  <input
                    className="input"
                    required
                    value={createValues.name}
                    onChange={(e) => setCreateValues((v) => ({ ...v, name: e.target.value }))}
                  />
                </label>
                <label className="form-row">
                  <span>Category</span>
                  <input
                    className="input"
                    required
                    value={createValues.category}
                    onChange={(e) => setCreateValues((v) => ({ ...v, category: e.target.value }))}
                  />
                </label>
                <label className="form-row">
                  <span>SKU</span>
                  <input
                    className="input"
                    required
                    value={createValues.sku}
                    onChange={(e) => setCreateValues((v) => ({ ...v, sku: e.target.value }))}
                  />
                </label>
                <label className="form-row">
                  <span>Batch number (must match SKU)</span>
                  <input
                    className="input"
                    required
                    value={createValues.batchNumber}
                    onChange={(e) => setCreateValues((v) => ({ ...v, batchNumber: e.target.value }))}
                  />
                </label>
                <label className="form-row">
                  <span>Price</span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    required
                    value={createValues.price}
                    onChange={(e) => setCreateValues((v) => ({ ...v, price: e.target.value }))}
                  />
                </label>
                <label className="form-row">
                  <span>MRP</span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    required
                    value={createValues.mrp}
                    onChange={(e) => setCreateValues((v) => ({ ...v, mrp: e.target.value }))}
                  />
                </label>
                <label className="form-row">
                  <span>Stock</span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    required
                    value={createValues.stock}
                    onChange={(e) => setCreateValues((v) => ({ ...v, stock: e.target.value }))}
                  />
                </label>
                <label className="form-row">
                  <span>Reorder level</span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    required
                    value={createValues.reorderLevel}
                    onChange={(e) => setCreateValues((v) => ({ ...v, reorderLevel: e.target.value }))}
                  />
                </label>
                <label className="form-row">
                  <span>Supplier ID (optional)</span>
                  <input
                    className="input"
                    value={createValues.supplierId}
                    onChange={(e) => setCreateValues((v) => ({ ...v, supplierId: e.target.value }))}
                  />
                </label>
                <label className="form-row">
                  <span>Expiry date</span>
                  <input
                    className="input"
                    type="date"
                    required
                    value={createValues.expiryDate}
                    onChange={(e) => setCreateValues((v) => ({ ...v, expiryDate: e.target.value }))}
                  />
                </label>
                <label className="form-row modal-span-2">
                  <span>Description</span>
                  <input
                    className="input"
                    value={createValues.description}
                    onChange={(e) => setCreateValues((v) => ({ ...v, description: e.target.value }))}
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? "Creating..." : "Create medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
