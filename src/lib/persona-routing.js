/** Identifies the complexion ad sets using Meta's ad-set-name parameter. */
export function isComplexionAdSet(search = "") {
  const adSet = new URLSearchParams(search).get("utm_medium") || "";
  return /(?:^|[^a-z0-9])dark(?:$|[^a-z0-9])/i.test(adSet);
}

export function buildComplexionDestination(href) {
  const url = new URL(href);
  url.pathname = "/style-for-your-complexion";
  return `${url.pathname}${url.searchParams.toString() ? `?${url.searchParams}` : ""}${url.hash}`;
}
