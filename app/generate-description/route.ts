import { invoke, initLogger, wrapTraced } from "braintrust";
import { BraintrustAdapter } from "@braintrust/vercel-ai-sdk";
import axios from "axios";
import * as cheerio from "cheerio";

initLogger({
  projectName: "eventbase",
  apiKey: process.env.BRAINTRUST_API_KEY,
  asyncFlush: true,
});

async function scrapeWebsiteHeaderInfo(
  url: string
): Promise<{ header: string; subtitle: string }> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Try to find the header (adjust selectors as needed)
    const header =
      $("h1").first().text().trim() ||
      $("header h2").first().text().trim() ||
      $("header .title").first().text().trim() ||
      "";

    // Try to find the subtitle (adjust selectors as needed)
    const subtitle =
      $("h2").first().text().trim() ||
      $("header h3").first().text().trim() ||
      $("header .subtitle").first().text().trim() ||
      $("p").first().text().trim() ||
      "";

    return { header, subtitle };
  } catch (error) {
    console.error("Error scraping website:", error);
    throw new Error("Failed to scrape website");
  }
}

export async function POST(req: Request) {
  const { website } = await req.json();
  console.log("Website:", website);

  const { header, subtitle } = await scrapeWebsiteHeaderInfo(website);

  console.log("Header:", header);
  console.log("Subtitle:", subtitle);

  const description = await handleRequest(header, subtitle);
  return BraintrustAdapter.toAIStreamResponse(description);
}

const handleRequest = wrapTraced(async function handleRequest(
  header,
  subtitle
) {
  return await invoke({
    projectName: "ycs24",
    slug: "generate-description-e9e1",
    input: {
      header,
      subtitle,
    },
    stream: true,
  });
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
