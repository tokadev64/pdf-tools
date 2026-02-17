/**
 * ページごとのテキスト配列を Markdown 形式に変換してファイルに書き出す
 */

/** ページテキスト配列を Markdown 文字列に整形する */
export function formatAsMarkdown(pages: string[], title: string): string {
  const lines: string[] = [`# ${title}`, ""];

  let pageNumber = 0;
  for (const page of pages) {
    if (page.trim() === "") continue;
    pageNumber++;
    lines.push(`## Page ${pageNumber}`, "", page, "");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

const SENTENCE_END_PATTERN = /[。．.!！?？）)」』】\]"]$/;

/** ページ区切りなしで全ページを結合した Markdown 文字列に整形する */
export function formatAsContinuousMarkdown(pages: string[], title: string): string {
  const nonEmptyPages = pages.filter((p) => p.trim() !== "");
  if (nonEmptyPages.length === 0) return `# ${title}\n`;

  const parts: string[] = [`# ${title}`, ""];
  let buffer = "";

  for (const page of nonEmptyPages) {
    if (buffer === "") {
      buffer = page;
      continue;
    }

    const lastLine = buffer.split("\n").at(-1) ?? "";
    if (SENTENCE_END_PATTERN.test(lastLine.trim())) {
      parts.push(buffer, "");
      buffer = page;
    } else {
      buffer = buffer + page;
    }
  }

  if (buffer !== "") {
    parts.push(buffer);
  }

  return `${parts.join("\n").trimEnd()}\n`;
}

const CJK_RANGE =
  /[\u2E80-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\u{20000}-\u{2FA1F}\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF]/u;

/**
 * PDF 由来の不要な改行を除去し、段落単位にまとめる
 *
 * - 空行（\n\n）は段落境界として保持
 * - 句読点・閉じ括弧で終わる行の改行は保持
 * - それ以外の単独改行は除去（CJK 同士はそのまま、それ以外はスペース挿入）
 */
export function joinLines(text: string): string {
  if (text === "") return "";

  const paragraphs = text.split(/\n{2,}/);

  const joined = paragraphs.map((para) => {
    const lines = para.split("\n");
    let result = lines[0];

    for (let i = 1; i < lines.length; i++) {
      const prev = result;
      const next = lines[i];

      if (SENTENCE_END_PATTERN.test(prev.trimEnd())) {
        result = `${prev}\n${next}`;
        continue;
      }

      const lastChar = prev.trimEnd().at(-1) ?? "";
      const firstChar = next.trimStart().at(0) ?? "";
      const bothCjk = CJK_RANGE.test(lastChar) && CJK_RANGE.test(firstChar);

      if (bothCjk) {
        result = prev.trimEnd() + next.trimStart();
      } else if (prev.endsWith(" ") || next.startsWith(" ")) {
        result = `${prev.trimEnd()} ${next.trimStart()}`;
      } else {
        result = `${prev} ${next}`;
      }
    }

    return result;
  });

  return joined.join("\n\n");
}

/** Markdown 文字列をファイルに書き出す */
export async function writeMarkdownFile(filePath: string, content: string): Promise<void> {
  await Deno.writeTextFile(filePath, content);
}
