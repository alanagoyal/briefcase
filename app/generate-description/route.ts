import { invoke, initLogger, wrapTraced } from "braintrust";
import { BraintrustAdapter } from "@braintrust/vercel-ai-sdk";
import axios from "axios";
import * as cheerio from "cheerio";

initLogger({
  projectName: "ycs24",
  apiKey: process.env.BRAINTRUST_API_KEY,
  asyncFlush: true,
});

function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  if (!url.includes("www.")) {
    const urlObj = new URL(url);
    url =
      urlObj.protocol +
      "//www." +
      urlObj.hostname +
      urlObj.pathname +
      urlObj.search +
      urlObj.hash;
  }
  return url;
}

async function scrapeWebsiteHeaderInfo(
  url: string
): Promise<{ header: string; subtitle: string; siteContent: string }> {
  try {
    url = normalizeUrl(url); // Normalize the URL
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

    // Get the entire site content
    const siteContent = $.html();

    return { header, subtitle, siteContent };
  } catch (error) {
    console.error("Error scraping website:", error);
    throw new Error("Failed to scrape website");
  }
}

export async function POST(req: Request) {
  const { website } = await req.json();
  console.log("Website:", website);

  const { header, subtitle, siteContent } = await scrapeWebsiteHeaderInfo(
    website
  );

  console.log("Header:", header);
  console.log("Subtitle:", subtitle);
  console.log("Site Content:", siteContent);

  const description = await handleRequest(siteContent);
  return BraintrustAdapter.toAIStreamResponse(description);
}

const handleRequest = wrapTraced(async function handleRequest(siteContent) {
  return await invoke({
    projectName: "ycs24",
    slug: "generate-description-e9e1",
    input: {
      siteContent,
    },
    stream: true,
  });
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
