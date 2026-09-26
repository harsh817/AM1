import { trustBadges } from "../../lib/landing-data.js";

function TrustBadges() {
  return (
    <div className="trust-badges" aria-label="StyleIQ proof points">
      {trustBadges.map((badge) => (
        <span key={badge}>{badge}</span>
      ))}
    </div>
  );
}

export function TrustSection() {
  return (
    <section className="trust-section">
      <div className="shell trust-section-shell">
        <TrustBadges />
      </div>
    </section>
  );
}
