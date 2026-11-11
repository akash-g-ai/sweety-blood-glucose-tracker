export default function ReportSummary({ summary }) {
  function Stat({ value, label, unit }) {
    return (
      <div className="stat">
        <div className="stat__main">
          <span className="stat__value">{value ?? "—"}</span>
          {unit && <span className="stat__unit">{unit}</span>}
        </div>
        <span className="stat__label">{label}</span>
      </div>
    );
  }

  function ReportCard({ data, label }) {
    return (
      <div className="report-card">
        <h3 className="report-card__label">{label}</h3>
        <div className="report-card__stats">
          <Stat value={data.average} label="Average" unit="mg/dL" />
          <Stat value={data.highest} label="Highest" unit="mg/dL" />
          <Stat value={data.lowest} label="Lowest" unit="mg/dL" />
          <Stat value={data.count} label="Readings" />
        </div>
      </div>
    );
  }

  return (
    <div className="report-summary">
      <ReportCard data={summary.daily} label="Today" />
      <ReportCard data={summary.month_to_date} label="This Month" />
      <ReportCard data={summary.previous_month} label="Last Month" />
    </div>
  );
}