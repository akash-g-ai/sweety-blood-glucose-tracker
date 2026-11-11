export default function LoadingIndicator({ label, inline = false }) {
  if (inline) {
    return (
      <span className="loading-indicator loading-indicator--inline" role="status" aria-live="polite">
        <svg className="loading-indicator__svg loading-indicator__svg--inline" viewBox="0 0 60 24" fill="none">
          <path className="ecg-line ecg-line--inline" d="M 0 12 L 12 12 L 15 8 L 18 16 L 21 4 L 24 20 L 27 12 L 60 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label && <span className="loading-indicator__label">{label}</span>}
      </span>
    );
  }

  return (
    <div className="loading-indicator loading-indicator--centered" role="status" aria-live="polite">
      <svg className="loading-indicator__svg" viewBox="0 0 120 24" fill="none">
        <path className="ecg-line" d="M 0 12 L 25 12 L 30 8 L 35 16 L 40 4 L 45 20 L 50 12 L 120 12" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label && <span className="loading-indicator__label">{label}</span>}
    </div>
  );
}