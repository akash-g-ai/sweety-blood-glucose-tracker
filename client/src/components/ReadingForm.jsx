import { useState, useEffect } from "react";
import { apiFetch } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { API_PATHS, SLOTS, VALUE_MIN, VALUE_MAX, todayInKolkata } from "../utils/constants.js";
import ErrorMessage from "./ErrorMessage.jsx";
import LoadingIndicator from "./LoadingIndicator.jsx";

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const KOLKATA_TZ = "Asia/Kolkata";

function isValidCalendarDate(str) {
  const match = str.match(DATE_RE);
  if (!match) return false;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

function isFutureDate(str) {
  const todayKolkata = new Date().toLocaleDateString("en-CA", { timeZone: KOLKATA_TZ });
  return str > todayKolkata;
}

export default function ReadingForm({ onSaved, editingReading, onCancelEdit }) {
  const { clearSession } = useAuth();
  const isEditing = Boolean(editingReading);

  const [readingDate, setReadingDate] = useState(editingReading?.reading_date ?? todayInKolkata());
  const [slot, setSlot] = useState(editingReading?.slot ?? "morning_fasting");
  const [valueMgdl, setValueMgdl] = useState(editingReading?.value_mgdl ?? "");
  const [notes, setNotes] = useState(editingReading?.notes ?? "");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingReading) {
      setReadingDate(editingReading.reading_date);
      setSlot(editingReading.slot);
      setValueMgdl(editingReading.value_mgdl);
      setNotes(editingReading.notes ?? "");
    } else {
      setReadingDate(todayInKolkata());
      setSlot("morning_fasting");
      setValueMgdl("");
      setNotes("");
    }
    setError(null);
  }, [editingReading]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!readingDate) { setError("Date is required."); return; }
    if (!isValidCalendarDate(readingDate)) { setError("Date must be a valid date in YYYY-MM-DD format."); return; }
    if (isFutureDate(readingDate)) { setError("Date cannot be in the future."); return; }
    const value = Number(valueMgdl);
    if (!Number.isInteger(value) || value < VALUE_MIN || value > VALUE_MAX) {
      setError("Value must be a whole number between " + VALUE_MIN + " and " + VALUE_MAX + ".");
      return;
    }
    const body = { reading_date: readingDate, slot, value_mgdl: value, notes: notes.trim() || null };
    setSubmitting(true);
    try {
      if (isEditing) {
        await apiFetch(API_PATHS.READINGS + "/" + editingReading.id, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch(API_PATHS.READINGS, { method: "POST", body: JSON.stringify(body) });
      }
      onSaved();
    } catch (err) {
      if (err.status === 401) { clearSession(); return; }
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="reading-form" onSubmit={handleSubmit}>
      <h2 className="reading-form__title">
        <svg className="reading-form__title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isEditing ? (
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          ) : (
            <path d="M12 5v14M5 12h14" />
          )}
        </svg>
        {isEditing ? "Edit Reading" : "Add Reading"}
      </h2>
      <p className="reading-form__subtitle">
        {isEditing ? "Update the details of this reading" : "Log a new blood glucose reading"}
      </p>
      <div className="form-group">
        <label htmlFor="reading_date">Date</label>
        <input id="reading_date" type="date" value={readingDate} max={todayInKolkata()} onChange={(e) => setReadingDate(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="slot">Slot</label>
        <select id="slot" value={slot} onChange={(e) => setSlot(e.target.value)}>
          {SLOTS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="value_mgdl">Value (mg/dL)</label>
        <input id="value_mgdl" type="number" min={VALUE_MIN} max={VALUE_MAX} step="1" value={valueMgdl} onChange={(e) => setValueMgdl(e.target.value)} placeholder="e.g. 95" required />
      </div>
      <div className="form-group">
        <label htmlFor="notes">Notes (optional)</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes about this reading..." rows="2" />
      </div>
      <ErrorMessage message={error} />
      <div className="reading-form__actions">
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? <LoadingIndicator inline label="Saving..." /> : (isEditing ? "Update" : "Add Reading")}
        </button>
        {isEditing && (
          <button type="button" className="btn btn--ghost" onClick={onCancelEdit}>Cancel</button>
        )}
      </div>
    </form>
  );
}