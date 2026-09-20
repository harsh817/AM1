import { makeFunctionReference } from "convex/server";

export const convexFunctions = {
  summary: makeFunctionReference("dashboard:getSummary"),
  orders: makeFunctionReference("dashboard:listOrders"),
  experiment: makeFunctionReference("dashboard:getExperiment"),
  updateExperiment: makeFunctionReference("dashboard:updateExperiment"),
};
