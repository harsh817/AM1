import { Check, ClockCountdown, SealCheck, Star, X } from "@phosphor-icons/react";
import { Fragment, useEffect } from "react";
import { initializeAnalytics, trackLandingView } from "../lib/analytics.js";
import { sendExperimentLanding } from "../lib/ab-testing.js";
import { LANDING_AM2_PATH, LANDING_PATH } from "../routes.js";
import { testimonials } from "../lib/landing-data.js";
import { Button, PRICE_LABEL, SectionHeading, SoundVideo } from "./landing/shared.jsx";
import { FAQ, Footer } from "./landing/SocialProofSections.jsx";
import { StickyBuyBar } from "./landing/StickyBuyBar.jsx";
import { TrustSection } from "./landing/TrustSection.jsx";
import "../styles/landing.css";
import "../styles/landing-am2.css";

const reportHighlights = [
  {
    number: "01",
    title: "Hairstyle ideas based on your facial geometry",
    copy: "We analyse your face shape, jawline angle, forehead, hair density and current grooming to suggest 3-5 hairstyles that create better balance and a sharper first impression.",
    highlight: "3-5 hairstyles that create better balance and a sharper first impression",
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/report/styleiq/hairstyle-analysis.webp",
    width: 1024,
    height: 1024,
  },
  {
    number: "02",
    title: "Colour combinations based on your skin complexion",
    copy: "We look at your skin undertone, natural contrast and complexion depth so you stop guessing between black, navy and white and start wearing colours that make you look clearer.",
    highlight: "colours that make you look clearer",
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/report/styleiq/colour-analysis-v2.webp",
    width: 1024,
    height: 1024,
  },
  {
    number: "03",
    title: "Fitting suggestions based on your body type",
    copy: "We study your height, frame and body proportions, then explain what fit, length, rise and fabric fall will look best on you.",
    highlight: "what fit, length, rise and fabric fall will look best on you",
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/report/styleiq/fit-analysis-v2.webp",
    width: 1024,
    height: 1024,
  },
  {
    number: "04",
    title: "20 complete outfits for different occasions",
    copy: "You get ready outfit combinations for office, casual outings, dates, dinners, weddings and formal events based on your lifestyle and budget.",
    highlight: "ready outfit combinations for office, casual outings, dates, dinners, weddings and formal events",
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/report/styleiq/outfit-planning-v2.webp",
    width: 1024,
    height: 1024,
  },
  {
    number: "05",
    title: "Beard, grooming and accessory suggestions",
    copy: "We recommend beard direction, shave or no-shave guidance, glasses, belts, shoes, perfume and finishing details that support your overall look.",
    highlight: "beard direction, shave or no-shave guidance",
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/report/styleiq/grooming-analysis.webp",
    width: 1024,
    height: 1024,
  },
];

function renderHighlightedCopy(copy, highlight) {
  const parts = copy.split(highlight);

  return parts.map((part, index) => (
    <Fragment key={`${part}-${index}`}>
      {part}
      {index < parts.length - 1 ? <strong>{highlight}</strong> : null}
    </Fragment>
  ));
}

function renderPersonaCopy(copy, highlights) {
  const chunks = [];
  let remaining = copy;

  highlights.forEach((highlight) => {
    const index = remaining.indexOf(highlight);
    if (index === -1) return;

    if (index > 0) chunks.push({ text: remaining.slice(0, index), highlighted: false });
    chunks.push({ text: highlight, highlighted: true });
    remaining = remaining.slice(index + highlight.length);
  });

  if (remaining) chunks.push({ text: remaining, highlighted: false });

  return chunks.map((chunk, index) => (
    chunk.highlighted
      ? <strong key={`${chunk.text}-${index}`}>{chunk.text}</strong>
      : <Fragment key={`${chunk.text}-${index}`}>{chunk.text}</Fragment>
  ));
}

const personaStories = [
  {
    name: "Rahul",
    meta: "29 | Software Engineer",
    image: "https://res.cloudinary.com/dhjsqmejb/image/upload/f_auto,q_auto,c_limit,w_900/v1784628150/ankur_hhdjc8.png",
    problem: "His default haircut made his round face look even wider, and his messy beard completely hid his jawline.",
    fix: "We cut the sides very short to slim his round face and lowered his beard line to fake a sharp jaw.",
    problemHighlights: ["round face", "messy beard", "hid his jawline"],
    fixHighlights: ["sides very short", "sharp jaw"],
  },
  {
    name: "Karan",
    meta: "23 | College Student",
    image: "https://res.cloudinary.com/dhjsqmejb/image/upload/f_auto,q_auto,c_limit,w_900/v1784628151/satyam_ttlk1w.png",
    problem: "He wore oversized clothes to hide his skinny body, but the baggy fabric just made him look weaker.",
    fix: "We switched him to properly fitted shirts and added thick jackets to instantly make his shoulders look broad.",
    problemHighlights: ["oversized clothes", "skinny body", "baggy fabric"],
    fixHighlights: ["properly fitted shirts", "thick jackets", "shoulders look broad"],
  },
  {
    name: "Aditya",
    meta: "31 | Business Owner",
    image: "https://res.cloudinary.com/dhjsqmejb/image/upload/f_auto,q_auto,c_limit,w_900/v1784628150/rahul_j5oyv6.png",
    problem: "He mostly wore bright white shirts, which looked dull and completely washed out his darkened skin complexion.",
    fix: "We replaced the stark whites with rich greens and dark reds to perfectly complement his dark skin tone.",
    problemHighlights: ["bright white shirts", "washed out", "darkened skin complexion"],
    fixHighlights: ["rich greens", "dark reds", "dark skin tone"],
  },
];

const styleIqAnalyses = [
  { title: "Face Shape Analysis", image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/analysis/face-shape-analysis.webp", alt: "Face shape analysis mapping facial proportions" },
  { title: "Jawline Analysis", image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/analysis/jawline-analysis.webp", alt: "Jawline and facial structure analysis" },
  { title: "Facial Hair Analysis", image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/analysis/facial-hair-analysis.webp", alt: "Facial hair and beard line analysis" },
  { title: "Skin Undertone Analysis", image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/analysis/complexion-analysis.webp", alt: "Skin undertone and complexion analysis" },
  { title: "Body Type Analysis", image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/analysis/body-proportion-analysis.webp", alt: "Body type and proportion analysis" },
  { title: "Clothing Fit Analysis", image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/analysis/clothing-fit-analysis.webp", alt: "Clothing fit analysis across body proportions" },
  { title: "Accessory Analysis", image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/analysis/accessory-analysis.webp", alt: "Accessory matching analysis" },
  { title: "Lifestyle Analysis", image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/analysis/lifestyle-analysis.webp", alt: "Lifestyle and real-world styling analysis" },
];

const deliverables = [
  {
    number: "01",
    title: "Best Hairstyle Ideas",
    copy: "You will get exact hairstyles that match your face shape, complete with reference photos to show your barber so you always look sharp.",
    highlights: ["exact hairstyles", "match your face shape", "reference photos"],
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/deliverables/01-hairstyle-options.webp",
    alt: "Five hairstyle recommendations around a face",
  },
  {
    number: "02",
    title: "Beard & Shaving Guide",
    copy: "You will get clear ideas on whether to keep stubble, a full beard, or go clean-shaven to make your jawline look structured and defined.",
    highlights: ["clear ideas", "stubble", "a full beard", "clean-shaven", "structured and defined"],
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/deliverables/02-beard-options.webp",
    alt: "Beard and shaving style recommendations",
  },
  {
    number: "03",
    title: "Your Best & Worst Colours",
    copy: "You will get a cheat sheet of colours that make your skin look naturally vibrant based on your colour contrast, plus a strict list of bad colours to completely avoid so you never look average.",
    highlights: ["cheat sheet of colours", "bad colours", "never look average"],
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/deliverables/03-colour-options.webp",
    alt: "Personal colour analysis with recommended and unsuitable colours",
  },
  {
    number: "04",
    title: "Clothing Fits For Your Body Type",
    copy: "You will get the exact shirt, jacket, and trouser fits for your height and weight to make you look handsome according to your body proportions.",
    highlights: ["exact shirt, jacket, and trouser fits", "body proportions"],
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/deliverables/04-fit-options.webp",
    alt: "Clothing fit recommendations based on body proportions",
  },
  {
    number: "05",
    title: "Daily Shoe Guide",
    copy: "You will get a simple list of the exact shoes you need for work, weekends, and dates, so you never pair wrong footwear with a good outfit.",
    highlights: ["exact shoes", "work, weekends, and dates", "wrong footwear"],
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/deliverables/05-shoe-options.webp",
    alt: "Formal and casual footwear paired with complete outfits",
  },
  {
    number: "06",
    title: "Perfume Recommendations",
    copy: "You will get perfume ideas so you know exactly what to wear to daily events and special occasions.",
    highlights: ["perfume ideas", "daily events and special occasions"],
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/deliverables/06-perfume-options.webp",
    alt: "Personal fragrance recommendations",
  },
  {
    number: "07",
    title: "Glasses & Sunglasses Shapes",
    copy: "You will get the exact frame shapes that fit your bone structure, so you stop buying and wearing glasses that look bad on your face.",
    highlights: ["exact frame shapes", "bone structure"],
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/deliverables/07-eyewear-options.webp",
    alt: "Glasses, belts and watches styled with clothing",
  },
  {
    number: "08",
    title: "Watches & Accessories",
    copy: "You will get the exact watch recommendations that match your overall outfit and look good on your wrist.",
    highlights: ["exact watch recommendations", "overall outfit"],
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/deliverables/08-accessory-options.webp",
    alt: "Watches and accessories paired with complete outfits",
  },
  {
    number: "09",
    title: "Ready-To-Wear Outfits",
    copy: "You will get 20 complete, head-to-toe outfits built for your office, weekends, and events so you never have to guess what to wear.",
    highlights: ["20 complete, head-to-toe outfits", "office, weekends, and events", "never have to guess what to wear"],
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/deliverables/09-outfit-options.webp",
    alt: "Four ready-to-wear looks for different occasions",
  },
  {
    number: "10",
    title: "Smart Shopping Guidance",
    copy: "You will get a brand recommendation list based on your actual budget so you only buy what you need and stop wasting money on items you never wear.",
    highlights: ["brand recommendation list", "actual budget", "only buy what you need"],
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/deliverables/10-shopping-options.webp",
    alt: "Personal shopping and wardrobe planning recommendations",
  },
];

const bonuses = [
  {
    title: "90-Day Style Upgrade Plan",
    copy: "A step-by-step roadmap for grooming, colours, fit, wardrobe gaps, outfits and your signature style direction.",
    highlights: ["step-by-step roadmap", "grooming, colours, fit", "signature style direction"],
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/bonuses/style-upgrade-roadmap.webp",
    width: 1254,
    height: 1254,
  },
  {
    title: "Men's Skincare, Haircare and Fragrance Guide",
    copy: "Simple grooming guidance for skincare, haircare, product categories, styling basics, perfume and common mistakes to avoid.",
    highlights: ["Simple grooming guidance", "skincare, haircare", "styling basics", "common mistakes to avoid"],
    image: "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/bonuses/grooming-guide.webp",
    width: 1254,
    height: 1254,
  },
];

const comparisonRows = [
  ["Copy style advice from Instagram or YouTube", "Get a personalized style based on your exact face and body."],
  ["Copy a celebrity or influencer look", "Build complete outfits around your actual lifestyle and office."],
  ["Wear expensive brands and logos", "Wear properly fitted clothes that make you look naturally attractive."],
  ["Follow mom's or wife's color and fit choice", "Know exactly what colors look good on your skin complexion."],
  ["Buy trendy clothes and hope you look good", "Buy clothes you know will look great on you."],
];

const recapItems = [
  "Hairstyle Ideas",
  "Beard Style Recommendations",
  "Colour Combinations",
  "20 Complete Outfits",
  "Exact Clothing Fits",
  "Ready-to-Wear Looks for Every Occasion",
  "Shoe, Watch & Perfume Ideas",
  "Smart Shopping Plan",
  "Bonus 1: Skin & Hair Care Routine",
  "Bonus 2: 90-Day Action Plan",
  "Lifetime Access",
];

export function LandingPageAM2({ variant = "AM", preview = false }) {
  const isDarkVariant = variant === "AM2";
  const route = globalThis.window?.location?.pathname || (isDarkVariant ? LANDING_AM2_PATH : LANDING_PATH);

  useEffect(() => {
    if (preview || import.meta.env?.DEV) return;
    initializeAnalytics({ route });
    trackLandingView({ route });
    sendExperimentLanding();
  }, [preview, route]);

  return (
    <div className={`am2-site${isDarkVariant ? " am2-theme-dark" : ""}`} data-page-variant={variant}>
      <main className="am2-page">
        <AM2Hero />
        <TrustSection />
        <ReportHighlights />
        <PersonaSection />
        <ButWeGetIt />
        <StyleIQIntro />
        <EverythingInside />
        <Bonuses />
        <Comparison />
        <HowItWorks />
        <Testimonials />
        <RecapOffer />
        <FAQ />
        <FinalClose />
      </main>
      <Footer />
      <StickyBuyBar />
    </div>
  );
}

function AM2Hero() {
  return (
    <section className="hero styleiq-hero am2-styleiq-hero" id="top">
      <div className="shell styleiq-page-shell">
        <div className="styleiq-hero-shell">
          <div className="hero-copy">
            <p className="hero-eyebrow">Dear Men</p>
            <h1 aria-label="DO YOU WANT TO DRESS LIKE A TRUE STYLISH GENTLEMAN STARTING TODAY WITHOUT COPYING OTHERS ON INTERNET OR PAYING CELEBRITY PRICES?">
              <span className="hero-title-line">DO YOU WANT TO DRESS LIKE A</span>
              <span className="hero-title-line"><strong className="hero-title-accent">TRUE STYLISH</strong> <em>GENTLEMAN</em></span>
              <span className="hero-title-line"><em className="hero-title-today">STARTING TODAY</em> WITHOUT COPYING OTHERS ON INTERNET OR PAYING <strong className="hero-title-accent">CELEBRITY PRICES?</strong></span>
            </h1>
            <p className="hero-lead">
              <span className="hero-lead-copy">
                Get A Personalised Style Report Built After Analyzing Your Face, Body, Complexion, Lifestyle And Preferences So You Know Which Hairstyles, Beard Styles, Colours, Fits And Clothes Work Best For You.
              </span>
            </p>
            <div className="am2-hero-transformation-wrap">
              <figure className="am2-hero-transformation">
                <img
                  src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/hero/before-after-style-report-annotated-v2.webp"
                  alt="Annotated before and after personal style comparison showing one man with mismatched styling on the left and personalised styling on the right"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width="1200"
                  height="1200"
                />
              </figure>
              <a className="button am2-hero-transformation-cta" href="#purchase">
                <span>Send My Personal Style Report</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportHighlights() {
  return (
    <section className="section report-contents section-editorial-preview report-contents-editorial am2-report-preview" id="preview">
      <div className="shell">
        <div className="am2-report-overview-block">
          <SectionHeading intro="The report shows you what to do with your hair, beard, colours, fits, outfits and grooming instead of leaving you with vague fashion advice.">
            Your Personal Style Report Takes You From <span>Average Nobody To Smart Handsome Gentlemen</span>
          </SectionHeading>
          <SoundVideo
            className="report-overview-video am2-loop-video"
            src="https://res.cloudinary.com/dhjsqmejb/video/upload/v1787990480/Style_Report_overview_2_sm1mmx.mp4"
            label="Personal Style Report overview video"
            showSoundControl={false}
          />
          <p className="am2-you-get">You'll Get:</p>
          <div className="report-content-subsections" aria-label="What you get inside the report">
            {reportHighlights.map((card) => (
              <article className="report-content-subsection am2-report-preview-card" key={card.title}>
                <div className="report-content-subsection-heading">
                  <h3>{card.title}</h3>
                </div>
                <div className="report-content-subsection-body">
                  <figure>
                    <img src={card.image} alt={card.title} loading="lazy" decoding="async" width={card.width} height={card.height} />
                  </figure>
                  <p>{renderHighlightedCopy(card.copy, card.highlight)}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="am2-report-keep-note">And much more inside your personalized report.</p>
          <h3 className="am2-testimonial-heading">
            Hear What <span>People Are Saying</span>
          </h3>
          <SoundVideo
            className="am2-report-testimonial-video"
            src="https://res.cloudinary.com/dm49wi6j4/video/upload/v1788007305/grooming_silence_edit_final_1_m4w53i.mp4"
            label="Personal style testimonial video"
          />
        </div>
      </div>
    </section>
  );
}

function PersonaSection() {
  return (
    <section className="section proof section-editorial-preview proof-editorial am2-personas" id="personas">
      <div className="shell">
        <div className="am2-persona-block">
          <SectionHeading>
            Meet the people who <span><em>now</em> know their style</span>
          </SectionHeading>
          <div className="testimonial-ledger am2-persona-ledger" aria-label="Example customer personas">
            {personaStories.map((story) => (
              <article className="testimonial-entry am2-persona-story" key={story.name}>
                <img
                  className="am2-persona-image"
                  src={story.image}
                  alt={`${story.name}, ${story.meta}`}
                  loading="lazy"
                  decoding="async"
                  width="1254"
                  height="1254"
                />
                <div className="am2-persona-identity">
                  <strong>{story.name}, {story.meta}</strong>
                </div>
                <div className="am2-persona-copy am2-persona-problem">
                  <p><strong className="am2-persona-label">The Problem:</strong> {renderPersonaCopy(story.problem, story.problemHighlights)}</p>
                </div>
                <div className="am2-persona-copy am2-persona-fix">
                  <p><strong className="am2-persona-label">The Fix:</strong> {renderPersonaCopy(story.fix, story.fixHighlights)}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="am2-persona-close">This is exactly what a personalized style system does for you.</p>
        </div>
      </div>
    </section>
  );
}

function ButWeGetIt() {
  return (
    <section className="section approach section-editorial-preview styleiq-editorial am2-narrative">
      <div className="shell narrow-shell">
        <div className="am2-narrative-block">
          <SectionHeading>
            Three Steps To Start Looking From <span>Average To Smart Charming Gentlemen</span>
          </SectionHeading>
          <div className="am2-narrative-subsections">
            <div className="am2-narrative-subsection am2-narrative-context">
              <h3 className="am2-narrative-subheading">First, You Need To Understand <span>Why You Look Average</span></h3>
              <div className="am2-copy-stack">
                <p>Maybe your dad picked the <strong>first hairstyle</strong> that you still follow and wears the <strong>outfits your mom buys</strong> for you.</p>
                <p>As a result, you <strong>didn't care about your looks.</strong></p>
                <p>Today, you're successful and have money, but after all the success, you still don't know your <strong>best colors</strong>, your <strong>ideal fit</strong>, or your <strong>personal style.</strong></p>
              </div>
            </div>
            <div className="am2-narrative-subsection">
              <h3 className="am2-narrative-subheading">The <span>Cost Of Ignoring Your Looks</span></h3>
              <div className="am2-copy-stack">
                <p>You might be earning <strong>5 or 6 or even 7-figure salary</strong>, but the real world works on <strong>first impressions.</strong></p>
                <p>Before you pitch a client, introduce yourself at a networking event, go for a job interview, or sit down for a date, people already put you in the <strong>&quot;Average Looks&quot; category.</strong></p>
                <p>Because of that, every single day, you are losing out on <strong>respect, attention, and opportunities</strong> to guys with half your intelligence simply because they understand <strong>how to look sharp.</strong></p>
              </div>
            </div>
            <div className="am2-narrative-subsection">
              <h3 className="am2-narrative-subheading">Learn From What <span>Top 1% People Are Doing</span></h3>
              <div className="am2-copy-stack">
                <p>While you watch <strong>Instagram and YouTube videos</strong> to fix your style and rely on luck, the <strong>TOP 1%</strong> like celebrities, athletes, and public figures pay stylists and image consultants <strong>50K - 1 lakh</strong> to always look smart, confident, and stylish.</p>
                <p>Because they understand the importance of <strong>looking good</strong> and personalised attention that works for their unique personality.</p>
                <p>Luckily, you <strong>don&rsquo;t have to spend lakhs</strong> to look smart and handsome. So it&rsquo;s time you stop hoping that someday you&rsquo;ll automatically look good and <strong>act on it.</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StyleIQIntro() {
  return (
    <section className="section report-contents section-editorial-preview report-contents-editorial am2-styleiq-intro">
      <div className="shell">
        <div className="am2-styleiq-block">
          <SectionHeading
            intro={
              <>
                StyleIQ is the <strong>exact system</strong> famous stylists use for <strong>Bollywood actors and elite athletes</strong>.
                We analyze you <strong>from head to toe</strong> and deliver <strong>top-tier style and confidence within your budget</strong>.
              </>
            }
          >
            Introducing <span>StyleIQ</span>
          </SectionHeading>
          <div className="am2-styleiq-analysis-grid" aria-label="What StyleIQ analyses">
            {styleIqAnalyses.map((analysis) => (
              <article className="am2-styleiq-analysis-card" key={analysis.title}>
                <figure>
                  <img src={analysis.image} alt={analysis.alt} loading="lazy" decoding="async" />
                </figure>
                <h3>{analysis.title}</h3>
              </article>
            ))}
          </div>
          <div className="am2-styleiq-report-note">
            Every analysis is combined into one personal style direction built around you.
          </div>
        </div>
      </div>
    </section>
  );
}

function EverythingInside() {
  return (
    <section className="section report-contents section-editorial-preview report-contents-editorial" id="inside">
      <div className="shell">
        <div className="am2-deliverables-block">
          <SectionHeading intro="These are the actual areas your report covers, so you are not left with theory. You get decisions.">
            Complete Things <span>You Are Getting</span>
          </SectionHeading>
          <div className="am2-deliverables-grid" aria-label="Everything inside your StyleIQ report">
            {deliverables.map((deliverable) => (
              <article className="am2-deliverable-card" key={deliverable.title}>
                <div className="am2-deliverable-heading">
                  <h3>{deliverable.title}</h3>
                </div>
                <div className="am2-deliverable-body">
                  <figure className="am2-deliverable-visual">
                    <img src={deliverable.image} alt={deliverable.alt} loading="lazy" decoding="async" />
                  </figure>
                  <p>{renderPersonaCopy(deliverable.copy, deliverable.highlights)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Bonuses() {
  return (
    <section className="section section-editorial-preview am2-bonuses">
      <div className="shell">
        <div className="am2-bonus-shell">
          <SectionHeading intro="Extra guidance to help you actually follow through on your personal style plan.">
            Bonuses <span>Included</span>
          </SectionHeading>
          <div className="am2-bonus-grid" aria-label="StyleIQ bonuses">
            {bonuses.map((bonus) => (
              <article className="am2-bonus-card" key={bonus.title}>
                <div className="am2-bonus-heading">
                  <h3>{bonus.title}</h3>
                </div>
                <div className="am2-bonus-body">
                  <figure className="am2-bonus-visual">
                    <img src={bonus.image} alt={bonus.title} loading="lazy" decoding="async" width={bonus.width} height={bonus.height} />
                  </figure>
                  <p>{renderPersonaCopy(bonus.copy, bonus.highlights)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  return (
    <section className="section comparison-section section-editorial-preview comparison-editorial am2-comparison">
      <div className="shell">
        <div className="am2-comparison-shell">
          <SectionHeading>
            With And Without <span>StyleIQ</span>
          </SectionHeading>
          <div className="comparison-subsections" role="table" aria-label="Without StyleIQ versus With StyleIQ">
            <div className="comparison-table-row comparison-table-header" role="row">
              <div className="comparison-subsection-heading comparison-heading-without" role="columnheader">
                <h3>Without StyleIQ</h3>
              </div>
              <div className="comparison-subsection-heading comparison-heading-with" role="columnheader">
                <h3>With StyleIQ</h3>
              </div>
            </div>
            {comparisonRows.map(([without, withStyleIq]) => (
              <div className="comparison-table-row" role="row" key={`${without}-${withStyleIq}`}>
                <div className="comparison-cell comparison-cell-without" role="cell">
                  <X size={18} weight="bold" aria-hidden="true" />
                  <span>{without}</span>
                </div>
                <div className="comparison-cell comparison-cell-with" role="cell">
                  <Check size={18} weight="bold" aria-hidden="true" />
                  <span>{withStyleIq}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["01", "You Upload Your Photos", "After purchase, you submit your images. We use the exact styling system designed for Bollywood celebrities and athletes to analyze your features and build your custom style profile.", ["After purchase", "exact styling system", "Bollywood celebrities and athletes", "custom style profile"], "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/process/styleiq-upload-photos.webp", 1254, 1254],
    ["02", "We Create A Custom Style Profile Based On Your Photos", "We calculate the best colors for your skin and the best clothing shapes for your body. We lay out everything you need—from daily outfits and footwear to your signature perfume—and compile it into one master report.", ["best colors", "best clothing shapes", "daily outfits and footwear", "signature perfume", "one master report"], "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/process/styleiq-variable-mapping.webp", 1254, 1254],
    ["03", "Personal Style Report In 48 Hours With Lifetime Access", "You receive your Personal Style Report within 48 hours. As soon as you implement the changes, you will see an immediate difference. From day one, you will look smarter, feel highly confident, and look exceptionally good.", ["within 48 hours", "immediate difference", "From day one", "smarter, feel highly confident, and look exceptionally good"], "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/process/styleiq-report-outcome.webp", 1254, 1254],
  ];

  return (
    <section className="section process section-editorial-preview process-editorial" id="process">
      <div className="shell process-shell">
        <div className="am2-process-shell">
          <SectionHeading>
            Here’s what happens when you apply for a personal <span>style report.</span>
          </SectionHeading>
          <div className="process-flow" aria-label="How StyleIQ delivery works">
            {steps.map(([number, title, description, highlights, image, width, height]) => (
              <article className="process-step am2-process-step" key={title}>
                <div className="process-step-heading am2-process-heading">
                  <span>{number}</span>
                  <h3>{title}</h3>
                </div>
                <div className="am2-process-body">
                  <figure>
                    <img src={image} alt={title} loading="lazy" decoding="async" width={width} height={height} />
                  </figure>
                  <p className="process-description">{renderPersonaCopy(description, highlights)}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="am2-section-action">
            <Button>Start My StyleIQ</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="section proof section-editorial-preview proof-editorial am2-more-proof" id="reviews">
      <div className="shell">
        <div className="am2-testimonials-shell">
          <SectionHeading>
            What Clients <span>Say</span>
          </SectionHeading>
          <div className="testimonial-ledger am2-testimonial-ledger" aria-label="StyleIQ customer reviews">
            {testimonials.map((item) => (
              <article className="testimonial-entry" key={item.quote}>
                <div className="testimonial-entry-content">
                  <div className="testimonial-client">
                    <img
                      className="testimonial-photo"
                      src={item.image}
                      alt={`${item.name} customer photo`}
                      loading="lazy"
                      decoding="async"
                      width={item.imageWidth}
                      height={item.imageHeight}
                    />
                    <div className="testimonial-client-copy">
                      <strong>{item.name}</strong>
                      {item.meta ? <small>{item.meta}</small> : null}
                    </div>
                  </div>
                  <div className="testimonial-rating" aria-label="Five stars">
                    {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={18} weight="fill" />)}
                  </div>
                  <blockquote>{item.quote}</blockquote>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RecapOffer() {
  return (
    <section className="section final-recap final-offer-section section-editorial-preview am2-recap-section" id="purchase">
      <div className="shell">
        <div className="am2-recap-shell">
          <SectionHeading>
            Recap Of <span>Everything</span>
          </SectionHeading>
          <div className="am2-recap-media">
            <img
              src="https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/product/attractivemen-style-report-mockup-v2.webp"
              alt="Personalized style report showing face analysis, colour palette, recommended looks and a 90-day action plan"
              loading="lazy"
              decoding="async"
              width="900"
              height="473"
            />
          </div>
          <div className="final-offer styleiq-final-offer am2-recap-offer">
            <p>Here's what you get in your personal style report</p>
            <div className="recap-grid">
              {recapItems.map((item) => (
                <span key={item}><Check size={15} weight="bold" /> {item}</span>
              ))}
            </div>
            <div className="price-line" aria-label="StyleIQ report final price">
              <span className="normal-price-label">Normal Price</span>
              <del aria-label="Normal price">₹2,999</del>
              <span>Today's Price</span>
              <strong>{PRICE_LABEL}</strong>
              <small>One-time payment.</small>
            </div>
            <Button className="final-offer-button" showIcon={false}>Get My Personal Style Report</Button>
            <div className="delivery-proof" aria-label="Delivery and access details">
              <span><ClockCountdown size={26} weight="regular" /> Delivered within 48 hours</span>
              <span><SealCheck size={26} weight="regular" /> Lifetime access included</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalClose() {
  return (
    <section className="section final-recap final-offer-section section-editorial-preview am2-final-close">
      <div className="shell">
        <div className="am2-final-shell">
          <SectionHeading>
            Stop Hoping You Will <span>Automatically Look Good</span>
          </SectionHeading>
          <div className="final-offer styleiq-final-offer">
            <p>You can keep watching videos, saving outfits and relying on luck.</p>
            <p>Or you can get a report that starts with your face, complexion, body, lifestyle and budget.</p>
            <p><strong>Know your hairstyles. Know your colours. Know your fits. Know what to wear.</strong></p>
            <Button className="final-offer-button" showIcon={false}>Send My Personal Style Report</Button>
            <div className="delivery-proof">
              <span>Personalised</span>
              <span>Delivered within 48 hours</span>
              <span>Lifetime access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
