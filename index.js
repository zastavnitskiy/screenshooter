const path = require("path"),
  puppeteer = require("puppeteer"),
  http = require("http"),
  url = require("url");

async function takeScreenshot(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const screenshot = await page.screenshot({
    path: path.resolve("./screenshots/screenshot.png")
  });
  await browser.close();
  return screenshot;
}

const server = http.createServer(async function(request, response) {
  try {
    const parsed = url.parse(request.url, true);
    const { path } = parsed.query;
    if (!path) {
      throw new Error("url parameter is mandatory for this request");
    }
    const buffer = await takeScreenshot(path);
    const base64 = await buffer.toString("base64");
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(`<body><img src="data:image/png;base64,${base64}"/></body>`);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/html" });
    response.end(`
      <h1>Server error</h1>
      <pre>
      ${request.url}

      ${error}
      </pre>
    `);
  }
});

console.log("started listening for connections at 8080");
server.listen(8080);