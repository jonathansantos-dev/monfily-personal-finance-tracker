interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Monfily brand logo — purple rounded square with an "M" chart line.
 * Used as favicon, sidebar branding, and auth pages.
 */
export function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#6366f1" />
      <path
        d="M8 22V10l4 6 4-6 4 6 4-6v12"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
