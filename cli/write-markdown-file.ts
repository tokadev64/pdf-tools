import { writeFile } from "node:fs/promises";

/** Markdown 文字列をファイルに書き出す */
export async function writeMarkdownFile(filePath: string, content: string): Promise<void> {
  await writeFile(filePath, content);
}
