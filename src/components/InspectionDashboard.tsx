import { useState } from 'react';

type Asset = {
  id: string;
  name: string;
  type: string;
  score: number;
  status: "Healthy" | "Attention" | "Critical";
};

const assets: Asset[] = [
  {
    id: "M-102",
    name: "CNC Machine M-102",
    type: "Machine",
    score: 92,
    status: "Healthy",
  },
  {
    id: "T-018",
    name: "Turbine T-018",
    type: "Turbine",
    score: 76,
    status: "Attention",
  },
  {
    id: "B-204",
    name: "Bridge Section B-204",
    type: "Structure",
    score: 61,
    status: "Critical",
  },
];

function StatusBadge({ status }: { status: Asset["status"] }) {
  return (
    <span className={`status-badge ${status.toLowerCase()}`}>
      {status}
    </span>
  );
}

export default function InspectionDashboard() {
  const healthy = assets.filter((a) => a.status === "Healthy").length;
  const attention = assets.filter((a) => a.status === "Attention").length;
  const critical = assets.filter((a) => a.status === "Critical").length;

  return (
    <main className="inspection-dashboard">

      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            ASSET INTELLIGENCE
          </span>

          <h1>Inspection Dashboard</h1>

          <p>
            Monitor machine condition, inspection activity and
            engineering findings.
          </p>
        </div>

        <button className="new-inspection-button">
          + New Inspection
        </button>
      </header>

      <section className="metric-grid">

        <div className="metric-card">
          <span className="metric-icon">🏭</span>
          <span className="metric-label">Total Assets</span>
          <strong>{assets.length}</strong>
          <small>Under monitoring</small>
        </div>

        <div className="metric-card">
          <span className="metric-icon">🔍</span>
          <span className="metric-label">Active Inspections</span>
          <strong>12</strong>
          <small>Currently running</small>
        </div>

        <div className="metric-card">
          <span className="metric-icon">⚠️</span>
          <span className="metric-label">Critical Alerts</span>
          <strong>{critical}</strong>
          <small>Require attention</small>
        </div>

        <div className="metric-card">
          <span className="metric-icon">✓</span>
          <span className="metric-label">Healthy Assets</span>
          <strong>{healthy}</strong>
          <small>No critical findings</small>
        </div>

      </section>

      <section className="dashboard-grid">

        <div className="dashboard-panel health-panel">

          <div className="panel-heading">
            <div>
              <h2>Asset Health</h2>
              <p>Current condition overview</p>
            </div>
          </div>

          <div className="health-content">

            <div className="health-ring">
              <strong>87</strong>
              <span>/100</span>
            </div>

            <div className="health-breakdown">

              <div>
                <span className="health-dot healthy-dot" />
                <span>Healthy</span>
                <strong>{healthy}</strong>
              </div>

              <div>
                <span className="health-dot attention-dot" />
                <span>Attention</span>
                <strong>{attention}</strong>
              </div>

              <div>
                <span className="health-dot critical-dot" />
                <span>Critical</span>
                <strong>{critical}</strong>
              </div>

            </div>

          </div>
        </div>

        <div className="dashboard-panel">

          <div className="panel-heading">
            <div>
              <h2>Critical Alerts</h2>
              <p>Assets requiring inspection</p>
            </div>
          </div>

          <div className="alert-list">

            <div className="alert-item">
              <span className="alert-symbol">!</span>

              <div>
                <strong>Bridge Section B-204</strong>
                <p>Structural condition requires review.</p>
              </div>
            </div>

            <div className="alert-item">
              <span className="alert-symbol">!</span>

              <div>
                <strong>Turbine T-018</strong>
                <p>Abnormal inspection measurement.</p>
              </div>
            </div>

          </div>
        </div>

      </section>

      <section className="dashboard-panel recent-panel">

        <div className="panel-heading">
          <div>
            <h2>Recent Inspections</h2>
            <p>Latest engineering inspection activity</p>
          </div>

          <button className="view-button">
            View all
          </button>
        </div>

        <div className="asset-table">

          <div className="table-header">
            <span>Asset</span>
            <span>Type</span>
            <span>Condition</span>
            <span>Status</span>
          </div>

          {assets.map((asset) => (
            <div className="table-row" key={asset.id}>

              <div>
                <strong>{asset.name}</strong>
                <small>ID: {asset.id}</small>
              </div>

              <span>{asset.type}</span>

              <strong>{asset.score}/100</strong>

              <StatusBadge status={asset.status} />

            </div>
          ))}

        </div>

      </section>

    </main>
  );
}
