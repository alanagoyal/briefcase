import NextNodeServer from "npm:next/dist/server/next-server";

const server = new NextNodeServer({
  conf: {},
});

Deno.serve({ port: 3000 }, (request) => {
  return server.handleRequest(request);
});
