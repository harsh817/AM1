import { sendJson } from "../_lib/http.js";
import { getConvexExperimentConfig } from "../_lib/convex.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { message: "Method not allowed." });
  try {
    const config = await getConvexExperimentConfig();
    return sendJson(res, 200, config || { experimentId: "am-vs-am2-v3", enabled: false, amPercentage: 50, am2Percentage: 50 });
  } catch {
    return sendJson(res, 200, { experimentId: "am-vs-am2-v3", enabled: false, amPercentage: 50, am2Percentage: 50 });
  }
}
