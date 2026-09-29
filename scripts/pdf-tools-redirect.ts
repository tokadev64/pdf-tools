export const PDF_TOOLS_REDIRECT_REF = "pdf_tools_trailing_slash";

const READ_ONLY_RULE_FIELDS = new Set(["version", "last_updated"]);

export type RedirectRule = {
  id?: string;
  ref?: string;
  description?: string;
  expression?: string;
  action?: string;
  enabled?: boolean;
  action_parameters?: {
    from_value?: {
      target_url?: { value?: string };
      status_code?: number;
      preserve_query_string?: boolean;
    };
  };
  version?: string;
  last_updated?: string;
};

export function pdfToolsRedirectRule(): RedirectRule {
  return {
    ref: PDF_TOOLS_REDIRECT_REF,
    description: "Redirect /pdf-tools to /pdf-tools/ and keep the query string.",
    expression: '(http.host eq "tokaga.me" and http.request.uri.path eq "/pdf-tools")',
    action: "redirect",
    enabled: true,
    action_parameters: {
      from_value: {
        target_url: { value: "https://tokaga.me/pdf-tools/" },
        status_code: 308,
        preserve_query_string: true,
      },
    },
  };
}

export function writableRule(rule: RedirectRule): RedirectRule {
  const copy = { ...rule };
  for (const field of READ_ONLY_RULE_FIELDS) delete copy[field as keyof RedirectRule];
  return copy;
}

export function mergeRedirectRules(existing: readonly RedirectRule[]): RedirectRule[] {
  const next = pdfToolsRedirectRule();
  let replaced = false;
  const merged: RedirectRule[] = [];
  for (const rule of existing) {
    if (rule.ref !== PDF_TOOLS_REDIRECT_REF) {
      merged.push(writableRule(rule));
      continue;
    }
    if (!replaced) {
      merged.push(writableRule(rule.id ? { ...next, id: rule.id } : next));
      replaced = true;
    }
  }
  if (!replaced) merged.push(next);
  return merged;
}
