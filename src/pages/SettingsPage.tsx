import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createSubscriptionPlan,
  getSubscriptionConfig,
  getSubscriptionPlans,
  type SubscriptionPlan,
  updateSubscriptionConfig,
  updateSubscriptionPlan,
} from "../api/admin";
import { UnauthorizedError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

type PlanFormState = {
  name: string;
  description: string;
  amountInr: string;
  razorpayPlanId: string;
  billingInterval: "monthly" | "yearly";
  trialDays: string;
};

type ConfigFormState = {
  amountInr: string;
  razorpayPlanId: string;
  billingInterval: "monthly" | "yearly";
  trialDays: string;
};

export function SettingsPage() {
  const { token, logout } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const [createPlan, setCreatePlan] = useState<PlanFormState>({
    name: "",
    description: "",
    amountInr: "",
    razorpayPlanId: "",
    billingInterval: "monthly",
    trialDays: "30",
  });

  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<{
    name: string;
    description: string;
    amountInr: string;
    billingInterval: "monthly" | "yearly";
    isActive: boolean;
  }>({
    name: "",
    description: "",
    amountInr: "",
    billingInterval: "monthly",
    isActive: true,
  });

  const [configForm, setConfigForm] = useState<ConfigFormState>({
    amountInr: "",
    razorpayPlanId: "",
    billingInterval: "monthly",
    trialDays: "30",
  });

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const load = async () => {
      setLoadingPlans(true);
      setError(null);
      try {
        const [planRes, configRes] = await Promise.all([
          getSubscriptionPlans(token, controller.signal),
          getSubscriptionConfig(token, controller.signal).catch(() => null),
        ]);
        const normalizedPlans = Array.isArray(planRes)
          ? planRes
          : Array.isArray(planRes.items)
            ? planRes.items
            : Array.isArray(planRes.data)
              ? planRes.data
              : [];
        setPlans(normalizedPlans);
        if (configRes) {
          setConfigForm({
            amountInr: String(configRes.amountInr ?? ""),
            razorpayPlanId: configRes.razorpayPlanId ?? "",
            billingInterval: configRes.billingInterval ?? "monthly",
            trialDays: String(configRes.trialDays ?? ""),
          });
        }
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          logout();
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load subscription settings");
      } finally {
        setLoadingPlans(false);
      }
    };
    load();
    return () => controller.abort();
  }, [token, logout, refreshTick]);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.name.localeCompare(b.name));
  }, [plans]);

  async function handleCreatePlan(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await createSubscriptionPlan(token, {
        name: createPlan.name.trim(),
        description: createPlan.description.trim(),
        amountInr: Number(createPlan.amountInr),
        razorpayPlanId: createPlan.razorpayPlanId.trim(),
        billingInterval: createPlan.billingInterval,
        trialDays: Number(createPlan.trialDays),
      });
      setCreatePlan({
        name: "",
        description: "",
        amountInr: "",
        razorpayPlanId: "",
        billingInterval: "monthly",
        trialDays: "30",
      });
      setSuccess("Subscription plan created.");
      setRefreshTick((v) => v + 1);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to create plan");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(plan: SubscriptionPlan) {
    setEditingPlanId(plan.id);
    setEditPlan({
      name: plan.name,
      description: plan.description ?? "",
      amountInr: String(plan.amountInr),
      billingInterval: plan.billingInterval ?? "monthly",
      isActive: plan.isActive ?? true,
    });
  }

  async function handleUpdatePlan(e: FormEvent) {
    e.preventDefault();
    if (!token || !editingPlanId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateSubscriptionPlan(token, editingPlanId, {
        name: editPlan.name.trim(),
        description: editPlan.description.trim(),
        amountInr: Number(editPlan.amountInr),
        billingInterval: editPlan.billingInterval,
        isActive: editPlan.isActive,
      });
      setSuccess("Subscription plan updated.");
      setEditingPlanId(null);
      setRefreshTick((v) => v + 1);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to update plan");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveConfig(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateSubscriptionConfig(token, {
        amountInr: Number(configForm.amountInr),
        razorpayPlanId: configForm.razorpayPlanId.trim(),
        billingInterval: configForm.billingInterval,
        trialDays: Number(configForm.trialDays),
      });
      setSuccess("Subscription fallback config updated.");
      setRefreshTick((v) => v + 1);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to update fallback config");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Subscription settings</h1>
          <p className="lede">Create and manage plans from admin APIs and update fallback subscription config.</p>
        </div>
      </header>

      {error ? <p className="api-error">{error}</p> : null}
      {success ? <p className="api-loading">{success}</p> : null}
      {loadingPlans ? <p className="api-loading">Loading subscription settings...</p> : null}

      <div className="settings-grid">
        <article className="card settings-card">
          <div className="card-head">
            <h2>Create subscription plan</h2>
            <p>POST /api/v1/subscription-plans</p>
          </div>
          <form className="form-grid" onSubmit={handleCreatePlan}>
            <label className="form-row">
              <span>Name</span>
              <input
                className="input"
                required
                value={createPlan.name}
                onChange={(e) => setCreatePlan((v) => ({ ...v, name: e.target.value }))}
              />
            </label>
            <label className="form-row">
              <span>Description</span>
              <input
                className="input"
                required
                value={createPlan.description}
                onChange={(e) => setCreatePlan((v) => ({ ...v, description: e.target.value }))}
              />
            </label>
            <label className="form-row">
              <span>Amount INR</span>
              <input
                className="input"
                type="number"
                min="0"
                required
                value={createPlan.amountInr}
                onChange={(e) => setCreatePlan((v) => ({ ...v, amountInr: e.target.value }))}
              />
            </label>
            <label className="form-row">
              <span>Razorpay Plan ID</span>
              <input
                className="input"
                required
                value={createPlan.razorpayPlanId}
                onChange={(e) => setCreatePlan((v) => ({ ...v, razorpayPlanId: e.target.value }))}
              />
            </label>
            <label className="form-row">
              <span>Billing interval</span>
              <select
                className="select"
                value={createPlan.billingInterval}
                onChange={(e) =>
                  setCreatePlan((v) => ({ ...v, billingInterval: e.target.value as "monthly" | "yearly" }))
                }
              >
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
              </select>
            </label>
            <label className="form-row">
              <span>Trial days</span>
              <input
                className="input"
                type="number"
                min="0"
                required
                value={createPlan.trialDays}
                onChange={(e) => setCreatePlan((v) => ({ ...v, trialDays: e.target.value }))}
              />
            </label>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Create plan"}
            </button>
          </form>
        </article>

        <article className="card settings-card">
          <div className="card-head">
            <h2>Update fallback config</h2>
            <p>PATCH /api/v1/subscription-config</p>
          </div>
          <form className="form-grid" onSubmit={handleSaveConfig}>
            <label className="form-row">
              <span>Amount INR</span>
              <input
                className="input"
                type="number"
                min="0"
                required
                value={configForm.amountInr}
                onChange={(e) => setConfigForm((v) => ({ ...v, amountInr: e.target.value }))}
              />
            </label>
            <label className="form-row">
              <span>Razorpay Plan ID</span>
              <input
                className="input"
                required
                value={configForm.razorpayPlanId}
                onChange={(e) => setConfigForm((v) => ({ ...v, razorpayPlanId: e.target.value }))}
              />
            </label>
            <label className="form-row">
              <span>Billing interval</span>
              <select
                className="select"
                value={configForm.billingInterval}
                onChange={(e) =>
                  setConfigForm((v) => ({ ...v, billingInterval: e.target.value as "monthly" | "yearly" }))
                }
              >
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
              </select>
            </label>
            <label className="form-row">
              <span>Trial days</span>
              <input
                className="input"
                type="number"
                min="0"
                required
                value={configForm.trialDays}
                onChange={(e) => setConfigForm((v) => ({ ...v, trialDays: e.target.value }))}
              />
            </label>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save config"}
            </button>
          </form>
        </article>
      </div>

      <article className="card settings-card settings-table-card">
        <div className="card-head">
          <h2>Subscription plans</h2>
          <p>GET /api/v1/subscription-plans · PATCH /api/v1/subscription-plans/:id</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Interval</th>
                <th>Trial</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.name}</td>
                  <td>{plan.description ?? "-"}</td>
                  <td>Rs {plan.amountInr}</td>
                  <td>{plan.billingInterval}</td>
                  <td>{plan.trialDays} days</td>
                  <td>{plan.isActive === false ? "No" : "Yes"}</td>
                  <td>
                    <button type="button" className="btn-secondary btn-sm" onClick={() => startEdit(plan)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {sortedPlans.length === 0 ? (
                <tr>
                  <td colSpan={7}>No plans found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>

      {editingPlanId ? (
        <div className="modal-overlay" role="presentation" onClick={() => setEditingPlanId(null)}>
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Edit subscription plan</h3>
            <form className="modal-grid" onSubmit={handleUpdatePlan}>
              <label className="form-row">
                <span>Name</span>
                <input
                  className="input"
                  required
                  value={editPlan.name}
                  onChange={(e) => setEditPlan((v) => ({ ...v, name: e.target.value }))}
                />
              </label>
              <label className="form-row">
                <span>Description</span>
                <input
                  className="input"
                  required
                  value={editPlan.description}
                  onChange={(e) => setEditPlan((v) => ({ ...v, description: e.target.value }))}
                />
              </label>
              <label className="form-row">
                <span>Amount INR</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  required
                  value={editPlan.amountInr}
                  onChange={(e) => setEditPlan((v) => ({ ...v, amountInr: e.target.value }))}
                />
              </label>
              <label className="form-row">
                <span>Billing interval</span>
                <select
                  className="select"
                  value={editPlan.billingInterval}
                  onChange={(e) =>
                    setEditPlan((v) => ({ ...v, billingInterval: e.target.value as "monthly" | "yearly" }))
                  }
                >
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                </select>
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={editPlan.isActive}
                  onChange={(e) => setEditPlan((v) => ({ ...v, isActive: e.target.checked }))}
                />
                Active
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingPlanId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
