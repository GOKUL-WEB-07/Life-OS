import { mkdir, writeFile, access } from "node:fs/promises";
const target = new URL("../public/fonts/", import.meta.url);
await mkdir(target, { recursive: true });
try {
  await access(new URL("Satoshi-Variable.woff2", target));
  await access(new URL("Satoshi-VariableItalic.woff2", target));
} catch {
  const response = await fetch(
    "https://api.fontshare.com/v2/css?f[]=satoshi@variable&display=swap",
  );
  if (!response.ok) throw new Error("Could not download Satoshi stylesheet");
  const css = await response.text();
  for (const [style, name] of [
    ["normal", "Satoshi-Variable.woff2"],
    ["italic", "Satoshi-VariableItalic.woff2"],
  ]) {
    const block = css
      .match(/@font-face\s*\{[^}]+\}/g)
      ?.find(
        (b) =>
          /font-weight:\s*300 900/.test(b) &&
          b.includes("font-style: " + style),
      );
    const url = block?.match(/url\(['"]?([^)'" ]+\.woff2)/)?.[1];
    if (!url) throw new Error("Satoshi variable font was not found");
    const font = await fetch(url.startsWith("//") ? "https:" + url : url);
    if (!font.ok) throw new Error("Satoshi download failed");
    const bytes = Buffer.from(await font.arrayBuffer());
    if (bytes.subarray(0, 4).toString() !== "wOF2")
      throw new Error("Invalid webfont");
    await writeFile(new URL(name, target), bytes);
  }
}
