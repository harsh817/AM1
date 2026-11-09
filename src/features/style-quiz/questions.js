function question(prompt, choices, { multiple = false, exclusive = null, limit = null } = {}) {
  return { prompt, choices, multiple, exclusive, limit };
}

export const PATHS = {
  colours: {
    label: "Colours that suit my complexion",
    acknowledgment: "Let’s make colours easier to choose.",
    questions: [
      question("What feels hardest about wearing colour?", ["Finding shades that complement my skin tone", "Wearing white or lighter colours", "Pairing brighter colours", "Moving beyond black and neutrals", "I’m unsure"]),
      question("Which examples would you most like to see?", ["Combinations shown on deeper brown skin", "Combinations shown on medium brown skin", "Examples across different skin tones", "No preference"]),
      question("What would you use first?", ["A simple colour palette", "Ways to pair colours I own", "A guide to choosing whites and light shades", "Complete outfit examples"]),
    ],
  },
  fit: {
    label: "Clothes that fit my body better",
    acknowledgment: "Let’s start with a better fit.",
    questions: [
      question("Where would you most like a better fit?", ["Waist or midsection", "Slim frame", "Height and proportions", "Shoulders and chest", "Overall fit"]),
      question("What usually happens when you try clothes on?", ["They feel too tight", "They hang too loosely", "They fit in one place but not another", "Sleeves or trousers are often the wrong length", "I’m unsure what good fit looks like"]),
      question("What would help you most?", ["Knowing what cuts to buy", "Knowing what a tailor can adjust", "Building comfortable outfits", "Checking fit for myself"]),
    ],
  },
  work: {
    label: "Looking sharper for work or business",
    acknowledgment: "Let’s build a sharper work wardrobe.",
    questions: [
      question("What does your work wardrobe need to cover?", ["Formal office", "Business casual", "Client meetings or presentations", "Mostly remote work", "A mix"]),
      question("What feels hardest about dressing for work?", ["Looking polished without overdressing", "Finding clothes that fit", "Putting together enough outfits", "Knowing what to wear for important meetings", "Finding options within budget"]),
      question("What would you use first?", ["Repeatable work outfits", "A reliable client-meeting look", "A list of workwear essentials", "Ways to get more from clothes I own"]),
    ],
  },
  change: {
    label: "Updating my style as my appearance changes",
    acknowledgment: "Let’s find a style that suits you today.",
    questions: [
      question("What would you like to style around?", ["Greying or white hair", "Thinning hair or a changing hairline", "Changes in body shape or fit", "Clothes that no longer feel like me", "I’d prefer not to say"]),
      question("What do you feel most unsure about?", ["What to ask my barber for", "Which colours work with my current look", "Which clothes fit comfortably now", "How to look current while feeling like myself"]),
      question("What kind of change feels right?", ["A few small changes", "A polished everyday look", "A fresh hair and wardrobe direction", "I’d like to see options first"]),
    ],
  },
  grooming: {
    label: "Finding a hairstyle or beard style",
    acknowledgment: "Let’s find a clearer grooming direction.",
    questions: [
      question("What would you most like help with?", ["A haircut", "Beard shape or stubble", "Clean-shaven styling", "An easier grooming routine", "Hair and beard together"]),
      question("How do you decide what to ask your barber for?", ["I keep the same style", "I leave it to the barber", "I show a reference photo", "I haven’t found a style I like"]),
      question("What would help at your next appointment?", ["Haircut references", "Beard shape and neckline guidance", "Easy-to-maintain options", "Coordinated hair and beard ideas"]),
    ],
  },
  social: {
    label: "Outfits for dates and social occasions",
    acknowledgment: "Let’s make getting ready to go out easier.",
    questions: [
      question("Where do you most often feel unsure what to wear?", ["First dates", "Casual meetups", "Dinners and nights out", "Weddings and celebrations", "A mix"]),
      question("What is the hardest part of getting dressed?", ["Knowing how formal to go", "Putting a complete outfit together", "Choosing shoes and accessories", "Finding something that feels like me", "Making my current clothes work"]),
      question("What would be most useful first?", ["A reliable date outfit", "Casual and dressier versions of a look", "Shoe and accessory guidance", "A few outfits I can rotate"]),
    ],
  },
  overall: {
    label: "Improving my overall style",
    acknowledgment: "Let’s find a good place to start.",
    questions: [
      question("When do you notice the problem most?", ["Getting dressed in the morning", "Shopping for clothes", "Getting ready for an important occasion", "Looking at photos of myself", "I’m still figuring it out"]),
      question("Which change would help most right now?", ["Better fitting clothes", "More confidence with colours", "A haircut or grooming update", "Complete outfits", "Deciding where to start"]),
      question("How would you like to begin?", ["Use what I own", "Try a few recommendations", "Follow a complete plan", "See some options first"]),
    ],
  },
};

export const AGE_RANGES = question("What’s your age range?", ["18–24", "25–34", "35–44", "45–54", "55+", "Prefer not to say"]);

export const FOCUS_KEYS = Object.keys(PATHS);

export const READINESS_CHECKS = [
  "A go-to colour combination",
  "Clothing fits I know work for me",
  "A hairstyle or grooming routine I can repeat",
  "An outfit ready for an important occasion",
  "A clear list of what I need to buy",
];

export const SHARED = {
  occasions: question("Where would you most like to look better?", ["Work or business", "Dates", "Dinners and social gatherings", "Weddings or family celebrations", "College", "Everyday life"], { multiple: true }),
  feeling: question("How would you like your style to feel?", ["Polished and professional", "Confident and approachable", "Relaxed but well put together", "Classic and understated", "Modern and expressive", "I’m still figuring that out"], { multiple: true, exclusive: 5 }),
  habit: question("What do you usually do when you’re unsure what to wear?", ["Repeat an outfit I already know", "Copy a look I saw online", "Ask someone I trust", "Try several things", "Choose something comfortable and move on"]),
  priorities: question("Is there anything else you’d like help with?", ["Colours and combinations", "Clothing fit and proportions", "Hair, beard or grooming", "Outfits for specific occasions", "Shoes and accessories", "What to buy and where to shop", "Nothing else right now"], { multiple: true, exclusive: 6 }),
  style: question("Which style would you enjoy wearing?", ["Classic and polished", "Smart casual", "Relaxed and simple", "Modern and expressive", "A mix of Western and Indian wear", "I’d like help choosing"], { multiple: true, exclusive: 5 }),
  budget: question("How would you prefer to spend on clothes?", ["Make the most of what I own", "Keep new purchases affordable", "Mix affordable items with a few investment pieces", "Pay more when the fit and quality are right", "I haven’t set a budget"]),
  obstacle: question("What usually stops you from making a change?", ["I don’t know where to start", "I worry I’ll buy things I won’t wear", "I don’t have enough time", "I’m unsure what will suit me", "I don’t want to feel overdressed", "I haven’t found advice that fits my life"]),
  pace: question("How much change would feel comfortable?", ["One or two changes I can try now", "A noticeable upgrade over time", "A full refresh", "I’d like to see options first"]),
  readiness: question("What do you already have sorted?", [...READINESS_CHECKS, "I’m still working on these"], { multiple: true, exclusive: READINESS_CHECKS.length }),
};

export const SECONDARY_FOCUS = {
  colours: 0,
  fit: 1,
  grooming: 2,
  work: 3,
  social: 3,
  change: null,
  overall: null,
};

export const STEPS = [
  "intro", "age", "focus", "acknowledge", "branch-0", "branch-1", "branch-2", "comparison", "education",
  "occasions", "feeling", "habit", "habit-feedback", "priorities", "testimonial", "style", "budget",
  "obstacle", "readiness", "potential", "analysis", "contact",
];

export function selectOption(selected, index, options = {}) {
  const { multiple, exclusive, limit } = options;
  if (!multiple) return [index];
  if (selected.includes(index)) return selected.filter((choice) => choice !== index);
  if (index === exclusive) return [index];
  const next = selected.filter((choice) => choice !== exclusive);
  if (Number.isInteger(limit) && next.length >= limit) return next;
  return [...next, index];
}

export function secondaryOptions(path) {
  const excluded = SECONDARY_FOCUS[path];
  return SHARED.priorities.choices.map((label, index) => ({ label, index })).filter(({ index }) => index !== excluded);
}

export function questionForStep(step, path) {
  if (step === "age") return AGE_RANGES;
  if (step === "focus") return question("What would you most like help with first?", FOCUS_KEYS.map((key) => PATHS[key].label));
  if (step === "focus-summary") return { prompt: "Your main focus", choices: FOCUS_KEYS.map((key) => PATHS[key].label) };
  if (step.startsWith("branch-")) return PATHS[path].questions[Number(step.at(-1))];
  if (step === "priorities") return { ...SHARED.priorities, choices: secondaryOptions(path).map(({ label }) => label), indexes: secondaryOptions(path).map(({ index }) => index) };
  return SHARED[step] || null;
}
