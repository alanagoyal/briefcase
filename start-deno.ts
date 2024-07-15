import NextNodeServer from "npm:next/dist/server/next-server.js";
import {
  NodeNextResponse,
  NodeNextRequest,
} from "npm:next/dist/server/base-http/node.js";
import { createServer } from "node:http";
import { normalize } from "node:path";

const server = new NextNodeServer.default({
  conf: {
    basePath: "./",
    distDir: "./.next",
    experimental: {},
    amp: {},
    publicRuntimeConfig: {},
  },
});

async function buildFileIndex(
  directory: string
): Promise<Record<string, string>> {
  const fileIndex: Record<string, string> = {};

  for await (const entry of Deno.readDir(directory)) {
    const fullPath = normalize(`${directory}/${entry.name}`);

    if (entry.isDirectory) {
      const subIndex = await buildFileIndex(fullPath);
      Object.assign(fileIndex, subIndex);
    } else {
      const relativePath = fullPath.replace(directory, "").replace(/\\/g, "/");
      fileIndex[relativePath] = fullPath;
    }
  }

  return fileIndex;
}

const publicDir = "./public";
const fileIndex = await buildFileIndex(publicDir);

function getContentType(filePath: string): string {
  const ext = filePath.split(".").pop();
  switch (ext) {
    case "html":
      return "text/html";
    case "css":
      return "text/css";
    case "js":
      return "application/javascript";
    case "json":
      return "application/json";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "svg":
      return "image/svg+xml";
    case "gif":
      return "image/gif";
    case "ico":
      return "image/x-icon";
    case "txt":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
}

const http = createServer(async (request, response) => {
  if (request.url?.startsWith("/_next/static")) {
    const file = Deno.readFileSync(
      "./.next/static" + request.url.replace("/_next/static", "")
    );
    response.write(file);
    response.end();
  }

  if (request.url) {
    console.log(request.url);
    console.log(fileIndex);
    const filePath = fileIndex["public" + request.url];
    if (filePath) {
      console.log("serving file", filePath);
      try {
        const file = await Deno.readFile(filePath);
        response.write(file);
        response.writeHead(200, {
          "Content-Type": getContentType(filePath),
        });
        response.end();
        return;
      } catch (err) {
        console.error("Error serving file:", err);
      }
    }
  }

  return server.handleRequest(
    new NodeNextRequest(request),
    new NodeNextResponse(response)
  );
});

http.listen(3000);
