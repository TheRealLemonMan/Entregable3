interface FeedbackProps {
  message: string;
  onRetry?: () => void;
}

type SkeletonVariant = "library" | "detail" | "sessions" | "form";

export function Loading({ message = "Cargando...", variant = "inline" }: { message?: string; variant?: SkeletonVariant | "inline" }) {
  if (variant === "inline") {
    return <div className="feedback" role="status"><span className="spinner" aria-hidden="true" />{message}</div>;
  }

  const count = variant === "library" ? 6 : variant === "sessions" ? 4 : 0;
  return (
    <div className={`skeleton-layout skeleton-${variant}`} role="status" aria-label={message}>
      <span className="sr-only">{message}</span>
      {variant === "library" && <div className="skeleton-cards">{Array.from({ length: count }, (_, index) => <div className="skeleton-game" key={index}><div className="skeleton-block skeleton-cover" /><div className="skeleton-game-body"><div className="skeleton-block skeleton-line short" /><div className="skeleton-block skeleton-line" /><div className="skeleton-block skeleton-line small" /></div></div>)}</div>}
      {variant === "detail" && <><div className="skeleton-detail-hero"><div className="skeleton-block skeleton-detail-cover" /><div className="skeleton-detail-copy"><div className="skeleton-block skeleton-line short" /><div className="skeleton-block skeleton-line title" /><div className="skeleton-block skeleton-line medium" /></div></div><div className="skeleton-block skeleton-section-title" /><div className="skeleton-stats">{Array.from({ length: 4 }, (_, index) => <div className="skeleton-block skeleton-stat" key={index} />)}</div><div className="skeleton-block skeleton-section-title" /><div className="skeleton-achievements">{Array.from({ length: 3 }, (_, index) => <div className="skeleton-block skeleton-achievement" key={index} />)}</div></>}
      {variant === "sessions" && <div className="skeleton-sessions">{Array.from({ length: count }, (_, index) => <div className="skeleton-block skeleton-session" key={index} />)}</div>}
      {variant === "form" && <><div className="skeleton-block skeleton-form-title" /><div className="skeleton-form">{Array.from({ length: 5 }, (_, index) => <div className="skeleton-block skeleton-field" key={index} />)}</div></>}
    </div>
  );
}

export function ErrorMessage({ message, onRetry }: FeedbackProps) {
  return (
    <div className="feedback feedback-error" role="alert">
      <span>{message}</span>
      {onRetry && <button className="button button-small" type="button" onClick={onRetry}>Reintentar</button>}
    </div>
  );
}

export function Empty({ title, detail }: { title: string; detail: string }) {
  return <div className="empty-state"><span className="empty-icon" aria-hidden="true">◇</span><h2>{title}</h2><p>{detail}</p></div>;
}
