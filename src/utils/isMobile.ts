export function isMobile(): boolean {
  // Check if window exists (for SSR compatibility)
  if (typeof window === "undefined") return false;

  // Check for touch support and screen size
  const hasTouchScreen =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0;

  const isSmallScreen = window.innerWidth <= 768;

  return hasTouchScreen && isSmallScreen;
}
