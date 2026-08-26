import assert from "node:assert/strict";
import test from "node:test";
import { buildTrackingFields } from "./tracking-webhook.js";

test("extracts missing UTM fields from marketing referrer URL", () => {
  const referrer = "https://thriveonp.com/a-m?utm_source=ig&utm_campaign=AM+-+4%2F08%2F26&utm_medium=First&utm_content=Video&utm_term=%7B%7Bterm.name%7D%7D&utm_id=120254409818390054&fbclid=example";

  const payload = buildTrackingFields({
    tracking: {
      marketing: {
        source: "",
        medium: "",
        campaign: "",
        content: "",
        term: "",
        referrer,
      },
    },
  });

  assert.deepEqual(payload.marketing, {
    source: "ig",
    medium: "First",
    campaign: "AM - 4/08/26",
    content: "Video",
    term: "{{term.name}}",
    id: "120254409818390054",
    referrer,
  });
  assert.equal(payload.utm_source, "ig");
  assert.equal(payload.utm_medium, "First");
  assert.equal(payload.utm_campaign, "AM - 4/08/26");
  assert.equal(payload.utm_content, "Video");
  assert.equal(payload.utm_term, "{{term.name}}");
  assert.equal(payload.utm_id, "120254409818390054");
});
