const GREEK_LETTERS: Record<string, string> = {
  "\\alpha": "alpha",
  "\\beta": "beta",
  "\\gamma": "gamma",
  "\\delta": "delta",
  "\\epsilon": "epsilon",
  "\\varepsilon": "epsilon",
  "\\zeta": "zeta",
  "\\eta": "eta",
  "\\theta": "theta",
  "\\vartheta": "theta",
  "\\iota": "iota",
  "\\kappa": "kappa",
  "\\lambda": "lambda",
  "\\mu": "mu",
  "\\nu": "nu",
  "\\xi": "xi",
  "\\pi": "pi",
  "\\rho": "rho",
  "\\sigma": "sigma",
  "\\varsigma": "sigma",
  "\\tau": "tau",
  "\\upsilon": "upsilon",
  "\\phi": "phi",
  "\\varphi": "phi",
  "\\chi": "chi",
  "\\psi": "psi",
  "\\omega": "omega",
  "\\Gamma": "capital gamma",
  "\\Delta": "capital delta",
  "\\Theta": "capital theta",
  "\\Lambda": "capital lambda",
  "\\Xi": "capital xi",
  "\\Pi": "capital pi",
  "\\Sigma": "sigma",
  "\\Upsilon": "capital upsilon",
  "\\Phi": "capital phi",
  "\\Psi": "capital psi",
  "\\Omega": "capital omega",
  α: "alpha",
  β: "beta",
  γ: "gamma",
  δ: "delta",
  ε: "epsilon",
  ζ: "zeta",
  η: "eta",
  θ: "theta",
  ι: "iota",
  κ: "kappa",
  λ: "lambda",
  μ: "mu",
  ν: "nu",
  ξ: "xi",
  π: "pi",
  ρ: "rho",
  σ: "sigma",
  ς: "sigma",
  τ: "tau",
  υ: "upsilon",
  φ: "phi",
  χ: "chi",
  ψ: "psi",
  ω: "omega",
  Γ: "capital gamma",
  Δ: "capital delta",
  Θ: "capital theta",
  Λ: "capital lambda",
  Ξ: "capital xi",
  Π: "capital pi",
  Σ: "sigma",
  Υ: "capital upsilon",
  Φ: "capital phi",
  Ψ: "capital psi",
  Ω: "capital omega",
};

const OPERATORS: Record<string, string> = {
  "+": " plus ",
  "-": " minus ",
  "×": " times ",
  "\\times": " times ",
  "\\cdot": " times ",
  "÷": " divided by ",
  "\\div": " divided by ",
  "/": " over ",
  "=": " equals ",
  "\\approx": " approximately equals ",
  "\\leq": " less than or equal to ",
  "\\le": " less than or equal to ",
  "\\geq": " greater than or equal to ",
  "\\ge": " greater than or equal to ",
  "<": " less than ",
  ">": " greater than ",
  "\\neq": " not equal to ",
  "\\pm": " plus or minus ",
  "\\mp": " minus or plus ",
  "\\sim": " distributed as ",
};

function powerToSpeech(base: string, exp: string): string {
  const baseWord = base.trim();
  const expWord = exp.trim();
  return `${baseWord} to the power of ${expWord}`;
}

function replaceGreek(tex: string): string {
  let result = tex;
  const sorted = Object.keys(GREEK_LETTERS).sort((a, b) => b.length - a.length);
  for (const key of sorted) {
    result = result.split(key).join(` ${GREEK_LETTERS[key]} `);
  }
  return result;
}

function replaceOperators(tex: string): string {
  let result = tex;
  const sorted = Object.keys(OPERATORS).sort((a, b) => b.length - a.length);
  for (const key of sorted) {
    result = result.split(key).join(OPERATORS[key]);
  }
  return result;
}

function replaceTextCommands(tex: string): string {
  return tex.replace(/\\text\s*\{([^{}]*)\}/g, (_, inner) => inner.trim());
}

function replaceBinom(tex: string): string {
  return tex
    .replace(
      /\\binom\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g,
      (_, n, k) => `${n.trim()} choose ${k.trim()}`,
    )
    .replace(/\\choose/g, " choose ");
}

function extractBalancedBraces(text: string, startIdx: number): string | null {
  if (text[startIdx] !== "{") return null;
  let depth = 0;
  let i = startIdx;
  while (i < text.length) {
    if (text[i] === "{") depth++;
    if (text[i] === "}") {
      depth--;
      if (depth === 0) {
        return text.slice(startIdx + 1, i);
      }
    }
    i++;
  }
  return null;
}

function replaceFractions(tex: string): string {
  let result = tex;
  let changed = true;

  while (changed) {
    changed = false;
    const fracMatch = /\\frac\s*/.exec(result);
    if (!fracMatch) break;

    const fracEnd = fracMatch.index + fracMatch[0].length;
    const numerator = extractBalancedBraces(result, fracEnd);
    if (!numerator) break;

    const denStart = fracEnd + numerator.length + 2;
    const denominator = extractBalancedBraces(result, denStart);
    if (!denominator) break;

    const denEnd = denStart + denominator.length + 2;
    const replacement = ` ${numerator.trim()} over ${denominator.trim()} `;
    result = result.slice(0, fracMatch.index) + replacement + result.slice(denEnd);
    changed = true;
  }

  return result;
}

function replaceSqrt(tex: string): string {
  return tex.replace(
    /\\sqrt\s*\{([^{}]+)\}/g,
    (_, inner) => `the square root of ${inner.trim()}`,
  );
}

function replaceFactorials(tex: string): string {
  return tex.replace(
    /([a-zA-Z0-9\)]+)!/g,
    (_, base) => `${base.trim()} factorial`,
  );
}

function replaceSubscripts(tex: string): string {
  return tex
    .replace(/([a-zA-Z0-9]+)_\{([^{}]+)\}/g, (_, base, sub) => {
      return `${base} sub ${sub.trim()}`;
    })
    .replace(/([a-zA-Z0-9]+)_([a-zA-Z0-9])/g, (_, base, sub) => {
      return `${base} sub ${sub}`;
    });
}

function replaceGroupedSuperscripts(tex: string): string {
  let result = tex;
  let prev = "";

  while (prev !== result) {
    prev = result;
    result = result.replace(
      /\(([^()]+)\)\^\{([^{}]+)\}/g,
      (_, inner, exp) =>
        ` bracket open ${inner.trim()} bracket close to the power of ${exp.trim()}`,
    );
    result = result.replace(
      /\(([^()]+)\)\^([a-zA-Z0-9-]+)/g,
      (_, inner, exp) =>
        ` bracket open ${inner.trim()} bracket close to the power of ${exp.trim()}`,
    );
  }

  return result;
}

function replaceSuperscripts(tex: string): string {
  return tex
    .replace(/([a-zA-Z0-9]+)\^\{([^{}]+)\}/g, (_, base, exp) =>
      powerToSpeech(base, exp),
    )
    .replace(/([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, (_, base, exp) =>
      powerToSpeech(base, exp),
    );
}

function replaceParentheses(tex: string): string {
  return tex
    .replace(/\\left\s*\(/g, " bracket open ")
    .replace(/\\right\s*\)/g, " bracket close ")
    .replace(/\\left\s*\[/g, " bracket open ")
    .replace(/\\right\s*\]/g, " bracket close ")
    .replace(/\\left\s*\{/g, " bracket open ")
    .replace(/\\right\s*\}/g, " bracket close ");
}

function replacePlainBrackets(tex: string): string {
  let result = tex;
  let prev = "";

  while (prev !== result) {
    prev = result;
    result = result.replace(
      /\(([^()]+)\)/g,
      " bracket open $1 bracket close ",
    );
  }

  return result;
}

function replaceImplicitMultiplicationEarly(tex: string): string {
  let result = tex;

  result = result.replace(/(\d)([a-zA-Z])/g, "$1 times $2");
  result = result.replace(
    /(?<![a-zA-Z\\])([a-z])([a-z])(?![a-zA-Z])/g,
    "$1 times $2",
  );
  result = result.replace(/(\))([a-zA-Z(])/g, "$1 times $2");
  result = result.replace(/([a-z])(\()/g, "$1 times $2");

  return result;
}

function normalizeCarets(tex: string): string {
  return tex.replace(/\s*\^\s*/g, "^");
}

function stripLatexCommands(tex: string): string {
  return tex
    .replace(/\\,/g, " ")
    .replace(/\\;/g, " ")
    .replace(/\\!/g, " ")
    .replace(/\\quad/g, " ")
    .replace(/\\qquad/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSpeech(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function latexToSpeech(tex: string): string {
  if (!tex.trim()) return "";

  let result = tex.trim();
  result = replaceTextCommands(result);
  result = replaceBinom(result);
  result = replaceImplicitMultiplicationEarly(result);
  result = replaceGroupedSuperscripts(result);
  result = replaceGreek(result);
  result = normalizeCarets(result);
  result = replaceFractions(result);
  result = replaceSqrt(result);
  result = replaceSuperscripts(result);
  result = replaceSubscripts(result);
  result = replaceFactorials(result);
  result = replaceParentheses(result);
  result = replaceOperators(result);
  result = replacePlainBrackets(result);
  result = stripLatexCommands(result);

  return normalizeSpeech(result);
}

function mathmlNodeToSpeech(node: Element): string {
  const annotation = node.querySelector?.(
    'annotation[encoding="application/x-tex"]',
  );
  if (annotation?.textContent) {
    return latexToSpeech(annotation.textContent);
  }

  const parts: string[] = [];

  function walk(el: Element): void {
    const tag = el.tagName.toLowerCase();
    if (
      tag === "annotation" &&
      el.getAttribute("encoding") === "application/x-tex"
    ) {
      parts.push(latexToSpeech(el.textContent ?? ""));
      return;
    }
    if (tag === "math") {
      for (const child of el.children) walk(child);
      return;
    }
    if (["mi", "mn", "mo", "mtext"].includes(tag)) {
      const text = el.textContent?.trim();
      if (text) parts.push(text);
      return;
    }
    for (const child of el.children) walk(child);
  }

  walk(node);
  return normalizeSpeech(parts.join(" "));
}

function getMathHost(el: Element): Element {
  return (
    el.closest("[data-latex], .math-inline, .math-display, .katex, math") ?? el
  );
}

function readLatexFromElement(el: Element): string | null {
  const host = getMathHost(el);
  const dataLatex = host.getAttribute("data-latex");
  if (dataLatex?.trim()) return dataLatex.trim();

  const katexAnnotation = host.querySelector(
    'annotation[encoding="application/x-tex"]',
  );
  if (katexAnnotation?.textContent?.trim()) {
    return katexAnnotation.textContent.trim();
  }

  return null;
}

export function mathNodeToSpeech(el: Element): string {
  const latex = readLatexFromElement(el);
  if (latex) return latexToSpeech(latex);

  const host = getMathHost(el);

  if (host.tagName.toLowerCase() === "math") {
    return mathmlNodeToSpeech(host);
  }

  const mathChild = host.querySelector("math");
  if (mathChild) {
    return mathmlNodeToSpeech(mathChild);
  }

  const tex = host.textContent?.trim() ?? "";
  return latexToSpeech(tex);
}
