import katex from "katex";

const KATEX_OPTIONS = {
  throwOnError: false,
  strict: "ignore" as const,
  trust: false,
};

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function wrapRenderedMath(tex: string, rendered: string, displayMode: boolean): string {
  const escapedLatex = escapeHtmlAttr(tex.trim());
  if (displayMode) {
    return `<div class="math-display" data-latex="${escapedLatex}">${rendered}</div>`;
  }
  return `<span class="math-inline" data-latex="${escapedLatex}">${rendered}</span>`;
}

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
    (_, tex) => wrapRenderedMath(tex, renderLatex(tex, true), true),
  );
  result = result.replace(
    /\\\[([\s\S]+?)\\\]/g,
    (_, tex) => wrapRenderedMath(tex, renderLatex(tex, true), true),
  );

  // Inline: $ ... $ and \( ... \) — only outside tags
  result = replaceInTextSegments(result, (text) => {
    let out = text.replace(
      /\\\(([\s\S]+?)\\\)/g,
      (_, tex) => wrapRenderedMath(tex, renderLatex(tex, false), false),
    );
    out = out.replace(
      /(?<!\$)\$(?!\$)((?:\\.|[^\$\\])+?)\$(?!\$)/g,
      (_, tex) => wrapRenderedMath(tex, renderLatex(tex, false), false),
    );
    return out;
  });

  return result;
}

function renderMathScriptTags(html: string): string {
  return html
    .replace(
      /<script\s+type=["']math\/tex;\s*mode=display["']\s*>([\s\S]*?)<\/script>/gi,
      (_, tex) => wrapRenderedMath(tex, renderLatex(tex, true), true),
    )
    .replace(
      /<script\s+type=["']math\/tex["']\s*>([\s\S]*?)<\/script>/gi,
      (_, tex) => wrapRenderedMath(tex, renderLatex(tex, false), false),
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
      const wrapper = wrapRenderedMath(latex, rendered, display);
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
