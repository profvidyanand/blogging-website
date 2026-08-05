import { latexToSpeech } from "../lib/tts/math-to-speech.ts";

const testCases = [
  {
    name: "Simple fraction with superscripts",
    latex: "\\frac{3 \\times 10^{8}}{5 \\times 10^{14}}",
    expected: "3 times 10 to the power of 8 over 5 times 10 to the power of 14",
  },
  {
    name: "Full wavelength formula",
    latex: "\\lambda = \\frac{c}{\\nu} = \\frac{3 \\times 10^8}{5 \\times 10^{14}} = 6 \\times 10^{-7} \\text{ m}",
    shouldContain: ["lambda", "over", "times", "to the power"],
  },
  {
    name: "Plain division operator",
    latex: "(3 \\times 10^8)/(5 \\times 10^{14})",
    shouldContain: ["over", "times", "to the power"],
  },
  {
    name: "Simple fraction",
    latex: "\\frac{1}{2}",
    expected: "1 over 2",
  },
  {
    name: "Nested fraction",
    latex: "\\frac{a^{2}}{b^{3}}",
    shouldContain: ["a to the power of 2", "over", "b to the power of 3"],
  },
];

console.log("Testing math-to-speech conversions:\n");

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const result = latexToSpeech(test.latex);
  
  let success = false;
  if (test.expected !== undefined) {
    success = result === test.expected;
  } else if (test.shouldContain) {
    success = test.shouldContain.every((phrase) =>
      result.toLowerCase().includes(phrase.toLowerCase())
    );
  }

  if (success) {
    console.log(`✓ ${test.name}`);
    console.log(`  Output: "${result}"\n`);
    passed++;
  } else {
    console.log(`✗ ${test.name}`);
    console.log(`  Input:  ${test.latex}`);
    console.log(`  Output: "${result}"`);
    if (test.expected) {
      console.log(`  Expected: "${test.expected}"`);
    } else if (test.shouldContain) {
      console.log(`  Should contain: ${test.shouldContain.join(", ")}`);
    }
    console.log();
    failed++;
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
