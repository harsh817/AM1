import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CircleNotch, LockKey } from "@phosphor-icons/react";
import { CheckoutPage, COUNTRY_CODES } from "../../pages/CheckoutPage.jsx";
import { ThankYouPage } from "../../pages/ThankYouPage.jsx";
import { PaymentFailedPage } from "../../pages/PaymentFailedPage.jsx";
import welcomeOutfits from "./assets/approved/welcome-outfits.webp";
import reportSample from "./assets/approved/report-preview.webp";
import assessmentGuide from "./assets/approved/assessment-photo-guide.webp";
import { getQuizRetry, rememberQuizRetry } from "../../lib/quiz-retry.js";
import { buildReadiness } from "./results.js";
import { FOCUS_KEYS, PATHS, STEPS, questionForStep, selectOption } from "./questions.js";
import { testimonials } from "../../lib/landing-data.js";
import { getComparison, REVIEWS } from "./visuals.js";
import "@fontsource/inter/latin-700.css";
import "./style-quiz.css";
const DRAFT_KEY = "styleiq-quiz-session:v1";
const QUIZ_VERSION = "styleiq-production-v1";
const imageUrls = import.meta.glob("./assets/**/*.webp", { eager: true, query: "?url", import: "default" });
const resolveImage = (path) => imageUrls[path.replace("/src/features/style-quiz/", "./")] || path;
const walkthroughImages = import.meta.glob("./assets/walkthrough/*.jpg", { eager: true, query: "?url", import: "default" });
const artwork = (key) => walkthroughImages[`./assets/walkthrough/${key}.jpg`];
const focusLabels = ["Find colours that suit me", "Get a better fit", "Look sharper at work", "Update my look",
  "Find a haircut or beard style", "Dress better for going out", "Improve my overall style"];
const darkSteps = new Set(["acknowledge", "education", "habit-feedback", "testimonial"]);

function visualPath(path, answers) {
  return path === "grooming" && [1, 2].includes(answers["branch-0"]?.[0]) ? "beard" : path;
}

const emptyDetails = { name: "", email: "", phone: "", phoneCountryCode: "+91" };
const demoOrder = "DEMO-STYLEIQ-001";
const SAMPLE_CHAPTERS = {
  colours: "Colours & fit", fit: "Colours & fit", work: "Outfits & lifestyle",
  change: "Face & grooming", grooming: "Face & grooming", social: "Outfits & lifestyle", overall: "Outfits & lifestyle",
};

function checkoutSample(path, answers) {
  const key = visualPath(path, answers);
  const sample = { colours: "colour", fit: "work", work: "work", change: "change", grooming: "hair", beard: "beard", social: "social", overall: "social" };
  return {
    image: artwork(`new-${sample[key]}`) || reportSample,
    alt: `${SAMPLE_CHAPTERS[path]} example from the StyleIQ report`,
    chapter: SAMPLE_CHAPTERS[path],
  };
}

function restoredContact(contact) {
  const digits = String(contact.phone || "").replace(/\D/g, "");
  const code = digits.length === 10 && !String(contact.phone).startsWith("+") ? "+91"
    : COUNTRY_CODES.map(([code]) => code).sort((a, b) => b.length - a.length)
      .find((code) => digits.startsWith(code.slice(1))) || "+91";
  const phone = digits.length === 10 && code === "+91" ? digits : digits.slice(code.length - 1);
  return { ...emptyDetails, ...contact, phone, phoneCountryCode: code };
}

function AssessmentPreview() {
  const [submitted, setSubmitted] = useState(false);
  const photos = ["Front portrait", "Side profile", "Full-length photo"];
  return <section className="style-quiz-assessment">
    <p className="style-quiz-eyebrow">ASSESSMENT DEMO</p>
    <h1>{submitted ? "Assessment preview complete" : "Complete your photo assessment"}</h1>
    {submitted ? <p>Delivered within 48 hours after we receive your completed assessment and required photos.</p> : <>
      <p>Order reference <strong>{demoOrder}</strong></p>
      <img src={assessmentGuide} alt="Examples of the three required photo angles" />
      <p>Use test images here. This local preview keeps the files on your device.</p>
      <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
        {photos.map((photo) => <label key={photo}>{photo}<input type="file" accept="image/*" required /></label>)}
        <button className="style-quiz-primary" type="submit">Complete demo assessment</button>
      </form>
    </>}
  </section>;
}

function readDraft(key = DRAFT_KEY) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || "null");
    if (saved && Number.isInteger(saved.position) && STEPS[saved.position] && saved.answers && typeof saved.answers === "object") {
      return { position: saved.position, path: PATHS[saved.path] ? saved.path : "", answers: saved.answers };
    }
  } catch { /* The current tab can continue without browser storage. */ }
  return { position: 0, path: "", answers: {} };
}

function getVisitorId() {
  try {
    const key = "styleiq-quiz-visitor:v1";
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = globalThis.crypto?.randomUUID?.() || `q-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return `q-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

function campaignFields() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "gclid", "gbraid", "wbraid", "fbclid"].map((key) => [key, (params.get(key) || "").slice(0, 256)]));
}

async function sendQuizEvent(eventType, visitorId) {
  if (import.meta.env.DEV) return;
  const eventKey = `${QUIZ_VERSION}:${visitorId}:${eventType}`;
  try { if (sessionStorage.getItem(eventKey)) return; } catch { /* Storage is optional. */ }
  const payload = { event_type: eventType, visitor_id: visitorId, quiz_version: QUIZ_VERSION, campaign: campaignFields() };
  for (const delay of [0, 750, 2250]) {
    if (delay) await new Promise((resolve) => window.setTimeout(resolve, delay));
    try {
      const response = await fetch("/api/quiz/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true });
      if (response.ok) {
        try { sessionStorage.setItem(eventKey, "1"); } catch { /* Server deduplication still applies. */ }
        return;
      }
      if (response.status < 500) return;
    } catch { /* Retry a transient network failure without blocking the quiz. */ }
  }
}

function ProgressHeader({ position, onBack, canGoBack, compact = false, demo = false }) {
  const completed = Math.min(100, Math.round(position / 24 * 100));
  return <header className={`style-quiz-header${compact ? " style-quiz-header--compact" : ""}`}>
    <button type="button" className="style-quiz-back" onClick={onBack} disabled={!canGoBack} aria-label="Go back"><ArrowLeft size={18} /></button>
    <strong className="style-quiz-wordmark">StyleIQ</strong>
    <span className="style-quiz-progress-label">{demo ? "Demo" : import.meta.env.DEV && (compact || !position) ? "Preview" : position ? "Your profile" : ""}</span>
    {!compact && position > 0 && <div className="style-quiz-progress" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={completed}><span style={{ width: `${completed}%` }} /></div>}
  </header>;
}

function ChoiceList({ step, path, question, selected, onChoose, onContinue }) {
  const multi = question.multiple;
  const hint = step === "age" ? "This helps us choose examples you can relate to."
    : step === "focus" ? "Choose the one that matters most today."
    : multi ? "Choose all that apply." : "Choose one.";
  return <>
    <p className="style-quiz-hint">{hint}</p>
    <div className="style-quiz-question-actions">
      <div className={`style-quiz-choices${step === "branch-0" && path === "work" ? " style-quiz-choices--three" : ""}`} role="group" aria-label={question.prompt}>
        {question.choices.map((choice, index) => {
          const actualIndex = question.indexes?.[index] ?? index;
          const active = selected.includes(actualIndex);
          const label = step === "focus" ? focusLabels[index] : step === "readiness" && index === 5 ? "None yet" : choice;
          return <button type="button" key={actualIndex} className={`style-quiz-choice${active ? " is-selected" : ""}`}
            aria-pressed={multi || active ? active : undefined} onClick={() => onChoose(actualIndex, question)}>{label}</button>;
        })}
      </div>
      {multi && <button type="button" className="style-quiz-primary" onClick={onContinue} disabled={!selected.length}>Continue</button>}
    </div>
  </>;
}

function ComparisonScreen({ path, answers }) {
  const useAgeExample = path === "overall" && answers["branch-1"]?.[0] === 4 && [3, 4].includes(answers.age?.[0]);
  const comparison = getComparison(useAgeExample ? "change" : path, useAgeExample ? {} : answers);
  const key = visualPath(path, answers);
  const concern = answers["branch-0"]?.[0];
  const referenceConcerns = { colours: 1, fit: 0, work: 2, change: 0, grooming: 0, beard: 1, social: 0, overall: 0 };
  const useWalkthrough = !useAgeExample && concern === referenceConcerns[key] &&
    (path !== "overall" || answers["branch-1"]?.[0] === 4);
  const images = comparison.images || [comparison.image];
  return <section className="style-quiz-comparison">
    <p className="style-quiz-eyebrow">STYLE IN PRACTICE</p>
    <h1 id="quiz-title" tabIndex={-1}>{comparison.title}</h1>
    {useWalkthrough ? <figure className="style-quiz-reference-comparison">
      <figcaption><span>Before</span><span>After</span></figcaption>
      <img src={artwork(key)} alt="Side-by-side illustrative styling comparison" />
    </figure> : <div className={images.length === 1 ? "style-quiz-single-comparison" : "style-quiz-image-pair"}>
      {images.map((source, index) => <figure key={source}>
        <figcaption>{comparison.captions?.[index] || "Before and after"}</figcaption>
        <img src={resolveImage(source)} alt={comparison.alt || comparison.captions[index]} />
      </figure>)}
    </div>}
    <small>Illustrative styling example</small>
    <p>{useWalkthrough && key === "colours"
      ? "Compare the charcoal shirt with the ivory shirt and burgundy layer. Notice how the lighter shade changes the contrast around his face."
      : comparison.text}</p>
  </section>;
}

function ScoreGraph({ current, target }) {
  const startY = 200 - current * 1.48;
  const endY = 200 - target * 1.48;
  const curve = `M31 ${startY} C103 ${startY} 206 ${endY} 279 ${endY}`;
  return <figure className="style-quiz-score-panel">
    <figcaption>Your style potential</figcaption>
    <svg className="style-quiz-chart" viewBox="0 0 320 245" role="img" aria-label={`${current} out of 100 today. Suggested style goal ${target} out of 100.`}>
      <defs><linearGradient id="quiz-score-fill" x2="0" y2="1">
        <stop stopColor="#bc885f" stopOpacity=".32" /><stop offset="1" stopColor="#bc885f" stopOpacity="0" />
      </linearGradient></defs>
      <path d="M16 52H304 M16 89H304 M16 126H304 M16 163H304 M16 200H304" fill="none" stroke="#395057" strokeDasharray="3 4" />
      <path className="style-quiz-plot-area" d={`${curve} V200 H31Z`} fill="url(#quiz-score-fill)" />
      <path className="style-quiz-plot-line" d={curve} pathLength="1" fill="none" stroke="#d7a279" strokeWidth="3" strokeLinecap="round" />
      <circle cx="31" cy={startY} r="5.5" fill="#10232a" stroke="#d7a279" strokeWidth="2" />
      <text x="20" y={startY - 17} fill="#fff9f3" fontSize="22" fontWeight="700">{current}<tspan fontSize="13" fontWeight="500">/100</tspan></text>
      <g className="style-quiz-plot-end">
        <circle cx="279" cy={endY} r="13" fill="#d7a279" opacity=".22" /><circle cx="279" cy={endY} r="5.5" fill="#f2c49e" />
        <text x="301" y={endY - 22} textAnchor="end" fill="#fff9f3" fontSize="25" fontWeight="700">{target}<tspan fontSize="14" fontWeight="500">/100</tspan></text>
      </g>
      <text x="19" y="225" fill="#f3d8c2" fontSize="12" fontWeight="650">Today</text>
      <text x="301" y="225" textAnchor="end" fill="#f3d8c2" fontSize="12" fontWeight="650">Suggested goal</text>
    </svg>
  </figure>;
}

function StylePotential({ readiness, onContinue }) {
  return <div className="style-quiz-potential">
    <p className="style-quiz-eyebrow">Style potential</p>
    <h1 id="quiz-title" tabIndex={-1}>See how far your style could go</h1>
    <p className="style-quiz-muted">Based on the answers you shared.</p>
    <ScoreGraph current={readiness.current} target={readiness.target} />
    <p className="style-quiz-potential-note">You have {readiness.readyCount} of 5 style basics in place. {readiness.readyCount === 5 ? "Your plan helps you maintain those basics." : "Your plan starts with the areas you want to improve."}</p>
    <button type="button" className="style-quiz-primary" onClick={onContinue}>Build my style plan <ArrowRight size={18} /></button>
  </div>;
}
const PLAN_STAGES = [
  ["colour", "Skin tone, undertone & colours", "Planning colour guidance for your report."],
  ["fit", "Clothing fit & proportions", "Adding guidance on cuts, fit and garment length."],
  ["face", "Face shape, hair & beard", "Selecting grooming guidance to include."],
  ["outfit", "Outfits & lifestyle", "Connecting outfit ideas to everyday occasions."],
  ["shopping", "Accessories, shopping & action plan", "Putting the next steps in order."],
];
const FIRST_STAGE = { colours: "colour", fit: "fit", work: "outfit", change: "face", grooming: "face", social: "outfit", overall: "outfit" };

function PlanAnalysis({ reducedMotion, onContinue, path, answers, goal }) {
  const [progress, setProgress] = useState(reducedMotion ? 100 : 0);
  const concern = answers["branch-0"]?.[0];
  const primary = path === "change" && concern === 2 ? "fit" : FIRST_STAGE[path];
  const ordered = [...PLAN_STAGES.filter(([key]) => key === primary), ...PLAN_STAGES.filter(([key]) => key !== primary)];
  const selectedConcern = PATHS[path].questions[0].choices[concern];
  useEffect(() => {
    if (reducedMotion) { setProgress(100); return undefined; }
    const started = performance.now();
    const timer = window.setInterval(() => {
      const next = Math.min(100, Math.floor((performance.now() - started) / 56));
      setProgress(next);
      if (next === 100) window.clearInterval(timer);
    }, 56);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);
  const done = progress === 100;
  const active = Math.floor(progress / 20);
  return <div className="style-quiz-analysis">
    <p className="style-quiz-eyebrow">YOUR PLAN PREVIEW</p>
    <h1 id="quiz-title" tabIndex={-1}>We’re building your plan</h1>
    <div className="style-quiz-analysis-goal"><span>Suggested style goal</span><strong>{goal}/100</strong></div>
    <div className="style-quiz-analysis-progress">
      <div><strong>{done ? "Plan outline ready" : "Building your plan"}</strong><span>{progress}%</span></div>
      <progress className="style-quiz-analysis-track" aria-label="Report preparation progress" max={100} value={progress} />
    </div>
    <ol className="style-quiz-analysis-list">{ordered.map(([key, label, description], index) => (
      <li key={key} className={index < active ? "is-complete" : index === active ? "is-active" : ""}>
        <span className="style-quiz-analysis-icon" aria-hidden="true">{index < active ? <Check size={16} weight="bold" /> : index === active ? <CircleNotch size={16} className="style-quiz-spin" /> : index + 1}</span>
        <span><strong>{key === "face" && path === "grooming" && [1, 2].includes(concern) ? "Beard shape & neckline" : label}</strong>
          <small>{index === 0 && selectedConcern ? `Your priority: ${selectedConcern}` : description}</small></span>
        <small>{index < active ? "Complete" : index === active ? "In progress" : "Upcoming"}</small>
      </li>
    ))}</ol>
    <p className="style-quiz-delivery">Your quiz answers help us organise the report. Personal analysis follows your photo assessment. Delivered within <strong>48 hours</strong> after we receive your completed assessment and required photos.</p>
    {done ? <button type="button" className="style-quiz-primary" onClick={onContinue}>Continue <ArrowRight size={18} /></button> : <p className="style-quiz-wait" role="status">Putting your answers together…</p>}
  </div>;
}

function ContactDetails({ value, error, onChange, onSubmit }) {
  const update = (event) => onChange(event.target.name, event.target.value);
  return <form className="style-quiz-contact" onSubmit={onSubmit} noValidate data-clarity-mask="true">
    <p className="style-quiz-eyebrow">ALMOST THERE</p><h1 id="quiz-title" tabIndex={-1}>Where should we send your report?</h1>
    <p className="style-quiz-muted">Add your details so we can carry them into secure checkout. We’ll use your assessment and required photos to personalise your report.</p>
    <label>Full name<input name="name" autoComplete="name" value={value.name} onChange={update} placeholder="Enter your full name" aria-invalid={Boolean(error.name)} />{error.name && <small>{error.name}</small>}</label>
    <label>Email address<input name="email" type="email" autoComplete="email" value={value.email} onChange={update} placeholder="Enter your email address" aria-invalid={Boolean(error.email)} />{error.email && <small>{error.email}</small>}</label>
    <div className="style-quiz-phone-field">
      <label htmlFor="quiz-phone">WhatsApp number</label>
      <div className="style-quiz-phone">
        <select name="phoneCountryCode" value={value.phoneCountryCode} onChange={update} aria-label="Country calling code">
          {COUNTRY_CODES.map(([code, flag]) => <option key={code} value={code}>{flag} {code}</option>)}
        </select>
        <input id="quiz-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national"
          value={value.phone} placeholder="Enter your number" aria-invalid={Boolean(error.phone)}
          aria-describedby={error.phone ? "quiz-phone-error" : undefined}
          onChange={(event) => {
            const raw = event.target.value.trim();
            const digits = raw.replace(/\D/g, "");
            const international = raw.startsWith("+") && COUNTRY_CODES.find(([code]) => digits.startsWith(code.slice(1)));
            if (international) {
              onChange("phoneCountryCode", international[0]);
              onChange("phone", digits.slice(international[0].length - 1));
            } else {
              onChange("phone", digits);
            }
          }} />
      </div>
      {error.phone && <small id="quiz-phone-error">{error.phone}</small>}
    </div>
    <label className="style-quiz-consent"><input type="checkbox" name="followUp" checked={value.followUp} onChange={(event) => onChange("followUp", event.target.checked)} /><span>It’s okay to contact me about completing my StyleIQ assessment.</span></label>
    <button type="submit" className="style-quiz-primary">Continue to checkout <ArrowRight size={18} /></button>
    <p className="style-quiz-privacy"><LockKey size={14} /> Your contact details stay out of the quiz analytics.</p>
  </form>;
}

export function StyleQuizPage({ preview = false }) {
  const isDemo = preview || import.meta.env.DEV;
  const draftKey = preview ? `${DRAFT_KEY}:demo` : DRAFT_KEY;
  const [draft, setDraft] = useState(() => readDraft(draftKey));
  const [details, setDetails] = useState(() => ({
    ...emptyDetails, followUp: false,
    ...(preview ? { name: "Demo Customer", email: "buyer@example.test", phone: "9876543210" } : {}),
  }));
  const [errors, setErrors] = useState({});
  const [checkout, setCheckout] = useState(false);
  const [selectedBumps, setSelectedBumps] = useState([]);
  const [previewStep, setPreviewStep] = useState("");
  const [retryOrderId] = useState(() => new URLSearchParams(window.location.search).get("retryOrderId"));
  const [retry] = useState(() => preview ? null : getQuizRetry(retryOrderId));
  const [retryLoading, setRetryLoading] = useState(Boolean(retry?.token && !import.meta.env.DEV));
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visitorId] = useState(getVisitorId);
  const screen = useRef(null);
  const { position, path, answers } = draft;
  const step = STEPS[position];
  const questionSteps = new Set(["age", "focus", "branch-0", "branch-1", "branch-2", "occasions", "feeling", "habit", "priorities", "style", "budget", "obstacle", "readiness"]);
  const question = questionSteps.has(step) ? questionForStep(step, path || "overall") : null;
  const selected = question ? answers[step] || [] : [];
  const pathMeta = PATHS[path] || PATHS.overall;
  const readiness = useMemo(() => buildReadiness(path || "overall", answers), [path, answers]);
  const absolutePosition = checkout ? 22 : position;
  const quizTracking = retry?.tracking || { quizVersion: QUIZ_VERSION, visitorId, campaign: campaignFields() };
  useEffect(() => {
    if (!retry) return undefined;
    setSelectedBumps(retry.selected || []);
    setDraft((draft) => ({ ...draft, position: STEPS.indexOf("contact") }));
    if (!retry.token || import.meta.env.DEV) return undefined;
    const controller = new AbortController();
    fetch("/api/quiz/retry", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: retryOrderId, token: retry.token }), signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) return;
      const result = await response.json();
      if (result.details?.name && result.details?.email && result.details?.phone) {
        setDetails(restoredContact(result.details));
        setCheckout(true);
      }
    }).catch(() => {}).finally(() => {
      if (!controller.signal.aborted) setRetryLoading(false);
    });
    return () => controller.abort();
  }, [retry, retryOrderId]);
  useEffect(() => {
    try { sessionStorage.setItem(draftKey, JSON.stringify(draft)); } catch { /* Keep the active session in memory if storage is unavailable. */ }
  }, [draft, draftKey]);
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (query) { setReducedMotion(query.matches); const update = () => setReducedMotion(query.matches); query.addEventListener?.("change", update); return () => query.removeEventListener?.("change", update); }
    return undefined;
  }, []);
  useEffect(() => { screen.current?.querySelector("h1")?.focus({ preventScroll: true }); }, [position, checkout]);
  function move(nextPosition) {
    setDraft((current) => ({ ...current, position: Math.max(0, Math.min(STEPS.length - 1, nextPosition)) }));
    window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  }
  function back() {
    if (checkout) { setCheckout(false); move(STEPS.indexOf("contact")); return; }
    move(position - 1);
  }
  function choose(index, currentQuestion) {
    setDraft((current) => {
      const currentSelected = current.answers[step] || [];
      const changed = selectOption(currentSelected, index, currentQuestion);
      if (currentQuestion.multiple && changed.length === currentSelected.length && changed.every((value, i) => value === currentSelected[i])) return current;
      const nextAnswers = { ...current.answers, [step]: changed };
      let nextPath = current.path;
      if (step === "focus") {
        nextPath = FOCUS_KEYS[index];
        if (current.path !== nextPath) for (const key of ["branch-0", "branch-1", "branch-2", "priorities"]) delete nextAnswers[key];
      }
      return { ...current, path: nextPath, answers: nextAnswers, position: currentQuestion.multiple ? current.position : current.position + 1 };
    });
    if (!currentQuestion.multiple) window.scrollTo({ top: 0 });
  }
  function submitContact(event) {
    event.preventDefault();
    const nextErrors = {};
    if (details.name.trim().length < 2) nextErrors.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(details.email.trim())) nextErrors.email = "Enter a valid email address.";
    const phoneDigits = String(details.phone || "").replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length + details.phoneCountryCode.length - 1 > 15) nextErrors.phone = "Enter a valid phone number.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (!isDemo && !retry) void sendQuizEvent("quiz_completed", visitorId);
    startCheckout();
  }
  function startCheckout() {
    if (!isDemo && !retry) void sendQuizEvent("checkout_started", visitorId);
    setCheckout(true);
    window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  }
  if (isDemo && previewStep === "failed") return <PaymentFailedPage merchantOrderId={demoOrder} preview="failed"
    onPreviewRetry={preview ? () => setPreviewStep("") : undefined} />;
  if (isDemo && previewStep === "thankyou") return <ThankYouPage merchantOrderId={demoOrder} preview="completed" onPreviewAssessment={() => setPreviewStep("assessment")} />;
  if (isDemo && previewStep === "assessment") return <div className="style-quiz-page"><AssessmentPreview /></div>;
  if (checkout) return <div className="style-quiz-checkout-shell">
    <ProgressHeader position={absolutePosition} canGoBack onBack={back} compact demo={preview} />
    <CheckoutPage quizCheckout initialDetails={details} initialSelected={selectedBumps} quizTracking={quizTracking}
      quizSample={checkoutSample(path || "overall", answers)}
      onQuizBack={(selected) => { setSelectedBumps(selected); back(); }}
      onPreviewComplete={isDemo ? () => setPreviewStep("thankyou") : undefined}
      onPreviewFailed={isDemo ? (selected) => {
        if (preview) setSelectedBumps(selected);
        else rememberQuizRetry(demoOrder, { selected, tracking: quizTracking });
        setPreviewStep("failed");
      } : undefined}
    />
  </div>;
  const review = testimonials[REVIEWS[path || "overall"].index];
  const habit = answers.habit?.[0];
  const feedback = {
    acknowledge: ["YOUR STARTING FOCUS", pathMeta.acknowledgment, "A few quick questions will help us find a starting point that reflects what matters to you."],
    education: ["YOUR ROUTINE", "Your style should work for your life.", "What you wear, where you go and what feels comfortable all shape what you’ll use."],
    "habit-feedback": ["YOUR HABITS",
      habit === 0 ? "Having a reliable outfit is a good start." : habit === 1 ? "Inspiration is a useful place to start." : "There’s a useful starting point for every routine.",
      habit === 0 ? "Let’s build a few more combinations that feel just as easy to wear." : habit === 1 ? "Look for the parts of an outfit that suit your fit, preferences and routine." : "We’ll use your answers to suggest one practical next step."],
    testimonial: ["CUSTOMER STORY", "Clear guidance can make getting dressed easier.", `“${review.quote}”`],
  }[step];
  return <div className={`style-quiz-page${darkSteps.has(step) ? " style-quiz-page--dark" : ""}`}>
    <ProgressHeader position={absolutePosition} canGoBack={position > 0} onBack={back} compact={["potential", "analysis", "contact"].includes(step)} demo={preview} />
    <main ref={screen} className={`style-quiz-content screen-${step}${question ? " screen-question" : ""}`}>
      {step === "intro" && <section className="style-quiz-welcome">
        <p className="style-quiz-eyebrow">A PERSONAL STYLE STARTING POINT</p>
        <h1 id="quiz-title" tabIndex={-1}>Find out where to start with your style.</h1>
        <p>Tell us what you’d like to improve. We’ll show you one practical place to start.</p>
        <img src={welcomeOutfits} alt="Four complete outfit directions" />
        <p className="style-quiz-caption">{preview ? "Interactive demo. No payment or uploads." : "No photos needed to begin."}</p>
        <button type="button" className="style-quiz-primary" onClick={() => { if (!isDemo) void sendQuizEvent("quiz_started", visitorId); move(1); }}>Start my quiz</button>
      </section>}
      {question && <section className="style-quiz-question">
        <h1 id="quiz-title" tabIndex={-1}>{step === "focus" ? "What would you change first?" : question.prompt}</h1>
        <ChoiceList step={step} path={path} question={question} selected={selected} onChoose={choose} onContinue={() => move(position + 1)} />
      </section>}
      {feedback && <section className="style-quiz-feedback">
        {step === "acknowledge" && <img src={artwork(visualPath(path || "overall", answers))} alt="Illustrative styling example for your focus" />}
        <p className="style-quiz-eyebrow">{feedback[0]}</p><h1 id="quiz-title" tabIndex={-1}>{feedback[1]}</h1>
        {step === "testimonial" ? <blockquote>{feedback[2]}</blockquote> : <p>{feedback[2]}</p>}
        {step === "testimonial" && <cite>{review.name}</cite>}
        {step === "education" && <><img src={welcomeOutfits} alt="Example outfits for different occasions" /><p className="style-quiz-routine">Work / Casual / Social</p></>}
        <button className="style-quiz-primary" type="button" onClick={() => move(position + 1)}>Continue</button>
      </section>}
      {step === "comparison" && <><ComparisonScreen path={path} answers={answers} />
        <button type="button" className="style-quiz-primary" onClick={() => move(position + 1)}>Continue</button>
      </>}
      {step === "potential" && <StylePotential readiness={readiness} onContinue={() => move(position + 1)} />}
      {step === "analysis" && <PlanAnalysis reducedMotion={reducedMotion} path={path || "overall"} answers={answers} goal={readiness.target} onContinue={() => move(position + 1)} />}
      {step === "contact" && (retryLoading ? <p role="status">Restoring your failed order…</p> : <>
        {retry && <p role="status">Your add-on choice is saved. Confirm your contact details to retry.</p>}
        <ContactDetails value={details} error={errors} onChange={(field, value) => setDetails((current) => ({ ...current, [field]: value }))} onSubmit={submitContact} />
      </>)}
    </main>

  </div>;
}
