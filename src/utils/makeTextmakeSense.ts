export function makeTextMakeSense(text: string): string {
  let result = text;

  // Replace "Sue" with "Souix"
  result = result.replace(/Sue/gi, "Souix");

  // Replace two numbers separated by space followed by "right" with concatenated numbers + "R"
  // Example: "1 2 right" -> "12R"
  result = result.replace(/(\d)\s+(\d)\s+right\b/gi, "$1$2R");

  // Remove space between any two numbers (handles remaining cases)
  result = result.replace(/(\d)\s+(\d)/g, "$1$2");

  return result;
}
