import { test } from "bun:test";
import { deepStrictEqual as assertEquals } from "node:assert/strict";

import * as fc from "fast-check";

import {
  PDF_TOOLS_REDIRECT_REF,
  mergeRedirectRules,
  type RedirectRule,
} from "./pdf-tools-redirect.ts";

test("PBT mergeRedirectRules - pdf-tools ルールは常に1件", () => {
  const ruleArb: fc.Arbitrary<RedirectRule> = fc.record({
    id: fc.option(fc.string({ minLength: 1, maxLength: 8 }), { nil: undefined }),
    ref: fc.option(fc.constantFrom(PDF_TOOLS_REDIRECT_REF, "other", "keep"), { nil: undefined }),
    description: fc.option(fc.string({ maxLength: 20 }), { nil: undefined }),
    version: fc.option(fc.constant("v1"), { nil: undefined }),
    last_updated: fc.option(fc.constant("2020-01-01"), { nil: undefined }),
  });

  fc.assert(
    fc.property(fc.array(ruleArb, { maxLength: 10 }), (existing) => {
      const merged = mergeRedirectRules(existing);
      const ours = merged.filter((rule) => rule.ref === PDF_TOOLS_REDIRECT_REF);
      assertEquals(ours.length, 1);
      assertEquals("version" in ours[0], false);
      assertEquals("last_updated" in ours[0], false);
      const others = existing.filter((rule) => rule.ref !== PDF_TOOLS_REDIRECT_REF);
      assertEquals(
        merged.filter((rule) => rule.ref !== PDF_TOOLS_REDIRECT_REF).length,
        others.length,
      );
    }),
  );
});
