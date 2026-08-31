import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./LandingPage.jsx", import.meta.url), "utf8");

test("standalone transformation carousel is removed from the page flow", () => {
  assert.doesNotMatch(source, /function TransformationShowcase\(\)/);
  assert.doesNotMatch(source, /<TransformationShowcase\s*\/>/);
  assert.doesNotMatch(source, /CaretLeft|CaretRight/);
  assert.doesNotMatch(source, /transformation-carousel|transformation-viewport|transformation-arrow|transformation-dots/);
});

test("hero ends before the white trust proof band", () => {
  const hero = source.match(/function Hero\(\) \{[\s\S]*?function TrustSection\(\)/);

  assert.ok(hero, "missing Hero source");
  assert.doesNotMatch(hero[0], /<TrustBadges\s*\/>/);
  assert.match(source, /<Hero\s*\/>\s*<TrustSection\s*\/>\s*<ProblemSection\s*\/>/);
});

test("sticky buy bar uses the two-column CTA structure", () => {
  const stickyBuy = source.match(/function StickyBuyBar\(\) \{[\s\S]*?function SectionHeading\(/);

  assert.ok(stickyBuy, "missing StickyBuyBar source");
  assert.match(stickyBuy[0], /<div className="sticky-buy-details">/);
  assert.match(stickyBuy[0], /<div className="sticky-buy-offer">[\s\S]*<span>Today's Price<\/span>[\s\S]*<strong>\{PRICE_LABEL\}<\/strong>/);
  assert.match(stickyBuy[0], /<div className="sticky-buy-countdown">[\s\S]*<span>Ends In<\/span>[\s\S]*<time aria-label=\{`\$\{remaining\.hours\} hours, \$\{remaining\.minutes\} minutes and \$\{remaining\.seconds\} seconds remaining`\}>\{timerText\}<\/time>/);
  assert.match(stickyBuy[0], /<a className="sticky-buy-button" href=\{CHECKOUT_TARGET\}>Get My Report<\/a>/);
  assert.doesNotMatch(stickyBuy[0], /One-time payment|Today ends in|Buy Now|<ArrowRight size=\{18\}/);
});

test("sticky buy bar stays visible after the hero is scrolled past", () => {
  const stickyBuy = source.match(/function StickyBuyBar\(\) \{[\s\S]*?function SectionHeading\(/);

  assert.ok(stickyBuy, "missing StickyBuyBar source");
  assert.match(stickyBuy[0], /const pastHero = hero \? hero\.getBoundingClientRect\(\)\.bottom <= 0 : false;/);
  assert.match(stickyBuy[0], /setVisible\(pastHero\);/);
  assert.doesNotMatch(stickyBuy[0], /finalOfferVisible|document\.getElementById\("purchase"\)|setVisible\(pastHero &&/);
});

test("landing videos expose tap for sound controls", () => {
  const soundVideo = source.match(/function SoundVideo\(\{ className, src, label \}\) \{[\s\S]*?function StickyBuyBar\(\)/);

  assert.ok(soundVideo, "missing SoundVideo source");
  assert.match(source, /import \{ useEffect, useRef, useState \} from "react";/);
  assert.match(soundVideo[0], /const videoRef = useRef\(null\);/);
  assert.match(soundVideo[0], /const \[soundOn, setSoundOn\] = useState\(false\);/);
  assert.match(soundVideo[0], /video\.muted = !nextSoundOn;/);
  assert.match(soundVideo[0], /video\.volume = 1;/);
  assert.match(soundVideo[0], /const playPromise = video\.play\(\);/);
  assert.match(soundVideo[0], /aria-pressed=\{soundOn\}/);
  assert.match(soundVideo[0], /<span>\{soundOn \? "Sound on" : "Tap for sound"\}<\/span>/);
  assert.match(source, /<SoundVideo\s*className="problem-header-video"[\s\S]*grooming_silence_edit_final_1_m4w53i\.mp4[\s\S]*label="Grooming and style direction video"\s*\/>/);
  assert.match(source, /<SoundVideo\s*className="report-overview-video"[\s\S]*Style_Report_overview_2_sm1mmx\.mp4[\s\S]*label="StyleIQ report overview video"\s*\/>/);
});

test("you-first transformation stack renders all moved images vertically", () => {
  const stack = source.match(/function YouFirstTransformationStack\(\) \{[\s\S]*?function ProblemSection\(\)/);

  assert.ok(stack, "missing YouFirstTransformationStack source");
  assert.match(stack[0], /className="you-first-transformation-stack"/);
  assert.match(stack[0], /transformationPersonas\.map\(\(persona, index\) =>/);
  assert.match(stack[0], /className="you-first-transformation-item"/);
  assert.match(stack[0], /className="you-first-transformation-persona"/);
  assert.match(stack[0], /Look at this <b>40 year old man<\/b>, he <b>looks stylish and almost 5 years younger<\/b>\./);
  assert.match(stack[0], /<p>This <strong>\{persona\.title\}<\/strong>&nbsp;\{persona\.outcome\}<\/p>/);
  assert.match(stack[0], /<p><strong>\{persona\.title\}<\/strong> - \{persona\.outcome\}<\/p>/);
  assert.match(stack[0], /className="you-first-transformation-frame"/);
  assert.match(stack[0], /src=\{persona\.image\}/);
  assert.match(stack[0], /alt=\{`Before and after personal style transformation for \$\{persona\.title\}`\}/);
  assert.match(stack[0], /loading=\{index === 0 \? "eager" : "lazy"\}/);
  assert.match(stack[0], /className="you-first-transformation-divider" aria-hidden="true"/);
  assert.match(stack[0], /you-first-transformation-label you-first-transformation-label-before">Before<\/span>/);
  assert.match(stack[0], /you-first-transformation-label you-first-transformation-label-after">After<\/span>/);
  assert.doesNotMatch(stack[0], /SectionHeading|button|transformation-arrow|transformation-dots|avatar|persona\.lines/);
});

test("you-first transformation personas speak to the target audience", () => {
  assert.match(source, /title: "40 year old man"[\s\S]*image: "https:\/\/res\.cloudinary\.com\/dhjsqmejb\/image\/upload\/v1784628150\/ankur_hhdjc8\.png"/);
  assert.match(source, /title: "30-year corporate guy"[\s\S]*image: "https:\/\/res\.cloudinary\.com\/dhjsqmejb\/image\/upload\/v1784628150\/rahul_j5oyv6\.png"/);
  assert.match(source, /title: "25 year old skinny guy"[\s\S]*image: "https:\/\/res\.cloudinary\.com\/dhjsqmejb\/image\/upload\/v1784628151\/satyam_ttlk1w\.png"/);
  assert.match(source, /title: "complete makeover for this 5\.6 guy"[\s\S]*image: "https:\/\/res\.cloudinary\.com\/dhjsqmejb\/image\/upload\/v1784628303\/ChatGPT_Image_Jul_21_2026_03_34_51_PM_qi3dmf\.png"/);
  assert.match(source, /outcome: "looks stylish and almost 5 years younger"/);
  assert.doesNotMatch(
    source,
    new RegExp(["40-year-old\\s+guy", "Looks less tired", "more sorted\\."].join("|")),
  );
  assert.match(source, /outcome: "now finally looks decent for office and dates\."/);
  assert.doesNotMatch(source, /30-year corporate guy\s+-\s+Finally looks decent for office and dates\./);
  assert.match(source, /outcome: "right style that make him look classy"/);
  assert.match(source, /outcome: "new style makes him confident\."/);
  assert.doesNotMatch(source, /skinny guy\s+-\s+Clothes stop looking too big on him\./);
  assert.doesNotMatch(source, /short guy\s+-\s+The outfit stops making him look shorter\./);
  assert.doesNotMatch(source, /avatar:|lines: \[/);
});

test("problem section uses editorial heading and emphasized left-aligned copy", () => {
  const problem = source.match(/function ProblemSection\(\) \{[\s\S]*?function WasteSection\(\)/);

  assert.ok(problem, "missing ProblemSection source");
  assert.match(problem[0], /className="section problem section-editorial-preview problem-editorial"/);
  assert.doesNotMatch(problem[0], /<SectionHeading\s+intro=/);
  assert.match(
    problem[0],
    /<SectionHeading>\s*THE INTERNET IS FULL OF <span>RANDOM FASHION ADVICE<\/span>\s*<\/SectionHeading>/,
  );
  assert.match(problem[0], /<p className="problem-intro">And somehow, figuring out what you should actually wear is still a mystery\.<\/p>/);
  assert.match(problem[0], /<p>You copy a <strong className="problem-emphasis problem-emphasis-caps">haircut<\/strong> that looked great on someone else\.<\/p>/);
  assert.match(problem[0], /<p>You save an outfit from <em className="problem-emphasis problem-emphasis-caps problem-emphasis-italic">Instagram<\/em>\.<\/p>/);
  assert.match(problem[0], /<li><span>Will this suit my face\?<\/span><\/li>/);
  assert.match(problem[0], /<li><span>Will this color suit my complexion\?<\/span><\/li>/);
  assert.doesNotMatch(problem[0], /<li><span>[^<]*<strong className="problem-emphasis/);
  assert.match(problem[0], /<p className="problem-kicker">It does not tell you <strong className="problem-emphasis problem-emphasis-caps">what looks good on you<\/strong>\.<\/p>/);
  assert.match(problem[0], /className="problem-emphasis problem-emphasis-caps problem-emphasis-underlined"/);
});

test("waste section applies skimmable copy treatment without rewriting copy", () => {
  const waste = source.match(/function WasteSection\(\) \{[\s\S]*?function YouFirstSection\(\)/);

  assert.ok(waste, "missing WasteSection source");
  assert.match(waste[0], /className="section waste-section section-editorial-preview waste-editorial"/);
  assert.match(waste[0], /<div className="shell narrow-shell">/);
  assert.doesNotMatch(waste[0], /<div className="shell split-copy">/);
  assert.doesNotMatch(waste[0], /<SectionHeading align="left">/);
  assert.match(
    waste[0],
    /<SectionHeading>\s*Stop wasting money on the <span>wrong clothes<\/span>\s*<\/SectionHeading>/,
  );
  assert.match(waste[0], /<div className="copy-stack waste-copy">/);
  assert.match(waste[0], /<p>We know, not because every purchase is expensive\.<\/p>/);
  assert.match(waste[0], /<p>But most of them start collecting dust because the <strong className="waste-emphasis waste-emphasis-caps">shirt<\/strong> you liked in the store but rarely wear\.<\/p>/);
  assert.match(waste[0], /<p>The <strong className="waste-emphasis waste-emphasis-caps">trousers<\/strong> that technically fit but never look like a good fit on you<\/p>/);
  assert.match(waste[0], /<p>No matter how many hairstyles, color combinations, and shoes you tried, still today, when you open your wardrobe before work, a date, or an event, you&apos;re still thinking:<\/p>/);
  assert.match(waste[0], /<p><strong className="waste-emphasis waste-emphasis-caps waste-emphasis-underlined">&ldquo;What the hell do I wear\?&rdquo;<\/strong><\/p>/);
  assert.match(waste[0], /<p>There&rsquo;s a simple solution: you don&rsquo;t need more <span className="waste-emphasis waste-emphasis-caps">trial and error<\/span>; you need <strong className="waste-emphasis waste-emphasis-underlined">better decisions<\/strong> about the clothes, grooming, and style choices you already make\.<\/p>/);
});

test("you-first section applies editorial skimmable copy treatment", () => {
  const youFirst = source.match(/function YouFirstSection\(\) \{[\s\S]*?function ProfessionalStylingSection\(\)/);

  assert.ok(youFirst, "missing YouFirstSection source");
  assert.match(youFirst[0], /className="section you-first-section section-editorial-preview you-first-editorial"/);
  assert.match(youFirst[0], /<div className="shell narrow-shell">/);
  assert.doesNotMatch(youFirst[0], /<div className="shell split-copy">/);
  assert.doesNotMatch(youFirst[0], /<SectionHeading align="left">/);
  assert.match(
    youFirst[0],
    /<SectionHeading>\s*You&rsquo;ve been trying to solve a <span>personal<\/span> problem with <span>generic<\/span> answers\.\s*<\/SectionHeading>/,
  );
  assert.match(youFirst[0], /<div className="copy-stack you-first-copy">/);
  assert.match(youFirst[0], /<p>Most style advice starts with a Reel of a YouTube Video saying:<\/p>/);
  assert.match(youFirst[0], /<div className="you-first-quote-stack">\s*<p>&ldquo;Buy this\.&rdquo;<\/p>\s*<p>&ldquo;Wear that\.&rdquo;<\/p>\s*<p>&ldquo;Get this haircut\.&rdquo;<\/p>\s*<\/div>/);
  assert.match(youFirst[0], /<p>But good styling starts with <strong className="you-first-emphasis you-first-emphasis-underlined">you<\/strong>\.<\/p>/);
  assert.match(youFirst[0], /<p>But good styling starts with <strong className="you-first-emphasis you-first-emphasis-underlined">you<\/strong>\.<\/p>\s*<YouFirstTransformationStack \/>/);
  assert.match(youFirst[0], /<YouFirstTransformationStack \/>\s*<div className="you-first-feature-stack">/);
  assert.match(youFirst[0], /<div className="you-first-feature-stack">\s*<p>Your features\.<\/p>\s*<p>Your proportions\.<\/p>\s*<p>Your coloring\.<\/p>\s*<p>Your lifestyle, taste, and budget\.<\/p>\s*<\/div>/);
  assert.match(youFirst[0], /<p>All these things matter because without that context, you&rsquo;re just guessing what might work\.<\/p>/);
  assert.match(youFirst[0], /<p>With it, choosing what to wear becomes much easier\.<\/p>/);
});

test("professional styling section applies editorial skimmable copy treatment", () => {
  const professionalStyling = source.match(/function ProfessionalStylingSection\(\) \{[\s\S]*?function StyleIqSystem\(\)/);

  assert.ok(professionalStyling, "missing ProfessionalStylingSection source");
  assert.match(professionalStyling[0], /className="section professional-styling-section section-editorial-preview professional-styling-editorial"/);
  assert.match(professionalStyling[0], /<div className="shell narrow-shell">/);
  assert.doesNotMatch(professionalStyling[0], /<div className="shell split-copy">/);
  assert.doesNotMatch(professionalStyling[0], /<SectionHeading align="left">/);
  assert.match(
    professionalStyling[0],
    /<SectionHeading>\s*Professional Styling Starts With <span>YOU<\/span>\.\s*<\/SectionHeading>/,
  );
  assert.match(professionalStyling[0], /<div className="copy-stack professional-styling-copy">/);
  assert.match(professionalStyling[0], /<p>Famous celebrities rely on personal styling all the time\.<\/p>/);
  assert.match(professionalStyling[0], /<p>It commonly considers factors such as <strong className="professional-styling-emphasis">face and body<\/strong> <strong className="professional-styling-emphasis">proportions, coloring, silhouettes, wardrobe needs, lifestyle, and occasion<\/strong> before making recommendations\.<\/p>/);
  assert.match(professionalStyling[0], /<p>That makes sense because\.<\/p>/);
  assert.match(professionalStyling[0], /<div className="professional-styling-reason-stack">\s*<p>A haircut cannot be judged only by whether it is fashionable\.<\/p>\s*<p>A color cannot be judged only by whether it is trending\.<\/p>\s*<p>A jacket cannot be judged only by whether it looks good on the model\.<\/p>\s*<\/div>/);
  assert.match(professionalStyling[0], /<p><strong className="professional-styling-emphasis professional-styling-emphasis-underlined">Personalized styling solves all these issues\.<\/strong><\/p>/);
  assert.match(professionalStyling[0], /<p>Because of this, all the celebrities pay lakhs of rupees to look stylish, but you don&rsquo;t have to\.<\/p>/);
  assert.match(professionalStyling[0], /<p>The StyleIQ is built to provide your unique, personalized makeover but completely within your budget\.<\/p>/);
});

test("styleiq system section uses editorial heading and black subsections", () => {
  const styleIqSystem = source.match(/function StyleIqSystem\(\) \{[\s\S]*?function ComparisonSection\(\)/);

  assert.ok(styleIqSystem, "missing StyleIqSystem source");
  assert.match(styleIqSystem[0], /className="section approach section-editorial-preview styleiq-editorial"/);
  assert.match(styleIqSystem[0], /<div className="shell narrow-shell approach-shell">/);
  assert.doesNotMatch(styleIqSystem[0], /<SectionHeading intro=/);
  assert.match(
    styleIqSystem[0],
    /<SectionHeading>\s*Your <span>StyleIQ<\/span>\s*<\/SectionHeading>/,
  );
  assert.match(styleIqSystem[0], /<div className="copy-stack styleiq-system-copy">/);
  assert.match(styleIqSystem[0], /<p>StyleIQ is the system our human stylists use to understand what actually suits you\.<\/p>/);
  assert.match(styleIqSystem[0], /<p>Your stylist reviews your photos, measurements, build, coloring, lifestyle, preferences, and budget, then turns those details into practical recommendations built around you\.<\/p>/);
  assert.match(styleIqSystem[0], /<div className="styleiq-subsections" aria-label="StyleIQ review inputs">/);
  assert.match(styleIqSystem[0], /<article className="styleiq-subsection" key=\{pillar\.title\}>/);
  assert.match(styleIqSystem[0], /<div className="styleiq-subsection-heading">\s*<small>\{String\(index \+ 1\)\.padStart\(2, "0"\)\}<\/small>\s*<h3>\{pillar\.title\}<\/h3>\s*<\/div>/);
  assert.match(styleIqSystem[0], /<p>\{pillar\.description\}<\/p>/);
  assert.doesNotMatch(styleIqSystem[0], /className="styleiq-pillars"/);
  assert.doesNotMatch(styleIqSystem[0], /className="styleiq-pillar"/);
  assert.match(styleIqSystem[0], /<p className="styleiq-judgment">StyleIQ gives your stylist the system\. Your stylist gives you the judgment\.<\/p>/);
});

test("comparison section groups all without and with items into two editorial subsections", () => {
  const comparison = source.match(/function ComparisonSection\(\) \{[\s\S]*?function ReportContents\(\)/);

  assert.ok(comparison, "missing ComparisonSection source");
  assert.match(comparison[0], /className="section comparison-section section-editorial-preview comparison-editorial"/);
  assert.doesNotMatch(comparison[0], /<SectionHeading intro=/);
  assert.match(
    comparison[0],
    /<SectionHeading>\s*Without StyleIQ <span>vs\. With StyleIQ<\/span>\s*<\/SectionHeading>/,
  );
  assert.match(comparison[0], /<div className="copy-stack comparison-copy">/);
  assert.match(comparison[0], /<p>See what changes when the advice is built around your features, proportions, lifestyle, and budget\.<\/p>/);
  assert.match(comparison[0], /<div className="comparison-subsections" aria-label="Without StyleIQ and With StyleIQ comparison">/);
  assert.match(comparison[0], /<article className="comparison-subsection comparison-subsection-without">/);
  assert.match(comparison[0], /<h3>Without StyleIQ<\/h3>/);
  assert.match(comparison[0], /<li key=\{row\.withoutStyleIq\}><X size=\{18\} weight="bold" aria-hidden="true" \/><span>\{row\.withoutStyleIq\}<\/span><\/li>/);
  assert.match(comparison[0], /<article className="comparison-subsection comparison-subsection-with">/);
  assert.match(comparison[0], /<h3>With StyleIQ<\/h3>/);
  assert.match(comparison[0], /<li key=\{row\.withStyleIq\}><Check size=\{18\} weight="bold" aria-hidden="true" \/><span>\{row\.withStyleIq\}<\/span><\/li>/);
  assert.doesNotMatch(comparison[0], /className="styleiq-comparison"/);
  assert.doesNotMatch(comparison[0], /className="comparison-card"/);
  assert.doesNotMatch(comparison[0], /className="comparison-generic-row"/);
  assert.doesNotMatch(comparison[0], /className="comparison-report-row"/);
});

test("report contents section uses dark editorial subsections instead of cards", () => {
  const reportContents = source.match(/function ReportContents\(\) \{[\s\S]*?function BonusesSection\(\)/);

  assert.ok(reportContents, "missing ReportContents source");
  assert.match(reportContents[0], /className="section report-contents section-editorial-preview report-contents-editorial"/);
  assert.doesNotMatch(reportContents[0], /<SectionHeading intro=/);
  assert.match(
    reportContents[0],
    /<SectionHeading>\s*Everything You Get <span>With StyleIQ<\/span>\s*<\/SectionHeading>/,
  );
  assert.match(reportContents[0], /<div className="copy-stack report-contents-copy">/);
  assert.match(reportContents[0], /<p>One personalized system for what to wear, how to groom, what to buy, and what to do next\.<\/p>/);
  assert.match(reportContents[0], /<div className="report-content-subsections" aria-label="Everything included in your StyleIQ report">/);
  assert.match(reportContents[0], /reportContentGroups\.map\(\(group, index\) =>/);
  assert.match(reportContents[0], /className="report-content-subsection"/);
  assert.doesNotMatch(reportContents[0], /report-content-subsection-\$\{/);
  assert.match(reportContents[0], /<div className="report-content-subsection-heading">\s*<small>\{String\(index \+ 1\)\.padStart\(2, "0"\)\}<\/small>\s*<h3>\{group\.title\}<\/h3>\s*<\/div>/);
  assert.match(reportContents[0], /<div className="report-content-subsection-body">\s*<p>\{group\.intro\}<\/p>/);
  assert.match(reportContents[0], /<li key=\{item\}><Check size=\{16\} weight="bold" \/><span>\{item\}<\/span><\/li>/);
  assert.doesNotMatch(reportContents[0], /className="report-content-grid"/);
  assert.doesNotMatch(reportContents[0], /className="report-content-card"/);
});

test("bonuses section uses editorial subsections instead of cards", () => {
  const bonusesSection = source.match(/function BonusesSection\(\) \{[\s\S]*?function ProcessSection\(\)/);

  assert.ok(bonusesSection, "missing BonusesSection source");
  assert.match(bonusesSection[0], /className="section bonuses-section section-editorial-preview bonuses-editorial"/);
  assert.doesNotMatch(bonusesSection[0], /<SectionHeading intro=/);
  assert.match(
    bonusesSection[0],
    /<SectionHeading>\s*Plus 2 <span>Bonuses<\/span>\s*<\/SectionHeading>/,
  );
  assert.match(bonusesSection[0], /<div className="bonus-subsections" aria-label="StyleIQ bonuses">/);
  assert.match(bonusesSection[0], /bonuses\.map\(\(bonus, index\) => \{/);
  assert.match(bonusesSection[0], /const bonusTitle = bonus\.title\.replace\(\/\^Bonus #\\d\+ - \/, ""\);/);
  assert.match(bonusesSection[0], /<article className="bonus-subsection" key=\{bonus\.title\}>/);
  assert.match(bonusesSection[0], /<div className="bonus-subsection-heading">\s*<small>\{String\(index \+ 1\)\.padStart\(2, "0"\)\}<\/small>\s*<h3>\{bonusTitle\}<\/h3>\s*<\/div>/);
  assert.match(bonusesSection[0], /<div className="bonus-subsection-body">\s*<p>\{bonus\.description\}<\/p>\s*<\/div>/);
  assert.doesNotMatch(bonusesSection[0], /className="bonus-grid"/);
  assert.doesNotMatch(bonusesSection[0], /className="bonus-card"/);
});

test("process section uses number-title image-description editorial steps", () => {
  const processSection = source.match(/function ProcessSection\(\) \{[\s\S]*?function SocialProof\(\)/);

  assert.ok(processSection, "missing ProcessSection source");
  assert.match(processSection[0], /className="section process section-editorial-preview process-editorial"/);
  assert.doesNotMatch(processSection[0], /<SectionHeading intro=/);
  assert.match(
    processSection[0],
    /<SectionHeading>\s*Getting Your StyleIQ Report <span>Is Simple<\/span>\s*<\/SectionHeading>/,
  );
  assert.match(processSection[0], /<div className="copy-stack process-copy">/);
  assert.match(processSection[0], /<p>No appointments\. No travel\. No waiting weeks for a styling consultation\.<\/p>/);
  assert.match(processSection[0], /<div className="process-flow" aria-label="How StyleIQ report delivery works">/);
  assert.match(processSection[0], /processSteps\.map\(\(step, index\) =>/);
  assert.match(processSection[0], /<article className="process-step" key=\{step\.number\} aria-label=\{`\$\{step\.number\}: \$\{step\.title\}`\}>/);
  assert.match(processSection[0], /<div className="process-step-heading">\s*<span>\{String\(index \+ 1\)\.padStart\(2, "0"\)\}<\/span>\s*<h3>\{step\.title\}<\/h3>\s*<\/div>/);
  assert.match(processSection[0], /<figure>\s*<img src=\{step\.image\} alt=\{step\.alt\} loading="lazy" \/>\s*<\/figure>\s*<p className="process-description">\{step\.description\}<\/p>/);
  assert.match(processSection[0], /<div className="process-action">\s*<Button>Start My StyleIQ<\/Button>/);
  assert.doesNotMatch(processSection[0], /className="process-list"/);
  assert.doesNotMatch(processSection[0], /process-timeline/);
  assert.doesNotMatch(processSection[0], /process-rail-node/);
  assert.doesNotMatch(processSection[0], /process-step-content/);
  assert.doesNotMatch(processSection[0], /process-step-copy/);
  assert.doesNotMatch(processSection[0], /process-arrow/);
  assert.doesNotMatch(processSection[0], /ArrowDown/);
  assert.doesNotMatch(processSection[0], /process-analysis-image/);
});

test("reviews section uses client-led testimonials with stars and italic quotes", () => {
  const proof = source.match(/function SocialProof\(\) \{[\s\S]*?function RecapSection\(\)/);

  assert.ok(proof, "missing SocialProof source");
  assert.match(proof[0], /className="section proof section-editorial-preview proof-editorial"/);
  assert.doesNotMatch(proof[0], /<SectionHeading intro=/);
  assert.match(
    proof[0],
    /<SectionHeading>\s*What Clients <span>Say<\/span>\s*<\/SectionHeading>/,
  );
  assert.match(proof[0], /<div className="testimonial-ledger" aria-label="StyleIQ customer reviews">/);
  assert.match(proof[0], /testimonials\.map\(\(item\) =>/);
  assert.match(proof[0], /<article className="testimonial-entry" key=\{item\.quote\}>/);
  assert.match(proof[0], /<div className="testimonial-client">/);
  assert.match(proof[0], /<img className="testimonial-photo" src=\{item\.image\} alt=\{`\$\{item\.name\} customer photo`\} loading="lazy" \/>/);
  assert.match(proof[0], /<div className="testimonial-client-copy">\s*<strong>\{item\.name\}<\/strong>\s*\{item\.meta && <small>\{item\.meta\}<\/small>\}\s*<\/div>/);
  assert.match(proof[0], /<div className="testimonial-rating" aria-label="Five stars">/);
  assert.match(proof[0], /Array\.from\(\{ length: 5 \}\)\.map\(\(_, star\) => <Star key=\{star\} size=\{18\} weight="fill" \/>\)/);
  assert.match(proof[0], /<blockquote>\{item\.quote\}<\/blockquote>/);
  assert.doesNotMatch(proof[0], /testimonial-number/);
  assert.doesNotMatch(proof[0], /className="testimonial-grid"/);
  assert.doesNotMatch(proof[0], /className="testimonial-card"/);
  assert.doesNotMatch(proof[0], /proof-copy/);
  assert.doesNotMatch(proof[0], /Customers call out the same thing/);
  assert.doesNotMatch(proof[0], /<footer>/);
  assert.doesNotMatch(proof[0], /StarHalf/);
  assert.doesNotMatch(proof[0], /testimonial-avatar/);
});

test("final recap section uses the standard editorial headline and single offer flow", () => {
  const recap = source.match(/function RecapSection\(\) \{[\s\S]*?function FAQ\(\)/);

  assert.ok(recap, "missing RecapSection source");
  assert.match(recap[0], /className="section final-recap final-offer-section section-editorial-preview"/);
  assert.match(
    recap[0],
    /<SectionHeading>\s*150\+ personal style decisions <span>already made easier<\/span> for you\s*<\/SectionHeading>/,
  );
  assert.match(recap[0], /className="final-offer styleiq-final-offer"/);
  assert.match(recap[0], /<p>One stylist\. One analysis\. One complete direction for how you look\.<\/p>/);
  assert.match(recap[0], /<div className="recap-grid">/);
  assert.match(recap[0], /recapItems\.map\(\(item\) =>/);
  assert.match(recap[0], /<div className="price-line" aria-label="StyleIQ final price">/);
  assert.match(recap[0], /<span>Today&apos;s Price<\/span>/);
  assert.match(recap[0], /<strong>\{PRICE_LABEL\}<\/strong>/);
  assert.match(recap[0], /<small>One-time payment<\/small>/);
  assert.match(recap[0], /<Button className="final-offer-button" showIcon=\{false\}>Get My Personal Style Report<\/Button>/);
  assert.match(recap[0], /<div className="delivery-proof" aria-label="Delivery and access details">/);
  assert.match(recap[0], /<ClockCountdown size=\{26\} weight="regular" \/> Delivered within 48 hours/);
  assert.match(recap[0], /<SealCheck size=\{26\} weight="regular" \/> Lifetime access included/);
  assert.doesNotMatch(recap[0], /final-offer-copy/);
  assert.doesNotMatch(recap[0], /final-offer-action/);
  assert.doesNotMatch(recap[0], /<div className="final-offer styleiq-final-offer">\s*<h2>/);
  assert.doesNotMatch(recap[0], /<Button light>/);
  assert.doesNotMatch(recap[0], /<Button className="final-offer-button">/);
});

test("faq section uses editorial accordion structure", () => {
  const faq = source.match(/function FAQ\(\) \{[\s\S]*?function Footer\(\)/);

  assert.ok(faq, "missing FAQ source");
  assert.match(faq[0], /className="section faq section-editorial-preview faq-editorial"/);
  assert.match(
    faq[0],
    /<SectionHeading>\s*Frequently asked <span>questions<\/span>\s*<\/SectionHeading>/,
  );
  assert.match(faq[0], /<Minus size=\{24\} weight="regular" aria-hidden="true" \/>/);
  assert.match(faq[0], /<Plus size=\{24\} weight="regular" aria-hidden="true" \/>/);
  assert.doesNotMatch(faq[0], /className="faq-heading"/);
  assert.doesNotMatch(faq[0], /faq-intro/);
  assert.doesNotMatch(faq[0], /Simple answers about the report/);
  assert.doesNotMatch(faq[0], /CaretDown/);
});
