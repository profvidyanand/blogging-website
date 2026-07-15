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

const NUMBER_WORDS: Record<string, string> = {
  "0": "zero",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
  "10": "ten",
  "11": "eleven",
  "12": "twelve",
};

function numberToWord(n: string): string {
  return NUMBER_WORDS[n] ?? n;
}

function powerToSpeech(base: string, exp: string): string {
  const trimmedExp = exp.trim();
  if (trimmedExp === "2") {
    const baseWord = /^\d+$/.test(base.trim())
      ? numberToWord(base.trim())
      : base.trim();
    return `${baseWord} squared`;
  }
  if (trimmedExp === "3") {
    const baseWord = /^\d+$/.test(base.trim())
      ? numberToWord(base.trim())
      : base.trim();
    return `${baseWord} cubed`;
  }
  return `${base.trim()} to the power of ${trimmedExp}`;
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
    .replace(
      /\\choose/g,
      " choose ",
    );
}

function replaceFractions(tex: string): string {
  return tex.replace(
    /\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g,
    (_, num, den) => `${num.trim()} over ${den.trim()}`,
  );
}

function replaceSqrt(tex: string): string {
  return tex.replace(
    /\\sqrt\s*\{([^{}]+)\}/g,
    (_, inner) => `the square root of ${inner.trim()}`,
  );
}

function replaceFactorials(tex: string): string {
  return tex.replace(/([a-zA-Z0-9\)]+)!/g, (_, base) => `${base.trim()} factorial`);
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
    .replace(/\\left\s*\(/g, " open parenthesis ")
    .replace(/\\right\s*\)/g, " close parenthesis ")
    .replace(/\\left\s*\[/g, " open bracket ")
    .replace(/\\right\s*\]/g, " close bracket ")
    .replace(/\\left\s*\{/g, " open brace ")
    .replace(/\\right\s*\}/g, " close brace ");
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

export function latexToSpeech(tex: string): string {
  if (!tex.trim()) return "";

  let result = tex.trim();
  result = replaceTextCommands(result);
  result = replaceBinom(result);
  result = replaceFractions(result);
  result = replaceSqrt(result);
  result = replaceSuperscripts(result);
  result = replaceSubscripts(result);
  result = replaceFactorials(result);
  result = replaceParentheses(result);
  result = replaceGreek(result);
  result = replaceOperators(result);
  result = stripLatexCommands(result);

  return result.replace(/\s+/g, " ").trim();
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
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function mathNodeToSpeech(el: Element): string {
  const katexAnnotation = el.querySelector(
    'annotation[encoding="application/x-tex"]',
  );
  if (katexAnnotation?.textContent) {
    return latexToSpeech(katexAnnotation.textContent);
  }

  if (el.tagName.toLowerCase() === "math") {
    return mathmlNodeToSpeech(el);
  }

  const mathChild = el.querySelector("math");
  if (mathChild) {
    return mathmlNodeToSpeech(mathChild);
  }

  const tex = el.textContent?.trim() ?? "";
  return latexToSpeech(tex);
}
