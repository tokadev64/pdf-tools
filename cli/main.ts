/**
 * PDF → Markdown 変換 CLI
 *
 * Usage:
 *   deno task convert <input.pdf> [-o output.md]
 */

import { parseArgs } from "jsr:@std/cli@1/parse-args";
import { basename } from "jsr:@std/path@1";
import {
  formatAsContinuousMarkdown,
  formatAsMarkdown,
  writeMarkdownFile,
} from "../src/lib/markdown-writer.ts";
import { extractTextFromPdf } from "./pdf-reader.ts";

function printUsage(): void {
  console.log("Usage: deno task convert <input.pdf> [-o output.md] [--merge]");
}

async function main(): Promise<void> {
  const args = parseArgs(Deno.args, {
    string: ["o"],
    boolean: ["merge"],
    alias: { o: "output" },
  });

  const inputFile = args._[0];
  if (typeof inputFile !== "string" || !inputFile.endsWith(".pdf")) {
    printUsage();
    Deno.exit(1);
  }

  const title = basename(inputFile, ".pdf");
  const outputFile = args.o ?? inputFile.replace(/\.pdf$/i, ".md");

  console.log(`Reading: ${inputFile}`);
  const pages = await extractTextFromPdf(inputFile);
  console.log(`Extracted ${pages.length} page(s)`);

  const markdown = args.merge
    ? formatAsContinuousMarkdown(pages, title)
    : formatAsMarkdown(pages, title);
  await writeMarkdownFile(outputFile, markdown);
  console.log(`Written: ${outputFile}`);
}

main();
