import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (relativePath) => readFileSync(new URL(relativePath, import.meta.url), "utf8");

const sources = {
  page: readSource("./LandingPage.jsx"),
  shared: readSource("./landing/shared.jsx"),
  hero: readSource("./landing/Hero.jsx"),
  trust: readSource("./landing/TrustSection.jsx"),
  sticky: readSource("./landing/StickyBuyBar.jsx"),
  editorial: readSource("./landing/EditorialSections.jsx"),
  offer: readSource("./landing/OfferSections.jsx"),
  social: readSource("./landing/SocialProofSections.jsx"),
};
const allLandingSource = Object.values(sources).join("\n\n");

test("landing page is composed from focused section modules", () => {
  assert.match(sources.page, /from "\.\/landing\/Hero\.jsx"/);
  assert.match(sources.page, /from "\.\/landing\/EditorialSections\.jsx"/);
  assert.match(sources.page, /from "\.\/landing\/OfferSections\.jsx"/);
  assert.match(sources.page, /from "\.\/landing\/SocialProofSections\.jsx"/);
  assert.match(
    sources.page,
    /<Hero \/>\s*<TrustSection \/>\s*<ProblemSection \/>\s*<WasteSection \/>\s*<YouFirstSection \/>\s*<ProfessionalStylingSection \/>\s*<StyleIqSystem \/>\s*<ComparisonSection \/>\s*<ReportContents \/>\s*<BonusesSection \/>\s*<ProcessSection \/>\s*<SocialProof \/>\s*<RecapSection \/>\s*<FAQ \/>/,
  );
  assert.match(sources.page, /<Footer \/>\s*<StickyBuyBar \/>/);
});

test("standalone transformation carousel is removed from the page flow", () => {
  assert.doesNotMatch(allLandingSource, /function TransformationShowcase\(\)/);
  assert.doesNotMatch(allLandingSource, /<TransformationShowcase\s*\/>/);
  assert.doesNotMatch(allLandingSource, /CaretLeft|CaretRight/);
  assert.doesNotMatch(allLandingSource, /transformation-carousel|transformation-viewport|transformation-arrow|transformation-dots/);
});

test("hero, trust strip, sticky buy bar, and video sound controls keep the approved behavior", () => {
  assert.doesNotMatch(sources.hero, /<TrustBadges\s*\/>/);
  assert.match(sources.trust, /function TrustBadges\(\)/);
  assert.match(sources.sticky, /const pastHero = hero \? hero\.getBoundingClientRect\(\)\.bottom <= 0 : false;/);
  assert.match(sources.sticky, /setVisible\(pastHero\);/);
  assert.match(sources.sticky, /<span>Today's Price<\/span>/);
  assert.match(sources.sticky, /<span>Ends In<\/span>/);
  assert.match(sources.sticky, /<a className="sticky-buy-button" href=\{CHECKOUT_TARGET\}>Get My Report<\/a>/);
  assert.match(sources.shared, /const videoRef = useRef\(null\);/);
  assert.match(sources.shared, /const \[soundOn, setSoundOn\] = useState\(false\);/);
  assert.match(sources.shared, /video\.muted = !nextSoundOn;/);
  assert.match(sources.shared, /const playPromise = video\.play\(\);/);
  assert.match(sources.shared, /aria-pressed=\{soundOn\}/);
  assert.match(sources.shared, /<span>\{soundOn \? "Sound on" : "Tap for sound"\}<\/span>/);
});

test("you-first transformation stack renders the moved images vertically", () => {
  assert.match(sources.editorial, /className="you-first-transformation-stack"/);
  assert.match(sources.editorial, /transformationPersonas\.map\(\(persona, index\) =>/);
  assert.match(sources.editorial, /className="you-first-transformation-item"/);
  assert.match(sources.editorial, /Look at this <b>40 year old man<\/b>, he <b>looks stylish and almost 5 years younger<\/b>\./);
  assert.match(sources.editorial, /<p>This <strong>\{persona\.title\}<\/strong>&nbsp;\{persona\.outcome\}<\/p>/);
  assert.match(sources.editorial, /src=\{persona\.image\}/);
  assert.match(sources.editorial, /loading=\{index === 0 \? "eager" : "lazy"\}/);
  assert.match(sources.editorial, /you-first-transformation-label you-first-transformation-label-before">Before<\/span>/);
  assert.match(sources.editorial, /you-first-transformation-label you-first-transformation-label-after">After<\/span>/);
  assert.doesNotMatch(sources.editorial, /avatar:|lines: \[/);
});

test("editorial sections keep approved headings and skimmable copy markers", () => {
  assert.match(sources.editorial, /className="section problem section-editorial-preview problem-editorial"/);
  assert.match(sources.editorial, /THE INTERNET IS FULL OF <span>RANDOM FASHION ADVICE<\/span>/);
  assert.match(sources.editorial, /<li><span>Will this suit my face\?<\/span><\/li>/);
  assert.match(sources.editorial, /<li><span>Will this color suit my complexion\?<\/span><\/li>/);
  assert.match(sources.editorial, /className="section waste-section section-editorial-preview waste-editorial"/);
  assert.match(sources.editorial, /Stop wasting money on the <span>wrong clothes<\/span>/);
  assert.match(sources.editorial, /&ldquo;What the hell do I wear\?&rdquo;/);
  assert.match(sources.editorial, /You&rsquo;ve been trying to solve a <span>personal<\/span> problem with <span>generic<\/span> answers\./);
  assert.match(sources.editorial, /Professional Styling Starts With <span>YOU<\/span>\./);
});

test("offer sections use subsection structures instead of old cards", () => {
  assert.match(sources.offer, /className="styleiq-subsections" aria-label="StyleIQ review inputs"/);
  assert.match(sources.offer, /<Fragment key=\{pillar\.title\}>/);
  assert.match(sources.offer, /className="comparison-subsections" aria-label="Without StyleIQ and With StyleIQ comparison"/);
  assert.match(sources.offer, /<li key=\{row\.withoutStyleIq\}><X size=\{18\} weight="bold" aria-hidden="true" \/>/);
  assert.match(sources.offer, /<li key=\{row\.withStyleIq\}><Check size=\{18\} weight="bold" aria-hidden="true" \/>/);
  assert.match(sources.offer, /className="report-content-subsections" aria-label="Everything included in your StyleIQ report"/);
  assert.match(sources.offer, /<Fragment key=\{group\.title\}>/);
  assert.match(sources.offer, /className="bonus-subsections" aria-label="StyleIQ bonuses"/);
  assert.match(sources.offer, /className="process-flow" aria-label="How StyleIQ report delivery works"/);
  assert.match(sources.offer, /className="final-offer styleiq-final-offer"/);
  assert.doesNotMatch(sources.offer, /className="styleiq-pillars"|className="report-content-grid"|className="bonus-grid"|className="process-list"/);
});

test("social proof, FAQ, and footer keep final conversion structure", () => {
  assert.match(sources.social, /className="section proof section-editorial-preview proof-editorial"/);
  assert.match(sources.social, /<img className="testimonial-photo" src=\{item\.image\}/);
  assert.match(sources.social, /<div className="testimonial-rating" aria-label="Five stars">/);
  assert.match(sources.social, /<blockquote>\{item\.quote\}<\/blockquote>/);
  assert.match(sources.social, /className="section faq section-editorial-preview faq-editorial"/);
  assert.match(sources.social, /Frequently asked <span>questions<\/span>/);
  assert.match(sources.social, /href="\/privacy"/);
  assert.match(sources.social, /href="\/terms"/);
  assert.doesNotMatch(sources.social, /testimonial-number|faq-intro|Customers call out the same thing/);
});
