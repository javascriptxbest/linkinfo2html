import { Arguments } from "https://deno.land/x/allo_arguments@v6.0.4/mod.ts";
import { readCSV } from "https://deno.land/x/csv@v0.8.0/mod.ts";
import pretty from "npm:pretty@2.0.0";

export interface LinkInfo {
  url: string;
  urlText: string;
  description: string;
}

interface Args {
  title: string | undefined;
  help: boolean;
}

const defaultTitle = "A Page of Links";

try {
  await main(getArguments());
} catch (error) {
  Arguments.rethrowUnprintableException(error);
}

/**
 * Read from stdio, text formatted like:
 * ```
 * https://someurl.com
 * Short description
 * A long description
 * <empty line>
 * <more entries>
 * ```
 * It will then take each entry and turn them into
 * HTML blocks, and create an HTML document. The
 * resulting document is sent to stdio.
 */


async function main(args: Args) {
  if (args.help) return;
  const options = {
    columnSeparator: "\n",
    lineSeparator: "\n\n",
  };

  const links: LinkInfo[] = [];

  for await (const row of readCSV(Deno.stdin, options)) {
    const cells: string[] = [];
    for await (const cell of row) {
      cells.push(cell);
    }
    if (cells.length === 3) {
      const link: LinkInfo = {
        url: cells[0],
        urlText: cells[1],
        description: cells[2],
      };
      links.push(link);
    }
  }

  const output = await buildHTML(args.title ?? defaultTitle, links);

  Deno.stdout.write(new TextEncoder().encode(output));
}

function getArguments(): Args {
  const info = [
    "This program interprets a formatted text file as blocks of URLs with info.",
    "It outputs these blocks in an HTML document.",
  ];
  const args = new Arguments({
    ...Arguments.createHelpOptions(),
    "title": {
      shortName: "t",
      description: "A header for the output document",
      convertor: Arguments.stringConvertor,
    },
  })
    .setDescription(info.join(`\n`));

  if (args.isHelpRequested()) args.triggerHelp();

  return args.getFlags();
}

async function buildHTML(header: string, linkData: LinkInfo[]) {
  const css = await renderCSS();
  const links = linkData.map((link) => renderLink(link)).join(``);

  const doc = `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>${header}</title>
		<style>${css}</style>
	</head>
	<body>
		<header><h1>${header}</h1></header>
		<main>${links}</main>
	</body>
	</html>
	`;

  return pretty(doc);
}

async function renderCSS() {
  const module = await fetch(new URL("./render.css", import.meta.url));
  const css = await module.text();
  return css;
}

function renderLink({ url, urlText, description }: LinkInfo) {
  const html = `
	<article>
		<h2>
			<a href="${url}">${urlText}</a>
		</h2>
		<details>
			<summary><span>@ </span><span>${url}</span></summary>
			<div><p>${description}</p></div>
		</details>
	</article>
	`;

  return html;
}
