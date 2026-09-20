import { makeFunctionReference } from "convex/server";

export const convexFunctions = {
  summary: makeFunctionReference("dashboard:getSummary"),
  overview: makeFunctionReference("dashboard:getOverview"),
  orders: makeFunctionReference("dashboard:listOrders"),
  ordersPage: makeFunctionReference("dashboard:listOrdersPage"),
  order: makeFunctionReference("dashboard:getOrder"),
  contacts: makeFunctionReference("dashboard:getContacts"),
  campaigns: makeFunctionReference("dashboard:getCampaigns"),
  funnel: makeFunctionReference("dashboard:getFunnel"),
  health: makeFunctionReference("dashboard:getHealth"),
  experiment: makeFunctionReference("dashboard:getExperiment"),
  updateExperiment: makeFunctionReference("dashboard:updateExperiment"),
};
