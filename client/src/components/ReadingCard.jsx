import { SLOT_LABELS } from "../utils/constants.js";
import LoadingIndicator from "./LoadingIndicator.jsx";

export default function ReadingCard({ reading, onEdit, onDelete, deletingId }) {
  const isDeleting = deletingId === reading.id;

  return (
    <div className="reading-card">
      <div className="reading-card__main">
        <span className="reading-card__slot">{SLOT_LABELS[reading.slot] ?? reading.slot}</span>
        <span className="reading-card__value">{reading.value_mgdl} <span className="reading-card__unit">mg/dL</span></span>
      </div>
      {reading.notes && <p className="reading-card__notes">{reading.notes}</p>}
      <div className="reading-card__actions">
        <button className="btn btn--small btn--ghost" onClick={() => onEdit(reading)}>Edit</button>
        <button className="btn btn--small btn--danger-ghost" onClick={() => onDelete(reading)} disabled={isDeleting}>
          {isDeleting ? <LoadingIndicator inline /> : "Delete"}
        </button>
      </div>
    </div>
  );
}