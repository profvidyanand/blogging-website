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

const DELIMITED_MATH_RE =
  /\$\$[\s\S]*?\$\$|\$(?:\\.|[^\$\\])+\$/g;

/** Chained matrix steps, e.g. \begin{bmatrix}...\end{bmatrix} \rightarrow \cdots \rightarrow \begin{bmatrix}...\end{bmatrix} */
const CHAINED_LATEX_ENV_RE =
  /\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}(?:\s*\\(?:rightarrow|leftrightarrow|Leftrightarrow|implies|to|mapsto)\s*(?:\\(?:cdots|dots|ldots)\s*)*(?:\\(?:rightarrow|leftrightarrow|Leftrightarrow|implies|to|mapsto)\s*(?:\\(?:cdots|dots|ldots)\s*)*)*\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\})+/g;

/** Variable assignment with a matrix, e.g. A = \begin{bmatrix}...\end{bmatrix} */
const ASSIGNMENT_LATEX_ENV_RE =
  /[A-Za-z]\s*=\s*\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}/g;

/** Any remaining bare \begin{env}...\end{env} block. */
const LATEX_ENV_RE = /\\begin\{(\w+\*?)\}([\s\S]*?)\\end\{\1\}/g;

function wrapDisplayMath(tex: string): string {
  return `$$${tex}$$`;
}

function interleaveDelimitedSegments(
  segments: string[],
  delimiters: string[],
): string {
  return segments
    .map((segment, index) =>
      index < delimiters.length ? segment + delimiters[index] : segment,
    )
    .join("");
}

/** Wrap bare LaTeX environments that the model omitted delimiters for. */
function wrapBareLatexEnvironments(text: string): string {
  const parts = text.split(DELIMITED_MATH_RE);
  const delimiters = text.match(DELIMITED_MATH_RE) ?? [];

  return parts
    .map((part, index) => {
      let out = part;

      out = out.replace(CHAINED_LATEX_ENV_RE, (match) => wrapDisplayMath(match));
      out = out.replace(ASSIGNMENT_LATEX_ENV_RE, (match) => wrapDisplayMath(match));

      const segments = out.split(DELIMITED_MATH_RE);
      const innerDelimiters = out.match(DELIMITED_MATH_RE) ?? [];
      out = interleaveDelimitedSegments(
        segments.map((segment) =>
          segment.replace(LATEX_ENV_RE, (match) => wrapDisplayMath(match)),
        ),
        innerDelimiters,
      );

      if (index < delimiters.length) {
        out += delimiters[index];
      }
      return out;
    })
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
  result = replaceInTextSegments(result, wrapBareLatexEnvironments);
  result = renderLatexDelimiters(result);

  return result;
}
