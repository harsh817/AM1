import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CaretDown,
  CaretLeft,
  CaretRight,
  Check,
  Palette,
  PersonSimple,
  UserFocus,
  ShieldCheck,
  Star,
  StarHalf,
  X,
} from "@phosphor-icons/react";
import {
  comparisonRows,
  faqs,
  processSteps,
  reportItems,
  testimonials,
} from "./data.js";
import { CHECKOUT_PATH } from "./routes.js";

const CHECKOUT_TARGET = CHECKOUT_PATH;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const approachAnalysisCards = [
  {
    title: "Your face shape",
    description: "down to the exact measurements",
    Icon: UserFocus,
    image: "/assets/approach/face-shape.png",
    alt: "Face shape analysis showing facial measurements and proportions",
  },
  {
    title: "Your skin undertone",
    description: "so every color we recommend actually flatters you, not fights you",
    Icon: Palette,
    image: "/assets/approach/skin-undertone.png",
    alt: "Skin undertone analysis with a personalised colour palette",
  },
  {
    title: "Your body type",
    description: "so every outfit is chosen to make you look taller, leaner, and sharper",
    Icon: PersonSimple,
    image: "/assets/approach/body-type.png",
    alt: "Body type analysis showing proportions and fit guidance",
  },
];
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

function Button({ children = "Get Your Personalized Report Now", light = false, className = "" }) {
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
          <strong>{"\u20B9"}1,900 <small>+ GST</small></strong>
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
function SectionHeading({ index, eyebrow, children, intro, align = "center", id }) {
  return (
    <div className={`section-heading section-heading-${align}`} id={id}>
      <h2>{children}</h2>
      {intro ? <p className="section-intro">{intro}</p> : null}
    </div>
  );
}

function BeforeAfterSlider() {
  return (
    <div className="before-after" aria-label="Before and after style comparison">
      <img
        className="comparison-composite"
        src="/assets/hero/before-after-square.png"
        alt="Before and after styling transformation with grooming and fit improvements"
      />
      <div className="comparison-separator" aria-hidden="true" />
      <div className="compare-label label-before">Before</div>
      <div className="compare-label label-after">After</div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="shell hero-shell">
        <div className="hero-copy">
          <Brand />
          <h1>
            <span className="hero-title-line hero-title-primary">Look Your Best Version</span>
            <span className="hero-title-line hero-title-accent">Without Expensive Brands...</span>
          </h1>
          <div className="hero-subheading-card">
            <h2>Random fashion Reel and YouTube videos make you look average</h2>
          </div>
          <div className="hero-visual">
            <BeforeAfterSlider />
            <Button />
            <div className="rating-line" aria-label="Rated 4.9 out of 5 by more than 1,119 Indian men">
              <span className="rating-stars" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Star key={index} size={22} weight="fill" />
                ))}
                <StarHalf size={22} weight="fill" />
              </span>
              <span><strong>4.9/5</strong> from 1,119+ Indian men who stopped guessing</span>
            </div>
          </div>
          <p className="hero-reason">
            Because the advice is not built for a <strong>face shape</strong>, <strong>body type</strong>, and <strong>skin tone</strong>.
          </p>
          <p className="hero-style-lead">
            Time to get your <em>personalized style</em> that covers <em>head-to-toe transformation</em>, including:
          </p>
          <ul className="hero-benefits">
            <li><Check size={18} weight="bold" /><span>Best hair style for your <strong>face shape</strong></span></li>
            <li><Check size={18} weight="bold" /><span>Best colors and fit for your <strong>body type</strong> and <strong>skin tone</strong></span></li>
            <li><Check size={18} weight="bold" /><span>Best shoes and accessories that compliments your look</span></li>
          </ul>
          <p className="hero-budget-note">Without spending money on expensive clothes and accessories.</p>
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
        <SectionHeading index="02" eyebrow="The problem">
          Here's why Reel and YouTube styling advice makes you <span>look average</span>
        </SectionHeading>
        <p className="problem-opening">
          You open any style Reel and the advice saying &ldquo;wear this jacket&rdquo;, &ldquo;get this haircut&rdquo;, &ldquo;try this color&rdquo;. So you try it. And it looks... fine. But, <strong>HONESTLY</strong> not the version of yourself you were hoping to see in the mirror.
        </p>
        <figure className="problem-visual">
          <img src="/assets/problem/reel-vs-real.webp" alt="The same outfit looking suitable in a Reel but poorly fitted in real life" />
        </figure>
        <div className="problem-copy">
          <p className="problem-kicker">That&apos;s because the advice was never about you:</p>
          <ul className="problem-bullets">
            <li><span><strong>A hairstyle &ldquo;trending in Bollywood right now&rdquo;</strong> is built for a completely different face shape than yours and instead of sharpening your jawline, it hides it.</span></li>
            <li><span><strong>A &ldquo;widely popular&rdquo; color</strong> can fade out your exact skin undertone while looking amazing on someone three shades warmer or cooler than you.</span></li>
            <li><span><strong>An outfit &ldquo;every man should own&rdquo;</strong> can add bulk in exactly the wrong place for your body type, or make you look completely bad.</span></li>
          </ul>
          <figure className="problem-testimonial-visual">
            <img
              className="problem-testimonial-image"
              src="https://res.cloudinary.com/dhjsqmejb/image/upload/v1785594161/ChatGPT_Image_Aug_1_2026_07_52_23_PM_iceryf.png"
              alt="Before and after outfit transformation testimonial"
              loading="lazy"
            />
            <div className="problem-testimonial-divider" aria-hidden="true" />
            <span className="problem-testimonial-label problem-testimonial-label-before">Before</span>
            <span className="problem-testimonial-label problem-testimonial-label-after">After</span>
          </figure>
          <p>That's why you end up spending money to look <em>more</em> generic, because the internet gives the same five tips to crores of different faces, bodies, and skin tones.</p>
          <p>Meanwhile, Indian men are stepping onto a global stage for jobs, for opportunities, for first impressions that happen in under seven seconds while still being told to copy a celebrity&apos;s look off Instagram and hope for the best.</p>
          <p>The only people who actually get <em>personalized</em> styling advice are the ones who can afford a stylist. And that costs {"\u20B9"}10,000-{"\u20B9"}15,000 a session.</p>
          <strong className="until-now">Until now.</strong>
        </div>
      </div>
    </section>
  );
}

function ApproachSection() {
  return (
    <section className="section approach" id="approach">
      <div className="shell approach-shell">
        <SectionHeading index="03" eyebrow="Our approach">
          <span className="approach-heading-line">We reverse-engineered what</span>
          <span className="approach-heading-line approach-heading-accent">celebrity stylists actually do</span>
          <span className="approach-heading-line">and made it affordable</span>
        </SectionHeading>
        <div className="approach-content">
          <p>We spent months studying how professional personal stylists build a look for a client: they measure the face shape. They read the skin&apos;s undertone. They analyse body proportions. Then they build every recommendation, including hair, color, fit, and grooming, around those three fixed facts about a person&apos;s body.</p>
          <div className="approach-method-panel">
            <p className="approach-method-lead">WE TOOK THAT EXACT PROCESS</p>
            <figure className="approach-gif-frame">
              <img
                src="https://res.cloudinary.com/dhjsqmejb/image/upload/v1785596656/1589814288149_gfergb.gif"
                alt="Surprised reaction"
                loading="lazy"
              />
            </figure>
            <p className="approach-method">and turned it into a structured system: <strong>the Style Analysis Method. The</strong> same depth of personalization, without the {"\u20B9"}15,000 expense and the multi-week wait for an appointment.</p>
          </div>
          <h3>From your photos and a few basic measurements, our stylist analyses:</h3>
          <div className="approach-analysis-grid">
            {approachAnalysisCards.map(({ title, description, Icon, image, alt }) => (
              <article className="report-card approach-analysis-card" key={title}>
                <div className="report-card-visual approach-analysis-visual">
                  {image ? (
                    <img src={image} alt={alt} loading="lazy" />
                  ) : (
                    <div className="approach-image-placeholder" aria-label={`${title} image placeholder`}>
                      <Icon size={52} weight="thin" aria-hidden="true" />
                      <span>Image placeholder</span>
                    </div>
                  )}
                </div>
                <div className="report-card-copy approach-analysis-copy">
                  <p><strong>{title}</strong> {description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="approach-conclusion">
            <p>Then we build your full report around those three things.</p>
            <div className="approach-contrast">
              <span>Not what&apos;s trending.</span>
              <span>Not what worked for a Bollywood actor with completely different proportions.</span>
              <strong>What works for your face, on your body, in your skin.</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="section section-cool comparison-section" id="comparison">
      <div className="shell comparison-shell">
        <SectionHeading index="04" eyebrow="See the difference" intro="See what changes when the advice is built around you.">
          Generic advice vs. <span>your personal report</span>
        </SectionHeading>
        <div className="comparison-cards">
          {comparisonRows.map((item) => (
            <article className={`comparison-card ${item.title === "Cost" ? "comparison-cost" : ""}`} key={item.title}>
              <h3>{item.title}</h3>
              <div className="comparison-report-row">
                <Check size={20} weight="bold" aria-hidden="true" />
                <div><strong>Your personal report</strong><p>{item.report}</p></div>
              </div>
              <div className="comparison-generic-row">
                <X size={19} weight="bold" aria-hidden="true" />
                <div><strong>Generic advice</strong><p>{item.generic}</p></div>
              </div>
              {item.note ? <small>{item.note}</small> : null}
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
        <SectionHeading index="05" eyebrow="Inside your report" intro="Everything is built around the same three inputs: your face, body, and skin tone.">
          What's Inside Your <span>Personalized Style Report</span>
        </SectionHeading>
        <div className="report-grid">
          {reportItems.map((item) => (
            <article className="report-card" key={item.number}>
              <div className={`report-card-visual${item.number === "04" ? " report-card-visual--full-bleed" : ""}`}>
                <img src={item.image} alt="" loading="lazy" />
              </div>
              <div className="report-card-copy">
                <small>{item.number}</small>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="report-closing">One report. Every part of your look covered.</p>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="section section-cool process" id="process">
      <div className="shell process-shell">
        <SectionHeading eyebrow="How our method works" intro="Share a few details. We study what suits you. Your complete report arrives within 48 hours.">
          Your Style Report, <span>Built in 3 Simple Steps</span>
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
        <Button>Start My Style Assessment</Button>
        <p className="process-note">No appointment. Your report arrives within 48 hours.</p>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="section proof" id="reviews">
      <div className="shell">
        <SectionHeading index="07" eyebrow="Customer results" intro="Real experiences from men who stopped guessing and started dressing for their features.">
          Here is what our clients say
        </SectionHeading>
        <div className="testimonial-grid">
          {testimonials.map((item, index) => (
            <article className="testimonial-card" key={index}>
              <div className="testimonial-rating" aria-label="Five stars">
                {Array.from({ length: 5 }).map((_, star) => <Star key={star} size={15} weight="fill" />)}
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

function ProductIntro() {
  return (
    <section className="section product-intro" id="sample">
      <div className="shell product-shell">
        <h2 className="product-title">The AttractiveMen <span>Personalized Style Report</span></h2>
        <figure className="product-stack">
          <img src="/assets/product/attractivemen-style-report-mockup-v2.png" alt="AttractiveMen personalized style report product mockup" loading="lazy" />
          <figcaption>Personalized for you &middot; Delivered within 48 hours</figcaption>
        </figure>
        <div className="product-copy">
          <p className="product-price">
            <del>{"\u20B9"}25,000</del>
            <span>{"\u20B9"}1,900 + GST</span>
          </p>
          <p className="product-saving">Save 33%- 80% affordable than a single stylist session, same depth of analysis</p>
          <p className="product-includes">Everything included:</p>
          <ul>
            <li><Check size={17} weight="bold" /> Face Shape Analysis</li>
            <li><Check size={17} weight="bold" /> Body Type Analysis</li>
            <li><Check size={17} weight="bold" /> Skin Tone Analysis</li>
            <li><Check size={17} weight="bold" /> Best Hairstyle Recommendation</li>
            <li><Check size={17} weight="bold" /> 20 Head-to-Toe Outfit Recommendations</li>
            <li><Check size={17} weight="bold" /> Accessories &amp; Footwear Suggestions</li>
            <li><Check size={17} weight="bold" /> Beard &amp; Mustache Guide</li>
            <li><Check size={17} weight="bold" /> 90-Day Action Plan</li>
            <li><Check size={17} weight="bold" /> Perfume Recommendations</li>
            <li><Check size={17} weight="bold" /> Wardrobe Essentials Checklist</li>
          </ul>
          <Button>Get My Personal Style Report</Button>
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
          <p>Simple answers about the report, recommendations and how the process works.</p>
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
      <div className="shell final-offer" id="purchase">
        <div>
          <h2>Stop guessing before your next haircut or purchase.</h2>
          <p>Get a complete head-to-toe plan built for your face, body, skin tone, routine and budget.</p>
          <div className="price-line"><strong>{"\u20B9"}1,900</strong><span>One-time payment</span></div>
          <Button light>Get Your Personalized Report Now</Button>
          <p className="delivery-proof"><ShieldCheck size={20} weight="regular" /> Delivered within 48 hours after your assessment.</p>
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

export function App() {
  return (
    <>
      <main>
        <Hero />
        <TransformationShowcase />
        <ProblemSection />
        <ApproachSection />
        <ComparisonSection />
        <ReportContents />
        <ProcessSection />
        <SocialProof />
        <ProductIntro />
        <FAQ />
      </main>
      <Footer />
      <StickyBuyBar />
    </>
  );
}





