// Simple utility to merge classnames (no clsx dependency needed)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
