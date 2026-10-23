import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const outDir = path.join(root, "doc-assets", "screenshots");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const frontendUrl = "http://127.0.0.1:8080";
const debugPort = 9223;
const userDataDir = path.join(root, ".tmp-chrome-doc-screens");

const user = {
  id: "doc-user",
  name: "Equipo EcoHuella",
  username: "ecohuella",
  email: "equipo@ecohuella.local",
  role: "admin",
  city: "San Juan",
  province: "San Juan",
  country: "Argentina",
};

const json = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  });
  res.end(JSON.stringify(body));
};

const mockServer = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    json(res, 204, {});
    return;
  }

  if (req.url === "/api/auth/profile") {
    json(res, 200, { user });
    return;
  }

  if (req.url === "/api/results") {
    json(res, 200, {
      count: 1,
      results: [
        {
          _id: "doc-result",
          completedAt: new Date().toISOString(),
          answers: {
            _surveyType: "ambiental",
            h_personas: 3,
            h_electricidad: "Media",
            t_medio_principal: "Auto",
            a_dieta: "Omnivora",
          },
          metadata: { survey_type: "ambiental" },
          results: {
            housing_kg: 1100,
            transport_kg: 1500,
            food_kg: 1800,
            waste_kg: 300,
            total_kg: 4700,
            total_tonnes: 4.7,
            planets_needed: 3.1,
            percentage_vs_average: 0,
          },
        },
      ],
    });
    return;
  }

  if (req.url === "/api/questions") {
    json(res, 200, { count: 0, questions: [] });
    return;
  }

  if (req.url === "/api/parameters") {
    json(res, 200, { count: 0, parameters: [] });
    return;
  }

  if (req.url === "/api/admin/users") {
    json(res, 200, { count: 1, users: [user] });
    return;
  }

  json(res, 200, { ok: true });
});

const requestJson = (url) =>
  new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });

const cdp = (wsUrl) => {
  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pending = new Map();

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  });

  const ready = new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
  const send = async (method, params = {}) => {
    await ready;
    const messageId = id++;
    ws.send(JSON.stringify({ id: messageId, method, params }));
    return new Promise((resolve, reject) => pending.set(messageId, { resolve, reject }));
  };

  return { send, close: () => ws.close() };
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForChrome = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const pages = await requestJson(`http://127.0.0.1:${debugPort}/json/list`);
      const page = pages.find((item) => item.type === "page" && item.webSocketDebuggerUrl);
      if (page) return page;
    } catch {
      await wait(250);
    }
  }
  throw new Error("Chrome remote debugging did not start");
};

const capture = async (client, route, filename, auth = false) => {
  if (auth) {
    await client.send("Page.navigate", { url: frontendUrl });
    await wait(800);
    await client.send("Runtime.evaluate", {
      expression: `
        localStorage.setItem('token', 'doc-token');
        localStorage.setItem('ecohuella_terms_accepted_v1', JSON.stringify(['doc-user']));
        localStorage.removeItem('ecohuella_terms_pending_user_v1');
      `,
    });
    await client.send("Page.navigate", { url: `${frontendUrl}/dashboard` });
    await wait(2500);
    await client.send("Runtime.evaluate", {
      expression: `
        history.pushState({}, '', '${route}');
        window.dispatchEvent(new PopStateEvent('popstate'));
      `,
    });
    await wait(2000);
  } else {
    await client.send("Page.navigate", { url: `${frontendUrl}${route}` });
    await wait(2500);
  }

  const state = await client.send("Runtime.evaluate", {
    expression: "({ href: location.href, text: document.body.innerText.slice(0, 180) })",
    returnByValue: true,
  });
  console.log(filename, state.result.value.href, state.result.value.text.replace(/\\s+/g, " "));

  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await fs.writeFile(path.join(outDir, filename), Buffer.from(result.data, "base64"));
};

await fs.mkdir(outDir, { recursive: true });
await fs.rm(userDataDir, { recursive: true, force: true });

await new Promise((resolve, reject) => {
  mockServer.once("error", reject);
  mockServer.listen(5000, "127.0.0.1", resolve);
});

const chrome = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${userDataDir}`,
  "--disable-gpu",
  "--hide-scrollbars",
  "--window-size=1440,1000",
  "about:blank",
], { stdio: "ignore" });

try {
  const page = await waitForChrome();
  const client = cdp(page.webSocketDebuggerUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");

  await capture(client, "/login", "01-login.png");
  await capture(client, "/signup", "02-registro.png");
  await capture(client, "/", "03-inicio.png", true);
  await capture(client, "/encuestas", "04-encuestas.png", true);
  await capture(client, "/dashboard", "05-dashboard.png", true);
  await capture(client, "/admin", "06-admin.png", true);

  client.close();
} finally {
  chrome.kill();
  mockServer.close();
}

console.log(outDir);
