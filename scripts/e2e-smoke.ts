/**
 * 本番ビルドを preview し、アプリ HTML が応答することを確認するスモーク e2e。
 */
import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const host = "127.0.0.1";
const port = 4173;
const baseUrl = `http://${host}:${port}/pdf-tools/`;

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`$ ${command} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // preview 起動待ち
    }
    await Bun.sleep(200);
  }
  throw new Error(`preview が ${timeoutMs}ms 以内に起動しませんでした: ${url}`);
}

function killProcessTree(child: ChildProcess): void {
  if (child.pid === undefined) {
    return;
  }
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    try {
      child.kill("SIGTERM");
    } catch {
      // 既に終了済み
    }
  }
}

let preview: ChildProcess | undefined;
let passed = false;

try {
  await run("bun", ["run", "build"]);

  const previewLogs: Buffer[] = [];
  preview = spawn("bun", ["run", "preview", "--", "--host", host, "--port", String(port)], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  preview.stdout?.on("data", (chunk: Buffer) => {
    previewLogs.push(chunk);
  });
  preview.stderr?.on("data", (chunk: Buffer) => {
    previewLogs.push(chunk);
  });

  const previewFailed = new Promise<never>((_, reject) => {
    preview?.on("error", reject);
    preview?.on("exit", (code, signal) => {
      if (code === 0 || signal === "SIGTERM" || signal === "SIGKILL") {
        return;
      }
      const log = Buffer.concat(previewLogs).toString();
      reject(new Error(`preview が終了しました (code=${code}, signal=${signal})\n${log}`));
    });
  });

  await Promise.race([waitForServer(baseUrl, 30_000), previewFailed]);

  const response = await fetch(baseUrl);
  if (!response.ok) {
    throw new Error(`${baseUrl} が ${response.status} を返しました`);
  }
  const html = await response.text();
  if (!html.includes("PDF to Markdown")) {
    throw new Error(`${baseUrl} の応答に "PDF to Markdown" が含まれません`);
  }

  console.log("e2e smoke passed");
  passed = true;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  if (preview) {
    killProcessTree(preview);
  }
  process.exit(passed ? 0 : 1);
}
