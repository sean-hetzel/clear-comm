export function makeTextMakeSense(text: string): string {
  let result = text;

  // Replace "Sue" with "Souix"
  result = result.replace(/Sue/gi, "Souix");

  // Replace two numbers separated by space followed by "right" with concatenated numbers + "R"
  // Example: "1 2 right" -> "12R"
  result = result.replace(/(\d)\s+(\d)\s+right\b/gi, "$1$2R");

  // Replace two numbers separated by space followed by "left" with concatenated numbers + "L"
  // Example: "1 2 left" -> "12L"
  result = result.replace(/(\d)\s+(\d)\s+left\b/gi, "$1$2L");

  // Replace two numbers separated by space followed by "center" with concatenated numbers + "C"
  // Example: "1 2 center" -> "12C"
  result = result.replace(/(\d)\s+(\d)\s+center\b/gi, "$1$2C");

  // Remove space between any two numbers (handles remaining cases)
  result = result.replace(/(\d)\s+(\d)/g, "$1$2");

  // Remove underscores
  result = result.replace(/_/g, "");

  // Remove hyphen followed by number at the end (e.g., "runway-1" -> "runway")
  result = result.replace(/-\d+$/g, "");

  // Replace remaining hyphens with spaces
  result = result.replace(/-/g, " ");

  return result;
}
