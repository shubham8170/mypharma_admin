import { type FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { login, token, isReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isReady && token) {
    return <Navigate to={from === "/login" ? "/" : from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from === "/login" ? "/" : from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <div className="login-brand-mark">MP</div>
          <div>
            <h1 className="login-brand-title">MyPharma Admin</h1>
            <p className="login-brand-sub">Sign in to the pharmacy console</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error ? (
            <div className="login-error" role="alert">
              {error}
            </div>
          ) : null}

          <div className="form-row">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@mypharma.com"
            />
          </div>
          <div className="form-row">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary login-submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>

        </form>
      </div>
    </div>
  );
}
