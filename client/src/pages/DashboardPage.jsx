import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../services/api.js";
import { API_PATHS, todayInKolkata } from "../utils/constants.js";
import { useAuth } from "../hooks/useAuth.jsx";
import ReadingForm from "../components/ReadingForm.jsx";
import ReadingList from "../components/ReadingList.jsx";
import Header from "../components/Header.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import LoadingIndicator from "../components/LoadingIndicator.jsx";
import ReportSummary from "../components/ReportSummary.jsx";
import TrendChart from "../components/TrendChart.jsx";

export default function DashboardPage() {
  const { clearSession } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReading, setEditingReading] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState(null);

  const loadReadings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(API_PATHS.READINGS);
      setReadings(data);
    } catch (err) {
      if (err.status === 401) {
        clearSession();
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const [s, t] = await Promise.all([
        apiFetch(API_PATHS.REPORTS_SUMMARY),
        apiFetch(API_PATHS.REPORTS_TREND),
      ]);
      setSummary(s);
      setTrend(t);
    } catch (err) {
      if (err.status === 401) {
        clearSession();
        return;
      }
      setReportsError(err.message);
    } finally {
      setReportsLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    loadReadings();
  }, [loadReadings, refreshKey]);

  useEffect(() => {
    loadReports();
  }, [loadReports, refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleEdit(reading) {
    setEditingReading(reading);
  }

  function handleCancelEdit() {
    setEditingReading(null);
  }

  function handleSaved() {
    setEditingReading(null);
    refresh();
  }

  async function handleDelete(reading) {
    if (!window.confirm("Delete this reading?")) return;
    setDeletingId(reading.id);
    try {
      await apiFetch(API_PATHS.READINGS + "/" + reading.id, { method: "DELETE" });
      refresh();
    } catch (err) {
      if (err.status === 401) {
        clearSession();
        return;
      }
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="dashboard">
      <Header />
      <main className="dashboard__main">
        <div className="welcome">
          <h1 className="welcome__title">Your Glucose Overview</h1>
          <p className="welcome__subtitle">
            <span className="welcome__date">{todayInKolkata()}</span> - Track and manage your blood glucose readings
          </p>
        </div>
        <div className="dashboard__grid">
          <section className="dashboard__form">
            <ReadingForm
              onSaved={handleSaved}
              editingReading={editingReading}
              onCancelEdit={handleCancelEdit}
            />
          </section>
          <section className="dashboard__readings">
            <h2 className="dashboard__section-title">Your Readings</h2>
            <ErrorMessage message={error} />
            <ReadingList
              readings={readings}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
              deletingId={deletingId}
            />
          </section>
        </div>
        <div className="reports-section">
          <h2 className="dashboard__section-title">Reports</h2>
          <ErrorMessage message={reportsError} />
          {reportsLoading ? (
            <LoadingIndicator label="Loading reports..." />
          ) : (
            <>
              {summary && <ReportSummary summary={summary} />}
              {trend && (
                <>
                  <h3 className="reports-section__subtitle">Monthly Glucose Trend</h3>
                  <TrendChart trend={trend} />
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}