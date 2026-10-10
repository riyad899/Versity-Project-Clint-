
import { useCallback, useEffect, useState } from 'react';
import '../App.css';

const API_URL = 'http://localhost:5009/api/v1';

export default function AssignmentDashboard() {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);

  const [selectedBus, setSelectedBus] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError('');

      const [busRes, driverRes, routeRes] = await Promise.all([
        fetch(`${API_URL}/buses`, { credentials: 'include' }),
        fetch(`${API_URL}/transportation-managers/drivers`, {
          credentials: 'include',
        }),
        fetch(`${API_URL}/routes`, { credentials: 'include' }),
      ]);

      if (!busRes.ok || !driverRes.ok || !routeRes.ok) {
        throw new Error(
          'Unable to load dashboard data. Please check your manager session.'
        );
      }

      const [busData, driverData, routeData] = await Promise.all([
        busRes.json(),
        driverRes.json(),
        routeRes.json(),
      ]);

      setBuses(Array.isArray(busData.data) ? busData.data : []);
      setDrivers(Array.isArray(driverData.data) ? driverData.data : []);
      setRoutes(Array.isArray(routeData.data) ? routeData.data : []);
    } catch (err) {
      setError(err.message || 'Could not load dashboard data.');
    }
  }, []);

  useEffect(() => {
    async function initialize() {
      setLoading(true);
      await loadData();
      setLoading(false);
    }

    initialize();
  }, [loadData]);

  async function handleAssign(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedBus || !selectedDriver || !selectedRoute) {
      setError('Please select a bus, driver, and route.');
      return;
    }

    try {
      setSaving(true);

      const driverRes = await fetch(
        `${API_URL}/buses/${selectedBus}/assign-driver`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ driverId: selectedDriver }),
        }
      );

      if (!driverRes.ok) {
        const data = await driverRes.json().catch(() => ({}));
        throw new Error(data.message || 'Driver assignment failed.');
      }

      const routeRes = await fetch(
        `${API_URL}/buses/${selectedBus}/assign-route`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ routeId: selectedRoute }),
        }
      );

      if (!routeRes.ok) {
        const data = await routeRes.json().catch(() => ({}));
        throw new Error(
          data.message ||
            'Driver assigned, but route assignment failed. Please check the bus.'
        );
      }

      setMessage('Driver and route assigned successfully!');
      await loadData();
    } catch (err) {
      setError(err.message || 'Assignment failed.');
    } finally {
      setSaving(false);
    }
  }

  const assignedBuses = buses.filter(
    (bus) => bus.assignedDriver && bus.assignedRoute
  ).length;

  if (loading) {
    return (
      <section className="assignment-dashboard">
        <div className="assignment-loading">
          <span className="loading-dot" />
          <p>Preparing your transportation dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="assignment-dashboard">
      <div className="manager-heading">
        <div>
          <span className="manager-eyebrow">
            CAMPUSMOVE / MANAGEMENT
          </span>
          <h1>Transportation Overview</h1>
          <p>
            Manage your campus fleet, assign drivers, and organize routes
            from one place.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={loadData}
          title="Refresh dashboard data"
        >
          <span aria-hidden="true">↻</span> Refresh
        </button>
      </div>

      {error && (
        <div className="manager-alert manager-alert-error" role="alert">
          <span>!</span>
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="manager-alert manager-alert-success" role="status">
          <span>✓</span>
          <p>{message}</p>
        </div>
      )}

      <div className="manager-stats">
        <article className="manager-stat-card">
          <div className="stat-icon stat-icon-green">▣</div>
          <p>Total buses</p>
          <strong>{buses.length}</strong>
          <span>Registered fleet</span>
        </article>

        <article className="manager-stat-card">
          <div className="stat-icon stat-icon-blue">♙</div>
          <p>Drivers</p>
          <strong>{drivers.length}</strong>
          <span>Available driver accounts</span>
        </article>

        <article className="manager-stat-card">
          <div className="stat-icon stat-icon-purple">⇄</div>
          <p>Routes</p>
          <strong>{routes.length}</strong>
          <span>Registered routes</span>
        </article>

        <article className="manager-stat-card">
          <div className="stat-icon stat-icon-orange">✓</div>
          <p>Assigned buses</p>
          <strong>{assignedBuses}</strong>
          <span>With driver and route</span>
        </article>
      </div>

      <div className="manager-section-heading">
        <div>
          <span className="manager-eyebrow">FLEET OPERATIONS</span>
          <h2>Create an assignment</h2>
          <p>Connect one bus with its driver and transportation route.</p>
        </div>
        <span className="manager-step-badge">01 / ASSIGN</span>
      </div>

      <form className="manager-assignment-form" onSubmit={handleAssign}>
        <label className="manager-field">
          <span className="manager-field-icon">▣</span>
          <span className="manager-field-title">Select bus</span>
          <span className="manager-field-hint">
            Choose a registered vehicle
          </span>
          <select
            value={selectedBus}
            onChange={(e) => setSelectedBus(e.target.value)}
            required
          >
            <option value="">Choose a bus</option>
            {buses.map((bus) => (
              <option key={bus._id} value={bus._id}>
                {bus.busNumber} — {bus.name}
              </option>
            ))}
          </select>
        </label>

        <label className="manager-field">
          <span className="manager-field-icon">♙</span>
          <span className="manager-field-title">Select driver</span>
          <span className="manager-field-hint">
            Choose a registered driver
          </span>
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            required
          >
            <option value="">Choose a driver</option>
            {drivers.map((driver) => (
              <option
                key={driver._id || driver.id}
                value={driver._id || driver.id}
              >
                {driver.name} — {driver.email}
              </option>
            ))}
          </select>
        </label>

        <label className="manager-field">
          <span className="manager-field-icon">⇄</span>
          <span className="manager-field-title">Select route</span>
          <span className="manager-field-hint">
            Choose a transportation route
          </span>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            required
          >
            <option value="">Choose a route</option>
            {routes.map((route) => (
              <option key={route._id} value={route._id}>
                {route.routeName} — {route.startPoint} to {route.endPoint}
              </option>
            ))}
          </select>
        </label>

        <div className="manager-form-footer">
          <p>
            <span aria-hidden="true">ⓘ</span>
            Review your selections before assigning.
          </p>
          <button
            className="manager-assign-button"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Assigning...' : 'Assign driver & route'}
            {!saving && <span aria-hidden="true"> →</span>}
          </button>
        </div>
      </form>

      <div className="manager-section-heading manager-list-heading">
        <div>
          <span className="manager-eyebrow">FLEET DIRECTORY</span>
          <h2>Current bus assignments</h2>
          <p>Review the driver and route currently linked to each bus.</p>
        </div>
        <span className="manager-count-badge">
          {buses.length} {buses.length === 1 ? 'bus' : 'buses'}
        </span>
      </div>

      {buses.length === 0 ? (
        <div className="manager-empty-state">
          <span>▣</span>
          <h3>No buses registered yet</h3>
          <p>Add a bus to start creating transportation assignments.</p>
        </div>
      ) : (
        <div className="manager-bus-grid">
          {buses.map((bus) => (
            <article className="manager-bus-card" key={bus._id}>
              <div className="manager-bus-card-top">
                <div className="manager-bus-icon">🚌</div>
                <span
                  className={`manager-status ${
                    bus.status === 'active'
                      ? 'manager-status-active'
                      : 'manager-status-other'
                  }`}
                >
                  {bus.status || 'Unknown'}
                </span>
              </div>

              <div className="manager-bus-identity">
                <span>BUS {bus.busNumber}</span>
                <h3>{bus.name}</h3>
                <p>{bus.licensePlate || 'License plate unavailable'}</p>
              </div>

              <div className="manager-bus-details">
                <div className="manager-detail-row">
                  <span className="manager-detail-icon">♙</span>
                  <div>
                    <small>Assigned driver</small>
                    <strong>
                      {bus.assignedDriver?.name || 'Not assigned'}
                    </strong>
                    {bus.assignedDriver?.email && (
                      <span>{bus.assignedDriver.email}</span>
                    )}
                  </div>
                </div>

                <div className="manager-detail-row">
                  <span className="manager-detail-icon">⇄</span>
                  <div>
                    <small>Transportation route</small>
                    <strong>
                      {bus.assignedRoute?.routeName || 'Not assigned'}
                    </strong>
                    {bus.assignedRoute?.startPoint &&
                      bus.assignedRoute?.endPoint && (
                        <span>
                          {bus.assignedRoute.startPoint} →{' '}
                          {bus.assignedRoute.endPoint}
                        </span>
                      )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="manager-edit-button"
                onClick={() => {
                  setSelectedBus(bus._id);
                  setSelectedDriver(
                    bus.assignedDriver?._id ||
                      bus.assignedDriver?.id ||
                      ''
                  );
                  setSelectedRoute(
                    bus.assignedRoute?._id ||
                      bus.assignedRoute?.id ||
                      ''
                  );
                  setMessage('');
                  setError('');
                  document
                    .querySelector('.manager-assignment-form')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                Edit assignment <span aria-hidden="true">↗</span>
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
