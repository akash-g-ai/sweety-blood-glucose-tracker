import ReadingCard from "./ReadingCard.jsx";
import LoadingIndicator from "./LoadingIndicator.jsx";

export default function ReadingList({ readings, onEdit, onDelete, loading, deletingId }) {
  if (loading) {
    return <LoadingIndicator label="Loading readings..." />;
  }

  if (!readings.length) {
    return (
      <div className="reading-list__empty">
        <p>No readings yet. Add your first blood glucose reading above.</p>
      </div>
    );
  }

  const byDate = {};
  for (const r of readings) {
    if (!byDate[r.reading_date]) byDate[r.reading_date] = [];
    byDate[r.reading_date].push(r);
  }

  const dates = Object.keys(byDate).sort().reverse();

  return (
    <div className="reading-list">
      {dates.map((date) => (
        <div key={date} className="reading-list__group">
          <h3 className="reading-list__date">{date}</h3>
          <div className="reading-list__cards">
            {byDate[date].map((reading) => (
              <ReadingCard
                key={reading.id}
                reading={reading}
                onEdit={onEdit}
                onDelete={onDelete}
                deletingId={deletingId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}