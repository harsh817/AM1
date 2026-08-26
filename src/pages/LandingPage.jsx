import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CaretDown,
  CaretLeft,
  CaretRight,
  Check,
  ShieldCheck,
  Star,
  StarHalf,
  X,
} from "@phosphor-icons/react";
import {
  bonuses,
  comparisonRows,
  faqs,
  heroBenefits,
  processSteps,
  recapItems,
  reportContentGroups,
  styleIqPillars,
  testimonials,
  trustBadges,
} from "../lib/landing-data.js";
import { CHECKOUT_PATH } from "../routes.js";

const CHECKOUT_TARGET = CHECKOUT_PATH;
const PRICE_LABEL = "\u20B91,999 + GST";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const transformationSlides = [
  "https://res.cloudinary.com/dhjsqmejb/image/upload/v1784628150/ankur_hhdjc8.png",
  "https://res.cloudinary.com/dhjsqmejb/image/upload/v1784628150/rahul_j5oyv6.png",
  "https://res.cloudinary.com/dhjsqmejb/image/upload/v1784628151/satyam_ttlk1w.png",
  "https://res.cloudinary.com/dhjsqmejb/image/upload/v1784628303/ChatGPT_Image_Jul_21_2026_03_34_51_PM_qi3dmf.png",
];

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

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="AttractiveMen home">
      AttractiveMen
    </a>
  );
}

function Button({ children = "Show Me What Suits Me", light = false, className = "" }) {
  return (
    <a className={`button ${light ? "button-light" : ""} ${className}`} href={CHECKOUT_TARGET}>
      <span>{children}</span>
      <ArrowRight size={20} weight="regular" aria-hidden="true" />
    </a>
  );
}

function StickyBuyBar() {
  const [remaining, setRemaining] = useState(getTimeUntilIstMidnight);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getTimeUntilIstMidnight()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const hero = document.querySelector(".hero");
    const purchase = document.getElementById("purchase");

    const updateVisibility = () => {
      const pastHero = hero ? hero.getBoundingClientRect().bottom <= 0 : false;
      const finalOfferVisible = purchase ? purchase.getBoundingClientRect().top <= window.innerHeight : false;
      setVisible(pastHero && !finalOfferVisible);
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
        <div className="sticky-buy-offer">
          <strong>{PRICE_LABEL}</strong>
          <span>One-time payment</span>
        </div>
        <div className="sticky-buy-countdown">
          <span>Today ends in</span>
          <time aria-label={`${remaining.hours} hours, ${remaining.minutes} minutes and ${remaining.seconds} seconds remaining`}>{timerText}</time>
        </div>
        <a className="sticky-buy-button" href={CHECKOUT_TARGET}>Buy Now <ArrowRight size={18} aria-hidden="true" /></a>
      </div>
    </aside>
  );
}

function SectionHeading({ children, intro, align = "center" }) {
  return (
    <div className={`section-heading section-heading-${align}`}>
      <h2>{children}</h2>
      {intro ? <p className="section-intro">{intro}</p> : null}
    </div>
  );
}

function TrustBadges() {
  return (
    <div className="trust-badges" aria-label="StyleIQ proof points">
      {trustBadges.map((badge) => (
        <span key={badge}>{badge}</span>
      ))}
    </div>
  );
}

function StyleIqPreview() {
  return (
    <div className="styleiq-preview" aria-label="StyleIQ input and report preview">
      <div className="styleiq-preview-card">
        <div className="styleiq-preview-block">
          <small>Your Inputs</small>
          <strong>Face - Build - Coloring - Lifestyle</strong>
        </div>
        <ArrowDown size={28} weight="regular" aria-hidden="true" />
        <div className="styleiq-preview-block">
          <small>Your Style Plan</small>
          <strong>Haircut - Colors - Fits - Outfits - Grooming</strong>
        </div>
      </div>
      <div className="report-preview-stack" aria-hidden="true">
        <img src="/assets/product/style-report.png" alt="" loading="eager" />
        <img src="/assets/product/attractivemen-style-report-mockup-v2.png" alt="" loading="eager" />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero styleiq-hero" id="top">
      <div className="shell hero-shell styleiq-hero-shell">
        <div className="hero-copy">
          <Brand />
          <p className="hero-eyebrow">Dear Indian Men</p>
          <h1>Stop Guessing What Actually Looks Good On You</h1>
          <p className="hero-lead">
            Get a personalized report for your hair, colors, fits, outfits, beard, shoes, and accessories, built around your face, body, height, skin tone, lifestyle, and preferences.
          </p>
          <ul className="hero-benefits">
            {heroBenefits.map((benefit) => (
              <li key={benefit}><Check size={18} weight="bold" /><span>{benefit}</span></li>
            ))}
          </ul>
          <div className="hero-action-row">
            <Button />
            <span>{PRICE_LABEL}</span>
          </div>
          <TrustBadges />
          <StyleIqPreview />
        </div>
      </div>
    </section>
  );
}

function TransformationShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || isPaused) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % transformationSlides.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const moveSlide = (direction) => {
    setActiveSlide((current) => (current + direction + transformationSlides.length) % transformationSlides.length);
  };

  return (
    <section
      className="transformation-showcase"
      aria-label="Style transformations"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="transformation-carousel">
        <div className="transformation-viewport">
          <div className="transformation-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
            {transformationSlides.map((src, index) => (
              <figure className="transformation-slide" key={`${src}-${index}`} aria-hidden={activeSlide !== index}>
                <img src={src} alt={`Before and after personal style transformation ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} />
                <div className="transformation-divider" aria-hidden="true" />
                <span className="transformation-label transformation-label-before">Before</span>
                <span className="transformation-label transformation-label-after">After</span>
              </figure>
            ))}
          </div>
        </div>
        <button className="transformation-arrow transformation-arrow-previous" type="button" onClick={() => moveSlide(-1)} aria-label="Show previous transformation">
          <CaretLeft size={20} weight="bold" />
        </button>
        <button className="transformation-arrow transformation-arrow-next" type="button" onClick={() => moveSlide(1)} aria-label="Show next transformation">
          <CaretRight size={20} weight="bold" />
        </button>
        <div className="transformation-dots" aria-label="Choose a transformation">
          {transformationSlides.map((_, index) => (
            <button
              className={activeSlide === index ? "active" : ""}
              type="button"
              key={index}
              onClick={() => setActiveSlide(index)}
              aria-label={`Show transformation ${index + 1}`}
              aria-current={activeSlide === index ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="section section-cool problem" id="problem">
      <div className="shell narrow-shell">
        <SectionHeading intro="And somehow, figuring out what you should actually wear is still a mystery.">
          The internet is full of random fashion advice
        </SectionHeading>
        <div className="problem-copy">
          <p>You copy a haircut that looked great on someone else. Save an outfit from Instagram. Buy the trousers every man is supposed to own.</p>
          <p>Sometimes it works. Sometimes it looks terrible.</p>
          <ul className="problem-bullets">
            <li><span>Does this suit my face?</span></li>
            <li><span>Does this fit my build?</span></li>
            <li><span>Does this color work with my complexion?</span></li>
            <li><span>What should I actually buy next?</span></li>
          </ul>
          <figure className="problem-visual">
            <img src="/assets/problem/reel-vs-real.webp" alt="The same outfit looking suitable in a Reel but poorly fitted in real life" />
          </figure>
          <p className="problem-kicker">Most style advice tells you what looks good. Not what looks good on you.</p>
        </div>
      </div>
    </section>
  );
}

function WasteSection() {
  return (
    <section className="section waste-section">
      <div className="shell split-copy">
        <SectionHeading align="left">
          Stop wasting money on the wrong clothes
        </SectionHeading>
        <div className="copy-stack">
          <p>The shirt you liked in the store but rarely wear. The trousers that technically fit but never look like a good fit on you. The hairstyle, color combination, or shoe purchase that still leaves you thinking: what the hell do I wear?</p>
          <p>You do not need more trial and error. You need better decisions about the clothes, grooming, and style choices you already make.</p>
        </div>
      </div>
    </section>
  );
}

function YouFirstSection() {
  return (
    <section className="section section-cool">
      <div className="shell split-copy">
        <SectionHeading align="left">
          Style advice should start with you
        </SectionHeading>
        <div className="copy-stack">
          <p>Most style advice starts with a Reel or YouTube video saying: buy this, wear that, get this haircut.</p>
          <p>Good styling starts with your features, your proportions, your coloring, your lifestyle, your taste, and your budget. Without that context, you are just guessing what might work.</p>
          <p>With it, choosing what to wear becomes much easier.</p>
        </div>
      </div>
    </section>
  );
}

function StyleIqSystem() {
  return (
    <section className="section approach" id="styleiq">
      <div className="shell approach-shell">
        <SectionHeading intro="StyleIQ is the system our human stylists use to understand what actually suits you.">
          Your StyleIQ
        </SectionHeading>
        <p className="styleiq-system-lead">
          Your stylist reviews your photos, measurements, build, coloring, lifestyle, preferences, and budget, then turns those details into practical recommendations built around you.
        </p>
        <div className="styleiq-pillars">
          {styleIqPillars.map((pillar, index) => (
            <article className="styleiq-pillar" key={pillar.title}>
              <small>{String(index + 1).padStart(2, "0")}</small>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
        <p className="styleiq-judgment">StyleIQ gives your stylist the system. Your stylist gives you the judgment.</p>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="section section-cool comparison-section">
      <div className="shell">
        <SectionHeading intro="See what changes when the advice is built around your features, proportions, lifestyle, and budget.">
          Without StyleIQ vs. With StyleIQ
        </SectionHeading>
        <div className="styleiq-comparison">
          {comparisonRows.map((row) => (
            <article className="comparison-card" key={row.withoutStyleIq}>
              <div className="comparison-generic-row">
                <X size={19} weight="bold" aria-hidden="true" />
                <p>{row.withoutStyleIq}</p>
              </div>
              <div className="comparison-report-row">
                <Check size={20} weight="bold" aria-hidden="true" />
                <p>{row.withStyleIq}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportContents() {
  return (
    <section className="section report-contents" id="inside">
      <div className="shell">
        <SectionHeading intro="One personalized system for what to wear, how to groom, what to buy, and what to do next.">
          Everything You Get With StyleIQ
        </SectionHeading>
        <div className="report-content-grid">
          {reportContentGroups.map((group) => (
            <article className="report-content-card" key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.intro}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item}><Check size={16} weight="bold" /><span>{item}</span></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BonusesSection() {
  return (
    <section className="section section-cool">
      <div className="shell">
        <SectionHeading>
          Plus 2 Bonuses
        </SectionHeading>
        <div className="bonus-grid">
          {bonuses.map((bonus) => (
            <article className="bonus-card" key={bonus.title}>
              <h3>{bonus.title}</h3>
              <p>{bonus.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="section process" id="process">
      <div className="shell process-shell">
        <SectionHeading intro="No appointments. No travel. No waiting weeks for a styling consultation.">
          Getting Your StyleIQ Report Is Simple
        </SectionHeading>
        <div className="process-list">
          {processSteps.map((step) => (
            <article className="process-step" key={step.number}>
              <p className="process-number">{step.number}</p>
              <h3>{step.title}</h3>
              <p className="process-description">{step.description}</p>
              <ArrowDown className="process-arrow" size={38} weight="thin" aria-hidden="true" />
              <figure>
                <img
                  className={step.number === "Step 2" ? "process-analysis-image" : undefined}
                  src={step.image}
                  alt={step.alt}
                  loading="lazy"
                />
              </figure>
            </article>
          ))}
        </div>
        <Button>Start My StyleIQ</Button>
        <p className="process-note">Your complete StyleIQ arrives within 48 hours after we receive your assessment.</p>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="section proof" id="reviews">
      <div className="shell">
        <SectionHeading intro="Customers call out the same thing: the advice feels personal, practical, and affordable.">
          What clients say
        </SectionHeading>
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <article className="testimonial-card" key={item.quote}>
              <div className="testimonial-rating" aria-label="Four and a half stars">
                {Array.from({ length: 4 }).map((_, star) => <Star key={star} size={15} weight="fill" />)}
                <StarHalf size={15} weight="fill" />
              </div>
              <blockquote>{item.quote}</blockquote>
              <footer>
                <img className="testimonial-avatar" src={item.image} alt={`${item.name}, verified customer`} loading="lazy" />
                <div><strong>{item.name}</strong>{item.meta && <small>{item.meta}</small>}</div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecapSection() {
  return (
    <section className="section final-recap" id="purchase">
      <div className="shell">
        <div className="final-offer styleiq-final-offer">
          <div>
            <h2>150+ personal style decisions already made easier for you</h2>
            <p>One stylist. One analysis. One complete direction for how you look.</p>
            <div className="recap-grid">
              {recapItems.map((item) => (
                <span key={item}><Check size={15} weight="bold" /> {item}</span>
              ))}
            </div>
            <div className="price-line"><strong>{PRICE_LABEL}</strong><span>One-time payment</span></div>
            <Button light>Get My Personal Style Report</Button>
            <p className="delivery-proof"><ShieldCheck size={20} weight="regular" /> Delivered within 48 hours. Lifetime access included.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section section-cool faq" id="faq">
      <div className="shell faq-shell">
        <div className="faq-heading">
          <h2>Frequently asked <span>questions</span></h2>
          <p>Simple answers about the report, personalization, delivery, revisions, and support.</p>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => {
            const isOpen = open === index;
            return (
              <article className={isOpen ? "open" : ""} key={question}>
                <button type="button" onClick={() => setOpen(isOpen ? -1 : index)} aria-expanded={isOpen}>
                  <span>{question}</span>
                  <CaretDown size={20} weight="regular" aria-hidden="true" />
                </button>
                <div className="faq-answer" aria-hidden={!isOpen}><p>{answer}</p></div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="shell footer-inner">
        <nav className="footer-legal-links" aria-label="Legal links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms &amp; Conditions</a>
        </nav>
        <div className="footer-disclaimer">
          <p>&copy; 2026 AttractiveMen. All rights reserved.</p>
          <p>This page is not affiliated with Facebook or Meta Platforms, Inc., and is not endorsed by Facebook in any way.</p>
        </div>
      </div>
      <div className="footer-wordmark" aria-label="AttractiveMen">AttractiveMen</div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <>
      <main>
        <Hero />
        <TransformationShowcase />
        <ProblemSection />
        <WasteSection />
        <YouFirstSection />
        <StyleIqSystem />
        <ComparisonSection />
        <ReportContents />
        <BonusesSection />
        <ProcessSection />
        <SocialProof />
        <RecapSection />
        <FAQ />
      </main>
      <Footer />
      <StickyBuyBar />
    </>
  );
}
