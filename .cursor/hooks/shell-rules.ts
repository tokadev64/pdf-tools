const FORCE_FLAG = /(?:^|\s)(?:--force|-f)(?:\s|$)/;

export function isMainPush(cmd: string): boolean {
  if (!/\bgit\s+push\b/.test(cmd)) return false;
  if (FORCE_FLAG.test(cmd)) return false;
  return /(?:^|\s)(origin\s+)?main\b/.test(cmd) || /HEAD:main\b/.test(cmd);
}

export function isForcePush(cmd: string): boolean {
  return /\bgit\s+push\b/.test(cmd) && FORCE_FLAG.test(cmd);
}

export function isDeployCommand(cmd: string): boolean {
  return (
    /\bwrangler\s+deploy\b/.test(cmd) ||
    /\bbunx\s+wrangler\s+deploy\b/.test(cmd) ||
    /\bnpx\s+wrangler\s+deploy\b/.test(cmd) ||
    /\bbun\s+run\s+ensure-redirect\b/.test(cmd) ||
    /ensure-pdf-tools-redirect\.ts\b/.test(cmd)
  );
}

export function isZoneOrAccountMutation(cmd: string): boolean {
  return (
    /\bwrangler\s+delete\b/.test(cmd) ||
    /\bcloudflare\b.*\b(zones|accounts)\b/i.test(cmd) ||
    /\bapi\.cloudflare\.com\/client\/v4\/zones\b/.test(cmd)
  );
}

export type ShellDecision = "allow" | "ask" | "deny";

export function decideShellCommand(cmd: string): ShellDecision {
  if (isMainPush(cmd) || isForcePush(cmd)) return "deny";
  if (isDeployCommand(cmd)) return "ask";
  if (isZoneOrAccountMutation(cmd)) return "deny";
  return "allow";
}
