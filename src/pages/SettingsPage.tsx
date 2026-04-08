export function SettingsPage() {
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Settings</h1>
          <p className="lede">Pharmacy profile, notifications, and security. Persist with your backend settings API.</p>
        </div>
        <button type="button" className="btn-primary">
          Save changes
        </button>
      </header>

      <div className="settings-grid">
        <article className="card settings-card">
          <div className="card-head">
            <h2>Pharmacy profile</h2>
            <p>Shown on invoices and compliance documents.</p>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="biz-name">Legal business name</label>
              <input id="biz-name" className="input" type="text" defaultValue="MyPharma Distribution Pvt Ltd" />
            </div>
            <div className="form-row">
              <label htmlFor="license">Drug licence No.</label>
              <input id="license" className="input" type="text" defaultValue="DL-MAS-204918" />
            </div>
            <div className="form-row">
              <label htmlFor="gst">GSTIN</label>
              <input id="gst" className="input" type="text" defaultValue="29ABCDE1234F1Z5" />
            </div>
            <div className="form-row">
              <label htmlFor="city">City / State</label>
              <input id="city" className="input" type="text" defaultValue="Bengaluru, Karnataka" />
            </div>
          </div>
        </article>

        <article className="card settings-card">
          <div className="card-head">
            <h2>Notifications</h2>
            <p>Email alerts for stock and orders.</p>
          </div>
          <div className="form-grid">
            <label className="checkbox-row">
              <input type="checkbox" defaultChecked />
              Low stock below reorder level
            </label>
            <label className="checkbox-row">
              <input type="checkbox" defaultChecked />
              New B2B orders
            </label>
            <label className="checkbox-row">
              <input type="checkbox" />
              Daily sales summary
            </label>
          </div>
        </article>

        <article className="card settings-card">
          <div className="card-head">
            <h2>Security</h2>
            <p>Session and access for admin users.</p>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="email">Admin email</label>
              <input id="email" className="input" type="email" defaultValue="admin@mypharma.com" autoComplete="email" />
            </div>
            <div className="form-row">
              <label htmlFor="session">Session timeout</label>
              <select id="session" className="select" defaultValue="60">
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="twofa">Two-factor authentication</label>
              <select id="twofa" className="select" defaultValue="off">
                <option value="off">Off</option>
                <option value="email">Email OTP</option>
                <option value="app">Authenticator app</option>
              </select>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
