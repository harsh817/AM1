import { PATHS, READINESS_CHECKS, STEPS, questionForStep } from "./questions.js";

const RESULT_COPY = {
  colours: ["Build confidence with colour combinations.", "Compare two shirt colours with the same trousers in daylight.", "A personal palette and complete colour combinations."],
  fit: ["Find a fit that works with your frame.", "Compare two cuts around the area you selected while standing and moving.", "Clothing cuts, fit checks and tailoring guidance for your proportions."],
  work: ["Build a work outfit you can repeat.", "Change one piece in an everyday outfit to make it work for an important meeting.", "Outfit combinations for your workplace and routine."],
  change: ["Build a style that suits you today.", "Pick one area to update and save two realistic grooming or outfit references.", "Grooming and wardrobe guidance for your current look."],
  grooming: ["Go to your barber with a clearer brief.", "Save a reference and note the length, shape or neckline you want to discuss.", "Haircut and beard recommendations with visual references."],
  social: ["Put together a reliable look for going out.", "Try on the full outfit, including shoes, before the occasion.", "Ready-to-wear looks for the occasions you chose."],
  overall: ["Start with the change that would help most.", "Choose an outfit you wear often and improve one piece first.", "A step-by-step starting plan across fit, colour, grooming and outfits."],
};

const MILESTONES = {
  colours: "Try a pairing",
  fit: "Check the fit",
  work: "Next workday",
  change: "Try one update",
  grooming: "Next appointment",
  social: "Next occasion",
  overall: "Try one change",
};

const ACTION_COPY = {
  colours: ["Pick a base colour", "Choose a pair of trousers you wear often. Use it as a steady base for comparing shirts.", "Save a combination", "Note which shirt and trousers you liked together so you can repeat the pairing."],
  fit: ["Pick one garment to check", "Start with a shirt or pair of trousers you wear often. Pay attention to the fit area you chose.", "Keep a fit reference", "Note the cut and measurements that feel comfortable so you have a reference when you shop."],
  work: ["Start with an outfit you already wear", "Lay out a work outfit you trust, including shoes. Use it as your starting point.", "Save a look that works", "Take a quick photo of the combination so you can put it together again in minutes."],
  change: ["Choose one area to update", "Start with the grooming or wardrobe change you feel most ready to try.", "Keep what feels right", "Wear the update in your normal routine and keep the part that still feels like you."],
  grooming: ["Save a reference", "Choose one hairstyle or beard reference you would feel comfortable wearing.", "Review the result", "Notice what is easy to maintain, and take a reference photo for your next appointment."],
  social: ["Start with the occasion", "Think about where you are going and how dressed up you want to feel.", "Keep a reliable combination", "Save the full look, including shoes, for another occasion with a similar dress code."],
  overall: ["Pick an everyday outfit", "Start with something you wear regularly so a small change is easy to compare.", "Repeat the useful change", "Save the version you would wear again, then try it with another outfit you already own."],
};

const FIRST_CHECK = { colours: 0, fit: 1, work: 3, change: 2, grooming: 2, social: 3, overall: 4 };
const CHECK_ACTIONS = [
  ["Find a go-to colour pairing", "Pick trousers you wear often, then compare two shirts with them in daylight."],
  ["Check the fit of one garment", "Try one shirt or pair of trousers while standing and moving. Note where it feels right and where it pulls."],
  ["Make your grooming routine repeatable", "Save one realistic reference for the haircut or grooming routine you want to try."],
  ["Put together an outfit for one occasion", "Choose the next occasion you’re dressing for and try on a complete outfit, including shoes."],
  ["Write a short shopping list", "Look through your wardrobe first and note which missing piece would make the most outfits easier to wear."],
];

export function buildReadiness(path, answers) {
  const selected = answers.readiness || [];
  const checks = READINESS_CHECKS.map((label, index) => ({ label, ready: selected.includes(index), index }));
  const readyCount = checks.filter(({ ready }) => ready).length;
  const current = Math.round(readyCount / checks.length * 100);
  const targetCount = readyCount < 4 ? 4 : checks.length;
  const openChecks = checks.filter(({ ready }) => !ready);
  const first = openChecks.find(({ index }) => index === FIRST_CHECK[path]);
  const plan = first ? [first, ...openChecks.filter((check) => check !== first)] : openChecks;

  return {
    checks,
    readyCount,
    targetCount,
    current,
    target: current < 85 ? 85 : 100,
    firstOpenIndex: plan[0]?.index,
    nextChecks: plan.slice(0, targetCount - readyCount).map(({ label }) => label),
  };
}

function selectedLabel(step, answers, path) {
  const indexes = answers[step] || [];
  const question = questionForStep(step === "focus" ? "focus-summary" : step, path);
  return indexes.map((index) => {
    const choiceIndex = question?.indexes ? question.indexes.indexOf(index) : index;
    return question?.choices[choiceIndex];
  }).filter(Boolean);
}

export function buildResult(path, answers) {
  const focus = PATHS[path] ? path : "overall";
  const primary = RESULT_COPY[focus];
  const branchQuestion = PATHS[focus].questions[0];
  const concernIndex = answers["branch-0"]?.[0];
  const occasions = selectedLabel("occasions", answers, focus);
  const readiness = buildReadiness(focus, answers);
  const clientMeetings = focus === "work" && concernIndex === 2;
  const remoteWork = focus === "work" && concernIndex === 3;
  let resultTip = focus === "fit" && concernIndex === 0
    ? "Compare two shirts while seated and standing. Look for room around the waist while the shoulders still sit comfortably."
    : focus === "colours" && concernIndex === 1
      ? "Compare a white and an off-white shirt in daylight with the same trousers. See which complete combination you prefer."
      : primary[1];
  if (clientMeetings) resultTip = "Start with an outfit you already wear. Change one piece before your next client meeting.";
  if (remoteWork) resultTip = "Try a structured shirt you already own. Check how it looks on camera before your next video call.";
  const [defaultFirstTitle, defaultFirstCopy, lastTitle, lastCopy] = ACTION_COPY[focus];
  const [firstTitle, firstCopy] = readiness.firstOpenIndex === FIRST_CHECK[focus]
    ? [defaultFirstTitle, defaultFirstCopy]
    : CHECK_ACTIONS[readiness.firstOpenIndex] ?? [defaultFirstTitle, defaultFirstCopy];
  const milestone = clientMeetings ? "Next meeting" : remoteWork ? "Next call" : MILESTONES[focus];

  const summary = [
    ["Your focus", PATHS[focus].label],
    ["You mentioned", branchQuestion.choices[concernIndex] || "A general style refresh"],
    ["Where you want to use it", occasions.join(" · ")],
    ["Style direction", selectedLabel("style", answers, focus).join(" · ")],
    ["Budget approach", selectedLabel("budget", answers, focus)[0]],
    ["Other priorities", selectedLabel("priorities", answers, focus).join(" · ")],
    ["Guidance you prefer", selectedLabel("guidance", answers, focus).join(" · ")],
  ].filter(([, value]) => value);

  return {
    path: focus,
    headline: primary[0],
    tip: resultTip,
    feature: primary[2],
    readiness,
    focusLabel: clientMeetings ? "client meetings" : (branchQuestion.choices[concernIndex] || PATHS[focus].label).toLowerCase(),
    actions: [
      { label: "Today", title: firstTitle, copy: firstCopy },
      { label: milestone, title: clientMeetings ? "Change one piece" : "Put it into practice", copy: resultTip },
      { label: "Repeat", title: lastTitle, copy: lastCopy },
    ],
    summary,
    answers: STEPS.filter((step) => answers[step]?.length).map((step) => ({
      question: step.startsWith("branch-")
        ? PATHS[focus].questions[Number(step.at(-1))]?.prompt
        : step === "focus" ? "Your main focus" : questionForStep(step, focus)?.prompt,
      answers: selectedLabel(step, answers, focus),
    })).filter((entry) => entry.question && entry.answers.length),
  };
}

const CAMPAIGN_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_content", "utm_term", "fbclid", "gclid", "gbraid", "wbraid"];

export function checkoutPreviewLink(search) {
  const incoming = new URLSearchParams(search);
  const params = new URLSearchParams({ previewQuiz: "1", quiz_version: "styleiq-v1" });
  for (const key of CAMPAIGN_KEYS) {
    if (incoming.has(key)) params.set(key, incoming.get(key));
  }
  return `/style-quiz-checkout.html?${params}`;
}
