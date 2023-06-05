/* eslint-disable import/group-exports */
export const RESET = '\u001B[0m';
export const RED = '\u001B[31m';
export const GREEN = '\u001B[32m';
export const YELLOW = '\u001B[33m';
export const BLUE = '\u001B[34m';
export const MAGENTA = '\u001B[35m';
export const CYAN = '\u001B[36m';

/**
 * Return an element in a different color
 * @param element The word/ sentence that should be printed in
 * @param color this color
 */
export function inColor(element: string, color: string): string {
  return `${color}${element}${RESET}`;
}

/* eslint-enable import/group-exports */
