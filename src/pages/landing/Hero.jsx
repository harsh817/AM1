import { Button, HERO_PRICE_LABEL } from "./shared.jsx";

export function Hero() {
  return (
    <section className="hero styleiq-hero" id="top">
      <div className="shell styleiq-page-shell">
        <div className="styleiq-hero-shell">
          <div className="hero-copy">
            <p className="hero-eyebrow">Dear Men</p>
            <h1 aria-label="Stop Guessing What Actually Looks Good On You">
              <span className="hero-title-line">Stop Guessing</span>
              <span className="hero-title-line">What Actually Looks</span>
              <span className="hero-title-line">Good On You</span>
            </h1>
            <p className="hero-lead">
              Get a personalized style report built around your face, body, height, skin tone, lifestyle, and preferences and start dressing better.
            </p>
            <figure className="hero-image">
              <img
                src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_900/v1788004059/ChatGPT_Image_Aug_29_2026_05_15_55_PM_b6cubf.webp"
                alt="Personal style transformation"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width="900"
                height="900"
              />
            </figure>
            <div className="hero-action-row">
              <Button showIcon={false} />
              <span>{HERO_PRICE_LABEL}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
