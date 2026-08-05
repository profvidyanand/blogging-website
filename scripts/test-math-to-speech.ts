import { latexToSpeech } from "../lib/tts/math-to-speech";

const samples: Array<{ input: string; expectIncludes: string[] }> = [
  {
    input: "x^2",
    expectIncludes: ["x to the power of 2"],
  },
  {
    input: "P(X = k) = \\binom{n}{k} p^k (1 - p)^{n-k}",
    expectIncludes: [
      "bracket open",
      "bracket close",
      "to the power of n minus k",
      "n choose k",
    ],
  },
  {
    input: "\\mu = np",
    expectIncludes: ["mu equals", "n times p"],
  },
  {
    input: "\\sigma^2 = np(1 - p)",
    expectIncludes: ["sigma to the power of 2", "n times p", "bracket open"],
  },
  {
    input: "\\sigma = \\sqrt{np(1 - p)}",
    expectIncludes: ["sigma equals", "square root of", "n times p"],
  },
  {
    input: "sm",
    expectIncludes: ["s times m"],
  },
  {
    input: "(a+b)",
    expectIncludes: ["bracket open a plus b bracket close"],
  },
];

let failed = 0;

for (const { input, expectIncludes } of samples) {
  const output = latexToSpeech(input);
  console.log(`IN:  ${input}`);
  console.log(`OUT: ${output}`);

  for (const phrase of expectIncludes) {
    if (!output.includes(phrase)) {
      console.error(`  FAIL: missing "${phrase}"`);
      failed += 1;
    }
  }

  console.log("");
}

if (failed > 0) {
  console.error(`${failed} assertion(s) failed`);
  process.exit(1);
}

console.log("All checks passed.");
