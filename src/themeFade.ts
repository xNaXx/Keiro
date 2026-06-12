/**
 * Theme changes melt instead of cutting: the root layout registers a runner
 * that raises a veil in the OLD theme's color, swaps the theme at full
 * opacity, then dissolves into the new one. Anyone toggling the theme goes
 * through here.
 */

type Runner = (swap: () => void) => void;

let runner: Runner | null = null;

export function registerThemeFade(r: Runner): () => void {
  runner = r;
  return () => {
    if (runner === r) runner = null;
  };
}

export function fadeTheme(swap: () => void) {
  if (runner) runner(swap);
  else swap();
}
