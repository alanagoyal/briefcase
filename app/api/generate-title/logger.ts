import { initLogger } from "braintrust";

export const logger = initLogger({
  projectName: "ycs24",
  apiKey: process.env.BRAINTRUST_API_KEY,
  asyncFlush: true,
});
