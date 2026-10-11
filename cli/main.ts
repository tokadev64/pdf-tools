/**
 * PDF → Markdown 変換 CLI
 *
 * Usage:
 *   bun run convert <input.pdf> [-o output.md]
 */

import { basename } from "node:path";
import { parseArgs } from "node:util";

import {
  EMPTY_PDF_TEXT_MESSAGE,
  formatAsContinuousMarkdown,
  formatAsMarkdown,
  hasExtractedText,
} from "../src/lib/markdown-writer.ts";
import { extractTextFromPdf } from "./pdf-reader.ts";
import { writeMarkdownFile } from "./write-markdown-file.ts";

function printUsage(): void {
  console.log("Usage: bun run convert <input.pdf> [-o output.md] [--merge]");
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    options: {
      output: { type: "string", short: "o" },
      merge: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  const inputFile = positionals[0];
  if (inputFile === undefined || !inputFile.endsWith(".pdf")) {
    printUsage();
    process.exit(1);
  }

  const title = basename(inputFile, ".pdf");
  const outputFile = values.output ?? inputFile.replace(/\.pdf$/i, ".md");

  console.log(`Reading: ${inputFile}`);
  const pages = await extractTextFromPdf(inputFile);
  if (!hasExtractedText(pages)) {
    console.error(EMPTY_PDF_TEXT_MESSAGE);
    process.exit(1);
  }
  console.log(`Extracted ${pages.length} page(s)`);

  const markdown = values.merge
    ? formatAsContinuousMarkdown(pages, title)
    : formatAsMarkdown(pages, title);
  await writeMarkdownFile(outputFile, markdown);
  console.log(`Written: ${outputFile}`);
}

main();
