import { useEffect, useMemo, useState } from 'react';

function getRemainingTime(endsAt) {
  const target = new Date(endsAt).getTime();
  if (!Number.isFinite(target)) return null;

  const remaining = Math.max(0, target - Date.now());

  return {
    total: remaining,
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining % 86400000) / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
    seconds: Math.floor((remaining % 60000) / 1000),
  };
}

export default function OfferCountdown({ endsAt, label = 'Offer ends in', className = '' }) {
  const initialTime = useMemo(() => getRemainingTime(endsAt), [endsAt]);
  const [remaining, setRemaining] = useState(initialTime);

  useEffect(() => {
    setRemaining(getRemainingTime(endsAt));
    if (!endsAt) return undefined;

    const timer = window.setInterval(() => {
      const next = getRemainingTime(endsAt);
      setRemaining(next);
      if (!next || next.total <= 0) window.clearInterval(timer);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [endsAt]);

  if (!remaining || remaining.total <= 0) return null;

  const units = [
    ['Days', remaining.days],
    ['Hours', remaining.hours],
    ['Minutes', remaining.minutes],
    ['Seconds', remaining.seconds],
  ];

  return (
    <div
      className={`offer-countdown ${className}`.trim()}
      role="timer"
      aria-label={`${label}: ${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes, ${remaining.seconds} seconds`}
    >
      <span className="offer-countdown-label">{label}</span>
      <div className="offer-countdown-units" aria-hidden="true">
        {units.map(([unit, value]) => (
          <span className="offer-countdown-unit" key={unit}>
            <strong>{String(value).padStart(2, '0')}</strong>
            <small>{unit}</small>
          </span>
        ))}
      </div>
    </div>
  );
}
