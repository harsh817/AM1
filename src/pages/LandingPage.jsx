import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ClockCountdown,
  Minus,
  Plus,
  SealCheck,
  SpeakerHigh,
  SpeakerSlash,
  Star,
  X,
} from "@phosphor-icons/react";
import {
  bonuses,
  comparisonRows,
  faqs,
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
const HERO_PRICE_LABEL = `Today's Price ${PRICE_LABEL}`;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const transformationPersonas = [
  {
    title: "40 year old man",
    outcome: "looks stylish and almost 5 years younger",
    image: "https://res.cloudinary.com/dhjsqmejb/image/upload/v1784628150/ankur_hhdjc8.png",
  },
  {
    title: "30-year corporate guy",
    outcome: "now finally looks decent for office and dates.",
    image: "https://res.cloudinary.com/dhjsqmejb/image/upload/v1784628150/rahul_j5oyv6.png",
  },
  {
    title: "25 year old skinny guy",
    outcome: "right style that make him look classy",
    image: "https://res.cloudinary.com/dhjsqmejb/image/upload/v1784628151/satyam_ttlk1w.png",
  },
  {
    title: "complete makeover for this 5.6 guy",
    outcome: "new style makes him confident.",
    image: "https://res.cloudinary.com/dhjsqmejb/image/upload/v1784628303/ChatGPT_Image_Jul_21_2026_03_34_51_PM_qi3dmf.png",
  },
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

function Button({ children = "Show Me What Suits Me", light = false, className = "", showIcon = true }) {
  return (
    <a className={`button ${light ? "button-light" : ""} ${className}`} href={CHECKOUT_TARGET}>
      <span>{children}</span>
      {showIcon ? <ArrowRight size={20} weight="regular" aria-hidden="true" /> : null}
    </a>
  );
}

function SoundVideo({ className, src, label }) {
  const videoRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);

  const handleSoundToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextSoundOn = !soundOn;
    video.muted = !nextSoundOn;

    if (!nextSoundOn) {
      setSoundOn(false);
      return;
    }

    video.volume = 1;
    const playPromise = video.play();

    if (playPromise?.then) {
      playPromise
        .then(() => setSoundOn(true))
        .catch(() => {
          video.muted = true;
          setSoundOn(false);
        });
      return;
    }

    setSoundOn(true);
  };

  return (
    <figure className={className}>
      <video ref={videoRef} autoPlay muted={!soundOn} loop playsInline aria-label={label}>
        <source src={src} type="video/mp4" />
      </video>
      <button
        className={`video-sound-button ${soundOn ? "video-sound-button-on" : ""}`}
        type="button"
        onClick={handleSoundToggle}
        aria-label={soundOn ? "Mute video sound" : "Play video sound"}
        aria-pressed={soundOn}
      >
        {soundOn ? (
          <SpeakerHigh size={18} weight="fill" aria-hidden="true" />
        ) : (
          <SpeakerSlash size={18} weight="fill" aria-hidden="true" />
        )}
        <span>{soundOn ? "Sound on" : "Tap for sound"}</span>
      </button>
    </figure>
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

function Hero() {
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
              <img src="https://res.cloudinary.com/dm49wi6j4/image/upload/v1788004059/ChatGPT_Image_Aug_29_2026_05_15_55_PM_b6cubf.webp" alt="Personal style transformation" loading="eager" />
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

function TrustSection() {
  return (
    <section className="trust-section">
      <div className="shell trust-section-shell">
        <TrustBadges />
      </div>
    </section>
  );
}

function YouFirstTransformationStack() {
  return (
    <div className="you-first-transformation-stack" aria-label="Personal style transformation examples">
      {transformationPersonas.map((persona, index) => (
        <article className="you-first-transformation-item" key={persona.title}>
          <div className="you-first-transformation-persona">
            {index === 0 ? (
              <p>
                Look at this <b>40 year old man</b>, he <b>looks stylish and almost 5 years younger</b>.
              </p>
            ) : index === 1 ? (
              <p>This <strong>{persona.title}</strong>&nbsp;{persona.outcome}</p>
            ) : index === 2 ? (
              <p>This <strong>{persona.title}</strong> found the <strong>{persona.outcome}</strong></p>
            ) : index === 3 ? (
              <p>We did the <strong>{persona.title}</strong> and <strong>{persona.outcome}</strong></p>
            ) : (
              <p><strong>{persona.title}</strong> - {persona.outcome}</p>
            )}
          </div>
          <figure className="you-first-transformation-frame">
            <img src={persona.image} alt={`Before and after personal style transformation for ${persona.title}`} loading={index === 0 ? "eager" : "lazy"} />
            <div className="you-first-transformation-divider" aria-hidden="true" />
            <span className="you-first-transformation-label you-first-transformation-label-before">Before</span>
            <span className="you-first-transformation-label you-first-transformation-label-after">After</span>
          </figure>
        </article>
      ))}
    </div>
  );
}

function ProblemSection() {
  return (
    <section className="section problem section-editorial-preview problem-editorial" id="problem">
      <div className="shell narrow-shell">
        <SoundVideo
          className="problem-header-video"
          src="https://res.cloudinary.com/dm49wi6j4/video/upload/v1788007305/grooming_silence_edit_final_1_m4w53i.mp4"
          label="Grooming and style direction video"
        />
        <figure className="problem-header-image">
          <img src="https://res.cloudinary.com/dm49wi6j4/image/upload/v1788003564/ChatGPT_Image_Aug_29_2026_05_06_07_PM_bf2kfj.webp" alt="Internet fashion advice" loading="lazy" />
        </figure>
        <SectionHeading>
          THE INTERNET IS FULL OF <span>RANDOM FASHION ADVICE</span>
        </SectionHeading>
        <div className="problem-copy">
          <p className="problem-intro">And somehow, figuring out what you should actually wear is still a mystery.</p>
          <figure className="problem-visual problem-visual-expanded">
            <img src="https://res.cloudinary.com/dm49wi6j4/image/upload/v1787994025/internet-random-advice_cht9si.webp" alt="Random fashion advice on the internet" loading="lazy" />
          </figure>
          <p>You copy a <strong className="problem-emphasis problem-emphasis-caps">haircut</strong> that looked great on someone else.</p>
          <p>You save an outfit from <em className="problem-emphasis problem-emphasis-caps problem-emphasis-italic">Instagram</em>.</p>
          <p>You buy the <strong className="problem-emphasis problem-emphasis-caps">trousers</strong> every man is supposed to own.</p>
          <p>Sometimes it <strong className="problem-emphasis problem-emphasis-caps">works</strong>.</p>
          <p>Sometimes it looks <span className="problem-emphasis problem-emphasis-caps problem-emphasis-underlined">terrible</span>.</p>
          <ul className="problem-bullets">
            <li><span>Will this suit my face?</span></li>
            <li><span>Will this fit my build?</span></li>
            <li><span>Will this color suit my complexion?</span></li>
            <li><span>What should I buy next?</span></li>
          </ul>
          <figure className="problem-visual">
            <img src="/assets/problem/reel-vs-real.webp" alt="The same outfit looking suitable in a Reel but poorly fitted in real life" />
          </figure>
          <p className="problem-kicker">Most style advice tells you <span className="problem-emphasis problem-emphasis-caps problem-emphasis-underlined">what looks good</span>.</p>
          <p className="problem-kicker">It does not tell you <strong className="problem-emphasis problem-emphasis-caps">what looks good on you</strong>.</p>
        </div>
      </div>
    </section>
  );
}

function WasteSection() {
  return (
    <section className="section waste-section section-editorial-preview waste-editorial">
      <div className="shell narrow-shell">
        <SectionHeading>
          Stop wasting money on the <span>wrong clothes</span>
        </SectionHeading>
        <div className="copy-stack waste-copy">
          <p>We know, not because every purchase is expensive.</p>
          <p>But most of them start collecting dust because the <strong className="waste-emphasis waste-emphasis-caps">shirt</strong> you liked in the store but rarely wear.</p>
          <p>The <strong className="waste-emphasis waste-emphasis-caps">trousers</strong> that technically fit but never look like a good fit on you</p>
          <figure className="waste-visual">
            <img src="https://res.cloudinary.com/dm49wi6j4/image/upload/v1787996066/ChatGPT_Image_Aug_29_2026_03_03_27_PM_jd4kve.webp" alt="Wardrobe dilemma" loading="lazy" />
          </figure>
          <p>No matter how many hairstyles, color combinations, and shoes you tried, still today, when you open your wardrobe before work, a date, or an event, you&apos;re still thinking:</p>
          <p><strong className="waste-emphasis waste-emphasis-caps waste-emphasis-underlined">&ldquo;What the hell do I wear?&rdquo;</strong></p>
          <p>There&rsquo;s a simple solution: you don&rsquo;t need more <span className="waste-emphasis waste-emphasis-caps">trial and error</span>; you need <strong className="waste-emphasis waste-emphasis-underlined">better decisions</strong> about the clothes, grooming, and style choices you already make.</p>
        </div>
      </div>
    </section>
  );
}

function YouFirstSection() {
  return (
    <section className="section you-first-section section-editorial-preview you-first-editorial">
      <div className="shell narrow-shell">
        <SectionHeading>
          You&rsquo;ve been trying to solve a <span>personal</span> problem with <span>generic</span> answers.
        </SectionHeading>
        <div className="copy-stack you-first-copy">
          <p>Most style advice starts with a Reel of a YouTube Video saying:</p>
          <div className="you-first-quote-stack">
            <p>&ldquo;Buy this.&rdquo;</p>
            <p>&ldquo;Wear that.&rdquo;</p>
            <p>&ldquo;Get this haircut.&rdquo;</p>
          </div>
          <p>But good styling starts with <strong className="you-first-emphasis you-first-emphasis-underlined">you</strong>.</p>
          <YouFirstTransformationStack />
          <div className="you-first-feature-stack">
            <p>Your features.</p>
            <p>Your proportions.</p>
            <p>Your coloring.</p>
            <p>Your lifestyle, taste, and budget.</p>
          </div>
          <p>All these things matter because without that context, you&rsquo;re just guessing what might work.</p>
          <p>With it, choosing what to wear becomes much easier.</p>
        </div>
      </div>
    </section>
  );
}

function ProfessionalStylingSection() {
  return (
    <section className="section professional-styling-section section-editorial-preview professional-styling-editorial">
      <div className="shell narrow-shell">
        <SectionHeading>
          Professional Styling Starts With <span>YOU</span>.
        </SectionHeading>
        <div className="copy-stack professional-styling-copy">
          <p>Famous celebrities rely on personal styling all the time.</p>
          <p>It commonly considers factors such as <strong className="professional-styling-emphasis">face and body</strong> <strong className="professional-styling-emphasis">proportions, coloring, silhouettes, wardrobe needs, lifestyle, and occasion</strong> before making recommendations.</p>
          <figure className="professional-styling-visual">
            <img src="https://res.cloudinary.com/dm49wi6j4/image/upload/v1787997317/ChatGPT_Image_Aug_29_2026_03_24_27_PM_pgk0dk.webp" alt="Professional styling factors" loading="lazy" />
          </figure>
          <p>That makes sense because.</p>
          <div className="professional-styling-reason-stack">
            <p>A haircut cannot be judged only by whether it is fashionable.</p>
            <p>A color cannot be judged only by whether it is trending.</p>
            <p>A jacket cannot be judged only by whether it looks good on the model.</p>
          </div>
          <p><strong className="professional-styling-emphasis professional-styling-emphasis-underlined">Personalized styling solves all these issues.</strong></p>
          <p>Because of this, all the celebrities pay lakhs of rupees to look stylish, but you don&rsquo;t have to.</p>
          <p>The StyleIQ is built to provide your unique, personalized makeover but completely within your budget.</p>
        </div>
      </div>
    </section>
  );
}

function StyleIqSystem() {
  return (
    <section className="section approach section-editorial-preview styleiq-editorial" id="styleiq">
      <div className="shell narrow-shell approach-shell">
        <SectionHeading>
          Your <span>StyleIQ</span>
        </SectionHeading>
        <div className="copy-stack styleiq-system-copy">
          <p>StyleIQ is the system our human stylists use to understand what actually suits you.</p>
          <p>Your stylist reviews your photos, measurements, build, coloring, lifestyle, preferences, and budget, then turns those details into practical recommendations built around you.</p>
        </div>
        <div className="styleiq-subsections" aria-label="StyleIQ review inputs">
          {styleIqPillars.map((pillar, index) => (
            <>
              {index === 0 && (
                <figure className="styleiq-overview-image">
                  <img src="https://res.cloudinary.com/dm49wi6j4/image/upload/v1787999365/ChatGPT_Image_Aug_29_2026_03_57_39_PM_1_adbvxg.webp" alt="StyleIQ system overview" loading="lazy" />
                </figure>
              )}
              {index === 1 && (
                <figure className="styleiq-overview-image">
                  <img src="https://res.cloudinary.com/dm49wi6j4/image/upload/v1787999365/ChatGPT_Image_Aug_29_2026_03_57_39_PM_2_vc4kcu.webp" alt="Build and proportions styling" loading="lazy" />
                </figure>
              )}
              {index === 2 && (
                <figure className="styleiq-overview-image">
                  <img src="https://res.cloudinary.com/dm49wi6j4/image/upload/v1787999365/ChatGPT_Image_Aug_29_2026_03_57_40_PM_3_uailwn.webp" alt="Personal coloring guide" loading="lazy" />
                </figure>
              )}
              {index === 3 && (
                <figure className="styleiq-overview-image">
                  <img src="https://res.cloudinary.com/dm49wi6j4/image/upload/v1787999365/ChatGPT_Image_Aug_29_2026_03_57_41_PM_5_cqgesu.webp" alt="Lifestyle styling guide" loading="lazy" />
                </figure>
              )}
              {index === 4 && (
                <figure className="styleiq-overview-image">
                  <img src="https://res.cloudinary.com/dm49wi6j4/image/upload/v1787999365/ChatGPT_Image_Aug_29_2026_03_57_41_PM_4_dbups8.webp" alt="Preferences and budget guide" loading="lazy" />
                </figure>
              )}
              <article className="styleiq-subsection" key={pillar.title}>
                <div className="styleiq-subsection-heading">
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <h3>{pillar.title}</h3>
                </div>
                <p>{pillar.description}</p>
              </article>
            </>
          ))}
        </div>
        <p className="styleiq-judgment">StyleIQ gives your stylist the system. Your stylist gives you the judgment.</p>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="section comparison-section section-editorial-preview comparison-editorial">
      <div className="shell">
        <SectionHeading>
          Without StyleIQ <span>vs. With StyleIQ</span>
        </SectionHeading>
        <div className="copy-stack comparison-copy">
          <p>See what changes when the advice is built around your features, proportions, lifestyle, and budget.</p>
        </div>
        <figure className="comparison-overview-image">
          <img src="https://res.cloudinary.com/dm49wi6j4/image/upload/v1788000316/ChatGPT_Image_Aug_29_2026_04_14_20_PM_1_a6bo6i.webp" alt="StyleIQ comparison overview" loading="lazy" />
        </figure>
        <div className="comparison-subsections" aria-label="Without StyleIQ and With StyleIQ comparison">
          <article className="comparison-subsection comparison-subsection-without">
            <div className="comparison-subsection-heading">
              <h3>Without StyleIQ</h3>
            </div>
            <ul className="comparison-subsection-list">
              {comparisonRows.map((row) => (
                <li key={row.withoutStyleIq}><X size={18} weight="bold" aria-hidden="true" /><span>{row.withoutStyleIq}</span></li>
              ))}
            </ul>
          </article>
          <article className="comparison-subsection comparison-subsection-with">
            <div className="comparison-subsection-heading comparison-with-heading">
              <figure className="comparison-with-image">
                <img src="https://res.cloudinary.com/dm49wi6j4/image/upload/v1788000316/ChatGPT_Image_Aug_29_2026_04_14_21_PM_2_nbdoi9.webp" alt="With StyleIQ benefits" loading="lazy" />
              </figure>
              <h3>With StyleIQ</h3>
            </div>
            <ul className="comparison-subsection-list">
              {comparisonRows.map((row) => (
                <li key={row.withStyleIq}><Check size={18} weight="bold" aria-hidden="true" /><span>{row.withStyleIq}</span></li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

function ReportContents() {
  return (
    <section className="section report-contents section-editorial-preview report-contents-editorial" id="inside">
      <div className="shell">
        <SectionHeading>
          Everything You Get <span>With StyleIQ</span>
        </SectionHeading>
        <div className="copy-stack report-contents-copy">
          <p>One personalized system for what to wear, how to groom, what to buy, and what to do next.</p>
        </div>
        <div className="report-content-subsections" aria-label="Everything included in your StyleIQ report">
          {reportContentGroups.map((group, index) => (
            <>
              {index === 0 && (
                <SoundVideo
                  className="report-overview-video"
                  src="https://res.cloudinary.com/dhjsqmejb/video/upload/v1787990480/Style_Report_overview_2_sm1mmx.mp4"
                  label="StyleIQ report overview video"
                />
              )}
              <article className="report-content-subsection" key={group.title}>
                <div className="report-content-subsection-heading">
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <h3>{group.title}</h3>
                </div>
                <div className="report-content-subsection-body">
                  <p>{group.intro}</p>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}><Check size={16} weight="bold" /><span>{item}</span></li>
                    ))}
                  </ul>
                </div>
              </article>
            </>
          ))}
        </div>
      </div>
    </section>
  );
}

function BonusesSection() {
  return (
    <section className="section bonuses-section section-editorial-preview bonuses-editorial">
      <div className="shell">
        <SectionHeading>
          Plus 2 <span>Bonuses</span>
        </SectionHeading>
        <div className="bonus-subsections" aria-label="StyleIQ bonuses">
          {bonuses.map((bonus, index) => {
            const bonusTitle = bonus.title.replace(/^Bonus #\d+ - /, "");

            return (
              <article className="bonus-subsection" key={bonus.title}>
                <div className="bonus-subsection-heading">
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <h3>{bonusTitle}</h3>
                </div>
                <div className="bonus-subsection-body">
                  <p>{bonus.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="section process section-editorial-preview process-editorial" id="process">
      <div className="shell process-shell">
        <SectionHeading>
          Getting Your StyleIQ Report <span>Is Simple</span>
        </SectionHeading>
        <div className="copy-stack process-copy">
          <p>No appointments. No travel. No waiting weeks for a styling consultation.</p>
        </div>
        <div className="process-flow" aria-label="How StyleIQ report delivery works">
          {processSteps.map((step, index) => (
            <article className="process-step" key={step.number} aria-label={`${step.number}: ${step.title}`}>
              <div className="process-step-heading">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
              </div>
              <figure>
                <img src={step.image} alt={step.alt} loading="lazy" />
              </figure>
              <p className="process-description">{step.description}</p>
            </article>
          ))}
        </div>
        <div className="process-action">
          <Button>Start My StyleIQ</Button>
          <p className="process-note">Your complete StyleIQ arrives within 48 hours after we receive your assessment.</p>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="section proof section-editorial-preview proof-editorial" id="reviews">
      <div className="shell">
        <SectionHeading>
          What Clients <span>Say</span>
        </SectionHeading>
        <div className="testimonial-ledger" aria-label="StyleIQ customer reviews">
          {testimonials.map((item) => (
            <article className="testimonial-entry" key={item.quote}>
              <div className="testimonial-entry-content">
                <div className="testimonial-client">
                  <img className="testimonial-photo" src={item.image} alt={`${item.name} customer photo`} loading="lazy" />
                  <div className="testimonial-client-copy">
                    <strong>{item.name}</strong>
                    {item.meta && <small>{item.meta}</small>}
                  </div>
                </div>
                <div className="testimonial-rating" aria-label="Five stars">
                  {Array.from({ length: 5 }).map((_, star) => <Star key={star} size={18} weight="fill" />)}
                </div>
                <blockquote>{item.quote}</blockquote>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecapSection() {
  return (
    <section className="section final-recap final-offer-section section-editorial-preview" id="purchase">
      <div className="shell">
        <SectionHeading>
          150+ personal style decisions <span>already made easier</span> for you
        </SectionHeading>
        <div className="final-offer styleiq-final-offer">
          <p>One stylist. One analysis. One complete direction for how you look.</p>
          <div className="recap-grid">
            {recapItems.map((item) => (
              <span key={item}><Check size={15} weight="bold" /> {item}</span>
            ))}
          </div>
          <div className="price-line" aria-label="StyleIQ final price">
            <span>Today&apos;s Price</span>
            <strong>{PRICE_LABEL}</strong>
            <small>One-time payment</small>
          </div>
          <Button className="final-offer-button" showIcon={false}>Get My Personal Style Report</Button>
          <div className="delivery-proof" aria-label="Delivery and access details">
            <span><ClockCountdown size={26} weight="regular" /> Delivered within 48 hours</span>
            <span><SealCheck size={26} weight="regular" /> Lifetime access included</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section faq section-editorial-preview faq-editorial" id="faq">
      <div className="shell faq-shell">
        <SectionHeading>
          Frequently asked <span>questions</span>
        </SectionHeading>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => {
            const isOpen = open === index;
            return (
              <article className={isOpen ? "open" : ""} key={question}>
                <button type="button" onClick={() => setOpen(isOpen ? -1 : index)} aria-expanded={isOpen}>
                  <span>{question}</span>
                  {isOpen ? (
                    <Minus size={24} weight="regular" aria-hidden="true" />
                  ) : (
                    <Plus size={24} weight="regular" aria-hidden="true" />
                  )}
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
        <TrustSection />
        <ProblemSection />
        <WasteSection />
        <YouFirstSection />
        <ProfessionalStylingSection />
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
