const asset = (name) => `/src/features/style-quiz/assets/${name}.webp`;

function pair(key, title, text, captions) {
  return { images: [asset(`${key}-before`), asset(`${key}-after`)], title, text, captions };
}

export function getComparison(path, answers) {
  const concern = answers["branch-0"]?.[0];
  if (path === "colours") {
    if (concern === 1 || answers["branch-2"]?.[0] === 2) {
      return {
        image: "/assets/persona/deeper-complexion-before-after.webp",
        alt: "One man shown in a dark shirt and then in a light shirt with coordinated dark trousers",
        title: "Light colours can work on deeper skin tones",
        text: "Notice how the light shirt, darker trousers and shoes come together as a complete outfit.",
      };
    }
    return {
      images: [asset("colour-light"), asset(concern === 2 ? "colour-wine" : "colour-olive")],
      captions: ["Light neutral", concern === 2 ? "Rich wine" : "Muted olive"],
      title: "See how a colour choice changes the look",
      text: "Compare two combinations and notice which one you would feel comfortable wearing.",
    };
  }
  if (path === "fit") {
    if (concern === 0) return pair("fit-waist", "Notice how the shirt sits at the waist", "Notice the garment at the shoulders, waist and hem. A suitable cut can feel more comfortable and considered.", ["Before", "After"]);
    if (concern === 2) return pair("fit-hem", "Compare the trouser lengths", "Look at the trouser shape and where the hem meets the shoe.", ["Before", "After"]);
    return pair("fit-shoulder", "Start with how the shirt sits at the shoulders", "Compare the shoulder line and how the shirt falls through the body.", ["Before", "After"]);
  }
  if (path === "work") return pair("work", "Build a look around your workday", "A few considered changes can take an everyday outfit toward a client-meeting look.", ["Everyday office", "Client meeting"]);
  if (path === "social") return pair("social", "Dress for the occasion", "Choose a complete look and shoes that feel right for where you are going.", ["Casual meetup", "Dinner or date"]);
  if (path === "grooming") {
    const beard = [1, 2].includes(concern);
    return beard
      ? pair("beard", "Give your barber a clear reference", "Compare how the cheek line and neckline change the shape of the beard.", ["Beard shape", "Defined beard line"])
      : pair("hair", "Show your barber the cut you have in mind", "Point out a length and shape you like so you have a specific reference to discuss.", ["Current haircut", "Styled haircut"]);
  }
  if (path === "change") {
    if (concern === 2) return pair("fit-waist", "A comfortable fit can evolve with you", "Compare how the garment sits and moves, then focus on the cut that feels right.", ["Current fit", "Adjusted fit"]);
    return {
      image: asset("changing-appearance"),
      alt: "Illustrative comparison showing a neat haircut and wardrobe update for a man with greying hair",
      title: "Let your style evolve with you",
      text: "Compare how a considered haircut and collar can frame the look you have today.",
    };
  }
  if (path === "overall") {
    const focus = answers["branch-1"]?.[0];
    if (focus === 0) return pair("fit-shoulder", "A better fit can be a useful first change", "Notice how the garment sits at the shoulders and through the body.", ["Before", "After"]);
    if (focus === 1) return getComparison("colours", { "branch-0": [1] });
    if (focus === 2) return getComparison("grooming", { "branch-0": [0] });
    if (focus === 3) return getComparison("social", {});
  }
  return pair("work", "Small styling choices add up", "Look at the fit and the way the colours work together. Start with one change you can see and feel.", ["Everyday look", "Considered look"]);
}

export const REVIEWS = {
  colours: { index: 0, title: "Getting clearer guidance on colour" },
  fit: { index: 1, title: "Knowing what to look for when clothes don’t fit" },
  grooming: { index: 0, title: "Having a clearer direction for hair and grooming" },
  work: { index: 2, title: "What a customer said about outfit guidance" },
  social: { index: 2, title: "What a customer said about outfit guidance" },
  change: { index: 3, title: "What a customer said about the report" },
  overall: { index: 2, title: "Knowing what to wear without starting from scratch" },
};
