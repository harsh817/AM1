import { useEffect, useState } from "react";
import { CHECKOUT_TARGET, PRICE_LABEL } from "./shared.jsx";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
function getTimeUntilIstMidnight() {
  const now = Date.now();
  const istNow = new Date(now + IST_OFFSET_MS);
  const nextMidnight = Date.UTC(
    istNow.getUTCFullYear(),
    istNow.getUTCMonth(),
    istNow.getUTCDate() + 1,
  );
  const remaining = Math.max(0, nextMidnight - (now + IST_OFFSET_MS));
  const totalSeconds = Math.floor(remaining / 1000);

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const padTimerPart = (value) => String(value).padStart(2, "0");

export function StickyBuyBar() {
  const [remaining, setRemaining] = useState(getTimeUntilIstMidnight);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getTimeUntilIstMidnight()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const hero = document.querySelector(".hero");

    const updateVisibility = () => {
      const pastHero = hero ? hero.getBoundingClientRect().bottom <= 0 : false;
      setVisible(pastHero);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("has-sticky-buy", visible);
    return () => document.body.classList.remove("has-sticky-buy");
  }, [visible]);

  const timerText = `${padTimerPart(remaining.hours)}:${padTimerPart(remaining.minutes)}:${padTimerPart(remaining.seconds)}`;

  return (
    <aside className={`sticky-buy-bar ${visible ? "visible" : ""}`} aria-hidden={!visible}>
      <div className="sticky-buy-inner">
        <div className="sticky-buy-details">
          <div className="sticky-buy-offer">
            <span>Today's Price</span>
            <strong>{PRICE_LABEL}</strong>
          </div>
          <div className="sticky-buy-countdown">
            <span>Ends In</span>
            <time aria-label={`${remaining.hours} hours, ${remaining.minutes} minutes and ${remaining.seconds} seconds remaining`}>{timerText}</time>
          </div>
        </div>
        <a className="sticky-buy-button" href={CHECKOUT_TARGET}>Get My Report</a>
      </div>
    </aside>
  );
}
