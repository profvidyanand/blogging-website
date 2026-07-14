import katex from "katex";

const KATEX_OPTIONS = {
  throwOnError: false,
  strict: "ignore" as const,
  trust: false,
};

function renderLatex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex.trim(), {
      ...KATEX_OPTIONS,
      displayMode,
    });
  } catch {
    return displayMode ? `<pre class="math-error">${tex}</pre>` : `<code class="math-error">${tex}</code>`;
  }
}

/** Replace LaTeX only in text segments (not inside HTML tags). */
function replaceInTextSegments(
  html: string,
  replacer: (text: string) => string,
): string {
  return html
    .split(/(<[^>]+>)/g)
    .map((segment) => (segment.startsWith("<") ? segment : replacer(segment)))
    .join("");
}

function renderLatexDelimiters(html: string): string {
  let result = html;

  // Block: $$ ... $$ and \[ ... \]
  result = result.replace(
    /\$\$([\s\S]+?)\$\$/g,
    (_, tex) =>
      `<div class="math-display">${renderLatex(tex, true)}</div>`,
  );
  result = result.replace(
    /\\\[([\s\S]+?)\\\]/g,
    (_, tex) =>
      `<div class="math-display">${renderLatex(tex, true)}</div>`,
  );

  // Inline: $ ... $ and \( ... \) — only outside tags
  result = replaceInTextSegments(result, (text) => {
    let out = text.replace(
      /\\\(([\s\S]+?)\\\)/g,
      (_, tex) =>
        `<span class="math-inline">${renderLatex(tex, false)}</span>`,
    );
    out = out.replace(
      /(?<!\$)\$(?!\$)((?:\\.|[^\$\\])+?)\$(?!\$)/g,
      (_, tex) =>
        `<span class="math-inline">${renderLatex(tex, false)}</span>`,
    );
    return out;
  });

  return result;
}

function renderMathScriptTags(html: string): string {
  return html
    .replace(
      /<script\s+type=["']math\/tex;\s*mode=display["']\s*>([\s\S]*?)<\/script>/gi,
      (_, tex) =>
        `<div class="math-display">${renderLatex(tex, true)}</div>`,
    )
    .replace(
      /<script\s+type=["']math\/tex["']\s*>([\s\S]*?)<\/script>/gi,
      (_, tex) =>
        `<span class="math-inline">${renderLatex(tex, false)}</span>`,
    );
}

function renderDataLatexAttributes(html: string): string {
  return html.replace(
    /<([a-z]+)\s+([^>]*?)data-latex=["']([^"']+)["']([^>]*)>/gi,
    (match, tag, before, latex, after) => {
      const display =
        /data-display=["']true["']/i.test(match) ||
        /class=["'][^"']*math-display/i.test(match);
      const rendered = renderLatex(latex, display);
      const wrapper = display
        ? `<div class="math-display">${rendered}</div>`
        : `<span class="math-inline">${rendered}</span>`;
      // If it's a placeholder element, replace entirely; otherwise inject rendered math inside
      if (tag === "span" || tag === "div") {
        return wrapper;
      }
      return `<${tag} ${before}${after}>${wrapper}</${tag}>`;
    },
  );
}

/**
 * Process article HTML: render LaTeX delimiters via KaTeX.
 * Native MathML (`<math>`) is passed through and styled via CSS.
 */
export function renderBlogContent(html: string): string {
  if (!html?.trim()) return "";

  let result = html;
  result = renderMathScriptTags(result);
  result = renderDataLatexAttributes(result);
  result = renderLatexDelimiters(result);

  return result;
}
